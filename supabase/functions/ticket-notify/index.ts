/**
 * ticket-notify — sends a notification email for a single ticket message.
 *
 * Two callers:
 *   (a) Admin UI — after an admin posts a reply, it POSTs { ticket_id,
 *       message_id } to get immediate customer notification. Uses the
 *       admin's access token (requireAdmin).
 *   (b) Queue drainer (Phase 3) — for customer→admin notifications
 *       captured by the `ticket_notification_queue` trigger. The drainer
 *       will call this function with a service-role bearer token.
 *
 * Authentication model:
 *   We accept EITHER a valid admin user JWT OR a service-role bearer
 *   (for the drainer). Customers cannot call this directly.
 *
 * Body: { ticket_id, message_id }
 * Response: { ok: true, data: { direction, delivered } }
 */

// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — Deno x
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

import { handlePreflight } from '../_shared/cors.ts';
import { sendEmail } from '../_shared/resend.ts';
import {
  jsonResponse,
  errorToResponse,
  requireAdmin,
  UnauthorizedError,
} from '../_shared/auth.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';
import { build as buildTicketEmail } from '../_shared/emails/ticket-notification.ts';

const FN_NAME = 'ticket-notify';
const PREVIEW_MAX = 500;

const BodySchema = z.object({
  ticket_id: z.string().uuid(),
  message_id: z.string().uuid(),
  locale: z.enum(['tr', 'en']).optional(),
});
type Body = z.infer<typeof BodySchema>;

function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
}

function extractBearer(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!auth) return null;
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return match?.[1] ?? null;
}

Deno.serve(async (req: Request) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResponse(req, 405, { ok: false, error: 'Method not allowed' });
  }

  logJson({ stage: 'start' });

  // Auth — accept admin JWT OR service role key
  const token = extractBearer(req);
  if (!token) {
    return errorToResponse(req, new UnauthorizedError());
  }
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const isServiceRole = serviceRoleKey !== '' && token === serviceRoleKey;

  if (!isServiceRole) {
    try {
      await requireAdmin(req);
    } catch (err) {
      logJson({ stage: 'auth_failed', error: err instanceof Error ? err.message : 'unknown' });
      return errorToResponse(req, err);
    }
  }

  // Parse + validate
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(req, 400, { ok: false, error: 'Invalid JSON body' });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(req, 400, { ok: false, error: 'Validation failed' });
  }
  const body: Body = parsed.data;

  const supabase = createAdminClient();

  // Load ticket + message + org + author role
  const { data: ticket, error: tErr } = await supabase
    .from('tickets')
    .select(`
      id, subject, organization_id,
      organization:organizations ( id, name, contact_email )
    `)
    .eq('id', body.ticket_id)
    .is('deleted_at', null)
    .maybeSingle();

  if (tErr) {
    logJson({ stage: 'ticket_lookup_failed', error: tErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not load ticket' });
  }
  if (!ticket) return jsonResponse(req, 404, { ok: false, error: 'Ticket not found' });

  const { data: message, error: mErr } = await supabase
    .from('ticket_messages')
    .select('id, body, author')
    .eq('id', body.message_id)
    .eq('ticket_id', body.ticket_id)
    .maybeSingle();

  if (mErr) {
    logJson({ stage: 'message_lookup_failed', error: mErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not load message' });
  }
  if (!message) return jsonResponse(req, 404, { ok: false, error: 'Message not found' });

  // Determine direction from the author's profile role
  let authorRole: 'admin' | 'customer' | 'unknown' = 'unknown';
  if (message.author) {
    const { data: authorProfile, error: apErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', message.author)
      .maybeSingle();
    if (apErr) {
      logJson({ stage: 'author_lookup_failed', error: apErr.message });
    } else if (authorProfile) {
      authorRole = authorProfile.role as 'admin' | 'customer';
    }
  }

  const direction: 'to-admin' | 'to-customer' =
    authorRole === 'admin' ? 'to-customer' : 'to-admin';

  // Recipient
  const org = Array.isArray(ticket.organization) ? ticket.organization[0] : ticket.organization;
  let toEmail: string | null = null;
  if (direction === 'to-customer') {
    toEmail = org?.contact_email ?? null;
  } else {
    toEmail = Deno.env.get('CONTACT_TO_EMAIL') ?? 'brokztech@gmail.com';
  }

  if (!toEmail) {
    logJson({ stage: 'no_recipient_email' });
    return jsonResponse(req, 200, {
      ok: true,
      data: { direction, delivered: false, reason: 'no_recipient_email' },
    });
  }

  const siteUrl = (Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:4321').replace(/\/$/, '');
  const ticketUrl = direction === 'to-admin'
    ? `${siteUrl}/admin/tickets/${ticket.id}`
    : `${siteUrl}/dashboard/tickets/${ticket.id}`;

  const preview =
    message.body.length > PREVIEW_MAX ? message.body.slice(0, PREVIEW_MAX) + '…' : message.body;

  const { subject, html, text } = buildTicketEmail({
    subject: ticket.subject,
    organizationName: org?.name ?? 'Brokz',
    messagePreview: preview,
    ticketUrl,
    direction,
    locale: body.locale ?? 'tr',
  });

  const sent = await sendEmail({ to: toEmail, subject, html, text });

  if (!sent.ok) {
    logJson({ stage: 'email_failed', error: sent.error, direction });
    return jsonResponse(req, 200, {
      ok: true,
      data: { direction, delivered: false, reason: 'email_failed' },
    });
  }

  logJson({ stage: 'email_sent', email_id: sent.id, direction });
  return jsonResponse(req, 200, {
    ok: true,
    data: { direction, delivered: true },
  });
});

/**
 * contact-lead-capture — public contact form endpoint.
 *
 * Replaces the legacy Vercel serverless function at `api/contact.ts`.
 * Deployed on Supabase Edge Functions (Deno) so it remains portable
 * when the frontend moves off Vercel onto shared hosting.
 *
 * Pipeline:
 *   1. CORS preflight / method guard (POST only)
 *   2. Parse JSON + validate with Zod
 *   3. Honeypot check (`hp` or `website` fields must be empty)
 *   4. IP rate limit — max 5 hits / 10 min / IP
 *   5. Insert into `public.leads` via service_role client
 *   6. Send branded admin notification via Resend
 *   7. Return `{ ok: true }`
 *
 * Env vars required:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (injected automatically)
 *   RESEND_API_KEY
 *   ALLOWED_ORIGINS       comma-separated
 *   CONTACT_TO_EMAIL      optional, defaults to brokztech@gmail.com
 *   CONTACT_FROM_EMAIL    optional, defaults to onboarding@resend.dev sender
 */

// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — Deno x import (resolved at edge runtime)
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

import { createAdminClient } from '../_shared/supabase-admin.ts';
import { sendEmail } from '../_shared/resend.ts';
import { corsHeaders, handlePreflight } from '../_shared/cors.ts';
import { renderContactNotification } from '../_shared/emails/contact-notification.ts';

// ─── constants ───────────────────────────────────────────────────────
const FN_NAME = 'contact-lead-capture';
const RATE_LIMIT_BUCKET = 'contact';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// ─── validation schema ───────────────────────────────────────────────
// `inquiry_type` is the new structured enum from the 2-step flow.
// `type` is kept as a legacy free-text field; if a caller sends only `type`
// (old /contact form during transition), `inquiry_type` defaults to 'general'.
const LEAD_INQUIRY_TYPE = z.enum([
  'general',
  'support',
  'webtrader_manager',
  'order_request',
  'info_pricing',
]);

const ContactSchema = z
  .object({
    company: z.string().max(120).optional(),
    name: z.string().min(1, 'Name is required').max(120),
    email: z.string().email('Invalid email').max(160),
    // New structured field — preferred over legacy `type`.
    inquiry_type: LEAD_INQUIRY_TYPE.optional(),
    // Legacy free-text field kept for backward compatibility with old /contact form.
    type: z.string().max(80).optional(),
    // Required phone in E.164 format (e.g. +905321234567)
    phone: z.string().min(1, 'Phone is required').max(30),
    // How the prospect prefers to be contacted
    contact_preference: z.enum(['email', 'phone', 'any']),
    // Order-request–specific fields.
    product_id: z.string().uuid().optional(),
    quantity: z.number().int().positive().max(10000).optional(),
    message: z.string().min(10, 'Message too short (min 10 chars)').max(5000),
    consent: z.boolean().optional(),
    source: z.string().max(120).optional(),
    // Honeypots — either field present and non-empty means bot.
    hp: z.string().max(200).optional(),
    website: z.string().max(200).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    // Resolve effective inquiry_type for cross-field checks.
    const effectiveType = val.inquiry_type ?? 'general';
    if (effectiveType === 'order_request' && !val.product_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'product_id is required for order_request',
        path: ['product_id'],
      });
    }
  });

type ContactPayload = z.infer<typeof ContactSchema>;

// ─── helpers ─────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  return '0.0.0.0';
}

function logJson(payload: Record<string, unknown>): void {
  // Structured log; stderr so it shows in Supabase dashboard logs.
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
}

function jsonResponse(
  req: Request,
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

/**
 * Simple sliding-window rate limit backed by `public.rate_limits`.
 * Returns true when the caller is over the limit and should be rejected.
 */
async function isRateLimited(ip: string): Promise<boolean> {
  const supabase = createAdminClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS).toISOString();

  // 1. Count recent hits in the window.
  const { count, error: selErr } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .eq('bucket', RATE_LIMIT_BUCKET)
    .gte('window_start', windowStart);

  if (selErr) {
    // Fail-open on DB errors — don't block legit users if our table is down,
    // but do log so we notice.
    logJson({ ip, outcome: 'rate_limit_check_failed', error: selErr.message });
    return false;
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return true;
  }

  // 2. Record this hit (upsert increments the bucket's current window row).
  // We use the `now()`-truncated-to-window as the key so concurrent hits
  // within the same window collapse onto one row.
  const bucketWindow = new Date(
    Math.floor(now.getTime() / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS,
  ).toISOString();

  const { error: upErr } = await supabase.rpc('increment_rate_limit', {
    p_ip: ip,
    p_bucket: RATE_LIMIT_BUCKET,
    p_window_start: bucketWindow,
  });

  // If the RPC isn't present (first deploy / migration not run), fall back to
  // a plain insert — counting only new rows is still a loose limiter.
  if (upErr) {
    await supabase
      .from('rate_limits')
      .insert({
        ip,
        bucket: RATE_LIMIT_BUCKET,
        count: 1,
        window_start: bucketWindow,
      })
      .then(() => undefined, () => undefined);
  }

  return false;
}

// ─── handler ─────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const ip = getClientIp(req);

  // CORS preflight
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResponse(req, 405, { ok: false, error: 'Method not allowed' });
  }

  // Parse JSON
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    logJson({ ip, outcome: 'bad_json' });
    return jsonResponse(req, 400, { ok: false, error: 'Invalid JSON body' });
  }

  // Validate
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string') fields[key] = issue.message;
    }
    logJson({ ip, outcome: 'validation_failed', fields: Object.keys(fields) });
    return jsonResponse(req, 400, {
      ok: false,
      error: 'Validation failed',
      fields,
    });
  }

  const data: ContactPayload = parsed.data;

  // Honeypot — silently succeed so bots don't learn.
  if ((data.hp && data.hp.trim() !== '') || (data.website && data.website.trim() !== '')) {
    logJson({ ip, outcome: 'honeypot_triggered' });
    return jsonResponse(req, 200, { ok: true });
  }

  // Consent required (mirror legacy behavior).
  if (data.consent === false) {
    return jsonResponse(req, 400, {
      ok: false,
      error: 'Consent is required',
      fields: { consent: 'Consent is required' },
    });
  }

  // Rate limit
  let limited = false;
  try {
    limited = await isRateLimited(ip);
  } catch (err) {
    logJson({
      ip,
      outcome: 'rate_limit_exception',
      error: err instanceof Error ? err.message : String(err),
    });
  }
  if (limited) {
    logJson({ ip, outcome: 'rate_limited' });
    return jsonResponse(req, 429, {
      ok: false,
      error: 'Too many requests. Please wait a few minutes and try again.',
    });
  }

  // Insert lead
  const supabase = createAdminClient();
  const leadSource = data.source?.trim() || 'contact_form';

  // Resolve the effective inquiry_type: use the new field if present,
  // otherwise fall back to 'general' (covers the legacy `type`-only path).
  const effectiveInquiryType = data.inquiry_type ?? 'general';

  const { error: insertErr } = await supabase.from('leads').insert({
    name: data.name,
    email: data.email,
    company: data.company,
    message: data.message,
    source: leadSource,
    inquiry_type: effectiveInquiryType,
    phone: data.phone,
    contact_preference: data.contact_preference,
    ...(data.product_id != null ? { product_id: data.product_id } : {}),
    ...(data.quantity != null ? { quantity: data.quantity } : {}),
  });

  if (insertErr) {
    logJson({ ip, outcome: 'lead_insert_failed', error: insertErr.message });
    return jsonResponse(req, 500, {
      ok: false,
      error: 'Could not save your message. Please try again shortly.',
    });
  }

  // Resolve product name for order_request leads (best-effort; don't fail the
  // whole request if the product lookup fails — lead is already saved).
  let productName: string | undefined;
  if (effectiveInquiryType === 'order_request' && data.product_id) {
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', data.product_id)
      .single();
    if (product && typeof (product as Record<string, unknown>).name === 'string') {
      productName = (product as Record<string, unknown>).name as string;
    }
  }

  // Send notification email
  const toEmail = Deno.env.get('CONTACT_TO_EMAIL') || 'brokztech@gmail.com';
  const { subject, html, text } = renderContactNotification({
    company: data.company,
    name: data.name,
    email: data.email,
    type: data.type,
    inquiry_type: effectiveInquiryType,
    product_name: productName,
    quantity: data.quantity,
    message: data.message,
    source: leadSource,
    ip,
  });

  const mail = await sendEmail({
    to: toEmail,
    subject,
    html,
    text,
    replyTo: data.email,
  });

  if (!mail.ok) {
    // Lead was saved; email is best-effort. Log and return success to user.
    logJson({ ip, outcome: 'email_failed_but_lead_saved', error: mail.error });
    return jsonResponse(req, 200, { ok: true });
  }

  logJson({ ip, outcome: 'success', email_id: mail.id, source: leadSource });
  return jsonResponse(req, 200, { ok: true });
});

/**
 * admin-invite-user — admin-only endpoint to onboard a new user.
 *
 * Pipeline:
 *   1. CORS preflight / POST guard.
 *   2. Zod validate body.
 *   3. `requireAdmin(req)` — 401/403 if not a Brokz admin.
 *   4. Resolve or create organization.
 *   5. Idempotent: if a user already exists for the email, return the
 *      existing profile row (no duplicate invite is sent).
 *   6. Generate Supabase invite link via `auth.admin.generateLink` so we
 *      can send OUR branded Resend email (Supabase default invite email
 *      is suppressed because no SMTP is called for `generateLink`).
 *   7. Upsert the profile row for that user (role, organization_id,
 *      full_name) — keeps schema consistent with the UI-side expectations.
 *   8. Audit log the action.
 *   9. Send invite email via Resend.
 *
 * Request  { email, organization_id?, organization_name?, country?,
 *            website?, contact_email?, role?, full_name?, locale? }
 * Response { ok: true, data: { user_id, organization_id, invited: boolean } }
 *
 * Env vars required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto),
 *   RESEND_API_KEY, PUBLIC_SITE_URL, CONTACT_FROM_EMAIL, ALLOWED_ORIGINS.
 */

// deno-lint-ignore-file no-explicit-any
// @ts-ignore — Deno std import
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-ignore — Deno x import
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

import { handlePreflight } from '../_shared/cors.ts';
import { sendEmail } from '../_shared/resend.ts';
import { requireAdmin, jsonResponse, errorToResponse } from '../_shared/auth.ts';
import { build as buildInviteEmail } from '../_shared/emails/invite-user.ts';

// @ts-ignore — Deno global
declare const Deno: { env: { get(key: string): string | undefined } };

const FN_NAME = 'admin-invite-user';

// ─── validation ──────────────────────────────────────────────────────
const BodySchema = z.object({
  email: z.string().email().max(160).transform((s) => s.trim().toLowerCase()),
  organization_id: z.string().uuid().optional(),
  organization_name: z.string().min(1).max(200).optional(),
  country: z.string().max(80).optional(),
  website: z.string().max(200).optional(),
  contact_email: z.string().email().max(160).optional(),
  role: z.enum(['admin', 'customer']).default('customer'),
  full_name: z.string().max(160).optional(),
  locale: z.enum(['tr', 'en']).optional(),
});

type Body = z.infer<typeof BodySchema>;

// ─── logging ────────────────────────────────────────────────────────
function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
}

/** Mask an email for structured logs: `jane@example.com` -> `j***@example.com`. */
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 1) return '***' + email.slice(at);
  return email[0] + '***' + email.slice(at);
}

// ─── handler ────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResponse(req, 405, { ok: false, error: 'Method not allowed' });
  }

  logJson({ stage: 'start' });

  // 1. Auth — admin only
  let ctx;
  try {
    ctx = await requireAdmin(req);
  } catch (err) {
    logJson({ stage: 'auth_failed', error: err instanceof Error ? err.message : 'unknown' });
    return errorToResponse(req, err);
  }

  const { supabase, profile: adminProfile } = ctx;

  // 2. Parse + validate
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(req, 400, { ok: false, error: 'Invalid JSON body' });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === 'string') fields[k] = issue.message;
    }
    logJson({ stage: 'validation_failed', fields: Object.keys(fields) });
    return jsonResponse(req, 400, { ok: false, error: 'Validation failed', fields });
  }
  const body: Body = parsed.data;

  // 3. Resolve / create organization
  let organizationId = body.organization_id ?? null;
  let organizationName = body.organization_name ?? null;

  try {
    if (organizationId) {
      const { data: org, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', organizationId)
        .maybeSingle();
      if (error) throw error;
      if (!org) {
        logJson({ stage: 'org_not_found', organization_id: organizationId });
        return jsonResponse(req, 404, { ok: false, error: 'Organization not found' });
      }
      organizationName = org.name;
    } else if (body.organization_name) {
      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert({
          name: body.organization_name,
          country: body.country ?? null,
          website: body.website ?? null,
          contact_email: body.contact_email ?? body.email,
        })
        .select('id, name')
        .single();
      if (error) throw error;
      organizationId = newOrg.id;
      organizationName = newOrg.name;
      logJson({ stage: 'org_created', organization_id: organizationId });
    } else {
      // No org provided is legal for admin invites (admin user on central team).
      if (body.role === 'customer') {
        return jsonResponse(req, 400, {
          ok: false,
          error: 'organization_id or organization_name is required for customer invites',
        });
      }
    }
  } catch (err: any) {
    logJson({ stage: 'org_resolve_failed', error: err?.message ?? 'unknown' });
    return jsonResponse(req, 500, { ok: false, error: 'Could not resolve organization' });
  }

  const siteUrl = Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:4321';
  const redirectTo = `${siteUrl.replace(/\/$/, '')}/auth/accept-invite`;

  // 4. Idempotency — look up existing profile by email via auth.admin API.
  // The public.profiles table does have an `email` column but the auth.users
  // table is the source of truth for account existence; we query it.
  let existingUserId: string | null = null;
  try {
    // auth.admin.listUsers has no email filter in SDK v2, so page until found.
    // In practice our user base is small; we keep a reasonable page cap.
    const emailLc = body.email;
    let page = 1;
    const perPage = 200;
    while (page <= 20 && !existingUserId) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      for (const u of data.users) {
        if ((u.email ?? '').toLowerCase() === emailLc) {
          existingUserId = u.id;
          break;
        }
      }
      if (data.users.length < perPage) break;
      page += 1;
    }
  } catch (err: any) {
    logJson({ stage: 'user_lookup_failed', error: err?.message ?? 'unknown' });
    // Not fatal — we will try to invite and handle a duplicate error below.
  }

  let userId: string;
  let invited = false;
  let actionLink: string | null = null;

  if (existingUserId) {
    userId = existingUserId;
    logJson({
      stage: 'user_exists',
      user_id: userId,
      email: maskEmail(body.email),
    });
  } else {
    // 5. Generate an invite action link via auth admin API.
    try {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email: body.email,
        options: {
          redirectTo,
          data: {
            role: body.role,
            organization_id: organizationId,
            full_name: body.full_name ?? null,
          },
        },
      });
      if (error) throw error;
      userId = data.user?.id ?? '';
      actionLink = data.properties?.action_link ?? null;
      invited = true;
      if (!userId) throw new Error('generateLink returned no user id');
    } catch (err: any) {
      logJson({ stage: 'invite_link_failed', error: err?.message ?? 'unknown' });
      return jsonResponse(req, 500, {
        ok: false,
        error: 'Could not create invite link',
      });
    }
  }

  // 6. Upsert profile — the `handle_new_user` trigger creates a minimal
  // profiles row on auth.users insert, but role/organization_id may need
  // to be re-set because the trigger has no access to custom metadata
  // past what we pass. Safest: explicit update from here.
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        organization_id: organizationId,
        role: body.role,
        full_name: body.full_name ?? null,
        email: body.email,
      }, { onConflict: 'id' });
    if (error) throw error;
  } catch (err: any) {
    logJson({ stage: 'profile_upsert_failed', error: err?.message ?? 'unknown' });
    // Continue — not fatal enough to roll back the invite.
  }

  // 7. Audit log (never log the action link, never log raw email body)
  try {
    await supabase.from('audit_log').insert({
      actor: adminProfile.id,
      action: existingUserId ? 'invite_user_reissue' : 'invite_user',
      entity_type: 'profiles',
      entity_id: userId,
      diff: {
        organization_id: organizationId,
        role: body.role,
      },
    });
  } catch (err: any) {
    logJson({ stage: 'audit_insert_failed', error: err?.message ?? 'unknown' });
  }

  // 8. Send branded invite email (only when we actually generated a link)
  if (invited && actionLink) {
    const { subject, html, text } = buildInviteEmail({
      inviteUrl: actionLink,
      organizationName: organizationName ?? 'Brokz',
      inviterName: adminProfile.full_name ?? undefined,
      locale: body.locale ?? 'tr',
    });
    const sent = await sendEmail({
      to: body.email,
      subject,
      html,
      text,
    });
    if (!sent.ok) {
      logJson({ stage: 'email_failed', error: sent.error });
      // User was created; we still return ok so admin UI can retry send.
    } else {
      logJson({ stage: 'email_sent', email_id: sent.id });
    }
  }

  logJson({
    stage: 'done',
    user_id: userId,
    organization_id: organizationId,
    invited,
  });

  return jsonResponse(req, 200, {
    ok: true,
    data: {
      user_id: userId,
      organization_id: organizationId,
      invited,
    },
  });
});

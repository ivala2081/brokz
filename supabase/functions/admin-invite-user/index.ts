/**
 * admin-invite-user — admin-only endpoint to onboard a new user.
 *
 * Uses Supabase's built-in invite email (auth.admin.inviteUserByEmail).
 * The email content is configured in:
 *   Supabase Dashboard → Authentication → Email Templates → "Invite user"
 *
 * Pipeline:
 *   1. CORS preflight / POST guard.
 *   2. Zod validate body.
 *   3. requireAdmin(req).
 *   4. Resolve or create organization.
 *   5. Idempotent: if a user already exists for the email, skip invite.
 *   6. Call inviteUserByEmail — Supabase sends the invite email via its
 *      configured SMTP (set in Auth → Settings).
 *   7. Upsert profile row (role + organization_id).
 *   8. Audit log.
 *
 * Request  { email, organization_id?, organization_name?, country?,
 *            website?, contact_email?, role?, full_name?, locale? }
 * Response { ok: true, data: { user_id, organization_id, invited: boolean } }
 *
 * Env vars (auto-injected): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Required: ALLOWED_ORIGINS (CORS), PUBLIC_SITE_URL (redirect after accept).
 */

// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — Deno x import
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

import { handlePreflight } from '../_shared/cors.ts';
import { requireAdmin, jsonResponse, errorToResponse } from '../_shared/auth.ts';

const FN_NAME = 'admin-invite-user';

const BodySchema = z.object({
  email: z.string().email().max(160).transform((s: string) => s.trim().toLowerCase()),
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

function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
}

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 1) return '***' + email.slice(at);
  return email[0] + '***' + email.slice(at);
}

Deno.serve(async (req: Request) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResponse(req, 405, { ok: false, error: 'Method not allowed' });
  }

  logJson({ stage: 'start' });

  let ctx;
  try {
    ctx = await requireAdmin(req);
  } catch (err) {
    logJson({ stage: 'auth_failed', error: err instanceof Error ? err.message : 'unknown' });
    return errorToResponse(req, err);
  }

  const { supabase, profile: adminProfile } = ctx;

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
    } else if (body.role === 'customer') {
      return jsonResponse(req, 400, {
        ok: false,
        error: 'organization_id or organization_name is required for customer invites',
      });
    }
  } catch (err: any) {
    logJson({ stage: 'org_resolve_failed', error: err?.message ?? 'unknown' });
    return jsonResponse(req, 500, { ok: false, error: 'Could not resolve organization' });
  }

  const siteUrl = Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:4321';
  const redirectTo = `${siteUrl.replace(/\/$/, '')}/auth/accept-invite`;

  // Idempotency check
  let existingUserId: string | null = null;
  try {
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
  }

  let userId: string;
  let invited = false;

  if (existingUserId) {
    userId = existingUserId;
    logJson({ stage: 'user_exists', user_id: userId, email: maskEmail(body.email) });
  } else {
    // Use Supabase's built-in invite email (sent via Supabase Auth SMTP).
    // Configure email template at Supabase Dashboard → Auth → Email Templates → "Invite user".
    try {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(body.email, {
        redirectTo,
        data: {
          role: body.role,
          organization_id: organizationId,
          organization_name: organizationName,
          full_name: body.full_name ?? null,
          locale: body.locale ?? 'tr',
        },
      });
      if (error) throw error;
      userId = data.user?.id ?? '';
      invited = true;
      if (!userId) throw new Error('inviteUserByEmail returned no user id');
      logJson({ stage: 'invite_sent', user_id: userId, email: maskEmail(body.email) });
    } catch (err: any) {
      logJson({ stage: 'invite_failed', error: err?.message ?? 'unknown' });
      return jsonResponse(req, 500, {
        ok: false,
        error: err?.message ?? 'Could not send invite email',
      });
    }
  }

  // Upsert profile with role + org
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
  }

  // Audit
  try {
    await supabase.from('audit_log').insert({
      actor: adminProfile.id,
      action: existingUserId ? 'invite_user_reissue' : 'invite_user',
      entity_type: 'profiles',
      entity_id: userId,
      diff: { organization_id: organizationId, role: body.role },
    });
  } catch (err: any) {
    logJson({ stage: 'audit_insert_failed', error: err?.message ?? 'unknown' });
  }

  logJson({ stage: 'done', user_id: userId, organization_id: organizationId, invited });

  return jsonResponse(req, 200, {
    ok: true,
    data: { user_id: userId, organization_id: organizationId, invited },
  });
});

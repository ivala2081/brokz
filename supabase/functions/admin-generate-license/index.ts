/**
 * admin-generate-license — admin-only endpoint to issue a license key.
 *
 * Pipeline:
 *   1. CORS preflight / POST guard.
 *   2. Zod validate body.
 *   3. requireAdmin(req).
 *   4. Load order; verify status in ('pending','active'); ensure we are
 *      not issuing more licenses than the order.quantity allows.
 *   5. Generate a unique license key (retry up to 3× on DB unique-key
 *      collision — probabilistically impossible but defensive).
 *   6. Insert license row; flip order.status to 'active' if it was
 *      'pending'.
 *   7. Audit log the action.
 *   8. Send `license-issued` email to organization.contact_email.
 *
 * Request  { order_id, expires_at? (ISO 8601, optional, default +365d), locale? }
 * Response { ok: true, data: { license_id, license_key } } — key is
 *   flagged `sensitive` by convention. This is the ONE time admin sees
 *   the raw key. It is NEVER logged.
 *
 * Idempotency: if the order already has licenses covering its full
 * `quantity`, return 409 (conflict). Admin can explicitly re-run after
 * revoking an existing license.
 */

// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — Deno x
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

import { handlePreflight } from '../_shared/cors.ts';
import { sendEmail } from '../_shared/resend.ts';
import { requireAdmin, jsonResponse, errorToResponse } from '../_shared/auth.ts';
import { generateLicenseKey, maskLicenseKey } from '../_shared/license-key.ts';
import { build as buildLicenseIssued } from '../_shared/emails/license-issued.ts';

const FN_NAME = 'admin-generate-license';

const BodySchema = z.object({
  order_id: z.string().uuid(),
  expires_at: z.string().datetime({ offset: true }).optional(),
  locale: z.enum(['tr', 'en']).optional(),
});
type Body = z.infer<typeof BodySchema>;

function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
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

  // Load order + joined product + organization
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select(`
      id, status, quantity,
      organization:organizations ( id, name, contact_email ),
      product:products ( id, name )
    `)
    .eq('id', body.order_id)
    .is('deleted_at', null)
    .maybeSingle();

  if (orderErr) {
    logJson({ stage: 'order_lookup_failed', error: orderErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not load order' });
  }
  if (!order) return jsonResponse(req, 404, { ok: false, error: 'Order not found' });
  if (!['pending', 'active'].includes(order.status)) {
    return jsonResponse(req, 400, {
      ok: false,
      error: `Order status '${order.status}' cannot receive a license`,
    });
  }

  // Count existing active licenses on this order
  const { count: existingCount, error: countErr } = await supabase
    .from('licenses')
    .select('*', { count: 'exact', head: true })
    .eq('order_id', order.id)
    .is('deleted_at', null)
    .eq('status', 'active');

  if (countErr) {
    logJson({ stage: 'license_count_failed', error: countErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not count existing licenses' });
  }

  if ((existingCount ?? 0) >= order.quantity) {
    return jsonResponse(req, 409, {
      ok: false,
      error: 'Order is already fully licensed for its quantity',
    });
  }

  const expiresAt = body.expires_at
    ? new Date(body.expires_at)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // Generate + insert with retry on unique-collision
  let attempt = 0;
  let licenseId: string | null = null;
  let licenseKey: string | null = null;

  while (attempt < 3 && !licenseId) {
    attempt += 1;
    const candidate = generateLicenseKey();
    const { data, error } = await supabase
      .from('licenses')
      .insert({
        order_id: order.id,
        license_key: candidate,
        issued_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active',
      })
      .select('id')
      .single();

    if (!error && data) {
      licenseId = data.id;
      licenseKey = candidate;
      break;
    }
    // Postgres unique_violation => 23505
    if (error && (error as any).code === '23505') {
      logJson({ stage: 'license_key_collision_retry', attempt });
      continue;
    }
    // Other error => fatal
    logJson({ stage: 'license_insert_failed', error: error?.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not create license' });
  }

  if (!licenseId || !licenseKey) {
    return jsonResponse(req, 500, {
      ok: false,
      error: 'License key generator failed repeatedly',
    });
  }

  // Flip order to 'active' if it was 'pending'
  if (order.status === 'pending') {
    const { error: upErr } = await supabase
      .from('orders')
      .update({ status: 'active' })
      .eq('id', order.id);
    if (upErr) {
      logJson({ stage: 'order_status_update_failed', error: upErr.message });
      // Not fatal — license is live.
    }
  }

  // Audit — DO NOT include the raw key
  try {
    await supabase.from('audit_log').insert({
      actor: adminProfile.id,
      action: 'generate_license',
      entity_type: 'licenses',
      entity_id: licenseId,
      diff: {
        order_id: order.id,
        license_key_masked: maskLicenseKey(licenseKey),
        expires_at: expiresAt.toISOString(),
      },
    });
  } catch (err: any) {
    logJson({ stage: 'audit_insert_failed', error: err?.message ?? 'unknown' });
  }

  // Email the customer
  const org = Array.isArray(order.organization) ? order.organization[0] : order.organization;
  const product = Array.isArray(order.product) ? order.product[0] : order.product;

  if (org?.contact_email && product) {
    const { subject, html, text } = buildLicenseIssued({
      organizationName: org.name,
      productName: product.name,
      licenseKey,
      expiresAt: expiresAt.toISOString(),
      locale: body.locale ?? 'tr',
    });
    const sent = await sendEmail({ to: org.contact_email, subject, html, text });
    if (!sent.ok) {
      logJson({ stage: 'email_failed', error: sent.error });
    } else {
      logJson({ stage: 'email_sent', email_id: sent.id });
    }
  } else {
    logJson({ stage: 'email_skipped_no_contact_email' });
  }

  logJson({
    stage: 'done',
    license_id: licenseId,
    order_id: order.id,
    // NEVER log the raw license_key — only the masked form.
    license_key_masked: maskLicenseKey(licenseKey),
  });

  return jsonResponse(req, 200, {
    ok: true,
    data: {
      license_id: licenseId,
      // sensitive — return once to admin so they can paste if email fails.
      license_key: licenseKey,
      expires_at: expiresAt.toISOString(),
    },
  });
});

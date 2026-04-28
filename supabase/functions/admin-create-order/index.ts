/**
 * admin-create-order — admin-only endpoint to insert a pending order.
 *
 * Pipeline:
 *   1. CORS preflight / POST guard.
 *   2. Zod validate body.
 *   3. requireAdmin(req).
 *   4. Validate org exists + is active, product exists + is active.
 *   5. Insert order row (status='pending', total = quantity*unit_price).
 *   6. Audit log the action.
 *   7. Send order-confirmation email to organization.contact_email (best
 *      effort — email failure does not fail the call).
 *
 * Request  { organization_id, product_id, quantity, unit_price, notes?, locale? }
 * Response { ok: true, data: { order_id } }
 *
 * Idempotency: creating the same order twice IS legal (a customer may
 * intentionally order the same SKU twice). Admin UI provides an optional
 * `notes` disambiguator — if needed in Phase 2 we can add a client-supplied
 * `idempotency_key` column.
 */

// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — Deno x import
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

import { handlePreflight } from '../_shared/cors.ts';
import { sendEmail } from '../_shared/resend.ts';
import { requireAdmin, jsonResponse, errorToResponse } from '../_shared/auth.ts';
import { build as buildOrderConfirmation } from '../_shared/emails/order-confirmation.ts';

const FN_NAME = 'admin-create-order';

// ─── validation ──────────────────────────────────────────────────────
const BodySchema = z.object({
  organization_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive().max(10_000),
  unit_price: z.number().nonnegative().max(1_000_000_000),
  notes: z.string().max(2000).optional(),
  locale: z.enum(['tr', 'en']).optional(),
});
type Body = z.infer<typeof BodySchema>;

function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── handler ────────────────────────────────────────────────────────

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

  // Validate organization
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name, contact_email, status')
    .eq('id', body.organization_id)
    .maybeSingle();
  if (orgErr) {
    logJson({ stage: 'org_lookup_failed', error: orgErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not load organization' });
  }
  if (!org) return jsonResponse(req, 404, { ok: false, error: 'Organization not found' });
  if (org.status !== 'active') {
    return jsonResponse(req, 400, { ok: false, error: 'Organization is not active' });
  }

  // Validate product
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id, name, currency, is_active')
    .eq('id', body.product_id)
    .maybeSingle();
  if (prodErr) {
    logJson({ stage: 'product_lookup_failed', error: prodErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not load product' });
  }
  if (!product) return jsonResponse(req, 404, { ok: false, error: 'Product not found' });
  if (!product.is_active) {
    return jsonResponse(req, 400, { ok: false, error: 'Product is not active' });
  }

  const total = round2(body.quantity * body.unit_price);

  // Insert order
  const { data: order, error: insertErr } = await supabase
    .from('orders')
    .insert({
      organization_id: org.id,
      product_id: product.id,
      status: 'pending',
      quantity: body.quantity,
      unit_price: body.unit_price,
      total,
      currency: product.currency,
      notes: body.notes ?? null,
      created_by: adminProfile.id,
    })
    .select('id')
    .single();

  if (insertErr || !order) {
    logJson({ stage: 'order_insert_failed', error: insertErr?.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not create order' });
  }

  // Audit
  try {
    await supabase.from('audit_log').insert({
      actor: adminProfile.id,
      action: 'create_order',
      entity_type: 'orders',
      entity_id: order.id,
      diff: {
        organization_id: org.id,
        product_id: product.id,
        quantity: body.quantity,
        unit_price: body.unit_price,
        total,
        currency: product.currency,
      },
    });
  } catch (err: any) {
    logJson({ stage: 'audit_insert_failed', error: err?.message ?? 'unknown' });
  }

  // Email confirmation — best effort
  if (org.contact_email) {
    const { subject, html, text } = buildOrderConfirmation({
      organizationName: org.name,
      productName: product.name,
      orderId: order.id,
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
    order_id: order.id,
    organization_id: org.id,
    product_id: product.id,
  });

  return jsonResponse(req, 200, {
    ok: true,
    data: { order_id: order.id },
  });
});

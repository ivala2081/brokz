/**
 * admin-create-order — admin-only endpoint to insert a pending order.
 *
 * Pipeline:
 *   1. CORS preflight / POST guard.
 *   2. Zod validate body.
 *   3. requireAdmin(req).
 *   4. Validate org exists + is active, product exists + is active.
 *   5. Validate payment_wallet exists + is_active.
 *   6. Cross-field validation: fixed_term requires term_months.
 *   7. Compute total. Insert order row with payment/plan fields.
 *   8. Materialize subscription invoices via RPC.
 *   9. Fire-and-forget PDF generation for each new invoice.
 *  10. Audit log.
 *  11. Send order-confirmation email to organization.contact_email (best effort).
 *
 * Request  {
 *   organization_id, product_id, quantity, unit_price, notes?, locale?,
 *   payment_wallet_id, plan_kind?, term_months?, monthly_amount, period_start?
 * }
 * Response { ok: true, data: { order, invoices } }
 *
 * Idempotency: creating the same order twice IS legal.
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
  // payment / plan fields
  payment_wallet_id: z.string().uuid(),
  plan_kind: z.enum(['fixed_term', 'open_ended']).default('fixed_term'),
  term_months: z.number().int().min(1).max(60).optional(),
  monthly_amount: z.number().positive(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
type Body = z.infer<typeof BodySchema>;

function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Today in UTC as YYYY-MM-DD. */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Invoke generate-invoice-pdf for a list of invoice ids.
 * Uses Promise.allSettled — individual failures are logged but never throw.
 */
async function triggerPdfGeneration(invoiceIds: string[], logCtx: (p: Record<string, unknown>) => void): Promise<number> {
  const projectUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('PUBLIC_SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!projectUrl || !serviceRoleKey || invoiceIds.length === 0) return 0;

  const base = `${projectUrl.replace(/\/$/, '')}/functions/v1/generate-invoice-pdf`;
  const results = await Promise.allSettled(
    invoiceIds.map(id =>
      fetch(base, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_id: id }),
      }).then(r => {
        if (!r.ok) {
          return r.text().catch(() => '').then(body => {
            logCtx({ stage: 'pdf_generate_failed', invoice_id: id, status: r.status, body: body.slice(0, 200) });
          });
        }
      }),
    ),
  );

  let triggered = 0;
  for (const result of results) {
    if (result.status === 'fulfilled') triggered++;
    else logCtx({ stage: 'pdf_call_rejected', reason: String((result as PromiseRejectedResult).reason) });
  }
  return triggered;
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

  // Cross-field: fixed_term requires term_months
  if (body.plan_kind === 'fixed_term' && !body.term_months) {
    logJson({ stage: 'validation_failed', fields: ['term_months'] });
    return jsonResponse(req, 400, {
      ok: false,
      error: 'Validation failed',
      fields: { term_months: 'term_months is required for fixed_term plan' },
    });
  }

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

  // Validate payment wallet
  const { data: wallet, error: walletErr } = await supabase
    .from('payment_wallets')
    .select('id, is_active')
    .eq('id', body.payment_wallet_id)
    .maybeSingle();
  if (walletErr) {
    logJson({ stage: 'wallet_lookup_failed', error: walletErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not load payment wallet' });
  }
  if (!wallet) return jsonResponse(req, 404, { ok: false, error: 'Payment wallet not found' });
  if (!wallet.is_active) {
    return jsonResponse(req, 400, { ok: false, error: 'Payment wallet is not active' });
  }

  // Compute totals
  const total = round2(body.quantity * body.unit_price);
  const planTotal = body.plan_kind === 'fixed_term'
    ? round2(body.monthly_amount * body.term_months!)
    : round2(body.monthly_amount); // open_ended: monthly_amount is the initial/current amount

  const periodStart = body.period_start ?? todayUtc();

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
      // payment / plan fields
      payment_wallet_id: body.payment_wallet_id,
      plan_kind: body.plan_kind,
      term_months: body.term_months ?? null,
      monthly_amount: body.monthly_amount,
      period_start: periodStart,
    })
    .select('id, organization_id, product_id, status, quantity, unit_price, total, currency, plan_kind, term_months, monthly_amount, period_start')
    .single();

  if (insertErr || !order) {
    logJson({ stage: 'order_insert_failed', error: insertErr?.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not create order' });
  }

  logJson({ stage: 'order_inserted', order_id: order.id, plan_kind: body.plan_kind });

  // Materialize invoices via RPC
  let invoices: Array<{ id: string }> = [];
  if (body.plan_kind === 'fixed_term') {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('materialize_order_schedule', {
      p_order_id: order.id,
    });
    if (rpcErr) {
      logJson({ stage: 'materialize_schedule_failed', error: rpcErr.message });
      // Non-fatal — order is already inserted; caller can retry via dedicated endpoint.
    } else {
      invoices = (rpcData ?? []) as Array<{ id: string }>;
      logJson({ stage: 'schedule_materialized', invoice_count: invoices.length });
    }
  } else {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('issue_open_ended_next_invoice', {
      p_order_id: order.id,
    });
    if (rpcErr) {
      logJson({ stage: 'issue_open_ended_invoice_failed', error: rpcErr.message });
    } else {
      // RPC returns a single invoice row or a setof with one row
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (row) {
        invoices = [row as { id: string }];
        logJson({ stage: 'open_ended_invoice_issued', invoice_id: row.id });
      }
    }
  }

  // Fire-and-forget PDF generation for each invoice
  const invoiceIds = invoices.map((inv: any) => inv.id).filter(Boolean);
  if (invoiceIds.length > 0) {
    // Not awaited in the critical path — run concurrently after response preparation
    triggerPdfGeneration(invoiceIds, logJson).then(n => {
      logJson({ stage: 'pdf_triggers_dispatched', count: n });
    });
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
        plan_kind: body.plan_kind,
        term_months: body.term_months ?? null,
        monthly_amount: body.monthly_amount,
        plan_total: planTotal,
        currency: product.currency,
        payment_wallet_id: body.payment_wallet_id,
        invoices_created: invoiceIds.length,
      },
    });
  } catch (err: any) {
    logJson({ stage: 'audit_insert_failed', error: err?.message ?? 'unknown' });
  }

  // Email confirmation — best effort. Include a brief plan summary.
  if (org.contact_email) {
    const planSummary = body.plan_kind === 'fixed_term'
      ? `${body.term_months} month(s) × ${body.monthly_amount} ${product.currency}`
      : `Open-ended · ${body.monthly_amount} ${product.currency}/month`;

    const { subject, html, text } = buildOrderConfirmation({
      organizationName: org.name,
      productName: product.name,
      orderId: order.id,
      locale: body.locale ?? 'tr',
      planSummary,
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
    invoices_count: invoices.length,
  });

  return jsonResponse(req, 200, {
    ok: true,
    data: { order, invoices },
  });
});

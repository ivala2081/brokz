/**
 * admin-issue-invoice — admin-only endpoint to issue an invoice for an order.
 *
 * Pipeline:
 *   1. CORS preflight / POST guard.
 *   2. Zod validate body.
 *   3. requireAdmin(req).
 *   4. Load order (+ org). Verify not soft-deleted.
 *   5. Idempotency: if an active (status != 'draft' AND status != 'overdue'?
 *      we consider any NON-cancelled, NON-soft-deleted invoice as existing)
 *      invoice already exists for this order, return the existing row.
 *      Note: `invoice_status` enum has no 'cancelled' — cancellation is
 *      done via `deleted_at`. So "existing" == any row with deleted_at IS NULL.
 *   6. Allocate the next invoice_number via the `next_invoice_number(year)`
 *      RPC — atomic per-year counter (see migration
 *      `20260422140000_invoice_number_sequence.sql`).
 *   7. Insert invoice (status='sent', issued_at=now, due_at=provided).
 *   8. Audit log.
 *   9. Send `invoice-issued` email to organization.contact_email with
 *      a dashboard link.
 *
 * Request  { order_id, due_at (ISO 8601), locale? }
 * Response { ok: true, data: { invoice_id, invoice_number } }
 */

// deno-lint-ignore-file no-explicit-any
// @ts-ignore — Deno std
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-ignore — Deno x
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

import { handlePreflight } from '../_shared/cors.ts';
import { sendEmail } from '../_shared/resend.ts';
import { requireAdmin, jsonResponse, errorToResponse } from '../_shared/auth.ts';
import { build as buildInvoiceIssued } from '../_shared/emails/invoice-issued.ts';

// @ts-ignore — Deno global
declare const Deno: { env: { get(key: string): string | undefined } };

const FN_NAME = 'admin-issue-invoice';

const BodySchema = z.object({
  order_id: z.string().uuid(),
  due_at: z.string().datetime({ offset: true }),
  locale: z.enum(['tr', 'en']).optional(),
});
type Body = z.infer<typeof BodySchema>;

function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
}

serve(async (req: Request) => {
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

  // Load order + organization
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select(`
      id, total, currency, organization_id,
      organization:organizations ( id, name, contact_email )
    `)
    .eq('id', body.order_id)
    .is('deleted_at', null)
    .maybeSingle();

  if (orderErr) {
    logJson({ stage: 'order_lookup_failed', error: orderErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not load order' });
  }
  if (!order) return jsonResponse(req, 404, { ok: false, error: 'Order not found' });

  const org = Array.isArray(order.organization) ? order.organization[0] : order.organization;

  // Idempotency — any non-soft-deleted invoice for this order counts as existing.
  const { data: existing, error: existingErr } = await supabase
    .from('invoices')
    .select('id, invoice_number')
    .eq('order_id', order.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (existingErr) {
    logJson({ stage: 'invoice_lookup_failed', error: existingErr.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not check existing invoices' });
  }

  if (existing) {
    logJson({
      stage: 'idempotent_return_existing',
      invoice_id: existing.id,
      invoice_number: existing.invoice_number,
    });
    return jsonResponse(req, 200, {
      ok: true,
      data: {
        invoice_id: existing.id,
        invoice_number: existing.invoice_number,
        reused: true,
      },
    });
  }

  // Allocate invoice number atomically
  const year = new Date().getUTCFullYear();
  const { data: numberRow, error: numberErr } = await supabase.rpc('next_invoice_number', {
    p_year: year,
  });
  if (numberErr || !numberRow) {
    logJson({ stage: 'invoice_number_alloc_failed', error: numberErr?.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not allocate invoice number' });
  }
  const invoiceNumber: string = typeof numberRow === 'string' ? numberRow : String(numberRow);

  // Insert invoice
  const nowIso = new Date().toISOString();
  const { data: invoice, error: insertErr } = await supabase
    .from('invoices')
    .insert({
      order_id: order.id,
      organization_id: order.organization_id,
      invoice_number: invoiceNumber,
      amount: order.total,
      currency: order.currency,
      status: 'sent',
      issued_at: nowIso,
      due_at: body.due_at,
    })
    .select('id')
    .single();

  if (insertErr || !invoice) {
    logJson({ stage: 'invoice_insert_failed', error: insertErr?.message });
    return jsonResponse(req, 500, { ok: false, error: 'Could not create invoice' });
  }

  // Audit
  try {
    await supabase.from('audit_log').insert({
      actor: adminProfile.id,
      action: 'issue_invoice',
      entity_type: 'invoices',
      entity_id: invoice.id,
      diff: {
        order_id: order.id,
        invoice_number: invoiceNumber,
        amount: order.total,
        currency: order.currency,
        due_at: body.due_at,
      },
    });
  } catch (err: any) {
    logJson({ stage: 'audit_insert_failed', error: err?.message ?? 'unknown' });
  }

  // PDF generation — best-effort. Calls generate-invoice-pdf on the same
  // project using service_role. Failure here does NOT fail the invoice.
  try {
    const projectUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('PUBLIC_SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (projectUrl && serviceRoleKey) {
      const pdfRes = await fetch(`${projectUrl.replace(/\/$/, '')}/functions/v1/generate-invoice-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_id: invoice.id }),
      });
      if (!pdfRes.ok) {
        const body = await pdfRes.text().catch(() => '');
        logJson({ stage: 'pdf_generate_failed', status: pdfRes.status, body: body.slice(0, 200) });
      } else {
        logJson({ stage: 'pdf_generated' });
      }
    }
  } catch (err: any) {
    logJson({ stage: 'pdf_call_failed', error: err?.message });
  }

  // Email
  const siteUrl = (Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:4321').replace(/\/$/, '');
  const invoiceUrl = `${siteUrl}/dashboard/invoices/view?id=${invoice.id}`;

  if (org?.contact_email) {
    const { subject, html, text } = buildInvoiceIssued({
      organizationName: org.name,
      invoiceNumber,
      amount: Number(order.total),
      currency: order.currency,
      dueAt: body.due_at,
      invoiceUrl,
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
    invoice_id: invoice.id,
    invoice_number: invoiceNumber,
  });

  return jsonResponse(req, 200, {
    ok: true,
    data: {
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
    },
  });
});

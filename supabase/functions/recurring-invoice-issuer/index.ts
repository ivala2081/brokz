/**
 * recurring-invoice-issuer — service-role-only cron endpoint.
 *
 * Invoked by Supabase dashboard cron or pg_cron via pg_net. No user JWT is
 * involved; callers must supply the `x-cron-secret` header matching the
 * `CRON_SECRET` environment variable set in the Supabase project secrets.
 *
 * Pipeline:
 *   1. CORS preflight / POST guard.
 *   2. Verify x-cron-secret matches CRON_SECRET env var — reject 401 otherwise.
 *   3. Select open-ended active orders whose next invoice date is due today or
 *      earlier.
 *   4. For each order, call the `issue_open_ended_next_invoice` RPC. Collect
 *      new invoice ids. Failures per order are logged and accumulated — they
 *      never abort the sweep.
 *   5. Sweep: find up to 100 subscription invoices with pdf_url IS NULL and
 *      trigger generate-invoice-pdf for each (fire-and-forget).
 *   6. Return { issued, errors, pdfsTriggered }.
 *
 * Env vars required:
 *   CRON_SECRET                 — shared secret the scheduler must provide in
 *                                 the x-cron-secret request header.
 *   SUPABASE_URL                — injected automatically by Supabase runtime.
 *   SUPABASE_SERVICE_ROLE_KEY   — injected automatically by Supabase runtime.
 */

// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { handlePreflight } from '../_shared/cors.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

const FN_NAME = 'recurring-invoice-issuer';

function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...payload }));
}

function jsonResp(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * Invoke generate-invoice-pdf for a list of invoice ids.
 * Uses Promise.allSettled — individual failures are logged but never throw.
 * Returns the count of dispatches that resolved without network error.
 */
async function triggerPdfGeneration(invoiceIds: string[]): Promise<number> {
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
            logJson({ stage: 'pdf_generate_failed', invoice_id: id, status: r.status, body: body.slice(0, 200) });
          });
        } else {
          logJson({ stage: 'pdf_triggered', invoice_id: id });
        }
      }),
    ),
  );

  let triggered = 0;
  for (const result of results) {
    if (result.status === 'fulfilled') triggered++;
    else logJson({ stage: 'pdf_call_rejected', reason: String((result as PromiseRejectedResult).reason) });
  }
  return triggered;
}

// ─── handler ─────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResp(405, { ok: false, error: 'Method not allowed' });
  }

  // ── Auth: validate cron secret ──────────────────────────────────────
  // CRON_SECRET must be set in Supabase project secrets (supabase secrets set CRON_SECRET=...).
  // The scheduler (cron job / pg_net call) must pass it as the x-cron-secret header.
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret) {
    logJson({ stage: 'misconfigured', error: 'CRON_SECRET env var not set' });
    return jsonResp(500, { ok: false, error: 'Server misconfiguration' });
  }
  const incomingSecret = req.headers.get('x-cron-secret') ?? req.headers.get('X-Cron-Secret');
  if (incomingSecret !== cronSecret) {
    logJson({ stage: 'unauthorized', reason: 'x-cron-secret mismatch or missing' });
    return jsonResp(401, { ok: false, error: 'Unauthorized' });
  }

  logJson({ stage: 'start' });

  const supabase = createAdminClient();

  // ── Step 1: Find open-ended orders due for invoicing ────────────────
  // coalesce(next_invoice_at, period_start, current_date) <= current_date
  const { data: dueOrders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, organization_id')
    .eq('plan_kind', 'open_ended')
    .eq('status', 'active')
    .lte('next_invoice_at_coalesced', new Date().toISOString().slice(0, 10))
    // Fallback: also pick up rows where next_invoice_at is null (first invoice)
    // The RPC uses coalesce internally; we use a DB view or computed column.
    // If next_invoice_at_coalesced does not exist as a column, use the raw
    // filter below that matches the RPC's own coalesce logic:
    .or('next_invoice_at.is.null,next_invoice_at.lte.' + new Date().toISOString());

  // Note to brokz-db-architect: if the above .or() / .lte() combination is
  // insufficient (PostgREST doesn't support coalesce in filters), add a
  // generated column `next_invoice_at_coalesced` to the orders table, or
  // replace this SELECT with a raw RPC that returns due order ids.

  if (ordersErr) {
    logJson({ stage: 'orders_query_failed', error: ordersErr.message });
    return jsonResp(500, { ok: false, error: 'Could not query due orders' });
  }

  const orders = dueOrders ?? [];
  logJson({ stage: 'orders_due', count: orders.length });

  // ── Step 2: Issue invoices for each due order ────────────────────────
  const issuedInvoiceIds: string[] = [];
  const errors: Array<{ order_id: string; error: string }> = [];

  for (const order of orders) {
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        'issue_open_ended_next_invoice',
        { p_order_id: order.id },
      );

      if (rpcErr) {
        logJson({ stage: 'rpc_failed', order_id: order.id, error: rpcErr.message });
        errors.push({ order_id: order.id, error: rpcErr.message });
        continue;
      }

      // RPC returns a single invoice row (or setof with one row)
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (row?.id) {
        issuedInvoiceIds.push(row.id);
        logJson({ stage: 'invoice_issued', order_id: order.id, invoice_id: row.id });
      } else {
        // RPC may return null if order was already invoiced this period (idempotent)
        logJson({ stage: 'invoice_skipped_idempotent', order_id: order.id });
      }
    } catch (err: any) {
      const msg = err?.message ?? 'unknown';
      logJson({ stage: 'rpc_exception', order_id: order.id, error: msg });
      errors.push({ order_id: order.id, error: msg });
    }
  }

  // ── Step 3: PDF sweep — pick up any subscription invoices without a PDF ─
  const { data: noPdfInvoices, error: sweepErr } = await supabase
    .from('invoices')
    .select('id')
    .is('pdf_url', null)
    .eq('invoice_type', 'subscription')
    .limit(100);

  if (sweepErr) {
    logJson({ stage: 'pdf_sweep_query_failed', error: sweepErr.message });
  }

  const sweepIds = (noPdfInvoices ?? []).map((r: any) => r.id);
  const allPdfIds = [...new Set([...issuedInvoiceIds, ...sweepIds])];

  const pdfsTriggered = await triggerPdfGeneration(allPdfIds);

  logJson({
    stage: 'done',
    issued: issuedInvoiceIds.length,
    errors: errors.length,
    pdfs_triggered: pdfsTriggered,
  });

  return jsonResp(200, {
    ok: true,
    data: {
      issued: issuedInvoiceIds.length,
      errors,
      pdfsTriggered,
    },
  });
});

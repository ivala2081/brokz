/**
 * generate-invoice-pdf — build a PDF for an invoice and upload it to
 * the `invoices` Storage bucket. Sets `invoices.pdf_url` to the object path.
 *
 * Caller: admin only (or service_role, e.g. called at the end of
 * admin-issue-invoice). Customers never call this directly.
 *
 * Body:  { invoice_id: string }
 * Response:
 *   { ok: true, data: { storage_path, signed_url } }
 *
 * Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto),
 *           ALLOWED_ORIGINS, PUBLIC_SITE_URL (optional)
 */

// deno-lint-ignore-file no-explicit-any
// @ts-ignore — Deno std
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-ignore — Deno x
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';
// @ts-ignore — pdf-lib via esm.sh
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

import { handlePreflight } from '../_shared/cors.ts';
import { requireAdmin, jsonResponse, errorToResponse, UnauthorizedError } from '../_shared/auth.ts';
import { createAdminClient } from '../_shared/supabase-admin.ts';

// @ts-ignore — Deno global
declare const Deno: { env: { get(key: string): string | undefined } };

const FN_NAME = 'generate-invoice-pdf';
const BUCKET = 'invoices';
const SIGNED_URL_TTL = 60 * 60; // 1 hour

const BodySchema = z.object({
    invoice_id: z.string().uuid(),
});
type Body = z.infer<typeof BodySchema>;

function logJson(p: Record<string, unknown>): void {
    console.log(JSON.stringify({ fn: FN_NAME, ts: new Date().toISOString(), ...p }));
}

function extractBearer(req: Request): string | null {
    const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
    if (!auth) return null;
    const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
    return match?.[1] ?? null;
}

interface InvoiceRow {
    id: string;
    invoice_number: string;
    amount: number | string;
    currency: string;
    status: string;
    issued_at: string | null;
    due_at: string | null;
    order: {
        id: string;
        quantity: number;
        unit_price: number | string;
        total: number | string;
        product: { name: string; description: string | null } | null;
    } | null;
    organization: {
        id: string;
        name: string;
        country: string | null;
        contact_email: string | null;
        website: string | null;
    } | null;
}

async function buildPdfBytes(invoice: InvoiceRow): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const mono = await doc.embedFont(StandardFonts.Courier);

    const BRAND = rgb(0 / 255, 192 / 255, 51 / 255);   // #00C033
    const INK = rgb(5 / 255, 10 / 255, 6 / 255);        // #050A06
    const MUTED = rgb(100 / 255, 116 / 255, 139 / 255); // slate-500

    let y = 800;
    const left = 48;

    // Brand header
    page.drawText('BROKZ', { x: left, y, size: 22, font: bold, color: INK });
    page.drawText('TECH', { x: left + 86, y, size: 22, font, color: BRAND });
    y -= 14;
    page.drawText('brokztech.com', { x: left, y, size: 9, font, color: MUTED });

    // Invoice title
    page.drawText('INVOICE', { x: 420, y: 800, size: 20, font: bold, color: INK });
    page.drawText(invoice.invoice_number, {
        x: 420, y: 780, size: 12, font: mono, color: INK,
    });
    page.drawText(`Status: ${invoice.status.toUpperCase()}`, {
        x: 420, y: 765, size: 9, font, color: MUTED,
    });

    y = 740;
    page.drawLine({
        start: { x: left, y }, end: { x: 547, y },
        thickness: 1, color: rgb(0.9, 0.9, 0.9),
    });

    // Bill-to
    y -= 22;
    page.drawText('BILL TO', { x: left, y, size: 9, font: bold, color: MUTED });
    y -= 14;
    page.drawText(invoice.organization?.name ?? '—', { x: left, y, size: 12, font: bold, color: INK });
    y -= 14;
    if (invoice.organization?.country) {
        page.drawText(invoice.organization.country, { x: left, y, size: 10, font, color: INK });
        y -= 12;
    }
    if (invoice.organization?.contact_email) {
        page.drawText(invoice.organization.contact_email, { x: left, y, size: 10, font, color: INK });
        y -= 12;
    }

    // Dates
    let rightY = 720;
    const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' }) : '—';
    page.drawText('ISSUED', { x: 420, y: rightY, size: 9, font: bold, color: MUTED });
    page.drawText(fmtDate(invoice.issued_at), { x: 420, y: rightY - 14, size: 10, font, color: INK });
    rightY -= 36;
    page.drawText('DUE', { x: 420, y: rightY, size: 9, font: bold, color: MUTED });
    page.drawText(fmtDate(invoice.due_at), { x: 420, y: rightY - 14, size: 10, font, color: INK });

    // Line items table
    y = 610;
    page.drawRectangle({
        x: left, y: y - 4, width: 499, height: 22,
        color: rgb(245 / 255, 247 / 255, 250 / 255),
    });
    page.drawText('DESCRIPTION', { x: left + 8, y: y + 4, size: 9, font: bold, color: MUTED });
    page.drawText('QTY', { x: 360, y: y + 4, size: 9, font: bold, color: MUTED });
    page.drawText('UNIT', { x: 410, y: y + 4, size: 9, font: bold, color: MUTED });
    page.drawText('TOTAL', { x: 490, y: y + 4, size: 9, font: bold, color: MUTED });
    y -= 28;

    const order = invoice.order;
    const productName = order?.product?.name ?? 'Service';
    const qty = order?.quantity ?? 1;
    const unit = Number(order?.unit_price ?? invoice.amount);
    const total = Number(order?.total ?? invoice.amount);
    const curr = invoice.currency;
    const fmtMoney = (n: number) => `${curr} ${n.toFixed(2)}`;

    page.drawText(productName, { x: left + 8, y, size: 11, font, color: INK });
    if (order?.product?.description) {
        y -= 12;
        const desc = order.product.description.length > 80 ? order.product.description.slice(0, 80) + '…' : order.product.description;
        page.drawText(desc, { x: left + 8, y, size: 9, font, color: MUTED });
    }
    page.drawText(String(qty), { x: 360, y: y + (order?.product?.description ? 12 : 0), size: 11, font, color: INK });
    page.drawText(fmtMoney(unit), { x: 410, y: y + (order?.product?.description ? 12 : 0), size: 11, font, color: INK });
    page.drawText(fmtMoney(total), { x: 490, y: y + (order?.product?.description ? 12 : 0), size: 11, font, color: INK });

    // Totals
    y -= 40;
    page.drawLine({
        start: { x: 350, y: y + 8 }, end: { x: 547, y: y + 8 },
        thickness: 0.5, color: rgb(0.85, 0.85, 0.85),
    });
    page.drawText('TOTAL', { x: 360, y, size: 10, font: bold, color: MUTED });
    page.drawText(fmtMoney(Number(invoice.amount)), { x: 490, y, size: 14, font: bold, color: INK });

    // Footer
    page.drawLine({
        start: { x: left, y: 90 }, end: { x: 547, y: 90 },
        thickness: 0.5, color: rgb(0.9, 0.9, 0.9),
    });
    page.drawText('Thank you for your business.', { x: left, y: 72, size: 9, font, color: MUTED });
    page.drawText('Questions? Reply to the email that delivered this invoice.', {
        x: left, y: 60, size: 9, font, color: MUTED,
    });
    page.drawText('Brokz Tech · brokztech@gmail.com', {
        x: left, y: 48, size: 8, font, color: MUTED,
    });

    return await doc.save();
}

serve(async (req: Request) => {
    const pre = handlePreflight(req);
    if (pre) return pre;

    if (req.method !== 'POST') {
        return jsonResponse(req, 405, { ok: false, error: 'Method not allowed' });
    }

    // Allow service_role OR admin JWT (so admin-issue-invoice can call internally).
    const token = extractBearer(req);
    if (!token) return errorToResponse(req, new UnauthorizedError());
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const isServiceRole = serviceRoleKey !== '' && token === serviceRoleKey;
    if (!isServiceRole) {
        try { await requireAdmin(req); }
        catch (err) { return errorToResponse(req, err); }
    }

    let raw: unknown;
    try { raw = await req.json(); }
    catch { return jsonResponse(req, 400, { ok: false, error: 'Invalid JSON body' }); }

    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
        return jsonResponse(req, 400, { ok: false, error: 'Validation failed' });
    }
    const body: Body = parsed.data;

    const supabase = createAdminClient();

    // Load invoice with join
    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
            id, invoice_number, amount, currency, status, issued_at, due_at,
            order:orders (
                id, quantity, unit_price, total,
                product:products ( name, description )
            ),
            organization:organizations ( id, name, country, contact_email, website )
        `)
        .eq('id', body.invoice_id)
        .maybeSingle();

    if (error) {
        logJson({ stage: 'invoice_lookup_failed', error: error.message });
        return jsonResponse(req, 500, { ok: false, error: 'Could not load invoice' });
    }
    if (!invoice) {
        return jsonResponse(req, 404, { ok: false, error: 'Invoice not found' });
    }

    const normalizedOrder = Array.isArray(invoice.order) ? invoice.order[0] : invoice.order;
    const normalizedOrg = Array.isArray(invoice.organization) ? invoice.organization[0] : invoice.organization;
    const normalizedProduct = normalizedOrder?.product && Array.isArray((normalizedOrder as any).product)
        ? (normalizedOrder as any).product[0]
        : (normalizedOrder as any)?.product;

    const invoiceRow: InvoiceRow = {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        issued_at: invoice.issued_at,
        due_at: invoice.due_at,
        order: normalizedOrder ? {
            id: normalizedOrder.id,
            quantity: normalizedOrder.quantity,
            unit_price: normalizedOrder.unit_price,
            total: normalizedOrder.total,
            product: normalizedProduct ?? null,
        } : null,
        organization: normalizedOrg ?? null,
    };

    if (!invoiceRow.organization?.id) {
        return jsonResponse(req, 500, { ok: false, error: 'Invoice has no organization' });
    }

    let bytes: Uint8Array;
    try {
        bytes = await buildPdfBytes(invoiceRow);
    } catch (err: any) {
        logJson({ stage: 'pdf_build_failed', error: err?.message });
        return jsonResponse(req, 500, { ok: false, error: 'PDF generation failed' });
    }

    const objectPath = `${invoiceRow.organization.id}/${invoiceRow.id}.pdf`;

    const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, bytes, {
            contentType: 'application/pdf',
            upsert: true,
            cacheControl: '3600',
        });

    if (uploadErr) {
        logJson({ stage: 'upload_failed', error: uploadErr.message });
        return jsonResponse(req, 500, { ok: false, error: 'Upload failed' });
    }

    // Persist path on invoice
    const { error: updErr } = await supabase
        .from('invoices')
        .update({ pdf_url: objectPath })
        .eq('id', invoiceRow.id);
    if (updErr) {
        logJson({ stage: 'invoice_update_failed', error: updErr.message });
    }

    // Return a short-lived signed URL for immediate download
    const { data: signed, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(objectPath, SIGNED_URL_TTL);

    if (signErr || !signed) {
        return jsonResponse(req, 200, {
            ok: true,
            data: { storage_path: objectPath, signed_url: null },
        });
    }

    logJson({ stage: 'done', invoice_id: invoiceRow.id, path: objectPath });
    return jsonResponse(req, 200, {
        ok: true,
        data: {
            storage_path: objectPath,
            signed_url: signed.signedUrl,
        },
    });
});

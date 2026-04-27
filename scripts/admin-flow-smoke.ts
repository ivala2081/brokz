/**
 * Admin flow smoke — tests the direct-insert path that NewOrderDialog /
 * IssueInvoiceDialog use when Edge Functions are unreachable (CORS or other).
 *
 * Usage: bun run test:admin-flow
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseEnv(path: string): Record<string, string> {
    const text = readFileSync(path, 'utf8');
    const out: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
        const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
        if (m) out[m[1]] = m[2].replace(/^"|"$/g, '');
    }
    return out;
}

const env = parseEnv(resolve(process.cwd(), '.env'));
const URL = env.PUBLIC_SUPABASE_URL;
const ANON = env.PUBLIC_SUPABASE_ANON_KEY;

async function main() {
    const admin = createClient(URL, ANON, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const ADMIN_EMAIL = process.env.BROKZ_ADMIN_EMAIL ?? 'brokztech@gmail.com';
    const ADMIN_PW = process.env.BROKZ_ADMIN_PASSWORD;
    if (!ADMIN_PW) {
        console.log('Set BROKZ_ADMIN_PASSWORD env var first:');
        console.log('  BROKZ_ADMIN_PASSWORD="..." bun run test:admin-flow');
        process.exit(2);
    }
    const { error: loginErr } = await admin.auth.signInWithPassword({
        email: ADMIN_EMAIL, password: ADMIN_PW,
    });
    if (loginErr) {
        console.log('✗ admin login: ' + loginErr.message);
        process.exit(1);
    }
    console.log('✓ admin logged in');

    // Pick any org
    const { data: orgs } = await admin.from('organizations').select('id, name').limit(1);
    if (!orgs?.length) { console.log('✗ no org in DB'); process.exit(1); }
    const orgId = orgs[0].id;
    console.log(`✓ org available: ${orgs[0].name}`);

    // Pick any product
    const { data: prods } = await admin.from('products').select('id, name, base_price').limit(1);
    if (!prods?.length) { console.log('✗ no product in DB'); process.exit(1); }
    const prodId = prods[0].id;
    console.log(`✓ product available: ${prods[0].name}`);

    // ─── Scenario 1: Try insert WITH new billing columns ──────────────────
    const fullPayload = {
        organization_id: orgId,
        product_id: prodId,
        status: 'pending',
        quantity: 1,
        unit_price: Number(prods[0].base_price),
        total: Number(prods[0].base_price),
        currency: 'USD',
        billing_type: 'onetime',
        notes: 'admin flow smoke — safe to delete',
    };
    let orderInsert = await admin.from('orders').insert(fullPayload).select('id').single();
    let usedFallback = false;

    if (orderInsert.error && /billing_type|period_start|next_invoice_at|column/i.test(orderInsert.error.message ?? '')) {
        // Schema missing new columns — retry with legacy
        usedFallback = true;
        const legacy = { ...fullPayload } as Record<string, unknown>;
        delete legacy.billing_type;
        orderInsert = await admin.from('orders').insert(legacy).select('id').single();
    }

    if (orderInsert.error) {
        console.log('✗ order insert: ' + orderInsert.error.message);
        process.exit(1);
    }
    console.log(`✓ order insert ${usedFallback ? '(legacy fallback)' : '(new schema)'} id=${orderInsert.data?.id}`);

    // ─── Scenario 2: Client-side invoice_number generation ────────────────
    const year = new Date().getUTCFullYear();
    const prefix = `BRKZ-${year}-`;
    const { data: lastRow } = await admin.from('invoices')
        .select('invoice_number')
        .ilike('invoice_number', `${prefix}%`)
        .order('invoice_number', { ascending: false })
        .limit(1).maybeSingle();
    const lastNum = lastRow?.invoice_number?.split('-').pop() ?? '000000';
    const nextNum = String(parseInt(lastNum, 10) + 1).padStart(6, '0');
    const invNumber = `${prefix}${nextNum}`;
    console.log(`✓ client-side invoice_number: ${invNumber}`);

    const invoiceInsert = await admin.from('invoices').insert({
        order_id: orderInsert.data!.id,
        organization_id: orgId,
        invoice_number: invNumber,
        amount: 100,
        currency: 'USD',
        status: 'sent',
        issued_at: new Date().toISOString(),
        due_at: new Date(Date.now() + 14 * 86400_000).toISOString(),
    }).select('id').single();

    if (invoiceInsert.error) {
        console.log('✗ invoice insert: ' + invoiceInsert.error.message);
        // cleanup order
        await admin.from('orders').delete().eq('id', orderInsert.data!.id);
        process.exit(1);
    }
    console.log(`✓ invoice insert id=${invoiceInsert.data?.id}`);

    // Cleanup
    await admin.from('invoices').delete().eq('id', invoiceInsert.data!.id);
    await admin.from('orders').delete().eq('id', orderInsert.data!.id);
    console.log('✓ cleanup complete');
    console.log('\nAll admin direct-insert scenarios passed.');
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });

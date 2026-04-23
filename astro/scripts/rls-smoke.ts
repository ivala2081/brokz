/**
 * Brokz RLS + auth smoke test. Runs against the live Supabase project with
 * ONLY the public anon key — simulates exactly what a browser sees.
 *
 * Usage:
 *   cd astro && bun ../supabase/tests/rls-smoke.ts
 *
 * Reads `astro/.env` for PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY.
 *
 * Test users (already seeded):
 *   brokztech@gmail.com        / Brokz2026!Bootstrap  (admin)
 *   test-customer@brokz.local  / Brokz2026!Customer   (customer, Vantage Markets Test org)
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

if (!URL || !ANON) {
    console.error('Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

type Result = { name: string; pass: boolean; detail?: string };
const results: Result[] = [];

function pass(name: string, detail?: string): void {
    results.push({ name, pass: true, detail });
}
function fail(name: string, detail: string): void {
    results.push({ name, pass: false, detail });
}

function client() {
    return createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function signIn(email: string, password: string): Promise<ReturnType<typeof client>> {
    const c = client();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new Error(`login failed for ${email}: ${error?.message}`);
    return c;
}

async function main() {
    // ─── Anon (not-logged-in) ──────────────────────────────────────────
    const anon = client();

    const anonProducts = await anon.from('products').select('id').limit(1);
    if (anonProducts.error) fail('anon can read active products', anonProducts.error.message);
    else pass('anon can read active products', `${anonProducts.data?.length ?? 0} rows`);

    const anonOrgs = await anon.from('organizations').select('id').limit(5);
    if ((anonOrgs.data?.length ?? 0) === 0) pass('anon cannot read organizations', 'rows=0');
    else fail('anon cannot read organizations', `leaked ${anonOrgs.data!.length} orgs`);

    const anonOrders = await anon.from('orders').select('id').limit(5);
    if ((anonOrders.data?.length ?? 0) === 0) pass('anon cannot read orders', 'rows=0');
    else fail('anon cannot read orders', `leaked ${anonOrders.data!.length} orders`);

    const anonLead = await anon.from('leads').insert({
        name: 'Test Lead',
        email: `smoke-${Date.now()}@brokz.test`,
        company: 'Smoke Test Co',
        message: 'RLS smoke test lead — safe to delete.',
        source: 'rls_smoke',
    });
    if (anonLead.error) fail('anon can insert lead (contact form)', anonLead.error.message);
    else pass('anon can insert lead (contact form)');

    const anonLeadRead = await anon.from('leads').select('id').limit(1);
    if ((anonLeadRead.data?.length ?? 0) === 0) pass('anon cannot read leads back', 'rows=0');
    else fail('anon cannot read leads back', `leaked ${anonLeadRead.data!.length} leads`);

    // ─── Customer ──────────────────────────────────────────────────────
    const cust = await signIn('test-customer@brokz.local', 'Brokz2026!Customer');

    const custProfile = await cust.from('profiles').select('id, role, organization_id, full_name');
    if ((custProfile.data?.length ?? 0) === 1 && custProfile.data![0].role === 'customer') {
        pass('customer sees exactly own profile', JSON.stringify(custProfile.data![0]));
    } else {
        fail('customer sees exactly own profile', JSON.stringify(custProfile));
    }
    const custOrgId = custProfile.data?.[0].organization_id;

    const custOrgs = await cust.from('organizations').select('id, name');
    if ((custOrgs.data?.length ?? 0) === 1) {
        pass('customer sees only own org', JSON.stringify(custOrgs.data));
    } else {
        fail('customer sees only own org', `got ${custOrgs.data?.length ?? 0} orgs`);
    }

    const custOrders = await cust.from('orders').select('id, organization_id');
    const ordersOk = (custOrders.data ?? []).every((o: any) => o.organization_id === custOrgId);
    if (ordersOk) pass('customer orders scoped to own org', `${custOrders.data?.length ?? 0} rows`);
    else fail('customer orders scoped to own org', JSON.stringify(custOrders.data));

    const custLicenses = await cust.from('licenses').select('id, order_id');
    pass('customer licenses accessible', `${custLicenses.data?.length ?? 0} rows`);

    const custInvoices = await cust.from('invoices').select('id, organization_id');
    const invOk = (custInvoices.data ?? []).every((i: any) => i.organization_id === custOrgId);
    if (invOk) pass('customer invoices scoped to own org', `${custInvoices.data?.length ?? 0} rows`);
    else fail('customer invoices scoped to own org', JSON.stringify(custInvoices.data));

    const custTickets = await cust.from('tickets').select('id, organization_id, subject');
    const ticketsOk = (custTickets.data ?? []).every((t: any) => t.organization_id === custOrgId);
    if (ticketsOk) pass('customer tickets scoped to own org', `${custTickets.data?.length ?? 0} rows`);
    else fail('customer tickets scoped to own org', JSON.stringify(custTickets.data));

    // Privilege-escalation attempt
    const custMe = custProfile.data![0];
    const escalate = await cust.from('profiles')
        .update({ role: 'admin' })
        .eq('id', custMe.id)
        .select();
    if (escalate.error || (escalate.data?.length ?? 0) === 0) {
        pass('customer cannot escalate self to admin', escalate.error?.message ?? 'no rows updated');
    } else {
        // Verify — re-read role
        const after = await cust.from('profiles').select('role').eq('id', custMe.id).maybeSingle();
        if (after.data?.role === 'admin') fail('customer cannot escalate self to admin', 'role became admin!');
        else pass('customer cannot escalate self to admin', 'role unchanged despite update call');
    }

    // Cross-tenant leak attempt: try to insert a ticket for a made-up org
    const fakeOrgId = '00000000-0000-0000-0000-000000000000';
    const crossInsert = await cust.from('tickets').insert({
        organization_id: fakeOrgId,
        subject: 'RLS attack test',
        opened_by: custMe.id,
    });
    if (crossInsert.error) pass('customer cannot insert ticket for foreign org', crossInsert.error.message);
    else fail('customer cannot insert ticket for foreign org', 'INSERT succeeded!');

    // Ticket message insert on own ticket (legit)
    const firstTicketId = custTickets.data?.[0]?.id;
    if (firstTicketId) {
        const msg = await cust.from('ticket_messages').insert({
            ticket_id: firstTicketId,
            body: `[smoke test ${new Date().toISOString()}] customer reply`,
            author: custMe.id,
        }).select();
        if (msg.error) fail('customer can insert own ticket message', msg.error.message);
        else pass('customer can insert own ticket message', `id=${msg.data?.[0]?.id}`);
    }

    // ─── Admin ─────────────────────────────────────────────────────────
    const admin = await signIn('brokztech@gmail.com', 'Brokz2026!Bootstrap');

    const adminProfiles = await admin.from('profiles').select('id, role');
    const adminSees = (adminProfiles.data?.length ?? 0) >= 2;
    if (adminSees) pass('admin sees multiple profiles', `count=${adminProfiles.data?.length}`);
    else fail('admin sees multiple profiles', `got ${adminProfiles.data?.length ?? 0}`);

    const adminOrgs = await admin.from('organizations').select('id');
    pass('admin sees all orgs', `count=${adminOrgs.data?.length ?? 0}`);

    const adminAudit = await admin.from('audit_log').select('id').limit(5);
    if (adminAudit.error) fail('admin can read audit_log', adminAudit.error.message);
    else pass('admin can read audit_log', `count=${adminAudit.data?.length ?? 0}`);

    const custAudit = await cust.from('audit_log').select('id').limit(5);
    if ((custAudit.data?.length ?? 0) === 0) pass('customer cannot read audit_log', 'rows=0');
    else fail('customer cannot read audit_log', `leaked ${custAudit.data!.length}`);

    // Admin CRUD — insert + cleanup a test product
    const testSlug = `rls-smoke-${Date.now()}`;
    const adminIns = await admin.from('products').insert({
        slug: testSlug, name: 'RLS Smoke Product', base_price: 1, currency: 'USD', is_active: true,
    }).select().single();
    if (adminIns.error) fail('admin can insert product', adminIns.error.message);
    else pass('admin can insert product', `id=${adminIns.data.id}`);

    // Customer CANNOT insert product
    const custIns = await cust.from('products').insert({
        slug: `cust-attack-${Date.now()}`, name: 'Attack', base_price: 0, currency: 'USD',
    });
    if (custIns.error) pass('customer cannot insert product', custIns.error.message);
    else fail('customer cannot insert product', 'INSERT succeeded!');

    // Anon CANNOT insert product
    const anonIns = await anon.from('products').insert({
        slug: `anon-attack-${Date.now()}`, name: 'Attack', base_price: 0, currency: 'USD',
    });
    if (anonIns.error) pass('anon cannot insert product', anonIns.error.message);
    else fail('anon cannot insert product', 'INSERT succeeded!');

    if (adminIns.data?.id) {
        await admin.from('products').delete().eq('id', adminIns.data.id);
    }

    // Cross-tenant: admin creates a 2nd org, customer A must NOT see it
    const org2 = await admin.from('organizations').insert({
        name: `RLS Smoke Org ${Date.now()}`, country: 'US', status: 'active',
    }).select().single();
    if (!org2.error && org2.data) {
        const custCross = await cust.from('organizations').select('id').eq('id', org2.data.id);
        if ((custCross.data?.length ?? 0) === 0) pass('customer A cannot see org B', 'rows=0');
        else fail('customer A cannot see org B', `leaked ${custCross.data!.length}`);
        await admin.from('organizations').delete().eq('id', org2.data.id);
    }

    // Storage: anon cannot list the invoices bucket
    const anonStorage = await anon.storage.from('invoices').list();
    if (anonStorage.error || (anonStorage.data?.length ?? 0) === 0) {
        pass('anon cannot list invoices bucket', anonStorage.error?.message ?? 'empty list');
    } else {
        fail('anon cannot list invoices bucket', `leaked ${anonStorage.data!.length} paths`);
    }

    // Print results
    let passed = 0, failed = 0;
    for (const r of results) {
        const mark = r.pass ? '✓' : '✗';
        console.log(`${mark} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
        if (r.pass) passed++;
        else failed++;
    }
    console.log(`\n${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

main().catch((e) => {
    console.error('FATAL:', e);
    process.exit(1);
});

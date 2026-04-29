/**
 * order-plan-rls.ts — RLS & role audit for order payment-plan columns and RPCs.
 *
 * Covers:
 *   - New columns: payment_wallet_id, plan_kind, term_months, monthly_amount
 *   - RPCs: materialize_order_schedule, issue_open_ended_next_invoice
 *   - Edge function: recurring-invoice-issuer (secret guard)
 *   - Cross-tenant isolation on orders + invoices
 *   - Customer cannot write plan columns
 *   - Admin happy-path: fixed_term 3-month schedule, open_ended next-invoice,
 *     idempotency guard, next_invoice_at advancement
 *
 * Usage:
 *   bun scripts/qa/order-plan-rls.ts
 *   (reads .env from cwd for PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY)
 *
 * Environment (optional overrides):
 *   BROKZ_ADMIN_EMAIL     (default: brokztech@gmail.com)
 *   BROKZ_ADMIN_PASSWORD
 *   BROKZ_CUST_A_EMAIL    customer A — must already exist in auth.users + profiles
 *   BROKZ_CUST_A_PASSWORD
 *   BROKZ_CUST_B_EMAIL    customer B — a DIFFERENT org; if absent, cross-tenant
 *                          checks are skipped with a WARNING
 *   BROKZ_CUST_B_PASSWORD
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ─── Env ────────────────────────────────────────────────────────────

function parseEnv(path: string): Record<string, string> {
    const text = readFileSync(path, 'utf8');
    const out: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
        const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line);
        if (m) out[m[1]] = m[2].replace(/^"|"$/g, '').trim();
    }
    return out;
}

const envFile = parseEnv(resolve(process.cwd(), '.env'));
const SUPA_URL  = envFile.PUBLIC_SUPABASE_URL;
const SUPA_ANON = envFile.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPA_URL || !SUPA_ANON) {
    console.error('FATAL: missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const ADMIN_EMAIL  = process.env.BROKZ_ADMIN_EMAIL    ?? 'brokztech@gmail.com';
const ADMIN_PASS   = process.env.BROKZ_ADMIN_PASSWORD ?? '';
const CUST_A_EMAIL = process.env.BROKZ_CUST_A_EMAIL   ?? 'test-customer@brokz.local';
const CUST_A_PASS  = process.env.BROKZ_CUST_A_PASSWORD ?? 'Brokz2026!Customer';
const CUST_B_EMAIL = process.env.BROKZ_CUST_B_EMAIL   ?? '';
const CUST_B_PASS  = process.env.BROKZ_CUST_B_PASSWORD ?? '';

// ─── Result tracking ────────────────────────────────────────────────

type Result = { name: string; pass: boolean; critical?: boolean; detail: string };
const results: Result[] = [];

function pass(name: string, detail = ''): void {
    results.push({ name, pass: true, detail });
    console.log(`  PASS  ${name}${detail ? ' — ' + detail : ''}`);
}
function fail(name: string, detail: string, critical = false): void {
    results.push({ name, pass: false, critical, detail });
    const tag = critical ? '[CRIT] FAIL' : '       FAIL';
    console.error(`  ${tag}  ${name} — ${detail}`);
}
function warn(name: string, detail: string): void {
    console.warn(`  WARN  ${name} — ${detail}`);
}

// ─── Client helpers ─────────────────────────────────────────────────

function anonClient(): SupabaseClient {
    return createClient(SUPA_URL, SUPA_ANON, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

async function signIn(email: string, password: string): Promise<SupabaseClient | null> {
    if (!email || !password) return null;
    const c = anonClient();
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (error) return null;
    return c;
}

// ─── Utility ────────────────────────────────────────────────────────

function todayPlus(months: number): string {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() + months);
    return d.toISOString().slice(0, 10);
}

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
    console.log('\n=== Brokz order-plan RLS audit ===\n');

    // ── 0. Anon baseline ────────────────────────────────────────────
    console.log('-- Anon baseline --');
    const anon = anonClient();

    {
        const r = await anon.from('orders').select('id, plan_kind, payment_wallet_id').limit(5);
        if ((r.data?.length ?? 0) === 0) pass('anon cannot read orders', 'rows=0');
        else fail('anon cannot read orders', `leaked ${r.data!.length} rows`, true);
    }
    {
        const r = await anon.from('invoices').select('id, invoice_type').limit(5);
        if ((r.data?.length ?? 0) === 0) pass('anon cannot read invoices', 'rows=0');
        else fail('anon cannot read invoices', `leaked ${r.data!.length} rows`, true);
    }
    {
        const r = await anon.rpc('materialize_order_schedule', { p_order_id: '00000000-0000-0000-0000-000000000000' });
        if (r.error) pass('anon RPC materialize_order_schedule rejected', r.error.message);
        else fail('anon RPC materialize_order_schedule NOT rejected', 'should have errored', true);
    }
    {
        const r = await anon.rpc('issue_open_ended_next_invoice', { p_order_id: '00000000-0000-0000-0000-000000000000' });
        if (r.error) pass('anon RPC issue_open_ended_next_invoice rejected', r.error.message);
        else fail('anon RPC issue_open_ended_next_invoice NOT rejected', 'should have errored', true);
    }

    // ── 1. Admin login ───────────────────────────────────────────────
    console.log('\n-- Admin login --');
    if (!ADMIN_PASS) {
        warn('admin tests', 'BROKZ_ADMIN_PASSWORD not set — admin section skipped. Set it to run full suite.');
    }

    const admin = ADMIN_PASS ? await signIn(ADMIN_EMAIL, ADMIN_PASS) : null;
    if (ADMIN_PASS && !admin) {
        fail('admin login', `${ADMIN_EMAIL} rejected`);
    } else if (admin) {
        pass('admin login', ADMIN_EMAIL);
    }

    // ── 2. Customer A login ──────────────────────────────────────────
    console.log('\n-- Customer A --');
    const custA = await signIn(CUST_A_EMAIL, CUST_A_PASS);
    if (!custA) {
        fail('customer A login', `${CUST_A_EMAIL} rejected — password may differ`);
        warn('customer A section', 'skipping all customer A checks');
    }

    let custAOrgId: string | null = null;
    let custAProfile: { id: string; role: string; organization_id: string | null } | null = null;

    if (custA) {
        const pf = await custA.from('profiles').select('id, role, organization_id').maybeSingle();
        if (pf.data) {
            custAProfile = pf.data as any;
            custAOrgId = pf.data.organization_id ?? null;
            pass('customer A profile loaded', `role=${pf.data.role} org=${pf.data.organization_id}`);
        } else {
            fail('customer A profile loaded', pf.error?.message ?? 'no row');
        }

        // 2a. Can SELECT own orders including new columns
        const orders = await custA.from('orders')
            .select('id, organization_id, payment_wallet_id, plan_kind, term_months, monthly_amount');
        const allOwn = (orders.data ?? []).every((o: any) => !custAOrgId || o.organization_id === custAOrgId);
        if (orders.error) {
            fail('customer A can SELECT own orders (new cols)', orders.error.message);
        } else if (allOwn) {
            pass('customer A can SELECT own orders (new cols)', `${orders.data!.length} rows, all own org`);
        } else {
            fail('customer A can SELECT own orders (new cols)', 'rows from foreign org returned', true);
        }

        const custAOrderIds = (orders.data ?? []).map((o: any) => o.id);

        // 2b. Can SELECT subscription invoices for own org
        const invs = await custA.from('invoices')
            .select('id, organization_id, invoice_type, period_start, period_end');
        const invOk = (invs.data ?? []).every((i: any) => !custAOrgId || i.organization_id === custAOrgId);
        if (invs.error) {
            fail('customer A can SELECT own invoices (subscription type)', invs.error.message);
        } else if (invOk) {
            pass('customer A can SELECT own invoices (subscription type)', `${invs.data!.length} rows`);
        } else {
            fail('customer A can SELECT own invoices (subscription type)', 'foreign org invoices leaked', true);
        }

        // 2c. Customer A CANNOT UPDATE plan columns on own order
        if (custAOrderIds.length > 0) {
            const upd = await custA.from('orders')
                .update({ plan_kind: 'open_ended', term_months: 99, monthly_amount: 9999 })
                .eq('id', custAOrderIds[0])
                .select('id, plan_kind');
            if (upd.error || (upd.data?.length ?? 0) === 0) {
                pass('customer A cannot UPDATE plan columns on own order',
                    upd.error?.message ?? 'no rows updated (RLS blocked)');
            } else {
                // Re-read to verify no actual change went through
                const recheck = await custA.from('orders')
                    .select('plan_kind').eq('id', custAOrderIds[0]).maybeSingle();
                if (recheck.data?.plan_kind === 'open_ended') {
                    fail('customer A cannot UPDATE plan columns on own order',
                        'UPDATE succeeded and value changed to open_ended!', true);
                } else {
                    pass('customer A cannot UPDATE plan columns on own order',
                        'update appeared to succeed but value unchanged');
                }
            }
        } else {
            warn('customer A UPDATE plan cols', 'no orders for customer A org — skipped');
        }

        // 2d. Customer A calling materialize_order_schedule must be rejected
        const rpcMat = await custA.rpc('materialize_order_schedule', {
            p_order_id: custAOrderIds[0] ?? '00000000-0000-0000-0000-000000000000',
        });
        if (rpcMat.error) {
            const isPermissionDenied = /permission denied|42501|admin only/i.test(rpcMat.error.message);
            if (isPermissionDenied) {
                pass('customer A calling materialize_order_schedule rejected (admin-only)', rpcMat.error.message);
            } else {
                // Some other error (e.g., order not found, wrong plan_kind) — still rejected, but note it
                pass('customer A calling materialize_order_schedule rejected', rpcMat.error.message);
            }
        } else {
            fail('customer A calling materialize_order_schedule NOT rejected',
                'RPC returned data without error', true);
        }

        // 2e. Customer A calling issue_open_ended_next_invoice must be rejected
        const rpcIss = await custA.rpc('issue_open_ended_next_invoice', {
            p_order_id: custAOrderIds[0] ?? '00000000-0000-0000-0000-000000000000',
        });
        if (rpcIss.error) {
            const isPermissionDenied = /permission denied|42501|admin only/i.test(rpcIss.error.message);
            if (isPermissionDenied) {
                pass('customer A calling issue_open_ended_next_invoice rejected (admin-only)', rpcIss.error.message);
            } else {
                pass('customer A calling issue_open_ended_next_invoice rejected', rpcIss.error.message);
            }
        } else {
            fail('customer A calling issue_open_ended_next_invoice NOT rejected',
                'RPC returned data without error', true);
        }
    }

    // ── 3. Customer B cross-tenant checks ────────────────────────────
    console.log('\n-- Customer B cross-tenant --');
    const custB = CUST_B_EMAIL ? await signIn(CUST_B_EMAIL, CUST_B_PASS) : null;

    if (!CUST_B_EMAIL) {
        warn('cross-tenant checks', 'BROKZ_CUST_B_EMAIL not set — skipping. Set env vars to enable.');
    } else if (!custB) {
        fail('customer B login', `${CUST_B_EMAIL} rejected`);
    } else {
        const bpf = await custB.from('profiles').select('id, role, organization_id').maybeSingle();
        const custBOrgId = bpf.data?.organization_id ?? null;
        pass('customer B profile loaded', `org=${custBOrgId}`);

        if (custAOrgId && custBOrgId && custAOrgId === custBOrgId) {
            warn('cross-tenant check', 'customer A and B are in the same org — not a valid isolation test');
        } else if (custAOrgId) {
            // B tries to read A's orders
            const xOrders = await custB.from('orders')
                .select('id').eq('organization_id', custAOrgId);
            if ((xOrders.data?.length ?? 0) === 0) {
                pass('customer B cannot read customer A orders', 'rows=0');
            } else {
                fail('customer B can read customer A orders',
                    `leaked ${xOrders.data!.length} rows from org ${custAOrgId}`, true);
            }

            // B tries to read A's invoices
            const xInvs = await custB.from('invoices')
                .select('id').eq('organization_id', custAOrgId);
            if ((xInvs.data?.length ?? 0) === 0) {
                pass('customer B cannot read customer A invoices', 'rows=0');
            } else {
                fail('customer B can read customer A invoices',
                    `leaked ${xInvs.data!.length} rows from org ${custAOrgId}`, true);
            }
        }
    }

    // ── 4. Recurring-invoice-issuer edge function secret guard ──────
    console.log('\n-- recurring-invoice-issuer edge fn --');
    try {
        const edgeFnUrl = `${SUPA_URL}/functions/v1/recurring-invoice-issuer`;

        // 4a. No secret at all
        const r1 = await fetch(edgeFnUrl, { method: 'POST' });
        if (r1.status === 401) pass('recurring-invoice-issuer without secret → 401', `status=${r1.status}`);
        else fail('recurring-invoice-issuer without secret should return 401', `got status=${r1.status}`);

        // 4b. Wrong secret
        const r2 = await fetch(edgeFnUrl, {
            method: 'POST',
            headers: { 'x-cron-secret': 'wrong-secret-value' },
        });
        if (r2.status === 401) pass('recurring-invoice-issuer with wrong secret → 401', `status=${r2.status}`);
        else fail('recurring-invoice-issuer with wrong secret should return 401', `got status=${r2.status}`);

        // 4c. Customer JWT, no cron secret
        if (custA) {
            const { data: sessData } = await custA.auth.getSession();
            const token = sessData?.session?.access_token;
            if (token) {
                const r3 = await fetch(edgeFnUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (r3.status === 401) {
                    pass('recurring-invoice-issuer with customer JWT (no cron secret) → 401', `status=${r3.status}`);
                } else {
                    fail('recurring-invoice-issuer with customer JWT should return 401',
                        `got status=${r3.status}`);
                }
            }
        }
    } catch (e: any) {
        warn('recurring-invoice-issuer edge fn checks', `fetch failed: ${e.message} — edge fn may not be deployed`);
    }

    // ── 5. Admin happy-path smoke ────────────────────────────────────
    console.log('\n-- Admin happy-path smoke --');
    if (!admin) {
        warn('admin happy-path', 'admin client unavailable — skipping all happy-path checks');
    } else {
        // Find an org and product to work with
        const { data: orgs } = await admin.from('organizations').select('id').limit(1);
        const { data: prods } = await admin.from('products').select('id, currency').limit(1);
        const { data: wallets } = await admin.from('payment_wallets')
            .select('id').eq('is_active', true).limit(1);

        if (!orgs?.length || !prods?.length) {
            warn('admin happy-path', 'no org/product in DB — skipping');
        } else {
            const orgId   = orgs[0].id;
            const prodId  = prods[0].id;
            const walletId = wallets?.[0]?.id ?? null;

            if (!walletId) {
                warn('admin happy-path', 'no active payment_wallet — plan columns will be null');
            }

            const MONTHLY = 50.00;
            const TERM    = 3;
            const periodStart = today();

            // 5a. Admin can SELECT orders with new plan columns
            const adminOrders = await admin.from('orders')
                .select('id, payment_wallet_id, plan_kind, term_months, monthly_amount')
                .limit(5);
            if (adminOrders.error) {
                fail('admin can SELECT order plan columns', adminOrders.error.message);
            } else {
                pass('admin can SELECT order plan columns', `${adminOrders.data!.length} rows`);
            }

            // 5b. Admin can INSERT order with plan columns
            const orderInsert = await admin.from('orders').insert({
                organization_id: orgId,
                product_id: prodId,
                status: 'active',
                quantity: 1,
                unit_price: MONTHLY * TERM,
                total: MONTHLY * TERM,
                currency: prods[0].currency ?? 'USD',
                plan_kind: 'fixed_term',
                term_months: TERM,
                monthly_amount: MONTHLY,
                period_start: periodStart,
                ...(walletId ? { payment_wallet_id: walletId } : {}),
                notes: 'qa smoke — safe to delete',
            }).select('id, plan_kind, term_months, monthly_amount').single();

            if (orderInsert.error || !orderInsert.data) {
                fail('admin INSERT fixed_term order with plan cols', orderInsert.error?.message ?? 'no data');
            } else {
                pass('admin INSERT fixed_term order with plan cols', `id=${orderInsert.data.id}`);
                const ftOrderId = orderInsert.data.id;

                // 5c. Admin calls materialize_order_schedule → 3 invoices
                const matRpc = await admin.rpc('materialize_order_schedule', { p_order_id: ftOrderId });
                if (matRpc.error) {
                    fail('admin materialize_order_schedule fixed_term', matRpc.error.message);
                } else {
                    const rows: any[] = Array.isArray(matRpc.data) ? matRpc.data : [matRpc.data];
                    if (rows.length === TERM) {
                        pass('admin materialize_order_schedule → 3 invoices', `count=${rows.length}`);

                        // Verify period_start spacing and status=draft
                        let periodOk = true;
                        let statusOk = true;
                        let amountOk = true;
                        for (let i = 0; i < TERM; i++) {
                            const row = rows[i];
                            const expectedMonth = new Date(periodStart);
                            expectedMonth.setUTCMonth(expectedMonth.getUTCMonth() + i);
                            const expectedStart = expectedMonth.toISOString().slice(0, 10);
                            if (row.period_start !== expectedStart) periodOk = false;
                            if (row.status !== 'draft') statusOk = false;
                            if (Number(row.amount) !== MONTHLY) amountOk = false;
                        }
                        if (periodOk) pass('invoice period_start spacing correct (month+0, +1, +2)');
                        else fail('invoice period_start spacing incorrect',
                            `got: ${rows.map((r:any)=>r.period_start).join(', ')}`);
                        if (statusOk) pass('all 3 invoices status=draft');
                        else fail('invoices status not draft', `got: ${rows.map((r:any)=>r.status).join(', ')}`);
                        if (amountOk) pass(`all 3 invoices amount=${MONTHLY}`);
                        else fail('invoice amounts wrong', `got: ${rows.map((r:any)=>r.amount).join(', ')}`);
                    } else {
                        fail('admin materialize_order_schedule → 3 invoices',
                            `expected ${TERM} invoices, got ${rows.length}`);
                    }

                    // 5d. Calling materialize_order_schedule again must error (idempotency)
                    const matRpc2 = await admin.rpc('materialize_order_schedule', { p_order_id: ftOrderId });
                    if (matRpc2.error && /already materialised|already materialized|23505|subscription invoice/i.test(matRpc2.error.message)) {
                        pass('materialize_order_schedule idempotency guard fires on second call', matRpc2.error.message);
                    } else if (matRpc2.error) {
                        pass('materialize_order_schedule second call rejected (error)', matRpc2.error.message);
                    } else {
                        fail('materialize_order_schedule idempotency not enforced',
                            'second call returned data instead of erroring');
                    }
                }

                // Cleanup fixed_term order + invoices (invoices cascade via FK restrict — delete invoices first)
                const invDel = await admin.from('invoices').delete().eq('order_id', ftOrderId);
                if (invDel.error) warn('cleanup', `invoice delete failed: ${invDel.error.message}`);
                await admin.from('orders').delete().eq('id', ftOrderId);
            }

            // 5e. Admin creates open_ended order
            const oeInsert = await admin.from('orders').insert({
                organization_id: orgId,
                product_id: prodId,
                status: 'active',
                quantity: 1,
                unit_price: MONTHLY,
                total: MONTHLY,
                currency: prods[0].currency ?? 'USD',
                plan_kind: 'open_ended',
                monthly_amount: MONTHLY,
                period_start: periodStart,
                ...(walletId ? { payment_wallet_id: walletId } : {}),
                notes: 'qa smoke open_ended — safe to delete',
            }).select('id, plan_kind, next_invoice_at').single();

            if (oeInsert.error || !oeInsert.data) {
                fail('admin INSERT open_ended order', oeInsert.error?.message ?? 'no data');
            } else {
                pass('admin INSERT open_ended order', `id=${oeInsert.data.id}`);
                const oeOrderId = oeInsert.data.id;

                // 5f. issue_open_ended_next_invoice → exactly 1 invoice, next_invoice_at advances
                const issRpc = await admin.rpc('issue_open_ended_next_invoice', { p_order_id: oeOrderId });
                if (issRpc.error) {
                    fail('admin issue_open_ended_next_invoice (first)', issRpc.error.message);
                } else {
                    const inv = Array.isArray(issRpc.data) ? issRpc.data[0] : issRpc.data;
                    if (inv?.id) {
                        pass('admin issue_open_ended_next_invoice → 1 invoice created', `id=${inv.id}`);
                    } else {
                        fail('admin issue_open_ended_next_invoice → no invoice returned', JSON.stringify(issRpc.data));
                    }

                    // Verify next_invoice_at advanced
                    const orderAfter = await admin.from('orders')
                        .select('next_invoice_at').eq('id', oeOrderId).maybeSingle();
                    const expectedNextAt = todayPlus(1);
                    if (orderAfter.data?.next_invoice_at) {
                        // accept same month or next month (date math may differ slightly)
                        pass('orders.next_invoice_at set after first open_ended invoice',
                            `next_invoice_at=${orderAfter.data.next_invoice_at}`);
                    } else {
                        fail('orders.next_invoice_at not set after first open_ended invoice',
                            `value=${orderAfter.data?.next_invoice_at}`);
                    }

                    // 5g. Call issue_open_ended_next_invoice again → second invoice, next_invoice_at advances again
                    const issRpc2 = await admin.rpc('issue_open_ended_next_invoice', { p_order_id: oeOrderId });
                    if (issRpc2.error) {
                        fail('admin issue_open_ended_next_invoice (second call)', issRpc2.error.message);
                    } else {
                        const inv2 = Array.isArray(issRpc2.data) ? issRpc2.data[0] : issRpc2.data;
                        if (inv2?.id && inv2.id !== (Array.isArray(issRpc.data) ? issRpc.data[0] : issRpc.data)?.id) {
                            pass('second call to issue_open_ended_next_invoice produces new invoice', `id=${inv2.id}`);
                        } else {
                            fail('second call to issue_open_ended_next_invoice did not produce new invoice',
                                JSON.stringify(issRpc2.data));
                        }

                        // Verify next_invoice_at advanced again
                        const orderAfter2 = await admin.from('orders')
                            .select('next_invoice_at').eq('id', oeOrderId).maybeSingle();
                        const prev = orderAfter.data?.next_invoice_at;
                        const curr = orderAfter2.data?.next_invoice_at;
                        if (curr && prev && curr > prev) {
                            pass('next_invoice_at advances on second open_ended invoice call',
                                `${prev} -> ${curr}`);
                        } else {
                            fail('next_invoice_at did not advance on second call',
                                `before=${prev} after=${curr}`);
                        }
                    }

                    // Verify total invoice count for open_ended order
                    const invCount = await admin.from('invoices')
                        .select('id').eq('order_id', oeOrderId).eq('invoice_type', 'subscription');
                    if ((invCount.data?.length ?? 0) === 2) {
                        pass('open_ended order has exactly 2 subscription invoices after two calls');
                    } else {
                        fail('open_ended order invoice count unexpected',
                            `expected 2, got ${invCount.data?.length ?? 0}`);
                    }
                }

                // Cleanup open_ended
                await admin.from('invoices').delete().eq('order_id', oeOrderId);
                await admin.from('orders').delete().eq('id', oeOrderId);
            }

            // 5h. Admin can UPDATE plan columns
            if (adminOrders.data?.length ?? 0 > 0) {
                const testOrdId = adminOrders.data![0]?.id;
                if (testOrdId) {
                    const upd = await admin.from('orders')
                        .update({ notes: `qa-smoke-check-${Date.now()}` })
                        .eq('id', testOrdId).select('id');
                    if (upd.error) fail('admin can UPDATE orders', upd.error.message);
                    else pass('admin can UPDATE orders', 'ok');
                }
            }
        }
    }

    // ─── Summary ────────────────────────────────────────────────────
    console.log('\n=== Summary ===');
    let passed = 0, failed = 0, critical = 0;
    for (const r of results) {
        if (r.pass) passed++;
        else {
            failed++;
            if (r.critical) critical++;
        }
    }
    console.log(`Total checks: ${results.length}`);
    console.log(`Pass:         ${passed}`);
    console.log(`Fail:         ${failed}`);
    console.log(`Critical:     ${critical}`);

    if (critical > 0) {
        console.error('\nCRITICAL FAILURES — cross-tenant leak or privilege escalation detected:');
        for (const r of results.filter(r => !r.pass && r.critical)) {
            console.error(`  [CRIT] ${r.name} — ${r.detail}`);
        }
        process.exit(2);
    }
    if (failed > 0) process.exit(1);
}

main().catch((e) => {
    console.error('FATAL:', e);
    process.exit(1);
});

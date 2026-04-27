/**
 * OverviewPanel — the top-level admin dashboard.
 *
 * Shows 4 KPI cards + a recent activity feed. Activity is "latest 5 orders
 * + latest 5 tickets" combined and sorted (audit_log isn't written by
 * Phase 1 Edge Functions yet — flagged in the handoff notes).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import { resolveAdminLocale } from '../../lib/admin/locale';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';
import { useAuth } from '../auth/AuthContext';
import { formatDateTime, formatMoney } from '../../lib/admin/format';
import { hasPaymentSubmissions } from '../../lib/admin/schemaProbe';

type Locale = 'en' | 'tr';

interface Kpis {
    activeOrders: number | null;
    openTickets: number | null;
    newLeads7d: number | null;
    revenueMtd: number | null;
}

interface ActivityItem {
    id: string;
    kind: 'order' | 'ticket' | 'payment';
    title: string;
    status: string;
    createdAt: string;
}

export default function OverviewPanel({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    return (
        <AdminShell
            locale={locale}
            activeKey="overview"
            title={useOverviewTitle()}
            subtitle={useOverviewSubtitle()}
        >
            <OverviewInner locale={locale} />
        </AdminShell>
    );
}

function useOverviewTitle() {
    const { t } = useTranslation('admin');
    return t('overview.title');
}
function useOverviewSubtitle() {
    const { t } = useTranslation('admin');
    return t('overview.subtitle');
}

function OverviewInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<Kpis>({
        activeOrders: null,
        openTickets: null,
        newLeads7d: null,
        revenueMtd: null,
    });
    const [activity, setActivity] = useState<ActivityItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            const sinceWeek = new Date();
            sinceWeek.setDate(sinceWeek.getDate() - 7);
            const mtd = new Date();
            mtd.setDate(1);
            mtd.setHours(0, 0, 0, 0);

            const paymentsReady = await hasPaymentSubmissions(supabase);
            const [activeOrders, openTickets, newLeads, paidInvoices, recentOrders, recentTickets, pendingPayments] =
                await Promise.all([
                    supabase
                        .from('orders')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'active')
                        .is('deleted_at', null),
                    supabase
                        .from('tickets')
                        .select('*', { count: 'exact', head: true })
                        .neq('status', 'closed')
                        .is('deleted_at', null),
                    supabase
                        .from('leads')
                        .select('*', { count: 'exact', head: true })
                        .gte('created_at', sinceWeek.toISOString()),
                    supabase
                        .from('invoices')
                        .select('amount')
                        .eq('status', 'paid')
                        .is('deleted_at', null)
                        .gte('paid_at', mtd.toISOString()),
                    supabase
                        .from('orders')
                        .select('id, status, created_at, product:products(name), organization:organizations(name)')
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false })
                        .limit(5),
                    supabase
                        .from('tickets')
                        .select('id, subject, status, created_at, organization:organizations(name)')
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false })
                        .limit(5),
                    paymentsReady
                        ? supabase
                              .from('payment_submissions')
                              .select('id, network, amount_paid, currency, status, submitted_at, organization:organizations(name), invoice:invoices(invoice_number)')
                              .eq('status', 'pending_review')
                              .order('submitted_at', { ascending: false })
                              .limit(5)
                        : Promise.resolve({ data: [], error: null }),
                ]);

            if (cancelled) return;

            const revenue = (paidInvoices.data ?? []).reduce(
                (sum, row) => sum + Number((row as { amount: number }).amount ?? 0),
                0,
            );

            setKpis({
                activeOrders: activeOrders.count ?? 0,
                openTickets: openTickets.count ?? 0,
                newLeads7d: newLeads.count ?? 0,
                revenueMtd: revenue,
            });

            const orderItems: ActivityItem[] = (recentOrders.data ?? []).map((row) => {
                const r = row as unknown as {
                    id: string;
                    status: string;
                    created_at: string;
                    product: { name: string } | null;
                    organization: { name: string } | null;
                };
                return {
                    id: `order-${r.id}`,
                    kind: 'order',
                    title: `${r.organization?.name ?? '—'} · ${r.product?.name ?? '—'}`,
                    status: r.status,
                    createdAt: r.created_at,
                };
            });

            const ticketItems: ActivityItem[] = (recentTickets.data ?? []).map((row) => {
                const r = row as unknown as {
                    id: string;
                    subject: string;
                    status: string;
                    created_at: string;
                    organization: { name: string } | null;
                };
                return {
                    id: `ticket-${r.id}`,
                    kind: 'ticket',
                    title: `${r.organization?.name ?? '—'} · ${r.subject}`,
                    status: r.status,
                    createdAt: r.created_at,
                };
            });

            const paymentItems: ActivityItem[] = ((pendingPayments.data ?? []) as unknown as Array<{
                id: string;
                network: string;
                amount_paid: number;
                currency: string;
                status: string;
                submitted_at: string;
                organization: { name: string } | null;
                invoice: { invoice_number: string } | null;
            }>).map((r) => ({
                id: `payment-${r.id}`,
                kind: 'payment',
                title: `${r.organization?.name ?? '—'} · ${r.invoice?.invoice_number ?? '—'} · ${r.amount_paid} ${r.currency}`,
                status: r.status,
                createdAt: r.submitted_at,
            }));

            setActivity(
                [...paymentItems, ...orderItems, ...ticketItems]
                    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                    .slice(0, 12),
            );
            setLoading(false);
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [supabase]);

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label={t('overview.kpi.activeOrders')} value={kpis.activeOrders ?? '—'} loading={loading} />
                <StatCard label={t('overview.kpi.openTickets')} value={kpis.openTickets ?? '—'} loading={loading} />
                <StatCard label={t('overview.kpi.newLeads7d')} value={kpis.newLeads7d ?? '—'} loading={loading} />
                <StatCard
                    label={t('overview.kpi.revenueMtd')}
                    value={kpis.revenueMtd !== null ? formatMoney(kpis.revenueMtd, 'USD', localeTag) : '—'}
                    loading={loading}
                />
            </div>

            <section>
                <h3 className="text-sm font-semibold text-ink mb-3">{t('overview.recent.title')}</h3>
                <div className="rounded-lg border border-line bg-white overflow-hidden">
                    {loading ? (
                        <ul className="divide-y divide-line">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <li key={i} className="px-4 py-3">
                                    <span className="inline-block h-4 w-60 rounded-sm bg-surface-subtle animate-pulse" />
                                </li>
                            ))}
                        </ul>
                    ) : activity.length === 0 ? (
                        <div className="p-8 text-center text-sm text-ink-muted">
                            {t('overview.recent.empty')}
                        </div>
                    ) : (
                        <ul className="divide-y divide-line">
                            {activity.map((item) => (
                                <li key={item.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-2xs uppercase tracking-wider text-ink-muted w-14 shrink-0">
                                            {item.kind}
                                        </span>
                                        <span className="truncate">{item.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <StatusBadge status={item.status} />
                                        <time
                                            dateTime={item.createdAt}
                                            className="text-xs text-ink-muted tabular-nums"
                                        >
                                            {formatDateTime(item.createdAt, localeTag)}
                                        </time>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}

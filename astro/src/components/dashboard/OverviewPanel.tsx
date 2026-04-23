/**
 * OverviewPanel — /dashboard landing.
 *
 * KPI cards: active licenses, unpaid invoices sum, open tickets.
 * Org contact info card. Recent 5 orders list.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardShell from './DashboardShell';
import { resolveAdminLocale } from '../../lib/admin/locale';
import StatCard from '../admin/StatCard';
import StatusBadge from '../admin/StatusBadge';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatMoney } from '../../lib/admin/format';
import { countryLabel } from '../../lib/countries';

type Locale = 'en' | 'tr';

interface Kpis {
    activeLicenses: number | null;
    unpaidInvoicesSum: number | null;
    openTickets: number | null;
}

interface OrgInfo {
    name: string;
    country: string | null;
    contact_email: string | null;
}

interface RecentOrder {
    id: string;
    status: string;
    total: number;
    currency: string;
    created_at: string;
    product: { name: string } | null;
}

export default function OverviewPanel({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    return (
        <DashboardShell locale={locale} activeKey="overview" title="">
            <OverviewInner locale={locale} />
        </DashboardShell>
    );
}

function OverviewInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('dashboard');
    const { supabase, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<Kpis>({
        activeLicenses: null,
        unpaidInvoicesSum: null,
        openTickets: null,
    });
    const [org, setOrg] = useState<OrgInfo | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);

            const [activeLicenses, unpaidInvoices, openTickets, orgData, ordersData] =
                await Promise.all([
                    supabase
                        .from('licenses')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'active')
                        .is('deleted_at', null),
                    supabase
                        .from('invoices')
                        .select('amount')
                        .in('status', ['draft', 'sent', 'overdue'])
                        .is('deleted_at', null),
                    supabase
                        .from('tickets')
                        .select('*', { count: 'exact', head: true })
                        .neq('status', 'closed')
                        .is('deleted_at', null),
                    profile.organization_id
                        ? supabase
                              .from('organizations')
                              .select('name, country, contact_email')
                              .eq('id', profile.organization_id)
                              .maybeSingle()
                        : Promise.resolve({ data: null }),
                    supabase
                        .from('orders')
                        .select('id, status, total, currency, created_at, product:products(name)')
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false })
                        .limit(5),
                ]);

            if (cancelled) return;

            const unpaidSum = (unpaidInvoices.data ?? []).reduce(
                (sum, row) => sum + Number((row as { amount: number }).amount ?? 0),
                0,
            );

            setKpis({
                activeLicenses: activeLicenses.count ?? 0,
                unpaidInvoicesSum: unpaidSum,
                openTickets: openTickets.count ?? 0,
            });
            setOrg((orgData.data as OrgInfo | null) ?? null);
            setRecentOrders((ordersData.data as unknown as RecentOrder[]) ?? []);
            setLoading(false);
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [supabase, profile.organization_id]);

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const greeting = org
        ? t('overview.greeting', { name: org.name })
        : t('overview.title');

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">{greeting}</h2>
                <p className="text-sm text-ink-muted mt-1">{t('overview.subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label={t('overview.kpi.activeLicenses')}
                    value={kpis.activeLicenses ?? '—'}
                    loading={loading}
                />
                <StatCard
                    label={t('overview.kpi.unpaidInvoices')}
                    value={
                        kpis.unpaidInvoicesSum !== null
                            ? formatMoney(kpis.unpaidInvoicesSum, 'USD', localeTag)
                            : '—'
                    }
                    loading={loading}
                />
                <StatCard
                    label={t('overview.kpi.openTickets')}
                    value={kpis.openTickets ?? '—'}
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Org info card */}
                <div className="rounded-lg border border-line bg-white p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-ink">{t('overview.orgCard.title')}</h3>
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-4 rounded-sm bg-surface-subtle animate-pulse" />
                            ))}
                        </div>
                    ) : org ? (
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-2xs uppercase tracking-wider text-ink-muted">{t('overview.orgCard.title')}</dt>
                                <dd className="font-medium text-ink mt-0.5">{org.name}</dd>
                            </div>
                            <div>
                                <dt className="text-2xs uppercase tracking-wider text-ink-muted">{t('overview.orgCard.country')}</dt>
                                <dd className="text-ink-secondary mt-0.5">
                                    {org.country ? countryLabel(org.country, locale) : t('overview.orgCard.notSet')}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-2xs uppercase tracking-wider text-ink-muted">{t('overview.orgCard.contact')}</dt>
                                <dd className="text-ink-secondary mt-0.5">
                                    {org.contact_email ?? t('overview.orgCard.notSet')}
                                </dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="text-sm text-ink-muted">—</p>
                    )}
                </div>

                {/* Recent orders */}
                <div className="lg:col-span-2 rounded-lg border border-line bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">{t('overview.recentOrders.title')}</h3>
                        <a
                            href="/dashboard/orders"
                            className="text-xs text-brand hover:text-brand-hover transition-colors"
                        >
                            {t('overview.recentOrders.viewAll')}
                        </a>
                    </div>
                    {loading ? (
                        <ul className="divide-y divide-line">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <li key={i} className="px-5 py-3">
                                    <span className="inline-block h-4 w-56 rounded-sm bg-surface-subtle animate-pulse" />
                                </li>
                            ))}
                        </ul>
                    ) : recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-sm text-ink-muted">
                            {t('overview.recentOrders.empty')}
                        </div>
                    ) : (
                        <ul className="divide-y divide-line">
                            {recentOrders.map((order) => (
                                <li key={order.id} className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
                                    <span className="truncate font-medium text-ink">
                                        {order.product?.name ?? '—'}
                                    </span>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="tabular-nums text-xs text-ink-secondary">
                                            {formatMoney(order.total, order.currency, localeTag)}
                                        </span>
                                        <StatusBadge status={order.status} />
                                        <time
                                            dateTime={order.created_at}
                                            className="text-xs text-ink-muted tabular-nums"
                                        >
                                            {formatDate(order.created_at, localeTag)}
                                        </time>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

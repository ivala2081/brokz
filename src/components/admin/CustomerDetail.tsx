/**
 * CustomerDetail — /admin/customers/view?id= island.
 *
 * Reads org id from window.location.search (?id=...) at runtime (we're fully client-side).
 * Tabs are local React state. Each tab is a filtered view backed by a
 * small inline query (not the big admin tables) to avoid extra client
 * code paths for "this org only".
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { countryLabel } from '../../lib/countries';
import StatusBadge from './StatusBadge';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatMoney, maskLicenseKey } from '../../lib/admin/format';
import { cn } from '../../lib/cn';

type Locale = 'en' | 'tr';
type TabKey = 'overview' | 'orders' | 'licenses' | 'invoices' | 'tickets' | 'users';

interface Org {
    id: string;
    name: string;
    country: string | null;
    website: string | null;
    contact_email: string | null;
    status: string;
    notes: string | null;
    created_at: string;
}

interface OrderRow {
    id: string;
    status: string;
    quantity: number;
    total: number;
    currency: string;
    created_at: string;
    product: { name: string } | null;
}

interface LicenseRow {
    id: string;
    license_key: string;
    status: string;
    issued_at: string;
    expires_at: string | null;
    order: { product: { name: string } | null } | null;
}

interface InvoiceRow {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    issued_at: string | null;
    due_at: string | null;
}

interface TicketRow {
    id: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
}

interface UserRow {
    id: string;
    email: string | null;
    full_name: string | null;
    role: string;
    created_at: string;
}

export default function CustomerDetail({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const [id, setId] = useState<string | null>(null);
    useEffect(() => {
        const qid = new URLSearchParams(window.location.search).get('id');
        if (qid) setId(qid);
    }, []);

    return (
        <AdminShell
            locale={locale}
            activeKey="customers"
            title="—"
            breadcrumbs={[{ label: 'Customers', href: '/admin/customers' }]}
        >
            {id ? <CustomerDetailInner orgId={id} locale={locale} /> : null}
        </AdminShell>
    );
}

function CustomerDetailInner({ orgId, locale }: { orgId: string; locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [org, setOrg] = useState<Org | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<TabKey>('overview');

    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [licenses, setLicenses] = useState<LicenseRow[]>([]);
    const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
    const [tickets, setTickets] = useState<TicketRow[]>([]);
    const [users, setUsers] = useState<UserRow[]>([]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            const [{ data: orgData }, ordersRes, licensesRes, invoicesRes, ticketsRes, usersRes] =
                await Promise.all([
                    supabase
                        .from('organizations')
                        .select('id, name, country, website, contact_email, status, notes, created_at')
                        .eq('id', orgId)
                        .maybeSingle(),
                    supabase
                        .from('orders')
                        .select('id, status, quantity, total, currency, created_at, product:products(name)')
                        .eq('organization_id', orgId)
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false }),
                    supabase
                        .from('licenses')
                        .select('id, license_key, status, issued_at, expires_at, order:orders(product:products(name), organization_id)')
                        .is('deleted_at', null)
                        .order('issued_at', { ascending: false }),
                    supabase
                        .from('invoices')
                        .select('id, invoice_number, amount, currency, status, issued_at, due_at')
                        .eq('organization_id', orgId)
                        .is('deleted_at', null)
                        .order('issued_at', { ascending: false }),
                    supabase
                        .from('tickets')
                        .select('id, subject, status, priority, created_at')
                        .eq('organization_id', orgId)
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false }),
                    supabase
                        .from('profiles')
                        .select('id, email, full_name, role, created_at')
                        .eq('organization_id', orgId)
                        .order('created_at', { ascending: false }),
                ]);

            if (cancelled) return;

            setOrg((orgData as Org | null) ?? null);
            setOrders((ordersRes.data as unknown as OrderRow[]) ?? []);
            setLicenses(
                ((licensesRes.data ?? []) as unknown as LicenseRow[]).filter(
                    (l) =>
                        (l as unknown as { order: { organization_id: string } | null }).order
                            ?.organization_id === orgId,
                ),
            );
            setInvoices((invoicesRes.data as unknown as InvoiceRow[]) ?? []);
            setTickets((ticketsRes.data as unknown as TicketRow[]) ?? []);
            setUsers((usersRes.data as unknown as UserRow[]) ?? []);
            setLoading(false);
        }
        void load();
        return () => {
            cancelled = true;
        };
    }, [orgId, supabase]);

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const tabs = useMemo<Array<{ key: TabKey; label: string; count: number }>>(
        () => [
            { key: 'overview', label: t('customers.detail.tabs.overview'), count: 0 },
            { key: 'orders', label: t('customers.detail.tabs.orders'), count: orders.length },
            { key: 'licenses', label: t('customers.detail.tabs.licenses'), count: licenses.length },
            { key: 'invoices', label: t('customers.detail.tabs.invoices'), count: invoices.length },
            { key: 'tickets', label: t('customers.detail.tabs.tickets'), count: tickets.length },
            { key: 'users', label: t('customers.detail.tabs.users'), count: users.length },
        ],
        [t, orders, licenses, invoices, tickets, users],
    );

    if (!loading && !org) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center">
                <p className="text-sm text-ink-muted">{t('customers.detail.notFound')}</p>
                <a href="/admin/customers" className="text-sm text-brand hover:text-brand-hover mt-3 inline-block">
                    ← {t('customers.detail.back')}
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="rounded-lg border border-line bg-white p-6">
                <a href="/admin/customers" className="text-xs text-ink-muted hover:text-ink">
                    ← {t('customers.detail.back')}
                </a>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-ink">
                            {org?.name ?? '—'}
                        </h2>
                        <dl className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs">
                            <InfoRow label={t('customers.columns.country')} value={countryLabel(org?.country, locale)} />
                            <InfoRow label={t('customers.columns.email')} value={org?.contact_email ?? '—'} />
                            <InfoRow label="Website" value={org?.website ?? '—'} />
                            <InfoRow label={t('customers.columns.createdAt')} value={org ? formatDate(org.created_at, localeTag) : '—'} />
                        </dl>
                    </div>
                    {org && <StatusBadge status={org.status} />}
                </div>
            </header>

            <nav className="border-b border-line flex overflow-x-auto" role="tablist">
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.key}
                        onClick={() => setTab(item.key)}
                        className={cn(
                            'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                            tab === item.key
                                ? 'border-brand text-ink'
                                : 'border-transparent text-ink-muted hover:text-ink',
                        )}
                    >
                        <span>{item.label}</span>
                        {item.count > 0 && (
                            <span className="ml-1.5 text-2xs text-ink-muted tabular-nums">
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            <section>
                {tab === 'overview' && <OverviewPane org={org} />}
                {tab === 'orders' && <OrdersPane rows={orders} localeTag={localeTag} />}
                {tab === 'licenses' && <LicensesPane rows={licenses} localeTag={localeTag} />}
                {tab === 'invoices' && <InvoicesPane rows={invoices} localeTag={localeTag} />}
                {tab === 'tickets' && <TicketsPane rows={tickets} localeTag={localeTag} />}
                {tab === 'users' && <UsersPane rows={users} localeTag={localeTag} />}
            </section>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="uppercase tracking-wider text-ink-muted text-2xs">{label}</dt>
            <dd className="text-ink">{value}</dd>
        </div>
    );
}

function PaneShell({ children }: { children: React.ReactNode }) {
    return <div className="rounded-lg border border-line bg-white overflow-hidden">{children}</div>;
}

function OverviewPane({ org }: { org: Org | null }) {
    if (!org?.notes) {
        return (
            <PaneShell>
                <div className="p-6 text-sm text-ink-muted">—</div>
            </PaneShell>
        );
    }
    return (
        <PaneShell>
            <div className="p-6 whitespace-pre-wrap text-sm text-ink">{org.notes}</div>
        </PaneShell>
    );
}

function TH({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
    return (
        <th
            className={cn(
                'px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-ink-secondary',
                align === 'right' ? 'text-right' : 'text-left',
            )}
        >
            {children}
        </th>
    );
}
function TD({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
    return (
        <td className={cn('px-4 py-3 text-ink', align === 'right' ? 'text-right' : 'text-left')}>
            {children}
        </td>
    );
}

function OrdersPane({ rows, localeTag }: { rows: OrderRow[]; localeTag: string }) {
    const { t } = useTranslation('admin');
    if (rows.length === 0) return <Empty text={t('orders.empty.title')} />;
    return (
        <PaneShell>
            <table className="w-full text-sm">
                <thead className="bg-surface-muted border-b border-line">
                    <tr>
                        <TH>{t('orders.columns.product')}</TH>
                        <TH align="right">{t('orders.columns.quantity')}</TH>
                        <TH align="right">{t('orders.columns.total')}</TH>
                        <TH>{t('orders.columns.status')}</TH>
                        <TH align="right">{t('orders.columns.createdAt')}</TH>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <TD>{r.product?.name ?? '—'}</TD>
                            <TD align="right">{r.quantity}</TD>
                            <TD align="right">{formatMoney(r.total, r.currency, localeTag)}</TD>
                            <TD><StatusBadge status={r.status} /></TD>
                            <TD align="right"><span className="text-xs text-ink-muted">{formatDate(r.created_at, localeTag)}</span></TD>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PaneShell>
    );
}

function LicensesPane({ rows, localeTag }: { rows: LicenseRow[]; localeTag: string }) {
    const { t } = useTranslation('admin');
    if (rows.length === 0) return <Empty text={t('licenses.empty.title')} />;
    return (
        <PaneShell>
            <table className="w-full text-sm">
                <thead className="bg-surface-muted border-b border-line">
                    <tr>
                        <TH>{t('licenses.columns.product')}</TH>
                        <TH>{t('licenses.columns.key')}</TH>
                        <TH align="right">{t('licenses.columns.issuedAt')}</TH>
                        <TH align="right">{t('licenses.columns.expiresAt')}</TH>
                        <TH>{t('licenses.columns.status')}</TH>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <TD>{r.order?.product?.name ?? '—'}</TD>
                            <TD><span className="font-mono text-xs">{maskLicenseKey(r.license_key)}</span></TD>
                            <TD align="right"><span className="text-xs text-ink-muted">{formatDate(r.issued_at, localeTag)}</span></TD>
                            <TD align="right"><span className="text-xs text-ink-muted">{formatDate(r.expires_at, localeTag)}</span></TD>
                            <TD><StatusBadge status={r.status} /></TD>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PaneShell>
    );
}

function InvoicesPane({ rows, localeTag }: { rows: InvoiceRow[]; localeTag: string }) {
    const { t } = useTranslation('admin');
    if (rows.length === 0) return <Empty text={t('invoices.empty.title')} />;
    return (
        <PaneShell>
            <table className="w-full text-sm">
                <thead className="bg-surface-muted border-b border-line">
                    <tr>
                        <TH>{t('invoices.columns.number')}</TH>
                        <TH align="right">{t('invoices.columns.amount')}</TH>
                        <TH>{t('invoices.columns.status')}</TH>
                        <TH align="right">{t('invoices.columns.issuedAt')}</TH>
                        <TH align="right">{t('invoices.columns.dueAt')}</TH>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <TD><span className="font-mono text-xs">{r.invoice_number}</span></TD>
                            <TD align="right">{formatMoney(r.amount, r.currency, localeTag)}</TD>
                            <TD><StatusBadge status={r.status} /></TD>
                            <TD align="right"><span className="text-xs text-ink-muted">{formatDate(r.issued_at, localeTag)}</span></TD>
                            <TD align="right"><span className="text-xs text-ink-muted">{formatDate(r.due_at, localeTag)}</span></TD>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PaneShell>
    );
}

function TicketsPane({ rows, localeTag }: { rows: TicketRow[]; localeTag: string }) {
    const { t } = useTranslation('admin');
    if (rows.length === 0) return <Empty text={t('tickets.empty.title')} />;
    return (
        <PaneShell>
            <table className="w-full text-sm">
                <thead className="bg-surface-muted border-b border-line">
                    <tr>
                        <TH>{t('tickets.columns.subject')}</TH>
                        <TH>{t('tickets.columns.priority')}</TH>
                        <TH>{t('tickets.columns.status')}</TH>
                        <TH align="right">{t('tickets.columns.lastMessageAt')}</TH>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((r) => (
                        <tr key={r.id} className="hover:bg-surface-muted cursor-pointer" onClick={() => window.location.assign(`/admin/tickets/view?id=${r.id}`)}>
                            <TD>{r.subject}</TD>
                            <TD><StatusBadge status={r.priority} /></TD>
                            <TD><StatusBadge status={r.status} /></TD>
                            <TD align="right"><span className="text-xs text-ink-muted">{formatDate(r.created_at, localeTag)}</span></TD>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PaneShell>
    );
}

function UsersPane({ rows, localeTag }: { rows: UserRow[]; localeTag: string }) {
    const { t } = useTranslation('admin');
    if (rows.length === 0) return <Empty text={t('customers.detail.tabs.users')} />;
    return (
        <PaneShell>
            <table className="w-full text-sm">
                <thead className="bg-surface-muted border-b border-line">
                    <tr>
                        <TH>{t('customers.inviteDialog.email')}</TH>
                        <TH>{t('customers.inviteDialog.role')}</TH>
                        <TH align="right">{t('customers.columns.createdAt')}</TH>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <TD>{r.email ?? r.full_name ?? '—'}</TD>
                            <TD><StatusBadge status={r.role === 'admin' ? 'active' : 'new'} /></TD>
                            <TD align="right"><span className="text-xs text-ink-muted">{formatDate(r.created_at, localeTag)}</span></TD>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PaneShell>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <PaneShell>
            <div className="p-10 text-center text-sm text-ink-muted">{text}</div>
        </PaneShell>
    );
}

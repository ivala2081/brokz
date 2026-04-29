/**
 * AdminOrderDetail — /admin/orders/view?id= island.
 *
 * Loads order (with org + product names), pinned wallet, and all
 * subscription invoices for the order ordered by period_start.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import StatusBadge from './StatusBadge';
import DataTable, { type DataTableColumn } from '../ui/DataTable';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatMoney } from '../../lib/admin/format';
import { maskAddress } from '../../lib/payments';
import { cn } from '../../lib/cn';

type Locale = 'en' | 'tr';

interface OrderDetail {
    id: string;
    status: string;
    quantity: number;
    total: number;
    currency: string;
    plan_kind: string | null;
    term_months: number | null;
    monthly_amount: number | null;
    period_start: string | null;
    payment_wallet_id: string | null;
    notes: string | null;
    created_at: string;
    organization: { id: string; name: string } | null;
    product: { id: string; name: string } | null;
}

interface WalletDetail {
    id: string;
    network: string;
    address: string;
    label: string | null;
}

interface InvoiceRow {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    period_start: string | null;
    due_at: string | null;
    issued_at: string | null;
}

export default function AdminOrderDetail({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const [id, setId] = useState<string | null>(null);
    useEffect(() => {
        const qid = new URLSearchParams(window.location.search).get('id');
        if (qid) setId(qid);
    }, []);

    return (
        <AdminShell
            locale={locale}
            activeKey="orders"
            title="—"
            breadcrumbs={[{ label: 'Orders', href: '/admin/orders' }]}
        >
            {id ? <OrderDetailInner orderId={id} locale={locale} /> : null}
        </AdminShell>
    );
}

function OrderDetailInner({ orderId, locale }: { orderId: string; locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [wallet, setWallet] = useState<WalletDetail | null>(null);
    const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            setLoading(true);
            const { data: orderData } = await supabase
                .from('orders')
                .select(
                    'id, status, quantity, total, currency, plan_kind, term_months, monthly_amount, period_start, payment_wallet_id, notes, created_at, organization:organizations(id, name), product:products(id, name)',
                )
                .eq('id', orderId)
                .maybeSingle();

            if (cancelled) return;
            const ord = (orderData as unknown as OrderDetail | null) ?? null;
            setOrder(ord);

            const [walletRes, invoicesRes] = await Promise.all([
                ord?.payment_wallet_id
                    ? supabase
                          .from('payment_wallets')
                          .select('id, network, address, label')
                          .eq('id', ord.payment_wallet_id)
                          .maybeSingle()
                    : Promise.resolve({ data: null }),
                supabase
                    .from('invoices')
                    .select('id, invoice_number, amount, currency, status, period_start, due_at, issued_at')
                    .eq('order_id', orderId)
                    .is('deleted_at', null)
                    .order('period_start', { ascending: true }),
            ]);

            if (cancelled) return;
            setWallet((walletRes.data as unknown as WalletDetail | null) ?? null);
            setInvoices((invoicesRes.data as unknown as InvoiceRow[]) ?? []);
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [orderId, supabase]);

    function copyAddress() {
        if (!wallet) return;
        void navigator.clipboard.writeText(wallet.address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function planSummary(): string {
        if (!order) return '—';
        if (order.plan_kind === 'fixed_term' && order.term_months != null && order.monthly_amount != null) {
            return `${order.term_months} ay × ${formatMoney(order.monthly_amount, order.currency, localeTag)}`;
        }
        if (order.plan_kind === 'open_ended' && order.monthly_amount != null) {
            return `${t('orders.openEnded')} × ${formatMoney(order.monthly_amount, order.currency, localeTag)}/ay`;
        }
        return '—';
    }

    const invoiceColumns: DataTableColumn<InvoiceRow>[] = [
        {
            key: 'period_start',
            header: t('orders.periodStart'),
            cell: (r) => (
                <span className="text-ink tabular-nums">
                    {r.period_start
                        ? new Intl.DateTimeFormat(localeTag, { year: 'numeric', month: 'long' }).format(
                              new Date(r.period_start),
                          )
                        : '—'}
                </span>
            ),
            sortable: true,
            searchAccessor: (r) => r.period_start ?? '',
        },
        {
            key: 'due_at',
            header: t('invoices.columns.dueAt'),
            cell: (r) => (
                <span className="text-ink-secondary tabular-nums">{formatDate(r.due_at, localeTag)}</span>
            ),
            sortable: true,
            searchAccessor: (r) => r.due_at ?? '',
        },
        {
            key: 'amount',
            header: t('invoices.columns.amount'),
            cell: (r) => (
                <span className="tabular-nums font-medium">{formatMoney(r.amount, r.currency, localeTag)}</span>
            ),
            align: 'right',
            sortable: true,
            searchAccessor: (r) => Number(r.amount),
        },
        {
            key: 'status',
            header: t('invoices.columns.status'),
            cell: (r) => <StatusBadge status={r.status} />,
            searchAccessor: (r) => r.status,
        },
        {
            key: 'invoice_number',
            header: t('invoices.columns.number'),
            cell: (r) => (
                <span className="text-xs text-ink-muted tabular-nums">{r.invoice_number}</span>
            ),
            searchAccessor: (r) => r.invoice_number,
        },
        {
            key: 'actions',
            header: '',
            cell: (r) => (
                <div className="text-right">
                    <a
                        href={`/admin/invoices/view?id=${r.id}`}
                        className="text-xs text-brand hover:text-brand-hover font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {t('orders.detail.viewInvoice')}
                    </a>
                </div>
            ),
            align: 'right',
        },
    ];

    if (!loading && !order) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center">
                <p className="text-sm text-ink-muted">{t('orders.detail.notFound')}</p>
                <a href="/admin/orders" className="text-sm text-brand hover:text-brand-hover mt-3 inline-block">
                    ← {t('orders.detail.back')}
                </a>
            </div>
        );
    }

    const totalValue = order?.plan_kind === 'fixed_term' && order.term_months != null && order.monthly_amount != null
        ? order.term_months * order.monthly_amount
        : order?.total ?? 0;

    return (
        <div className="space-y-6">
            {/* Header card */}
            <header className="rounded-lg border border-line bg-white p-6">
                <a href="/admin/orders" className="text-xs text-ink-muted hover:text-ink">
                    ← {t('orders.detail.back')}
                </a>
                <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-ink">
                            {order?.organization?.name ?? '—'}
                        </h2>
                        <p className="mt-0.5 text-sm text-ink-secondary">
                            {order?.product?.name ?? '—'}
                        </p>

                        <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-xs">
                            <InfoRow label={t('orders.columns.plan')} value={planSummary()} />
                            <InfoRow
                                label={t('orders.totalPreview')}
                                value={formatMoney(totalValue, order?.currency ?? 'USD', localeTag)}
                            />
                            <InfoRow
                                label={t('orders.periodStart')}
                                value={formatDate(order?.period_start, localeTag)}
                            />
                            <InfoRow
                                label={t('orders.columns.status')}
                                value={order ? '' : '—'}
                                badge={order ? <StatusBadge status={order.status} /> : undefined}
                            />
                        </dl>
                    </div>
                </div>

                {/* Pinned wallet */}
                {wallet && (
                    <div className="mt-5 flex items-center gap-3 rounded-md border border-line bg-surface-muted px-4 py-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-2xs uppercase tracking-wider text-ink-muted font-semibold">
                                {t('orders.detail.pinnedWallet')}
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-ink">
                                <span className="text-ink-secondary">{wallet.network}</span>
                                {' '}
                                <span className="tabular-nums">{maskAddress(wallet.address)}</span>
                            </p>
                            <p className="text-xs text-ink-muted break-all font-mono mt-0.5">
                                {wallet.address}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={copyAddress}
                            className={cn(
                                'shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-medium transition-colors',
                                copied
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white text-ink hover:border-ink/30',
                            )}
                        >
                            {copied ? t('common.copied') : t('common.copy')}
                        </button>
                    </div>
                )}
            </header>

            {/* Invoice schedule */}
            <section>
                <h3 className="mb-3 text-sm font-semibold text-ink">{t('orders.detail.schedule')}</h3>
                <DataTable<InvoiceRow>
                    data={invoices}
                    columns={invoiceColumns}
                    loading={loading}
                    getRowId={(r) => r.id}
                    onRowClick={(r) => { window.location.href = `/admin/invoices/view?id=${r.id}`; }}
                    initialSort={{ key: 'period_start', dir: 'asc' }}
                    labels={{
                        search: t('common.search'),
                        previous: t('common.previous'),
                        next: t('common.next'),
                        rowCount: (n) => `${n}`,
                        pageOf: (c, tot) => `${c} / ${tot}`,
                        noResults: t('common.none'),
                    }}
                    emptyState={
                        <div className="p-10 text-center text-sm text-ink-muted">
                            {t('invoices.empty.title')}
                        </div>
                    }
                />
            </section>

            {/* Notes */}
            {order?.notes && (
                <section className="rounded-lg border border-line bg-white px-6 py-4">
                    <p className="text-2xs uppercase tracking-wider text-ink-muted font-semibold mb-2">
                        {t('orders.dialog.notes')}
                    </p>
                    <p className="text-sm text-ink whitespace-pre-wrap">{order.notes}</p>
                </section>
            )}
        </div>
    );
}

function InfoRow({
    label,
    value,
    badge,
}: {
    label: string;
    value: string;
    badge?: ReactNode;
}) {
    return (
        <div>
            <dt className="uppercase tracking-wider text-ink-muted text-2xs">{label}</dt>
            <dd className="mt-0.5 text-ink">
                {badge ?? value}
            </dd>
        </div>
    );
}

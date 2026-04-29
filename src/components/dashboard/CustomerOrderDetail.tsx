/**
 * CustomerOrderDetail — /dashboard/orders/view?id=<order_id>
 *
 * Shows order plan summary, pinned payment wallet, and a subscription
 * schedule table with per-row payment actions.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardShell from './DashboardShell';
import StatusBadge from '../admin/StatusBadge';
import DataTable, { type DataTableColumn } from '../ui/DataTable';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatMoney } from '../../lib/admin/format';
import { toast } from '../ui/Toast';
import Button from '../ui/Button';
import PaymentProofDialog from './PaymentProofDialog';
import { NETWORKS, type NetworkCode } from '../../lib/payments';

type Locale = 'en' | 'tr';

interface Product {
    name: string;
    slug: string | null;
    category: string | null;
}

interface Wallet {
    id: string;
    network: string;
    address: string;
    label: string | null;
    memo: string | null;
    display_order: number;
    is_active: boolean;
}

interface Order {
    id: string;
    status: string;
    total: number;
    currency: string;
    plan_kind: 'fixed_term' | 'open_ended' | null;
    term_months: number | null;
    monthly_amount: number | null;
    period_start: string | null;
    organization_id: string;
    product: Product | null;
    wallet: Wallet | null;
}

interface SubscriptionInvoice {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    due_at: string | null;
    pdf_url: string | null;
    period_start: string | null;
}

interface Submission {
    id: string;
    invoice_id: string;
    status: 'pending_review' | 'approved' | 'rejected';
}

export default function CustomerOrderDetail({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('dashboard');
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
        const qid = new URLSearchParams(window.location.search).get('id');
        if (qid) setId(qid);
    }, []);

    return (
        <DashboardShell
            locale={locale}
            activeKey="orders"
            title={t('orders.title')}
            breadcrumbs={[{ label: t('orders.title'), href: '/dashboard/orders' }]}
        >
            {id ? <OrderDetailInner orderId={id} locale={locale} /> : null}
        </DashboardShell>
    );
}

function OrderDetailInner({ orderId, locale }: { orderId: string; locale: Locale }) {
    const { t } = useTranslation('dashboard');
    const { supabase } = useAuth();

    const [order, setOrder] = useState<Order | null>(null);
    const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [fallbackWallets, setFallbackWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [proofInvoice, setProofInvoice] = useState<SubscriptionInvoice | null>(null);

    const load = useCallback(async () => {
        setLoading(true);

        // Fetch order + pinned wallet
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select(
                'id, status, total, currency, plan_kind, term_months, monthly_amount, period_start, organization_id, product:products(name, slug, category), wallet:payment_wallets!payment_wallet_id(id, network, address, label, memo, display_order, is_active)',
            )
            .eq('id', orderId)
            .maybeSingle();

        if (orderError || !orderData) {
            setOrder(null);
            setLoading(false);
            return;
        }

        const ord = orderData as unknown as Order;
        setOrder(ord);

        // Fetch subscription invoices for this order
        const { data: invData } = await supabase
            .from('invoices')
            .select('id, invoice_number, amount, currency, status, due_at, pdf_url, period_start')
            .eq('order_id', orderId)
            .eq('invoice_type', 'subscription')
            .order('period_start', { ascending: true });

        const invRows = (invData as SubscriptionInvoice[] | null) ?? [];
        setInvoices(invRows);

        // Fetch submissions for those invoice ids
        const invoiceIds = invRows.map((i) => i.id);
        let subRows: Submission[] = [];
        if (invoiceIds.length > 0) {
            const { data: subData } = await supabase
                .from('payment_submissions')
                .select('id, invoice_id, status')
                .in('invoice_id', invoiceIds);
            subRows = (subData as Submission[] | null) ?? [];
        }
        setSubmissions(subRows);

        // Fallback: if no pinned wallet, load active wallets
        if (!ord.wallet) {
            console.warn('[CustomerOrderDetail] order has no pinned payment_wallet_id — falling back to active wallets list');
            const { data: wData } = await supabase
                .from('payment_wallets')
                .select('id, network, address, label, memo, display_order, is_active')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            setFallbackWallets((wData as Wallet[] | null) ?? []);
        }

        setLoading(false);
    }, [supabase, orderId]);

    useEffect(() => { void load(); }, [load]);

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    // Derive the "next payment" from the first non-paid invoice
    const nextPaymentInvoice = useMemo(
        () => invoices.find((inv) => inv.status !== 'paid') ?? null,
        [invoices],
    );

    // Submission lookup keyed by invoice_id → latest submission
    const submissionByInvoice = useMemo(() => {
        const map = new Map<string, Submission>();
        // submissions are fetched without ordering, so we check all and keep the first pending if any
        for (const s of submissions) {
            const existing = map.get(s.invoice_id);
            if (!existing) {
                map.set(s.invoice_id, s);
            } else if (s.status === 'pending_review') {
                // pending_review takes priority
                map.set(s.invoice_id, s);
            }
        }
        return map;
    }, [submissions]);

    if (loading) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center text-sm text-ink-muted">
                {t('common.loading')}
            </div>
        );
    }

    if (!order) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center">
                <p className="text-sm text-ink-muted">{t('orders.detail.notFound')}</p>
                <a href="/dashboard/orders" className="text-sm text-brand hover:text-brand-hover mt-3 inline-block">
                    ← {t('orders.title')}
                </a>
            </div>
        );
    }

    const pinnedWallet = order.wallet;
    const effectiveNetwork = pinnedWallet?.network ?? null;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Back link */}
            <a href="/dashboard/orders" className="text-xs text-ink-muted hover:text-ink">
                ← {t('orders.title')}
            </a>

            {/* Product heading */}
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">
                    {order.product?.name ?? '—'}
                </h2>
            </div>

            {/* Plan summary card */}
            <div className="rounded-lg border border-line bg-white p-8 space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-ink">
                        {order.plan_kind === 'fixed_term'
                            ? `${t('orders.detail.planFixed')}${order.term_months ? ` — ${order.term_months} ay` : ''}`
                            : t('orders.detail.planOpen')}
                    </h3>
                    <StatusBadge status={order.status} />
                </div>

                <dl className="grid grid-cols-2 gap-5 text-sm sm:grid-cols-3">
                    {order.monthly_amount != null && (
                        <div>
                            <dt className="text-2xs uppercase tracking-wider text-ink-muted">
                                {t('orders.detail.amount')}
                            </dt>
                            <dd className="font-semibold text-ink mt-0.5 tabular-nums text-lg">
                                {formatMoney(order.monthly_amount, order.currency, localeTag)}
                                <span className="text-sm font-normal text-ink-muted ml-1">/ ay</span>
                            </dd>
                        </div>
                    )}
                    {order.plan_kind === 'fixed_term' && order.total != null && (
                        <div>
                            <dt className="text-2xs uppercase tracking-wider text-ink-muted">
                                {t('orders.detail.total')}
                            </dt>
                            <dd className="font-semibold text-ink mt-0.5 tabular-nums text-lg">
                                {formatMoney(order.total, order.currency, localeTag)}
                            </dd>
                        </div>
                    )}
                    {order.period_start && (
                        <div>
                            <dt className="text-2xs uppercase tracking-wider text-ink-muted">
                                Başlangıç
                            </dt>
                            <dd className="text-ink-secondary mt-0.5 tabular-nums">
                                {formatDate(order.period_start, localeTag)}
                            </dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Pinned wallet card */}
            <WalletCard
                pinnedWallet={pinnedWallet}
                fallbackWallets={fallbackWallets}
                locale={locale}
            />

            {/* Next payment banner */}
            {nextPaymentInvoice && (
                <div className="rounded-md border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-ink">
                    <span className="font-semibold text-ink">{t('orders.detail.nextPayment')}:</span>{' '}
                    <span className="tabular-nums">{formatDate(nextPaymentInvoice.due_at, localeTag)}</span>
                    {' — '}
                    <span className="tabular-nums font-semibold">
                        {formatMoney(nextPaymentInvoice.amount, nextPaymentInvoice.currency, localeTag)}
                    </span>
                </div>
            )}

            {/* Schedule table */}
            {invoices.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-base font-semibold text-ink">{t('orders.detail.schedule')}</h3>
                    <ScheduleTable
                        invoices={invoices}
                        submissionByInvoice={submissionByInvoice}
                        locale={locale}
                        order={order}
                        onOpenProof={(inv) => setProofInvoice(inv)}
                    />
                </div>
            )}

            {/* PaymentProofDialog */}
            {proofInvoice && (
                <PaymentProofDialog
                    open={proofInvoice !== null}
                    onClose={() => setProofInvoice(null)}
                    onSuccess={() => { setProofInvoice(null); void load(); }}
                    invoiceId={proofInvoice.id}
                    organizationId={order.organization_id}
                    defaultAmount={Number(proofInvoice.amount)}
                    defaultCurrency="USDT"
                    lockedInvoiceId={proofInvoice.id}
                    lockedNetwork={effectiveNetwork ?? undefined}
                    lockedAmount={Number(proofInvoice.amount)}
                    lockedCurrency={proofInvoice.currency}
                />
            )}
        </div>
    );
}

function WalletCard({
    pinnedWallet,
    fallbackWallets,
    locale,
}: {
    pinnedWallet: Wallet | null;
    fallbackWallets: Wallet[];
    locale: Locale;
}) {
    const { t } = useTranslation('dashboard');
    const [copied, setCopied] = useState<string | null>(null);

    async function copyAddr(addr: string) {
        try {
            await navigator.clipboard.writeText(addr);
            setCopied(addr);
            setTimeout(() => setCopied((c) => (c === addr ? null : c)), 1500);
        } catch {
            /* clipboard blocked */
        }
    }

    const wallets: Wallet[] = pinnedWallet
        ? [pinnedWallet]
        : fallbackWallets;

    if (wallets.length === 0) return null;

    return (
        <div className="rounded-lg border border-line bg-white p-8 space-y-4">
            <h3 className="text-base font-semibold text-ink">
                {t('orders.detail.walletPinned')}
            </h3>

            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <strong>⚠ </strong>{t('payment.networkWarning')}
            </div>

            <ul className="space-y-3">
                {wallets.map((w) => {
                    const info = NETWORKS[w.network as NetworkCode];
                    return (
                        <li
                            key={w.id}
                            className="rounded-md border border-line bg-surface-muted p-3 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                                        {info?.label ?? w.network}
                                    </span>
                                    <span className="text-2xs text-ink-muted">
                                        {info?.chainLabel ?? ''}
                                    </span>
                                </div>
                                <p className="mt-1 font-mono text-xs text-ink break-all">{w.address}</p>
                                {w.memo && (
                                    <p className="mt-1 text-2xs text-ink-muted">
                                        memo: <span className="font-mono">{w.memo}</span>
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => void copyAddr(w.address)}
                                className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-line bg-white hover:border-brand hover:text-brand transition-colors"
                            >
                                {copied === w.address ? t('common.copied') : t('common.copy')}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function ScheduleTable({
    invoices,
    submissionByInvoice,
    locale,
    order,
    onOpenProof,
}: {
    invoices: SubscriptionInvoice[];
    submissionByInvoice: Map<string, Submission>;
    locale: Locale;
    order: Order;
    onOpenProof: (inv: SubscriptionInvoice) => void;
}) {
    const { t } = useTranslation('dashboard');
    const { supabase } = useAuth();
    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    function formatMonthLabel(iso: string | null): string {
        if (!iso) return '—';
        try {
            return new Intl.DateTimeFormat(localeTag, { month: 'short', year: 'numeric' }).format(new Date(iso));
        } catch {
            return '—';
        }
    }

    async function handleDownload(storagePath: string) {
        const { data, error } = await supabase.storage
            .from('invoices')
            .createSignedUrl(storagePath, 60);
        if (error || !data?.signedUrl) {
            toast.error(t('common.errorGeneric'));
            return;
        }
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    }

    const columns: DataTableColumn<SubscriptionInvoice>[] = [
        {
            key: 'month',
            header: t('orders.detail.monthLabel'),
            cell: (inv) => (
                <span className="font-medium text-ink tabular-nums">
                    {formatMonthLabel(inv.period_start)}
                </span>
            ),
            searchAccessor: (inv) => inv.period_start ?? '',
        },
        {
            key: 'due',
            header: t('orders.detail.due'),
            cell: (inv) => (
                <span className="text-ink-secondary tabular-nums text-xs">
                    {formatDate(inv.due_at, localeTag)}
                </span>
            ),
            searchAccessor: (inv) => inv.due_at ?? '',
        },
        {
            key: 'amount',
            header: t('orders.detail.amount'),
            align: 'right',
            cell: (inv) => (
                <span className="tabular-nums font-medium">
                    {formatMoney(inv.amount, inv.currency, localeTag)}
                </span>
            ),
            searchAccessor: (inv) => Number(inv.amount),
            sortable: true,
        },
        {
            key: 'status',
            header: t('orders.detail.status'),
            cell: (inv) => <StatusBadge status={inv.status} />,
            searchAccessor: (inv) => inv.status,
        },
        {
            key: 'action',
            header: '',
            align: 'right',
            cell: (inv) => {
                const sub = submissionByInvoice.get(inv.id);
                const pendingReview = sub?.status === 'pending_review';

                if (pendingReview) {
                    return (
                        <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider">
                            {t('orders.detail.inReview')}
                        </span>
                    );
                }

                if (inv.status === 'paid' && inv.pdf_url) {
                    return (
                        <button
                            type="button"
                            onClick={() => void handleDownload(inv.pdf_url!)}
                            className="text-xs text-brand hover:text-brand-hover underline-offset-2 hover:underline"
                        >
                            {t('orders.detail.downloadInvoice')}
                        </button>
                    );
                }

                if (inv.status === 'paid') {
                    // paid but no PDF yet
                    return (
                        <span className="text-2xs text-ink-muted">{t('invoices.detail.noPdf')}</span>
                    );
                }

                // draft / sent / overdue with no pending submission
                return (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenProof(inv)}
                    >
                        {t('orders.detail.markPaid')}
                    </Button>
                );
            },
        },
    ];

    return (
        <DataTable<SubscriptionInvoice>
            data={invoices}
            columns={columns}
            loading={false}
            getRowId={(inv) => inv.id}
            labels={{
                search: t('common.search'),
                previous: t('common.previous'),
                next: t('common.next'),
                rowCount: (n) => `${n}`,
                pageOf: (c, tot) => `${c} / ${tot}`,
                noResults: t('common.none'),
            }}
        />
    );
}

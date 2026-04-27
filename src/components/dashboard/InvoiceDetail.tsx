/**
 * InvoiceDetail — /dashboard/invoices/view?id=.
 *
 * Shows invoice metadata, status badge, order reference, and PDF download
 * button (or "not yet available" if pdf_url is null — Phase 3).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardShell from './DashboardShell';
import StatusBadge from '../admin/StatusBadge';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatMoney } from '../../lib/admin/format';
import { toast } from '../ui/Toast';
import Button from '../ui/Button';
import PaymentProofDialog from './PaymentProofDialog';
import { NETWORKS, maskAddress, type NetworkCode } from '../../lib/payments';
import { hasPaymentSubmissions } from '../../lib/admin/schemaProbe';

type Locale = 'en' | 'tr';

function DownloadPdfButton({ storagePath, label }: { storagePath: string; label: string }) {
    const { supabase } = useAuth();
    const [busy, setBusy] = useState(false);
    async function handleClick() {
        setBusy(true);
        const { data, error } = await supabase.storage
            .from('invoices')
            .createSignedUrl(storagePath, 60);
        setBusy(false);
        if (error || !data?.signedUrl) {
            toast.error('Could not fetch download link.');
            return;
        }
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    }
    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-md font-medium tracking-tight h-10 px-4 text-sm bg-brand text-white border border-brand hover:bg-brand-hover hover:border-brand-hover transition-colors disabled:opacity-60"
        >
            {busy ? '…' : label}
        </button>
    );
}

interface Invoice {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    issued_at: string | null;
    due_at: string | null;
    pdf_url: string | null;
    organization_id: string;
    order: { id: string; product: { name: string } | null } | null;
}

interface Wallet {
    id: string;
    network: string;
    address: string;
    label: string | null;
    memo: string | null;
    display_order: number;
}

interface Submission {
    id: string;
    network: string;
    tx_hash: string;
    amount_paid: number;
    currency: string;
    status: 'pending_review' | 'approved' | 'rejected';
    submitted_at: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
}

export default function InvoiceDetail({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
        const qid = new URLSearchParams(window.location.search).get('id');
        if (qid) setId(qid);
    }, []);

    return (
        <DashboardShell
            locale={locale}
            activeKey="invoices"
            title="—"
            breadcrumbs={[{ label: 'Invoices', href: '/dashboard/invoices' }]}
        >
            {id ? <InvoiceDetailInner invoiceId={id} locale={locale} /> : null}
        </DashboardShell>
    );
}

function InvoiceDetailInner({ invoiceId, locale }: { invoiceId: string; locale: Locale }) {
    const { t } = useTranslation('dashboard');
    const { supabase } = useAuth();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [proofOpen, setProofOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const paymentsReady = await hasPaymentSubmissions(supabase);
        const [invRes, walletRes, subRes] = await Promise.all([
            supabase
                .from('invoices')
                .select('id, invoice_number, amount, currency, status, issued_at, due_at, pdf_url, organization_id, order:orders(id, product:products(name))')
                .eq('id', invoiceId)
                .maybeSingle(),
            paymentsReady
                ? supabase
                      .from('payment_wallets')
                      .select('id, network, address, label, memo, display_order')
                      .eq('is_active', true)
                      .order('display_order', { ascending: true })
                : Promise.resolve({ data: [], error: null }),
            paymentsReady
                ? supabase
                      .from('payment_submissions')
                      .select('id, network, tx_hash, amount_paid, currency, status, submitted_at, reviewed_at, rejection_reason')
                      .eq('invoice_id', invoiceId)
                      .order('submitted_at', { ascending: false })
                : Promise.resolve({ data: [], error: null }),
        ]);
        setInvoice((invRes.data as unknown as Invoice | null) ?? null);
        setWallets((walletRes.data as Wallet[] | null) ?? []);
        setSubmissions((subRes.data as Submission[] | null) ?? []);
        setLoading(false);
    }, [supabase, invoiceId]);

    useEffect(() => { void load(); }, [load]);

    const latestSubmission = submissions[0] ?? null;
    const pendingReview = latestSubmission?.status === 'pending_review';
    const lastRejected  = latestSubmission?.status === 'rejected';
    const approved      = submissions.some((s) => s.status === 'approved') || invoice?.status === 'paid';

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    if (loading) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center text-sm text-ink-muted">
                {t('common.loading')}
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="rounded-lg border border-line bg-white p-10 text-center">
                <p className="text-sm text-ink-muted">{t('invoices.detail.notFound')}</p>
                <a href="/dashboard/invoices" className="text-sm text-brand hover:text-brand-hover mt-3 inline-block">
                    ← {t('invoices.detail.back')}
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <a href="/dashboard/invoices" className="text-xs text-ink-muted hover:text-ink">
                ← {t('invoices.detail.back')}
            </a>

            <div className="rounded-lg border border-line bg-white p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-2xs uppercase tracking-wider text-ink-muted">{t('invoices.columns.number')}</p>
                        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-0.5 font-mono">
                            {invoice.invoice_number}
                        </h2>
                    </div>
                    <StatusBadge status={invoice.status} />
                </div>

                <dl className="grid grid-cols-2 gap-5 text-sm">
                    <div>
                        <dt className="text-2xs uppercase tracking-wider text-ink-muted">
                            {t('invoices.detail.amount')}
                        </dt>
                        <dd className="font-semibold text-ink mt-0.5 tabular-nums text-lg">
                            {formatMoney(invoice.amount, invoice.currency, localeTag)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-2xs uppercase tracking-wider text-ink-muted">
                            {t('invoices.detail.order')}
                        </dt>
                        <dd className="text-ink-secondary mt-0.5">
                            {invoice.order?.product?.name ?? '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-2xs uppercase tracking-wider text-ink-muted">
                            {t('invoices.detail.issuedAt')}
                        </dt>
                        <dd className="text-ink-secondary mt-0.5 tabular-nums">
                            {formatDate(invoice.issued_at, localeTag)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-2xs uppercase tracking-wider text-ink-muted">
                            {t('invoices.detail.dueAt')}
                        </dt>
                        <dd className="text-ink-secondary mt-0.5 tabular-nums">
                            {formatDate(invoice.due_at, localeTag)}
                        </dd>
                    </div>
                </dl>

                <div className="pt-2">
                    {invoice.pdf_url ? (
                        <DownloadPdfButton
                            storagePath={invoice.pdf_url}
                            label={t('invoices.detail.download')}
                        />
                    ) : (
                        <p className="text-sm text-ink-muted">{t('invoices.detail.noPdf')}</p>
                    )}
                </div>
            </div>

            {!approved && (
                <PaymentSection
                    wallets={wallets}
                    pending={pendingReview}
                    lastRejected={lastRejected}
                    lastSubmission={latestSubmission}
                    onOpenProof={() => setProofOpen(true)}
                />
            )}

            {submissions.length > 0 && (
                <SubmissionHistory submissions={submissions} />
            )}

            <PaymentProofDialog
                open={proofOpen}
                onClose={() => setProofOpen(false)}
                onSuccess={() => void load()}
                invoiceId={invoice.id}
                organizationId={invoice.organization_id}
                defaultAmount={Number(invoice.amount)}
                defaultCurrency="USDT"
            />
        </div>
    );
}

function PaymentSection({
    wallets,
    pending,
    lastRejected,
    lastSubmission,
    onOpenProof,
}: {
    wallets: Wallet[];
    pending: boolean;
    lastRejected: boolean;
    lastSubmission: Submission | null;
    onOpenProof: () => void;
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

    const grouped = useMemo(() => {
        const map = new Map<string, Wallet>();
        for (const w of wallets) if (!map.has(w.network)) map.set(w.network, w);
        return Array.from(map.values());
    }, [wallets]);

    return (
        <div className="rounded-lg border border-line bg-white p-8 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink">
                    {t('payment.walletsHeading')}
                </h3>
                {pending && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider">
                        {t('payment.pendingReview')}
                    </span>
                )}
            </div>

            {lastRejected && lastSubmission?.rejection_reason && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                    <p className="font-semibold text-red-700 text-xs uppercase tracking-wider mb-1">
                        {t('payment.lastRejected')}
                    </p>
                    {lastSubmission.rejection_reason}
                </div>
            )}

            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <strong>⚠ </strong>{t('payment.networkWarning')}
            </div>

            <ul className="space-y-3">
                {grouped.map((w) => {
                    const info = NETWORKS[w.network as NetworkCode];
                    return (
                        <li key={w.id} className="rounded-md border border-line bg-surface-muted p-3 flex items-center justify-between gap-3">
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

            <div className="pt-2">
                <Button onClick={onOpenProof} disabled={pending}>
                    {pending ? t('payment.proof.pendingCta') : t('payment.proof.cta')}
                </Button>
            </div>
        </div>
    );
}

function SubmissionHistory({ submissions }: { submissions: Submission[] }) {
    const { t } = useTranslation('dashboard');
    return (
        <div className="rounded-lg border border-line bg-white p-6 space-y-4">
            <h3 className="text-base font-semibold text-ink">{t('payment.history')}</h3>
            <ul className="space-y-3">
                {submissions.map((s) => {
                    const info = NETWORKS[s.network as NetworkCode];
                    const explorerUrl = info?.explorerTxUrl(s.tx_hash);
                    const color =
                        s.status === 'approved' ? 'text-brand' :
                        s.status === 'rejected' ? 'text-red-600' :
                        'text-amber-700';
                    return (
                        <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>
                                {t(`payment.status.${s.status}`)}
                            </span>
                            <span className="text-ink-secondary">{info?.label ?? s.network}</span>
                            <span className="tabular-nums text-ink">{s.amount_paid} {s.currency}</span>
                            {explorerUrl && (
                                <a
                                    href={explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-2xs text-ink-muted hover:text-brand"
                                >
                                    {maskAddress(s.tx_hash)} ↗
                                </a>
                            )}
                            <span className="text-2xs text-ink-muted ml-auto">
                                {new Date(s.submitted_at).toLocaleString()}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/**
 * InvoiceDetail — /dashboard/invoices/view?id=.
 *
 * Shows invoice metadata, status badge, order reference, and PDF download
 * button (or "not yet available" if pdf_url is null — Phase 3).
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardShell from './DashboardShell';
import StatusBadge from '../admin/StatusBadge';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatMoney } from '../../lib/admin/format';
import { toast } from '../ui/Toast';

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
    order: { id: string; product: { name: string } | null } | null;
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const { data } = await supabase
                .from('invoices')
                .select('id, invoice_number, amount, currency, status, issued_at, due_at, pdf_url, order:orders(id, product:products(name))')
                .eq('id', invoiceId)
                .maybeSingle();
            setInvoice((data as unknown as Invoice | null) ?? null);
            setLoading(false);
        }
        void load();
    }, [supabase, invoiceId]);

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
        </div>
    );
}

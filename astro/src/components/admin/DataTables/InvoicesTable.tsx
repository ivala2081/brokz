/**
 * InvoicesTable — Invoices page with issue / mark-paid / preview.
 *
 * Preview is an inline Dialog that iframes the `pdf_url` if present;
 * otherwise shows a fallback. PDF rendering is owned by the Edge Function;
 * we just display what the DB has.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from '../AdminShell';
import StatusBadge from '../StatusBadge';
import DataTable, { type DataTableColumn } from '../../ui/DataTable';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import EmptyState from '../../ui/EmptyState';
import { resolveAdminLocale } from '../../../lib/admin/locale';
import IssueInvoiceDialog from '../IssueInvoiceDialog';
import { useAuth } from '../../auth/AuthContext';
import { toast } from '../../ui/Toast';
import { formatDate, formatMoney } from '../../../lib/admin/format';
import { callEdgeFunction } from '../../../lib/admin/edgeFunction';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    issued_at: string | null;
    due_at: string | null;
    pdf_url: string | null;
    organization: { id: string; name: string } | null;
}

const STATUS_OPTIONS = ['all', 'draft', 'sent', 'paid', 'overdue'];

export default function InvoicesTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="invoices"
            title={t('invoices.title')}
            subtitle={t('invoices.subtitle')}
        >
            <InvoicesInner locale={locale} />
        </AdminShell>
    );
}

function InvoicesInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [issueOpen, setIssueOpen] = useState(false);
    const [preview, setPreview] = useState<Row | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('invoices')
            .select('id, invoice_number, amount, currency, status, issued_at, due_at, pdf_url, organization:organizations(id, name)')
            .is('deleted_at', null)
            .order('issued_at', { ascending: false, nullsFirst: false });
        if (status !== 'all') query = query.eq('status', status);
        const { data } = await query;
        setRows((data as unknown as Row[]) ?? []);
        setLoading(false);
    }, [supabase, status]);

    useEffect(() => {
        void load();
    }, [load]);

    async function openPreview(r: Row) {
        setPreview(r);
        setPreviewUrl(null);
        if (!r.pdf_url) return;
        setPreviewLoading(true);
        const { data, error } = await supabase.storage
            .from('invoices')
            .createSignedUrl(r.pdf_url, 60 * 10);
        setPreviewLoading(false);
        if (error || !data?.signedUrl) {
            toast.error(t('invoices.preview.error'));
            return;
        }
        setPreviewUrl(data.signedUrl);
    }

    async function generatePdf(r: Row) {
        setGeneratingId(r.id);
        const res = await callEdgeFunction<{ storage_path: string }>(
            supabase,
            'generate-invoice-pdf',
            { invoice_id: r.id },
        );
        setGeneratingId(null);
        if (res.error || !res.data) {
            toast.error(t('invoices.generatePdf.error'));
            return;
        }
        toast.success(t('invoices.generatePdf.success'));
        void load();
    }

    async function markPaid(r: Row) {
        const { error } = await supabase
            .from('invoices')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', r.id);
        if (error) {
            toast.error(t('invoices.markPaid.error'));
            return;
        }
        toast.success(t('invoices.markPaid.success'));
        void load();
    }

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'number',
            header: t('invoices.columns.number'),
            cell: (r) => <span className="font-mono text-xs">{r.invoice_number}</span>,
            sortable: true,
            searchAccessor: (r) => r.invoice_number,
        },
        {
            key: 'organization',
            header: t('invoices.columns.organization'),
            cell: (r) =>
                r.organization ? (
                    <a
                        href={`/admin/customers/view?id=${r.organization.id}`}
                        className="text-ink hover:text-brand"
                    >
                        {r.organization.name}
                    </a>
                ) : (
                    <span className="text-ink-muted">—</span>
                ),
            searchAccessor: (r) => r.organization?.name ?? '',
        },
        {
            key: 'amount',
            header: t('invoices.columns.amount'),
            cell: (r) => <span className="tabular-nums">{formatMoney(r.amount, r.currency, localeTag)}</span>,
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
            key: 'issuedAt',
            header: t('invoices.columns.issuedAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.issued_at, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.issued_at ?? '',
        },
        {
            key: 'dueAt',
            header: t('invoices.columns.dueAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.due_at, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.due_at ?? '',
        },
        {
            key: 'actions',
            header: '',
            cell: (r) => (
                <div className="text-right flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => void openPreview(r)}>
                        {t('common.view')}
                    </Button>
                    {!r.pdf_url && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void generatePdf(r)}
                            disabled={generatingId === r.id}
                        >
                            {generatingId === r.id ? '…' : t('invoices.generatePdf.action')}
                        </Button>
                    )}
                    {r.status !== 'paid' && (
                        <Button size="sm" variant="secondary" onClick={() => void markPaid(r)}>
                            {t('invoices.markPaid.action')}
                        </Button>
                    )}
                </div>
            ),
            align: 'right',
        },
    ];

    return (
        <>
            <DataTable<Row>
                data={rows}
                columns={columns}
                loading={loading}
                getRowId={(r) => r.id}
                searchPlaceholder={t('common.search')}
                labels={{
                    search: t('common.search'),
                    previous: t('common.previous'),
                    next: t('common.next'),
                    rowCount: (n) => `${n}`,
                    pageOf: (c, tot) => `${c} / ${tot}`,
                    noResults: t('common.none'),
                }}
                filter={{
                    label: t('common.filter'),
                    value: status,
                    onChange: setStatus,
                    options: STATUS_OPTIONS.map((v) => ({
                        value: v,
                        label: v === 'all' ? t('common.all') : t(`status.${v}`),
                    })),
                }}
                toolbar={<Button onClick={() => setIssueOpen(true)}>{t('invoices.issue')}</Button>}
                emptyState={
                    <EmptyState
                        title={t('invoices.empty.title')}
                        description={t('invoices.empty.description')}
                        action={<Button onClick={() => setIssueOpen(true)}>{t('invoices.empty.cta')}</Button>}
                    />
                }
            />

            <IssueInvoiceDialog
                open={issueOpen}
                onClose={() => setIssueOpen(false)}
                onSuccess={() => void load()}
            />

            <Dialog
                open={!!preview}
                onClose={() => { setPreview(null); setPreviewUrl(null); }}
                title={t('invoices.preview.title')}
                size="xl"
                footer={
                    <Button variant="secondary" onClick={() => { setPreview(null); setPreviewUrl(null); }}>
                        {t('invoices.preview.close')}
                    </Button>
                }
            >
                {previewLoading ? (
                    <div className="p-10 text-center text-sm text-ink-muted">{t('common.loading')}</div>
                ) : preview && previewUrl ? (
                    <iframe
                        src={previewUrl}
                        title={preview.invoice_number}
                        className="w-full h-[60vh] border border-line rounded-md"
                    />
                ) : preview ? (
                    <div className="p-10 text-center text-sm text-ink-muted space-y-3">
                        <p>{t('invoices.preview.noPdf')}</p>
                        <Button onClick={() => { void generatePdf(preview); setPreview(null); }}>
                            {t('invoices.generatePdf.action')}
                        </Button>
                    </div>
                ) : null}
            </Dialog>
        </>
    );
}

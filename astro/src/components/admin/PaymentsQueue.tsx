/**
 * PaymentsQueue — /admin/payments.
 *
 * Lists payment_submissions grouped by status with a slide-in review panel
 * on the right for the selected row. Admin approves or rejects via RPC
 * (approve_payment_submission / reject_payment_submission) which handles
 * invoice status + audit_log atomically.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import DataTable, { type DataTableColumn } from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import Textarea from '../ui/Textarea';
import { toast } from '../ui/Toast';
import { formatDateTime, formatMoney } from '../../lib/admin/format';
import {
    NETWORKS,
    PAYMENT_AMOUNT_TOLERANCE_USD,
    maskAddress,
    type NetworkCode,
} from '../../lib/payments';

type Locale = 'en' | 'tr';
type TabKey = 'pending_review' | 'approved' | 'rejected';

interface Row {
    id: string;
    invoice_id: string;
    network: string;
    tx_hash: string;
    amount_paid: number;
    currency: string;
    status: TabKey;
    submitted_at: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
    note: string | null;
    proof_storage_path: string | null;
    invoice: {
        id: string;
        invoice_number: string;
        amount: number;
        currency: string;
        status: string;
        due_at: string | null;
    } | null;
    organization: {
        id: string;
        name: string;
    } | null;
    submitter: {
        id: string;
        email: string | null;
        full_name: string | null;
    } | null;
}

export default function PaymentsQueue({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="payments"
            title={t('payments.title')}
            subtitle={t('payments.subtitle')}
        >
            <PaymentsInner locale={locale} />
        </AdminShell>
    );
}

function PaymentsInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [tab, setTab] = useState<TabKey>('pending_review');
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Row | null>(null);
    const [actionBusy, setActionBusy] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [proofSignedUrl, setProofSignedUrl] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from('payment_submissions')
            .select(`
                id, invoice_id, network, tx_hash, amount_paid, currency, status,
                submitted_at, reviewed_at, rejection_reason, note, proof_storage_path,
                invoice:invoices ( id, invoice_number, amount, currency, status, due_at ),
                organization:organizations ( id, name ),
                submitter:profiles!payment_submissions_submitted_by_fkey ( id, email, full_name )
            `)
            .eq('status', tab)
            .order('submitted_at', { ascending: tab === 'pending_review', nullsFirst: false })
            .limit(200);
        setRows(((data ?? []) as unknown as Row[]));
        setLoading(false);
    }, [supabase, tab]);

    useEffect(() => { void load(); }, [load]);

    async function openProof(path: string) {
        const { data } = await supabase.storage
            .from('payment-proofs')
            .createSignedUrl(path, 600);
        setProofSignedUrl(data?.signedUrl ?? null);
    }

    useEffect(() => {
        if (selected?.proof_storage_path) void openProof(selected.proof_storage_path);
        else setProofSignedUrl(null);
    }, [selected?.proof_storage_path]);

    async function approve(row: Row) {
        setActionBusy(true);
        const { error } = await supabase.rpc('approve_payment_submission', {
            p_submission_id: row.id,
        });
        setActionBusy(false);
        if (error) {
            toast.error(error.message || t('payments.error.generic'));
            return;
        }
        toast.success(t('payments.action.approved'));
        setSelected(null);
        void load();
    }

    async function reject(row: Row, reason: string) {
        setActionBusy(true);
        const { error } = await supabase.rpc('reject_payment_submission', {
            p_submission_id: row.id,
            p_reason: reason,
        });
        setActionBusy(false);
        if (error) {
            toast.error(error.message || t('payments.error.generic'));
            return;
        }
        toast.success(t('payments.action.rejected'));
        setRejectOpen(false);
        setRejectReason('');
        setSelected(null);
        void load();
    }

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'organization',
            header: t('payments.columns.customer'),
            cell: (r) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-ink">{r.organization?.name ?? '—'}</span>
                    <span className="text-2xs text-ink-muted">{r.submitter?.email ?? '—'}</span>
                </div>
            ),
            searchAccessor: (r) => `${r.organization?.name ?? ''} ${r.submitter?.email ?? ''}`,
        },
        {
            key: 'invoice',
            header: t('payments.columns.invoice'),
            cell: (r) => (
                <a
                    href={`/admin/customers/view?id=${r.organization?.id}`}
                    className="font-mono text-xs text-ink hover:text-brand"
                    onClick={(e) => e.stopPropagation()}
                >
                    {r.invoice?.invoice_number ?? '—'}
                </a>
            ),
            searchAccessor: (r) => r.invoice?.invoice_number ?? '',
        },
        {
            key: 'expected',
            header: t('payments.columns.expected'),
            cell: (r) => (
                <span className="tabular-nums text-sm text-ink">
                    {r.invoice ? formatMoney(r.invoice.amount, r.invoice.currency, locale === 'tr' ? 'tr-TR' : 'en-US') : '—'}
                </span>
            ),
            align: 'right',
        },
        {
            key: 'paid',
            header: t('payments.columns.paid'),
            cell: (r) => (
                <div className="flex flex-col items-end">
                    <span className="tabular-nums text-sm text-ink">
                        {r.amount_paid.toFixed(2)} {r.currency}
                    </span>
                    {r.invoice && <AmountDiffBadge expected={r.invoice.amount} paid={r.amount_paid} />}
                </div>
            ),
            align: 'right',
        },
        {
            key: 'network',
            header: t('payments.columns.network'),
            cell: (r) => <span className="text-xs text-ink-secondary">{r.network}</span>,
        },
        {
            key: 'tx',
            header: t('payments.columns.tx'),
            cell: (r) => {
                const info = NETWORKS[r.network as NetworkCode];
                const url = info?.explorerTxUrl(r.tx_hash);
                return url ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-2xs text-ink-muted hover:text-brand"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {maskAddress(r.tx_hash)} ↗
                    </a>
                ) : (
                    <span className="font-mono text-2xs text-ink-muted">{maskAddress(r.tx_hash)}</span>
                );
            },
            searchAccessor: (r) => r.tx_hash,
        },
        {
            key: 'age',
            header: t('payments.columns.submitted'),
            cell: (r) => (
                <span className="text-2xs text-ink-muted tabular-nums">
                    {formatDateTime(r.submitted_at, locale === 'tr' ? 'tr-TR' : 'en-US')}
                </span>
            ),
            sortable: true,
            searchAccessor: (r) => r.submitted_at,
            align: 'right',
        },
    ];

    return (
        <>
            <div className="mb-4 inline-flex rounded-md border border-line overflow-hidden bg-white">
                {(['pending_review', 'approved', 'rejected'] as TabKey[]).map((k) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => setTab(k)}
                        className={
                            'px-3 py-1.5 text-xs font-medium transition-colors ' +
                            (tab === k ? 'bg-ink text-white' : 'bg-white text-ink-muted hover:text-ink')
                        }
                    >
                        {t(`payments.tabs.${k}`)}
                    </button>
                ))}
            </div>

            <DataTable<Row>
                data={rows}
                columns={columns}
                loading={loading}
                getRowId={(r) => r.id}
                searchPlaceholder={t('common.search')}
                onRowClick={(r) => setSelected(r)}
                labels={{
                    search: t('common.search'),
                    previous: t('common.previous'),
                    next: t('common.next'),
                    rowCount: (n) => `${n}`,
                    pageOf: (c, tot) => `${c} / ${tot}`,
                    noResults: t('common.none'),
                }}
                emptyState={
                    <EmptyState
                        title={t(`payments.empty.${tab}.title`)}
                        description={t(`payments.empty.${tab}.description`)}
                    />
                }
            />

            <Dialog
                open={!!selected}
                onClose={() => setSelected(null)}
                title={selected?.invoice?.invoice_number ?? ''}
                size="lg"
                footer={
                    selected?.status === 'pending_review' ? (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => { setRejectReason(''); setRejectOpen(true); }}
                                disabled={actionBusy}
                            >
                                {t('payments.action.reject')}
                            </Button>
                            <Button
                                onClick={() => selected && void approve(selected)}
                                disabled={actionBusy}
                            >
                                {actionBusy ? '…' : t('payments.action.approve')}
                            </Button>
                        </div>
                    ) : (
                        <Button variant="secondary" onClick={() => setSelected(null)}>
                            {t('common.close')}
                        </Button>
                    )
                }
            >
                {selected && <ReviewPanel row={selected} proofUrl={proofSignedUrl} locale={locale} />}
            </Dialog>

            <Dialog
                open={rejectOpen}
                onClose={() => setRejectOpen(false)}
                title={t('payments.rejectDialog.title')}
                size="sm"
                footer={
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" onClick={() => setRejectOpen(false)} disabled={actionBusy}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={() => selected && reject(selected, rejectReason.trim())}
                            disabled={actionBusy || rejectReason.trim().length < 3}
                        >
                            {actionBusy ? '…' : t('payments.action.reject')}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <p className="text-sm text-ink-muted">
                        {t('payments.rejectDialog.description')}
                    </p>
                    <Textarea
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={t('payments.rejectDialog.placeholder')}
                    />
                </div>
            </Dialog>
        </>
    );
}

function AmountDiffBadge({ expected, paid }: { expected: number; paid: number }) {
    const diff = paid - expected;
    const abs = Math.abs(diff);
    if (abs <= PAYMENT_AMOUNT_TOLERANCE_USD) {
        return <span className="text-2xs text-brand">✓ match</span>;
    }
    return (
        <span className={`text-2xs ${diff < 0 ? 'text-red-600' : 'text-amber-700'}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(2)}
        </span>
    );
}

function ReviewPanel({ row, proofUrl, locale }: { row: Row; proofUrl: string | null; locale: Locale }) {
    const { t } = useTranslation('admin');
    const info = NETWORKS[row.network as NetworkCode];
    const explorerUrl = info?.explorerTxUrl(row.tx_hash);
    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    return (
        <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Info label={t('payments.columns.customer')} value={row.organization?.name ?? '—'} />
                <Info label={t('payments.review.submitter')} value={row.submitter?.email ?? '—'} />
                <Info
                    label={t('payments.columns.expected')}
                    value={row.invoice ? formatMoney(row.invoice.amount, row.invoice.currency, localeTag) : '—'}
                />
                <Info
                    label={t('payments.columns.paid')}
                    value={`${row.amount_paid.toFixed(2)} ${row.currency}`}
                    mono
                />
                <Info label={t('payments.columns.network')} value={`${info?.label ?? row.network} · ${info?.chainLabel ?? ''}`} />
                <Info label={t('payments.review.submittedAt')} value={formatDateTime(row.submitted_at, localeTag)} />
            </dl>

            <div>
                <p className="text-2xs uppercase tracking-wider text-ink-muted mb-1">{t('payments.columns.tx')}</p>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink break-all">{row.tx_hash}</span>
                    {explorerUrl && (
                        <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md border border-line px-2 py-0.5 text-2xs hover:border-brand hover:text-brand"
                        >
                            {t('payments.review.openExplorer')} ↗
                        </a>
                    )}
                </div>
            </div>

            {row.note && (
                <div>
                    <p className="text-2xs uppercase tracking-wider text-ink-muted mb-1">{t('payments.review.note')}</p>
                    <p className="text-sm text-ink whitespace-pre-wrap">{row.note}</p>
                </div>
            )}

            {row.rejection_reason && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                    <p className="text-2xs uppercase tracking-wider text-red-700 mb-1">
                        {t('payments.review.rejection')}
                    </p>
                    <p className="text-sm text-red-900">{row.rejection_reason}</p>
                </div>
            )}

            {row.proof_storage_path && (
                <div>
                    <p className="text-2xs uppercase tracking-wider text-ink-muted mb-1">
                        {t('payments.review.screenshot')}
                    </p>
                    {proofUrl ? (
                        <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <img
                                src={proofUrl}
                                alt="proof"
                                className="max-h-64 rounded-md border border-line"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="block text-2xs text-brand mt-1">{t('payments.review.openFull')} ↗</span>
                        </a>
                    ) : (
                        <span className="text-xs text-ink-muted">{t('common.loading')}</span>
                    )}
                </div>
            )}
        </div>
    );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <dt className="text-2xs uppercase tracking-wider text-ink-muted">{label}</dt>
            <dd className={`mt-0.5 text-sm text-ink ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</dd>
        </div>
    );
}

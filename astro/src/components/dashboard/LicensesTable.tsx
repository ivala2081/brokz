/**
 * LicensesTable — /dashboard/licenses.
 *
 * Licenses masked by default. "Reveal key" opens a Dialog with full key
 * and a Copy button. No admin actions (extend/revoke) shown to customer.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardShell from './DashboardShell';
import StatusBadge from '../admin/StatusBadge';
import DataTable, { type DataTableColumn } from '../ui/DataTable';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import EmptyState from '../ui/EmptyState';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';
import { formatDate, maskLicenseKey } from '../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    license_key: string;
    status: string;
    issued_at: string;
    expires_at: string | null;
    order: {
        product: { name: string } | null;
    } | null;
}

const STATUS_OPTIONS = ['all', 'active', 'expired', 'revoked'];

export default function LicensesTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('dashboard');
    return (
        <DashboardShell
            locale={locale}
            activeKey="licenses"
            title={t('licenses.title')}
            subtitle={t('licenses.subtitle')}
        >
            <LicensesInner locale={locale} />
        </DashboardShell>
    );
}

function LicensesInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('dashboard');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [revealRow, setRevealRow] = useState<Row | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('licenses')
            .select('id, license_key, status, issued_at, expires_at, order:orders(product:products(name))')
            .is('deleted_at', null)
            .order('issued_at', { ascending: false });
        if (status !== 'all') query = query.eq('status', status);
        const { data } = await query;
        setRows((data as unknown as Row[]) ?? []);
        setLoading(false);
    }, [supabase, status]);

    useEffect(() => {
        void load();
    }, [load]);

    async function copyKey(key: string) {
        try {
            await navigator.clipboard.writeText(key);
            toast.success(t('licenses.revealDialog.copySuccess'));
        } catch {
            /* noop */
        }
    }

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'product',
            header: t('licenses.columns.product'),
            cell: (r) => <span className="font-medium text-ink">{r.order?.product?.name ?? '—'}</span>,
            sortable: true,
            searchAccessor: (r) => r.order?.product?.name ?? '',
        },
        {
            key: 'key',
            header: t('licenses.columns.key'),
            cell: (r) => (
                <span className="font-mono text-xs text-ink-secondary">
                    {maskLicenseKey(r.license_key)}
                </span>
            ),
        },
        {
            key: 'issuedAt',
            header: t('licenses.columns.issuedAt'),
            cell: (r) => (
                <span className="text-xs text-ink-muted tabular-nums">
                    {formatDate(r.issued_at, localeTag)}
                </span>
            ),
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.issued_at,
        },
        {
            key: 'expiresAt',
            header: t('licenses.columns.expiresAt'),
            cell: (r) => (
                <span className="text-xs text-ink-muted tabular-nums">
                    {formatDate(r.expires_at, localeTag)}
                </span>
            ),
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.expires_at ?? '',
        },
        {
            key: 'status',
            header: t('licenses.columns.status'),
            cell: (r) => <StatusBadge status={r.status} />,
            searchAccessor: (r) => r.status,
        },
        {
            key: 'actions',
            header: '',
            cell: (r) => (
                <div className="flex justify-end">
                    <Button size="sm" variant="secondary" onClick={() => setRevealRow(r)}>
                        {t('common.reveal')}
                    </Button>
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
                emptyState={
                    <EmptyState
                        title={t('licenses.empty.title')}
                        description={t('licenses.empty.description')}
                    />
                }
            />

            {/* Reveal key dialog */}
            <Dialog
                open={!!revealRow}
                onClose={() => setRevealRow(null)}
                title={t('licenses.revealDialog.title')}
                size="sm"
                footer={
                    <div className="flex gap-2 justify-end w-full">
                        <Button variant="secondary" onClick={() => setRevealRow(null)}>
                            {t('common.close')}
                        </Button>
                        {revealRow && (
                            <Button onClick={() => void copyKey(revealRow.license_key)}>
                                {t('common.copy')}
                            </Button>
                        )}
                    </div>
                }
            >
                {revealRow && (
                    <div className="space-y-3">
                        <p className="text-sm text-ink-muted">{t('licenses.revealDialog.description')}</p>
                        <div className="rounded-md border border-line bg-surface-muted p-4">
                            <p className="font-mono text-sm break-all text-ink select-all">
                                {revealRow.license_key}
                            </p>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}

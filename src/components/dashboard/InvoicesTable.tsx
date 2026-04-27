/**
 * InvoicesTable — /dashboard/invoices.
 *
 * Read-only invoice list. Row click → /dashboard/invoices/view?id=.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardShell from './DashboardShell';
import StatusBadge from '../admin/StatusBadge';
import DataTable, { type DataTableColumn } from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import { formatDate, formatMoney } from '../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: string;
    issued_at: string | null;
    due_at: string | null;
}

const STATUS_OPTIONS = ['all', 'draft', 'sent', 'paid', 'overdue'];

export default function InvoicesTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('dashboard');
    return (
        <DashboardShell
            locale={locale}
            activeKey="invoices"
            title={t('invoices.title')}
            subtitle={t('invoices.subtitle')}
        >
            <InvoicesInner locale={locale} />
        </DashboardShell>
    );
}

function InvoicesInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('dashboard');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('invoices')
            .select('id, invoice_number, amount, currency, status, issued_at, due_at')
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
            cell: (r) => (
                <span className="text-xs text-ink-muted tabular-nums">
                    {formatDate(r.issued_at, localeTag)}
                </span>
            ),
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.issued_at ?? '',
        },
        {
            key: 'dueAt',
            header: t('invoices.columns.dueAt'),
            cell: (r) => (
                <span className="text-xs text-ink-muted tabular-nums">
                    {formatDate(r.due_at, localeTag)}
                </span>
            ),
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.due_at ?? '',
        },
    ];

    return (
        <DataTable<Row>
            data={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id}
            onRowClick={(r) => window.location.assign(`/dashboard/invoices/view?id=${r.id}`)}
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
                    title={t('invoices.empty.title')}
                    description={t('invoices.empty.description')}
                />
            }
        />
    );
}

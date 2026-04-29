/**
 * OrdersTable — /dashboard/orders.
 *
 * Read-only order list. RLS scopes to the caller's org automatically.
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
    status: string;
    quantity: number;
    total: number;
    currency: string;
    created_at: string;
    product: { name: string } | null;
}

const STATUS_OPTIONS = ['all', 'pending', 'active', 'cancelled', 'expired'];

export default function OrdersTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('dashboard');
    return (
        <DashboardShell
            locale={locale}
            activeKey="orders"
            title={t('orders.title')}
            subtitle={t('orders.subtitle')}
        >
            <OrdersInner locale={locale} />
        </DashboardShell>
    );
}

function OrdersInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('dashboard');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('orders')
            .select('id, status, quantity, total, currency, created_at, product:products(name)')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
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
            key: 'product',
            header: t('orders.columns.product'),
            cell: (r) => <span className="font-medium text-ink">{r.product?.name ?? '—'}</span>,
            sortable: true,
            searchAccessor: (r) => r.product?.name ?? '',
        },
        {
            key: 'quantity',
            header: t('orders.columns.quantity'),
            cell: (r) => <span className="tabular-nums">{r.quantity}</span>,
            align: 'right',
        },
        {
            key: 'total',
            header: t('orders.columns.total'),
            cell: (r) => <span className="tabular-nums">{formatMoney(r.total, r.currency, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => Number(r.total),
        },
        {
            key: 'status',
            header: t('orders.columns.status'),
            cell: (r) => <StatusBadge status={r.status} />,
            searchAccessor: (r) => r.status,
        },
        {
            key: 'createdAt',
            header: t('orders.columns.createdAt'),
            cell: (r) => (
                <span className="text-xs text-ink-muted tabular-nums">
                    {formatDate(r.created_at, localeTag)}
                </span>
            ),
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.created_at,
        },
    ];

    return (
        <DataTable<Row>
            data={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id}
            onRowClick={(r) => window.location.assign(`/dashboard/orders/view?id=${r.id}`)}
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
                    title={t('orders.empty.title')}
                    description={t('orders.empty.description')}
                />
            }
        />
    );
}

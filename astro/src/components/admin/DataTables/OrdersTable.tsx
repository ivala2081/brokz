/**
 * OrdersTable — Orders page.
 *
 * Row actions:
 *   - Activate (status → active) via admin-generate-license Edge Function
 *     per spec: activating an order triggers license generation. We call
 *     admin-generate-license which is expected to flip status + generate
 *     the license atomically. (Confirm with api-layer agent.)
 *   - Cancel via direct update (RLS admin full).
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from '../AdminShell';
import StatusBadge from '../StatusBadge';
import DataTable, { type DataTableColumn } from '../../ui/DataTable';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { resolveAdminLocale } from '../../../lib/admin/locale';
import NewOrderDialog from '../NewOrderDialog';
import { useAuth } from '../../auth/AuthContext';
import { callEdgeFunction } from '../../../lib/admin/edgeFunction';
import { toast } from '../../ui/Toast';
import { formatDate, formatMoney } from '../../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    status: string;
    quantity: number;
    total: number;
    currency: string;
    created_at: string;
    organization: { id: string; name: string } | null;
    product: { id: string; name: string } | null;
}

const STATUS_OPTIONS = ['all', 'pending', 'active', 'cancelled', 'expired'];

export default function OrdersTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="orders"
            title={t('orders.title')}
            subtitle={t('orders.subtitle')}
        >
            <OrdersInner locale={locale} />
        </AdminShell>
    );
}

function OrdersInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>('all');
    const [dialogOpen, setDialogOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('orders')
            .select('id, status, quantity, total, currency, created_at, organization:organizations(id, name), product:products(id, name)')
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

    async function activate(r: Row) {
        const ok = window.confirm(t('orders.actions.activateConfirm'));
        if (!ok) return;
        const { error } = await callEdgeFunction(supabase, 'admin-generate-license', {
            order_id: r.id,
        });
        if (error) {
            toast.error(t('orders.actions.activateError'));
            return;
        }
        toast.success(t('orders.actions.activateSuccess'));
        void load();
    }

    async function cancel(r: Row) {
        const ok = window.confirm(t('orders.actions.cancelConfirm'));
        if (!ok) return;
        const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', r.id);
        if (error) {
            toast.error(t('orders.actions.cancelError'));
            return;
        }
        toast.success(t('orders.actions.cancelSuccess'));
        void load();
    }

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'organization',
            header: t('orders.columns.organization'),
            cell: (r) =>
                r.organization ? (
                    <a
                        href={`/admin/customers/view?id=${r.organization.id}`}
                        className="font-medium text-ink hover:text-brand"
                    >
                        {r.organization.name}
                    </a>
                ) : (
                    <span className="text-ink-muted">—</span>
                ),
            sortable: true,
            searchAccessor: (r) => r.organization?.name ?? '',
        },
        {
            key: 'product',
            header: t('orders.columns.product'),
            cell: (r) => <span className="text-ink-secondary">{r.product?.name ?? '—'}</span>,
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
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.created_at, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.created_at,
        },
        {
            key: 'actions',
            header: '',
            cell: (r) => (
                <div className="text-right flex justify-end gap-1.5">
                    {r.status === 'pending' && (
                        <Button size="sm" variant="secondary" onClick={() => void activate(r)}>
                            {t('orders.actions.activate')}
                        </Button>
                    )}
                    {(r.status === 'pending' || r.status === 'active') && (
                        <Button size="sm" variant="danger" onClick={() => void cancel(r)}>
                            {t('orders.actions.cancel')}
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
                toolbar={<Button onClick={() => setDialogOpen(true)}>{t('orders.new')}</Button>}
                emptyState={
                    <EmptyState
                        title={t('orders.empty.title')}
                        description={t('orders.empty.description')}
                        action={<Button onClick={() => setDialogOpen(true)}>{t('orders.empty.cta')}</Button>}
                    />
                }
            />
            <NewOrderDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={() => void load()}
            />
        </>
    );
}

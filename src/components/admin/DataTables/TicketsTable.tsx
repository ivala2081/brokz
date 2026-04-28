/**
 * TicketsTable — inbox page. Click a row to open the thread.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from '../AdminShell';
import StatusBadge from '../StatusBadge';
import DataTable, { type DataTableColumn } from '../../ui/DataTable';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { resolveAdminLocale } from '../../../lib/admin/locale';
import { useAuth } from '../../auth/AuthContext';
import { toast } from '../../ui/Toast';
import { formatDateTime } from '../../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    subject: string;
    status: string;
    priority: string;
    updated_at: string;
    organization: { id: string; name: string } | null;
    assignee: { id: string; email: string | null; full_name: string | null } | null;
}

const STATUS_OPTIONS = ['all', 'open', 'pending', 'closed'];

export default function TicketsTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="tickets"
            title={t('tickets.title')}
            subtitle={t('tickets.subtitle')}
        >
            <TicketsInner locale={locale} />
        </AdminShell>
    );
}

function TicketsInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('tickets')
            .select('id, subject, status, priority, updated_at, organization:organizations(id, name), assignee:profiles!tickets_assigned_to_fkey(id, email, full_name)')
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });
        if (status !== 'all') query = query.eq('status', status);
        const { data } = await query;
        setRows((data as unknown as Row[]) ?? []);
        setLoading(false);
    }, [supabase, status]);

    useEffect(() => {
        void load();
    }, [load]);

    async function deleteRow(r: Row) {
        if (!window.confirm(t('common.deleteConfirm'))) return;
        const { error } = await supabase
            .from('tickets')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', r.id);
        if (error) { toast.error(`${t('common.deleteError')}: ${error.message}`); return; }
        toast.success(t('common.deleteSuccess'));
        void load();
    }

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'subject',
            header: t('tickets.columns.subject'),
            cell: (r) => <span className="font-medium text-ink">{r.subject}</span>,
            sortable: true,
            searchAccessor: (r) => r.subject,
        },
        {
            key: 'organization',
            header: t('tickets.columns.organization'),
            cell: (r) => <span className="text-ink-secondary">{r.organization?.name ?? '—'}</span>,
            searchAccessor: (r) => r.organization?.name ?? '',
        },
        {
            key: 'priority',
            header: t('tickets.columns.priority'),
            cell: (r) => <StatusBadge status={r.priority} />,
            searchAccessor: (r) => r.priority,
        },
        {
            key: 'status',
            header: t('tickets.columns.status'),
            cell: (r) => <StatusBadge status={r.status} />,
            searchAccessor: (r) => r.status,
        },
        {
            key: 'assigned',
            header: t('tickets.columns.assignedTo'),
            cell: (r) => (
                <span className="text-xs text-ink-secondary">
                    {r.assignee?.full_name ?? r.assignee?.email ?? '—'}
                </span>
            ),
        },
        {
            key: 'lastMessageAt',
            header: t('tickets.columns.lastMessageAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDateTime(r.updated_at, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.updated_at,
        },
        {
            key: 'actions',
            header: '',
            cell: (r) => (
                <div className="text-right">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); void deleteRow(r); }}
                    >
                        {t('common.delete')}
                    </Button>
                </div>
            ),
            align: 'right',
        },
    ];

    return (
        <DataTable<Row>
            data={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id}
            onRowClick={(r) => window.location.assign(`/admin/tickets/view?id=${r.id}`)}
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
                    title={t('tickets.empty.title')}
                    description={t('tickets.empty.description')}
                />
            }
        />
    );
}

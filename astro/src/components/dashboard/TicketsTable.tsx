/**
 * TicketsTable — /dashboard/tickets.
 *
 * Customer's support ticket inbox. Row click → thread.
 * "New ticket" button opens NewTicketDialog.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardShell from './DashboardShell';
import NewTicketDialog from './NewTicketDialog';
import StatusBadge from '../admin/StatusBadge';
import DataTable, { type DataTableColumn } from '../ui/DataTable';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import { formatDateTime } from '../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    subject: string;
    status: string;
    priority: string;
    updated_at: string;
}

const STATUS_OPTIONS = ['all', 'open', 'pending', 'closed'];

export default function TicketsTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('dashboard');
    return (
        <DashboardShell
            locale={locale}
            activeKey="tickets"
            title={t('tickets.title')}
            subtitle={t('tickets.subtitle')}
        >
            <TicketsInner locale={locale} />
        </DashboardShell>
    );
}

function TicketsInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('dashboard');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [newOpen, setNewOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('tickets')
            .select('id, subject, status, priority, updated_at')
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
            key: 'lastMessageAt',
            header: t('tickets.columns.lastMessageAt'),
            cell: (r) => (
                <span className="text-xs text-ink-muted tabular-nums">
                    {formatDateTime(r.updated_at, localeTag)}
                </span>
            ),
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.updated_at,
        },
    ];

    return (
        <>
            <DataTable<Row>
                data={rows}
                columns={columns}
                loading={loading}
                getRowId={(r) => r.id}
                onRowClick={(r) => window.location.assign(`/dashboard/tickets/view?id=${r.id}`)}
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
                toolbar={
                    <Button onClick={() => setNewOpen(true)}>{t('tickets.new')}</Button>
                }
                emptyState={
                    <EmptyState
                        title={t('tickets.empty.title')}
                        description={t('tickets.empty.description')}
                        action={<Button onClick={() => setNewOpen(true)}>{t('tickets.new')}</Button>}
                    />
                }
            />

            <NewTicketDialog
                open={newOpen}
                onClose={() => setNewOpen(false)}
                onSuccess={() => {
                    setNewOpen(false);
                    void load();
                }}
            />
        </>
    );
}

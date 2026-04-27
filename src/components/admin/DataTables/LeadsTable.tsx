/**
 * LeadsTable — Leads page with qualify/reject/convert actions.
 *
 * Convert opens the InviteCustomerDialog prefilled with lead email + company.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from '../AdminShell';
import StatusBadge from '../StatusBadge';
import DataTable, { type DataTableColumn } from '../../ui/DataTable';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { resolveAdminLocale } from '../../../lib/admin/locale';
import InviteCustomerDialog from '../InviteCustomerDialog';
import { useAuth } from '../../auth/AuthContext';
import { toast } from '../../ui/Toast';
import { formatDate, truncate } from '../../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    name: string;
    email: string;
    company: string | null;
    message: string | null;
    source: string | null;
    status: string;
    created_at: string;
}

const STATUS_OPTIONS = ['all', 'new', 'qualified', 'rejected'];

export default function LeadsTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="leads"
            title={t('leads.title')}
            subtitle={t('leads.subtitle')}
        >
            <LeadsInner locale={locale} />
        </AdminShell>
    );
}

function LeadsInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [converting, setConverting] = useState<Row | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('leads')
            .select('id, name, email, company, message, source, status, created_at')
            .order('created_at', { ascending: false });
        if (status !== 'all') query = query.eq('status', status);
        const { data } = await query;
        setRows((data as Row[]) ?? []);
        setLoading(false);
    }, [supabase, status]);

    useEffect(() => {
        void load();
    }, [load]);

    async function qualify(r: Row) {
        const { error } = await supabase.from('leads').update({ status: 'qualified' }).eq('id', r.id);
        if (error) {
            toast.error(t('leads.mutations.error'));
            return;
        }
        toast.success(t('leads.mutations.qualifySuccess'));
        void load();
    }

    async function reject(r: Row) {
        const { error } = await supabase.from('leads').update({ status: 'rejected' }).eq('id', r.id);
        if (error) {
            toast.error(t('leads.mutations.error'));
            return;
        }
        toast.success(t('leads.mutations.rejectSuccess'));
        void load();
    }

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'company',
            header: t('leads.columns.company'),
            cell: (r) => <span className="font-medium text-ink">{r.company ?? '—'}</span>,
            sortable: true,
            searchAccessor: (r) => r.company ?? '',
        },
        {
            key: 'name',
            header: t('leads.columns.name'),
            cell: (r) => <span className="text-ink-secondary">{r.name}</span>,
            searchAccessor: (r) => r.name,
        },
        {
            key: 'email',
            header: t('leads.columns.email'),
            cell: (r) => <span className="text-ink-secondary">{r.email}</span>,
            searchAccessor: (r) => r.email,
        },
        {
            key: 'source',
            header: t('leads.columns.source'),
            cell: (r) => <span className="text-ink-muted text-xs">{r.source ?? '—'}</span>,
            searchAccessor: (r) => r.source ?? '',
        },
        {
            key: 'message',
            header: t('leads.columns.message'),
            cell: (r) => (
                <span className="text-xs text-ink-secondary" title={r.message ?? ''}>
                    {truncate(r.message, 60)}
                </span>
            ),
            searchAccessor: (r) => r.message ?? '',
        },
        {
            key: 'status',
            header: t('leads.columns.status'),
            cell: (r) => <StatusBadge status={r.status} />,
            searchAccessor: (r) => r.status,
        },
        {
            key: 'createdAt',
            header: t('leads.columns.createdAt'),
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
                    {r.status !== 'qualified' && (
                        <Button size="sm" variant="secondary" onClick={() => void qualify(r)}>
                            {t('leads.actions.qualify')}
                        </Button>
                    )}
                    {r.status !== 'rejected' && (
                        <Button size="sm" variant="ghost" onClick={() => void reject(r)}>
                            {t('leads.actions.reject')}
                        </Button>
                    )}
                    <Button size="sm" onClick={() => setConverting(r)}>
                        {t('leads.actions.convert')}
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
                        title={t('leads.empty.title')}
                        description={t('leads.empty.description')}
                    />
                }
            />

            <InviteCustomerDialog
                open={!!converting}
                onClose={() => setConverting(null)}
                prefillEmail={converting?.email}
                prefillOrgName={converting?.company ?? undefined}
                onSuccess={() => {
                    // Mark the lead as qualified after successful invite.
                    if (converting) {
                        void supabase
                            .from('leads')
                            .update({ status: 'qualified' })
                            .eq('id', converting.id)
                            .then(() => void load());
                    } else {
                        void load();
                    }
                }}
            />
        </>
    );
}

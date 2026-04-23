/**
 * CustomersTable — full Customers page React island.
 *
 * Fetches organizations + licenses count + open-ticket count, renders
 * the generic DataTable, and hosts the Invite Customer dialog.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from '../AdminShell';
import StatusBadge from '../StatusBadge';
import InviteCustomerDialog from '../InviteCustomerDialog';
import DataTable, { type DataTableColumn } from '../../ui/DataTable';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { resolveAdminLocale } from '../../../lib/admin/locale';
import { countryLabel } from '../../../lib/countries';
import { useAuth } from '../../auth/AuthContext';
import { formatDate } from '../../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    name: string;
    country: string | null;
    contact_email: string | null;
    status: string;
    created_at: string;
    license_count: number;
    open_ticket_count: number;
}

export default function CustomersTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    return (
        <AdminShell
            locale={locale}
            activeKey="customers"
            title={useTitle(locale)}
            subtitle={useSubtitle(locale)}
        >
            <CustomersInner locale={locale} />
        </AdminShell>
    );
}

function useTitle(_locale: Locale) {
    const { t } = useTranslation('admin');
    return t('customers.title');
}
function useSubtitle(_locale: Locale) {
    const { t } = useTranslation('admin');
    return t('customers.subtitle');
}

function CustomersInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from('organizations')
            .select('id, name, country, contact_email, status, created_at')
            .order('created_at', { ascending: false });

        const orgIds = (data ?? []).map((o: { id: string }) => o.id);
        let licenseCounts: Record<string, number> = {};
        let ticketCounts: Record<string, number> = {};
        if (orgIds.length > 0) {
            // Per-org license count via a head-only query per id would be N+1. Pull rows and aggregate.
            const [{ data: licRows }, { data: tickRows }] = await Promise.all([
                supabase
                    .from('licenses')
                    .select('order_id, order:orders(organization_id)')
                    .is('deleted_at', null)
                    .eq('status', 'active'),
                supabase
                    .from('tickets')
                    .select('organization_id')
                    .neq('status', 'closed')
                    .is('deleted_at', null),
            ]);
            licenseCounts = (licRows ?? []).reduce<Record<string, number>>((acc, r) => {
                const orgId = ((r as unknown) as { order: { organization_id: string } | null }).order?.organization_id;
                if (orgId) acc[orgId] = (acc[orgId] ?? 0) + 1;
                return acc;
            }, {});
            ticketCounts = (tickRows ?? []).reduce<Record<string, number>>((acc, r) => {
                const orgId = (r as { organization_id: string }).organization_id;
                if (orgId) acc[orgId] = (acc[orgId] ?? 0) + 1;
                return acc;
            }, {});
        }

        setRows(
            (data ?? []).map((r) => ({
                ...(r as Omit<Row, 'license_count' | 'open_ticket_count'>),
                license_count: licenseCounts[(r as { id: string }).id] ?? 0,
                open_ticket_count: ticketCounts[(r as { id: string }).id] ?? 0,
            })),
        );
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        void load();
    }, [load]);

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'name',
            header: t('customers.columns.name'),
            cell: (r) => (
                <a
                    href={`/admin/customers/view?id=${r.id}`}
                    className="font-medium text-ink hover:text-brand"
                >
                    {r.name}
                </a>
            ),
            sortable: true,
            searchAccessor: (r) => r.name,
        },
        {
            key: 'country',
            header: t('customers.columns.country'),
            cell: (r) => <span className="text-ink-secondary">{countryLabel(r.country, locale)}</span>,
            sortable: true,
            searchAccessor: (r) => countryLabel(r.country, locale),
        },
        {
            key: 'email',
            header: t('customers.columns.email'),
            cell: (r) => <span className="text-ink-secondary">{r.contact_email ?? '—'}</span>,
            searchAccessor: (r) => r.contact_email ?? '',
        },
        {
            key: 'status',
            header: t('customers.columns.status'),
            cell: (r) => <StatusBadge status={r.status} />,
            searchAccessor: (r) => r.status,
        },
        {
            key: 'licenses',
            header: t('customers.columns.licenses'),
            cell: (r) => <span className="tabular-nums">{r.license_count}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.license_count,
        },
        {
            key: 'tickets',
            header: t('customers.columns.tickets'),
            cell: (r) => <span className="tabular-nums">{r.open_ticket_count}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.open_ticket_count,
        },
        {
            key: 'createdAt',
            header: t('customers.columns.createdAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.created_at, localeTag)}</span>,
            sortable: true,
            searchAccessor: (r) => r.created_at,
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
                onRowClick={(r) => window.location.assign(`/admin/customers/view?id=${r.id}`)}
                searchPlaceholder={t('common.search')}
                labels={{
                    search: t('common.search'),
                    previous: t('common.previous'),
                    next: t('common.next'),
                    rowCount: (n) => `${n}`,
                    pageOf: (c, tot) => `${c} / ${tot}`,
                    noResults: t('common.none'),
                }}
                toolbar={
                    <Button onClick={() => setInviteOpen(true)}>
                        {t('customers.invite')}
                    </Button>
                }
                emptyState={
                    <EmptyState
                        title={t('customers.empty.title')}
                        description={t('customers.empty.description')}
                        action={
                            <Button onClick={() => setInviteOpen(true)}>
                                {t('customers.empty.cta')}
                            </Button>
                        }
                    />
                }
            />

            <InviteCustomerDialog
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
                onSuccess={() => void load()}
            />
        </>
    );
}

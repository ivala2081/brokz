/**
 * LicensesTable — Licenses page with reveal-key, extend, revoke.
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from '../AdminShell';
import StatusBadge from '../StatusBadge';
import DataTable, { type DataTableColumn } from '../../ui/DataTable';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { resolveAdminLocale } from '../../../lib/admin/locale';
import ExtendLicenseDialog from '../ExtendLicenseDialog';
import { useAuth } from '../../auth/AuthContext';
import { toast } from '../../ui/Toast';
import { formatDate, maskLicenseKey } from '../../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    license_key: string;
    status: string;
    issued_at: string;
    expires_at: string | null;
    order: {
        id: string;
        product: { name: string } | null;
        organization: { id: string; name: string } | null;
    } | null;
}

const STATUS_OPTIONS = ['all', 'active', 'expired', 'revoked'];

export default function LicensesTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="licenses"
            title={t('licenses.title')}
            subtitle={t('licenses.subtitle')}
        >
            <LicensesInner locale={locale} />
        </AdminShell>
    );
}

function LicensesInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>('all');
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [extending, setExtending] = useState<Row | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('licenses')
            .select('id, license_key, status, issued_at, expires_at, order:orders(id, product:products(name), organization:organizations(id, name))')
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

    async function revoke(r: Row) {
        const ok = window.confirm(t('licenses.revoke.confirm'));
        if (!ok) return;
        const { error } = await supabase.from('licenses').update({ status: 'revoked' }).eq('id', r.id);
        if (error) {
            toast.error(t('licenses.revoke.error'));
            return;
        }
        toast.success(t('licenses.revoke.success'));
        void load();
    }

    async function copyKey(key: string) {
        try {
            await navigator.clipboard.writeText(key);
            toast.success(t('common.copied'));
        } catch {
            /* noop */
        }
    }

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'organization',
            header: t('licenses.columns.organization'),
            cell: (r) =>
                r.order?.organization ? (
                    <a
                        href={`/admin/customers/view?id=${r.order.organization.id}`}
                        className="font-medium text-ink hover:text-brand"
                    >
                        {r.order.organization.name}
                    </a>
                ) : (
                    <span className="text-ink-muted">—</span>
                ),
            sortable: true,
            searchAccessor: (r) => r.order?.organization?.name ?? '',
        },
        {
            key: 'product',
            header: t('licenses.columns.product'),
            cell: (r) => <span className="text-ink-secondary">{r.order?.product?.name ?? '—'}</span>,
            searchAccessor: (r) => r.order?.product?.name ?? '',
        },
        {
            key: 'key',
            header: t('licenses.columns.key'),
            cell: (r) => (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                        {revealed[r.id] ? r.license_key : maskLicenseKey(r.license_key)}
                    </span>
                    <button
                        type="button"
                        onClick={() => setRevealed((m) => ({ ...m, [r.id]: !m[r.id] }))}
                        className="text-2xs text-ink-muted hover:text-ink"
                    >
                        {revealed[r.id] ? t('common.hide') : t('common.reveal')}
                    </button>
                    {revealed[r.id] && (
                        <button
                            type="button"
                            onClick={() => void copyKey(r.license_key)}
                            className="text-2xs text-ink-muted hover:text-ink"
                        >
                            {t('common.copy')}
                        </button>
                    )}
                </div>
            ),
            searchAccessor: (r) => r.license_key,
        },
        {
            key: 'issuedAt',
            header: t('licenses.columns.issuedAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.issued_at, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.issued_at,
        },
        {
            key: 'expiresAt',
            header: t('licenses.columns.expiresAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.expires_at, localeTag)}</span>,
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
                <div className="text-right flex justify-end gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => setExtending(r)}>
                        {t('licenses.extendDialog.submit')}
                    </Button>
                    {r.status === 'active' && (
                        <Button size="sm" variant="danger" onClick={() => void revoke(r)}>
                            {t('licenses.revoke.action')}
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
                emptyState={
                    <EmptyState
                        title={t('licenses.empty.title')}
                        description={t('licenses.empty.description')}
                    />
                }
            />
            <ExtendLicenseDialog
                open={!!extending}
                onClose={() => setExtending(null)}
                licenseId={extending?.id ?? null}
                currentExpiresAt={extending?.expires_at ?? null}
                onSuccess={() => void load()}
            />
        </>
    );
}

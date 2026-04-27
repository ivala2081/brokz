/**
 * ProductsTable — Products page. Direct Supabase CRUD (admin via RLS).
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from '../AdminShell';
import DataTable, { type DataTableColumn } from '../../ui/DataTable';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import EmptyState from '../../ui/EmptyState';
import { resolveAdminLocale } from '../../../lib/admin/locale';
import { hasProductsBilling } from '../../../lib/admin/schemaProbe';
import ProductDialog, { type ProductRow } from '../ProductDialog';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, formatMoney } from '../../../lib/admin/format';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string | null;
    base_price: number;
    currency: string;
    is_active: boolean;
    billing_type: 'onetime' | 'monthly' | 'annual_upfront' | 'annual_installments';
    setup_fee: number;
    updated_at: string;
}

export default function ProductsTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="products"
            title={t('products.title')}
            subtitle={t('products.subtitle')}
        >
            <ProductsInner locale={locale} />
        </AdminShell>
    );
}

function ProductsInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ProductRow | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        // Probe once — skip billing columns if the migration hasn't landed.
        const hasBilling = await hasProductsBilling(supabase);
        const columns = hasBilling
            ? 'id, slug, name, description, category, base_price, currency, is_active, billing_type, setup_fee, updated_at'
            : 'id, slug, name, description, category, base_price, currency, is_active, updated_at';
        const { data } = await supabase.from('products').select(columns).order('name', { ascending: true });
        const raw = (data as Array<Partial<Row>>) ?? [];
        setRows(raw.map((r) => ({
            ...(r as Row),
            billing_type: r.billing_type ?? 'onetime',
            setup_fee: r.setup_fee ?? 0,
        })));
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        void load();
    }, [load]);

    function openNew() {
        setEditing(null);
        setDialogOpen(true);
    }
    function openEdit(r: Row) {
        setEditing({
            id: r.id,
            slug: r.slug,
            name: r.name,
            description: r.description,
            category: r.category,
            base_price: Number(r.base_price),
            currency: r.currency,
            is_active: r.is_active,
            billing_type: r.billing_type ?? 'onetime',
            setup_fee: Number(r.setup_fee ?? 0),
        });
        setDialogOpen(true);
    }

    const localeTag = locale === 'tr' ? 'tr-TR' : 'en-US';

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'name',
            header: t('products.columns.name'),
            cell: (r) => (
                <div>
                    <div className="font-medium text-ink">{r.name}</div>
                    <div className="text-2xs text-ink-muted font-mono">{r.slug}</div>
                </div>
            ),
            sortable: true,
            searchAccessor: (r) => r.name,
        },
        {
            key: 'category',
            header: t('products.columns.category'),
            cell: (r) => <span className="text-ink-secondary">{r.category ?? '—'}</span>,
            sortable: true,
            searchAccessor: (r) => r.category ?? '',
        },
        {
            key: 'basePrice',
            header: t('products.columns.basePrice'),
            cell: (r) => <span className="tabular-nums">{formatMoney(r.base_price, r.currency, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => Number(r.base_price),
        },
        {
            key: 'active',
            header: t('products.columns.active'),
            cell: (r) =>
                r.is_active ? (
                    <Badge variant="brand">{t('common.yes')}</Badge>
                ) : (
                    <Badge variant="neutral">{t('common.no')}</Badge>
                ),
            searchAccessor: (r) => (r.is_active ? '1' : '0'),
        },
        {
            key: 'updatedAt',
            header: t('products.columns.updatedAt'),
            cell: (r) => <span className="text-xs text-ink-muted tabular-nums">{formatDate(r.updated_at, localeTag)}</span>,
            align: 'right',
            sortable: true,
            searchAccessor: (r) => r.updated_at,
        },
        {
            key: 'actions',
            header: '',
            cell: (r) => (
                <div className="text-right">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>
                        {t('common.edit')}
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
                toolbar={<Button onClick={openNew}>{t('products.new')}</Button>}
                emptyState={
                    <EmptyState
                        title={t('products.empty.title')}
                        description={t('products.empty.description')}
                        action={<Button onClick={openNew}>{t('products.empty.cta')}</Button>}
                    />
                }
            />
            <ProductDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                initial={editing}
                onSuccess={() => void load()}
            />
        </>
    );
}

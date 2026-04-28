/**
 * WalletsTable — /admin/wallets.
 *
 * Admin CRUD for `payment_wallets`. Customer-facing invoice pages read
 * these to show "pay to this address" boxes.
 *
 * Safety: deactivate is preferred over delete (we keep historical record
 * of which address was active when a given submission was received).
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminShell from './AdminShell';
import { resolveAdminLocale } from '../../lib/admin/locale';
import { useAuth } from '../auth/AuthContext';
import DataTable, { type DataTableColumn } from '../ui/DataTable';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Field from '../ui/Field';
import EmptyState from '../ui/EmptyState';
import { toast } from '../ui/Toast';
import { NETWORK_CODES, NETWORKS, maskAddress, type NetworkCode } from '../../lib/payments';

type Locale = 'en' | 'tr';

interface Row {
    id: string;
    network: string;
    address: string;
    label: string | null;
    memo: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

export default function WalletsTable({ locale: localeProp = 'tr' }: { locale?: Locale }) {
    const locale = resolveAdminLocale(localeProp);
    const { t } = useTranslation('admin');
    return (
        <AdminShell
            locale={locale}
            activeKey="billing"
            title={t('wallets.title')}
            subtitle={t('wallets.subtitle')}
        >
            <WalletsInner locale={locale} />
        </AdminShell>
    );
}

export function WalletsInner({ locale }: { locale: Locale }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Row | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from('payment_wallets')
            .select('id, network, address, label, memo, is_active, display_order, created_at')
            .order('display_order', { ascending: true });
        setRows((data as Row[] | null) ?? []);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { void load(); }, [load]);

    async function toggleActive(row: Row) {
        const { error } = await supabase
            .from('payment_wallets')
            .update({ is_active: !row.is_active })
            .eq('id', row.id);
        if (error) { toast.error(t('wallets.error.update')); return; }
        toast.success(t('wallets.success.updated'));
        void load();
    }

    async function deleteRow(row: Row) {
        if (!window.confirm(t('wallets.deleteConfirm'))) return;
        const { error } = await supabase.from('payment_wallets').delete().eq('id', row.id);
        if (error) { toast.error(t('wallets.error.delete')); return; }
        toast.success(t('wallets.success.deleted'));
        void load();
    }

    const columns: DataTableColumn<Row>[] = [
        {
            key: 'network',
            header: t('wallets.columns.network'),
            cell: (r) => {
                const info = NETWORKS[r.network as NetworkCode];
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-ink">{info?.label ?? r.network}</span>
                        <span className="text-2xs text-ink-muted">{info?.chainLabel ?? ''}</span>
                    </div>
                );
            },
            sortable: true,
            searchAccessor: (r) => r.network,
        },
        {
            key: 'address',
            header: t('wallets.columns.address'),
            cell: (r) => (
                <span className="font-mono text-xs text-ink" title={r.address}>
                    {maskAddress(r.address)}
                </span>
            ),
            searchAccessor: (r) => r.address,
        },
        {
            key: 'label',
            header: t('wallets.columns.label'),
            cell: (r) => <span className="text-sm text-ink-secondary">{r.label ?? '—'}</span>,
            searchAccessor: (r) => r.label ?? '',
        },
        {
            key: 'status',
            header: t('wallets.columns.status'),
            cell: (r) => (
                <span className={
                    'inline-flex rounded-full px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider ' +
                    (r.is_active
                        ? 'bg-brand-subtle text-green-700 border border-green-200'
                        : 'bg-surface-muted text-ink-muted border border-line')
                }>
                    {r.is_active ? t('wallets.status.active') : t('wallets.status.inactive')}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            cell: (r) => (
                <div className="text-right flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setDialogOpen(true); }}>
                        {t('common.edit')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void toggleActive(r)}>
                        {r.is_active ? t('wallets.action.deactivate') : t('wallets.action.activate')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void deleteRow(r)}>
                        {t('common.delete')}
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
                toolbar={
                    <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                        {t('wallets.newCta')}
                    </Button>
                }
                emptyState={
                    <EmptyState
                        title={t('wallets.empty.title')}
                        description={t('wallets.empty.description')}
                        action={
                            <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                                {t('wallets.newCta')}
                            </Button>
                        }
                    />
                }
            />

            <WalletDialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false); setEditing(null); }}
                onSuccess={() => { void load(); }}
                editing={editing}
            />
        </>
    );
}

function WalletDialog({
    open, onClose, onSuccess, editing,
}: { open: boolean; onClose: () => void; onSuccess: () => void; editing: Row | null }) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();
    const [network, setNetwork] = useState<NetworkCode>('USDT-TRC20');
    const [address, setAddress] = useState('');
    const [label, setLabel] = useState('');
    const [memo, setMemo] = useState('');
    const [displayOrder, setDisplayOrder] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editing) {
            setNetwork(editing.network as NetworkCode);
            setAddress(editing.address);
            setLabel(editing.label ?? '');
            setMemo(editing.memo ?? '');
            setDisplayOrder(editing.display_order);
        } else {
            setNetwork('USDT-TRC20');
            setAddress('');
            setLabel('');
            setMemo('');
            setDisplayOrder(0);
        }
    }, [editing, open]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const info = NETWORKS[network];
        if (!info.addressPattern.test(address.trim())) {
            toast.error(t('wallets.error.addressShape'));
            return;
        }
        setSubmitting(true);
        const payload = {
            network,
            address: address.trim(),
            label: label.trim() || null,
            memo: memo.trim() || null,
            display_order: displayOrder,
        };
        const { error } = editing
            ? await supabase.from('payment_wallets').update(payload).eq('id', editing.id)
            : await supabase.from('payment_wallets').insert(payload);
        setSubmitting(false);
        if (error) {
            toast.error(error.message || t('wallets.error.generic'));
            return;
        }
        toast.success(editing ? t('wallets.success.updated') : t('wallets.success.created'));
        onSuccess();
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={editing ? t('wallets.editTitle') : t('wallets.newTitle')}
            size="md"
            footer={null}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label={t('wallets.columns.network')} required>
                    <Select value={network} onChange={(e) => setNetwork(e.target.value as NetworkCode)}>
                        {NETWORK_CODES.map((code) => (
                            <option key={code} value={code}>
                                {NETWORKS[code].label} · {NETWORKS[code].chainLabel}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label={t('wallets.columns.address')} required>
                    <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="font-mono text-xs"
                        placeholder={network.startsWith('USDT-TRC20') ? 'T...' : '0x...'}
                    />
                </Field>
                <Field label={t('wallets.columns.label')}>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} />
                </Field>
                <Field label={t('wallets.memoLabel')}>
                    <Input value={memo} onChange={(e) => setMemo(e.target.value)} />
                </Field>
                <Field label={t('wallets.displayOrderLabel')}>
                    <Input
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
                    />
                </Field>
                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" loading={submitting} disabled={submitting}>
                        {submitting ? t('common.saving') : t('common.save')}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}

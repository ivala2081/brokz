/**
 * IssueInvoiceDialog — calls `admin-issue-invoice` with { order_id, due_at }.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Field from '../ui/Field';
import { useAuth } from '../auth/AuthContext';
import { callEdgeFunction } from '../../lib/admin/edgeFunction';
import { toast } from '../ui/Toast';

export interface IssueInvoiceDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    /** Prefill an order when opening from an order row. */
    prefillOrderId?: string;
}

interface OrderOption { id: string; label: string; }

export default function IssueInvoiceDialog({
    open,
    onClose,
    onSuccess,
    prefillOrderId,
}: IssueInvoiceDialogProps) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [orderId, setOrderId] = useState('');
    const [dueAt, setDueAt] = useState('');
    const [options, setOptions] = useState<OrderOption[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setOrderId(prefillOrderId ?? '');
        // default due 30 days out
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setDueAt(d.toISOString().slice(0, 10));

        void (async () => {
            // Load active orders with their org + product for a readable label.
            const { data } = await supabase
                .from('orders')
                .select('id, total, currency, organization:organizations(name), product:products(name)')
                .eq('status', 'active')
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(200);
            if (data) {
                const opts: OrderOption[] = (data as unknown as Array<{
                    id: string;
                    total: number;
                    currency: string;
                    organization: { name: string } | null;
                    product: { name: string } | null;
                }>).map((r) => ({
                    id: r.id,
                    label: `${r.organization?.name ?? '—'} · ${r.product?.name ?? '—'} · ${r.currency} ${r.total}`,
                }));
                setOptions(opts);
            }
        })();
    }, [open, supabase, prefillOrderId]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        const body = {
            order_id: orderId,
            due_at: new Date(dueAt).toISOString(),
        };
        const { error } = await callEdgeFunction(supabase, 'admin-issue-invoice', body);
        setSubmitting(false);
        if (error) {
            toast.error(t('invoices.issueDialog.error'));
            return;
        }
        toast.success(t('invoices.issueDialog.success'));
        onSuccess?.();
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t('invoices.issueDialog.title')}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" form="issue-invoice-form" loading={submitting}>
                        {t('invoices.issueDialog.submit')}
                    </Button>
                </>
            }
        >
            <form id="issue-invoice-form" onSubmit={handleSubmit} className="space-y-4">
                <Field label={t('invoices.issueDialog.order')} required>
                    <Select value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
                        <option value="">—</option>
                        {options.map((o) => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </Select>
                </Field>
                <Field label={t('invoices.issueDialog.dueAt')} required>
                    <Input
                        type="date"
                        value={dueAt}
                        onChange={(e) => setDueAt(e.target.value)}
                        required
                    />
                </Field>
            </form>
        </Dialog>
    );
}

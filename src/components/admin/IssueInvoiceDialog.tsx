/**
 * IssueInvoiceDialog — issues a new invoice.
 *
 * Flow:
 *   1. Admin picks an order (options now include billing_type + periodic status).
 *   2. Picks invoice type: setup / subscription / onetime / addon
 *      - If setup and setup_fee>0: amount = product.setup_fee
 *      - If subscription: period fields appear, amount = order.total (period price)
 *      - If onetime/addon: admin types an amount override
 *   3. Calls `admin-issue-invoice` Edge Function with { order_id, due_at }.
 *      Then decorates the created invoice with invoice_type / period fields
 *      and (for subscription) bumps orders.next_invoice_at forward.
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Field from '../ui/Field';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';

type BillingType = 'onetime' | 'monthly' | 'annual_upfront' | 'annual_installments';
type InvoiceType = 'setup' | 'subscription' | 'onetime' | 'addon';

export interface IssueInvoiceDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    prefillOrderId?: string;
}

interface OrderRow {
    id: string;
    total: number;
    currency: string;
    billing_type: BillingType;
    period_start: string | null;
    next_invoice_at: string | null;
    organization: { name: string } | null;
    product: { name: string; setup_fee: number; billing_type: BillingType } | null;
}

function addMonths(d: Date, months: number): Date {
    const next = new Date(d);
    next.setMonth(next.getMonth() + months);
    return next;
}

function nextPeriod(startIso: string, billing: BillingType): { end: string; next: string | null } {
    const start = new Date(startIso);
    if (billing === 'annual_upfront') {
        const end = addMonths(start, 12);
        return { end: end.toISOString().slice(0, 10), next: end.toISOString().slice(0, 10) };
    }
    // monthly + annual_installments: one-month periods
    const end = addMonths(start, 1);
    return { end: end.toISOString().slice(0, 10), next: end.toISOString().slice(0, 10) };
}

export default function IssueInvoiceDialog({
    open, onClose, onSuccess, prefillOrderId,
}: IssueInvoiceDialogProps) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [orderId, setOrderId] = useState('');
    const [dueAt, setDueAt] = useState('');
    const [invoiceType, setInvoiceType] = useState<InvoiceType>('onetime');
    const [periodStart, setPeriodStart] = useState<string>('');
    const [periodEnd, setPeriodEnd] = useState<string>('');
    const [amountOverride, setAmountOverride] = useState<string>('');
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const selected = useMemo(() => orders.find((o) => o.id === orderId) ?? null, [orders, orderId]);
    const orderBillingType: BillingType = selected?.billing_type ?? selected?.product?.billing_type ?? 'onetime';
    const isRecurring = orderBillingType !== 'onetime';
    const setupFee = selected?.product?.setup_fee ?? 0;

    // When user picks an order, auto-select sensible invoice type.
    useEffect(() => {
        if (!selected) return;
        if (isRecurring) {
            // If no subscription invoice yet has been sent OR period_start is in the future,
            // and setup_fee > 0, suggest 'setup'. Otherwise 'subscription'.
            setInvoiceType('subscription');
            const ps = selected.next_invoice_at ?? selected.period_start ?? new Date().toISOString().slice(0, 10);
            setPeriodStart(ps);
            const { end } = nextPeriod(ps, orderBillingType);
            setPeriodEnd(end);
            setAmountOverride(String(selected.total));
        } else {
            setInvoiceType('onetime');
            setPeriodStart('');
            setPeriodEnd('');
            setAmountOverride(String(selected.total));
        }
    }, [selected, isRecurring, orderBillingType]);

    // Recompute period_end when period_start changes.
    useEffect(() => {
        if (invoiceType !== 'subscription' || !periodStart) return;
        const { end } = nextPeriod(periodStart, orderBillingType);
        setPeriodEnd(end);
    }, [periodStart, invoiceType, orderBillingType]);

    // When invoice type changes, adjust amount defaults.
    useEffect(() => {
        if (!selected) return;
        if (invoiceType === 'setup') {
            setAmountOverride(String(setupFee || 0));
        } else if (invoiceType === 'subscription') {
            setAmountOverride(String(selected.total));
        }
    }, [invoiceType, selected, setupFee]);

    useEffect(() => {
        if (!open) return;
        setOrderId(prefillOrderId ?? '');
        const due = new Date();
        due.setDate(due.getDate() + 14);
        setDueAt(due.toISOString().slice(0, 10));

        void (async () => {
            // Try full select with new billing columns; fall back to legacy.
            const full = await supabase
                .from('orders')
                .select(`
                    id, total, currency, billing_type, period_start, next_invoice_at,
                    organization:organizations(name),
                    product:products(name, setup_fee, billing_type)
                `)
                .in('status', ['active', 'pending'])
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(200);
            if (full.error) {
                const legacy = await supabase
                    .from('orders')
                    .select('id, total, currency, organization:organizations(name), product:products(name)')
                    .in('status', ['active', 'pending'])
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false })
                    .limit(200);
                const rows = ((legacy.data ?? []) as unknown as Array<Partial<OrderRow>>).map((r) => ({
                    ...(r as OrderRow),
                    billing_type: 'onetime' as BillingType,
                    period_start: null,
                    next_invoice_at: null,
                    product: r.product
                        ? {
                            name: (r.product as { name: string }).name,
                            setup_fee: 0,
                            billing_type: 'onetime' as BillingType,
                        }
                        : null,
                }));
                setOrders(rows);
            } else if (full.data) {
                setOrders(full.data as unknown as OrderRow[]);
            }
        })();
    }, [open, supabase, prefillOrderId]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selected) return;
        setSubmitting(true);

        // Generate invoice_number client-side. Format: BRKZ-YYYY-NNNNNN.
        // We query MAX across the current year and +1. Race risk is negligible
        // (admin-only writes, single session). Server RPC `next_invoice_number`
        // is admin-only in the DB — we use it if available, else fall back.
        const year = new Date().getUTCFullYear();
        let invoiceNumber = '';
        const rpc = await supabase.rpc('next_invoice_number', { p_year: year })
            .then((r) => r, () => ({ data: null, error: true as unknown }));
        if (!rpc.error && typeof rpc.data === 'string') {
            invoiceNumber = rpc.data;
        } else {
            const prefix = `BRKZ-${year}-`;
            const { data: lastRow } = await supabase
                .from('invoices')
                .select('invoice_number')
                .ilike('invoice_number', `${prefix}%`)
                .order('invoice_number', { ascending: false })
                .limit(1)
                .maybeSingle();
            const lastNumber = lastRow?.invoice_number?.split('-').pop() ?? '000000';
            const next = String(parseInt(lastNumber, 10) + 1).padStart(6, '0');
            invoiceNumber = `${prefix}${next}`;
        }

        const amount = Number(amountOverride);
        const finalAmount = !Number.isNaN(amount) && amount > 0 ? amount : Number(selected.total);

        const basePayload: Record<string, unknown> = {
            order_id: selected.id,
            organization_id: (selected as unknown as { organization_id?: string }).organization_id
                // organization_id isn't directly on selected; look it up via the order row
                ?? null,
            invoice_number: invoiceNumber,
            amount: finalAmount,
            currency: selected.currency,
            status: 'sent',
            issued_at: new Date().toISOString(),
            due_at: new Date(dueAt).toISOString(),
            invoice_type: invoiceType,
        };
        if (invoiceType === 'subscription') {
            basePayload.period_start = periodStart;
            basePayload.period_end = periodEnd;
        }

        // Ensure organization_id populated — query orders if missing.
        if (!basePayload.organization_id) {
            const orderLookup = await supabase
                .from('orders')
                .select('organization_id')
                .eq('id', selected.id)
                .maybeSingle();
            basePayload.organization_id = orderLookup.data?.organization_id ?? null;
        }

        let result = await supabase.from('invoices').insert(basePayload).select('id').single();

        // Retry without new columns on ANY error — pragmatic, cheap.
        if (result.error) {
            const legacy: Record<string, unknown> = {
                order_id: basePayload.order_id,
                organization_id: basePayload.organization_id,
                invoice_number: basePayload.invoice_number,
                amount: basePayload.amount,
                currency: basePayload.currency,
                status: basePayload.status,
                issued_at: basePayload.issued_at,
                due_at: basePayload.due_at,
            };
            result = await supabase.from('invoices').insert(legacy).select('id').single();
        }

        if (result.error || !result.data) {
            setSubmitting(false);
            toast.error(t('invoices.issueDialog.error'));
            // eslint-disable-next-line no-console
            console.error('[IssueInvoiceDialog] insert failed:', result.error);
            return;
        }

        // For subscription invoices, advance the order's next_invoice_at.
        if (invoiceType === 'subscription' && periodEnd) {
            await supabase
                .from('orders')
                .update({ next_invoice_at: periodEnd, period_start: periodStart })
                .eq('id', selected.id)
                .then((r) => r, () => undefined);
        }

        setSubmitting(false);
        toast.success(t('invoices.issueDialog.success'));
        onSuccess?.();
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t('invoices.issueDialog.title')}
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" form="issue-invoice-form" loading={submitting} disabled={submitting || !orderId}>
                        {t('invoices.issueDialog.submit')}
                    </Button>
                </>
            }
        >
            <form id="issue-invoice-form" onSubmit={handleSubmit} className="space-y-4">
                <Field label={t('invoices.issueDialog.order')} required>
                    <Select value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
                        <option value="">—</option>
                        {orders.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.organization?.name ?? '—'} · {o.product?.name ?? '—'} · {o.currency} {Number(o.total).toFixed(2)}
                                {o.billing_type !== 'onetime' ? ` · ${o.billing_type}` : ''}
                            </option>
                        ))}
                    </Select>
                </Field>

                {selected && (
                    <Field label={t('invoices.issueDialog.invoiceType')} required>
                        <Select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}>
                            {isRecurring && setupFee > 0 && <option value="setup">{t('invoices.issueDialog.types.setup')}</option>}
                            {isRecurring && <option value="subscription">{t('invoices.issueDialog.types.subscription')}</option>}
                            <option value="onetime">{t('invoices.issueDialog.types.onetime')}</option>
                            <option value="addon">{t('invoices.issueDialog.types.addon')}</option>
                        </Select>
                    </Field>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <Field label={t('invoices.issueDialog.amount')} required>
                        <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={amountOverride}
                            onChange={(e) => setAmountOverride(e.target.value)}
                            required
                        />
                    </Field>
                    <Field label={t('invoices.issueDialog.dueAt')} required>
                        <Input
                            type="date"
                            value={dueAt}
                            onChange={(e) => setDueAt(e.target.value)}
                            required
                        />
                    </Field>
                </div>

                {invoiceType === 'subscription' && (
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={t('invoices.issueDialog.periodStart')} required>
                            <Input
                                type="date"
                                value={periodStart}
                                onChange={(e) => setPeriodStart(e.target.value)}
                                required
                            />
                        </Field>
                        <Field label={t('invoices.issueDialog.periodEnd')} required>
                            <Input
                                type="date"
                                value={periodEnd}
                                onChange={(e) => setPeriodEnd(e.target.value)}
                                required
                            />
                        </Field>
                    </div>
                )}
            </form>
        </Dialog>
    );
}

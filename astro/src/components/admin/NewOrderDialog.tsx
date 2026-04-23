/**
 * NewOrderDialog — creates an order via `admin-create-order`.
 *
 * Body: { organization_id, product_id, quantity, unit_price, notes? }
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Field from '../ui/Field';
import { useAuth } from '../auth/AuthContext';
import { callEdgeFunction } from '../../lib/admin/edgeFunction';
import { toast } from '../ui/Toast';

export interface NewOrderDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    /** Prefill org id when opened from the customer detail page. */
    prefillOrgId?: string;
}

type ProductBillingType = 'onetime' | 'monthly' | 'annual_upfront' | 'annual_installments';
interface OrgRow { id: string; name: string; }
interface ProductRow {
    id: string;
    name: string;
    base_price: number;
    currency: string;
    billing_type: ProductBillingType;
    setup_fee: number;
}

function addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function nextInvoiceFrom(start: Date, billingType: ProductBillingType): Date | null {
    if (billingType === 'onetime') return null;
    if (billingType === 'annual_upfront') return addMonths(start, 12);
    return addMonths(start, 1); // monthly + annual_installments both bill monthly
}

export default function NewOrderDialog({
    open,
    onClose,
    onSuccess,
    prefillOrgId,
}: NewOrderDialogProps) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [orgs, setOrgs] = useState<OrgRow[]>([]);
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [orgId, setOrgId] = useState('');
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState('0');
    const [notes, setNotes] = useState('');
    const [periodStart, setPeriodStart] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [submitting, setSubmitting] = useState(false);

    const selectedProduct = products.find((p) => p.id === productId) ?? null;
    const billingType: ProductBillingType = selectedProduct?.billing_type ?? 'onetime';
    const isRecurring = billingType !== 'onetime';

    useEffect(() => {
        if (!open) return;
        setOrgId(prefillOrgId ?? '');
        setProductId('');
        setQuantity(1);
        setUnitPrice('0');
        setNotes('');

        void (async () => {
            const [{ data: orgsData }, { data: productsData }] = await Promise.all([
                supabase.from('organizations').select('id, name').order('name'),
                supabase.from('products').select('id, name, base_price, currency, billing_type, setup_fee').eq('is_active', true).order('name'),
            ]);
            if (orgsData) setOrgs(orgsData as OrgRow[]);
            if (productsData) setProducts(productsData as ProductRow[]);
        })();
    }, [open, supabase, prefillOrgId]);

    // Autofill unit price from product.
    useEffect(() => {
        if (!productId) return;
        const p = products.find((x) => x.id === productId);
        if (p) setUnitPrice(String(p.base_price));
    }, [productId, products]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        const body = {
            organization_id: orgId,
            product_id: productId,
            quantity,
            unit_price: Number(unitPrice),
            notes: notes || undefined,
        };
        const { data, error } = await callEdgeFunction<{ order_id: string }>(
            supabase, 'admin-create-order', body,
        );
        if (error || !data?.order_id) {
            setSubmitting(false);
            toast.error(t('orders.dialog.error'));
            return;
        }

        // For recurring products, decorate the order with billing fields
        // (admin-create-order Edge Function only handles the base flow).
        if (isRecurring) {
            const start = new Date(periodStart);
            const next = nextInvoiceFrom(start, billingType);
            await supabase.from('orders').update({
                billing_type: billingType,
                period_start: periodStart,
                next_invoice_at: next ? next.toISOString().slice(0, 10) : null,
            }).eq('id', data.order_id);
        } else {
            await supabase.from('orders').update({
                billing_type: 'onetime',
            }).eq('id', data.order_id);
        }

        setSubmitting(false);
        toast.success(t('orders.dialog.success'));
        onSuccess?.();
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t('orders.dialog.title')}
            description={t('orders.dialog.description')}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" form="new-order-form" loading={submitting}>
                        {t('orders.dialog.submit')}
                    </Button>
                </>
            }
        >
            <form id="new-order-form" onSubmit={handleSubmit} className="space-y-4">
                <Field label={t('orders.dialog.organization')} required>
                    <Select value={orgId} onChange={(e) => setOrgId(e.target.value)} required>
                        <option value="">—</option>
                        {orgs.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </Select>
                </Field>
                <Field label={t('orders.dialog.product')} required>
                    <Select value={productId} onChange={(e) => setProductId(e.target.value)} required>
                        <option value="">—</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label={t('orders.dialog.quantity')} required>
                        <Input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            required
                        />
                    </Field>
                    <Field label={t('orders.dialog.unitPrice')} required>
                        <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                            required
                        />
                    </Field>
                </div>
                {selectedProduct && (
                    <div className="rounded-md border border-line bg-surface-muted px-3 py-2 text-xs text-ink-secondary space-y-0.5">
                        <p>
                            <span className="text-ink-muted">{t('orders.dialog.billingTypeLabel')}: </span>
                            <strong className="text-ink">{t(`products.billingTypes.${billingType}`)}</strong>
                        </p>
                        {selectedProduct.setup_fee > 0 && (
                            <p>
                                <span className="text-ink-muted">{t('orders.dialog.setupFeeLabel')}: </span>
                                <strong className="text-ink tabular-nums">
                                    {selectedProduct.setup_fee.toFixed(2)} {selectedProduct.currency}
                                </strong>
                            </p>
                        )}
                    </div>
                )}

                {isRecurring && (
                    <Field label={t('orders.dialog.periodStart')} required hint={t('orders.dialog.periodStartHint')}>
                        <Input
                            type="date"
                            value={periodStart}
                            onChange={(e) => setPeriodStart(e.target.value)}
                            required
                        />
                    </Field>
                )}

                <Field label={t('orders.dialog.notes')}>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </Field>
            </form>
        </Dialog>
    );
}

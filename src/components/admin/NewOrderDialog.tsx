/**
 * NewOrderDialog — creates an order via `admin-create-order` Edge Function.
 *
 * POST body: {
 *   organization_id, product_id, quantity, unit_price,
 *   payment_wallet_id, plan_kind, term_months?, monthly_amount,
 *   period_start?, notes?, locale?
 * }
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
import { toast } from '../ui/Toast';
import { hasProductsBilling } from '../../lib/admin/schemaProbe';
import { callEdgeFunction } from '../../lib/admin/edgeFunction';
import { maskAddress } from '../../lib/payments';
import { formatMoney } from '../../lib/admin/format';

export interface NewOrderDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    /** Prefill org id when opened from the customer detail page. */
    prefillOrgId?: string;
}

type ProductBillingType = 'onetime' | 'monthly' | 'annual_upfront' | 'annual_installments';
type PlanKind = 'fixed_term' | 'open_ended';

interface OrgRow { id: string; name: string; }
interface ProductRow {
    id: string;
    name: string;
    base_price: number;
    currency: string;
    billing_type: ProductBillingType;
    setup_fee: number;
}
interface WalletRow {
    id: string;
    network: string;
    address: string;
    label: string | null;
    display_order: number;
}

export default function NewOrderDialog({
    open,
    onClose,
    onSuccess,
    prefillOrgId,
}: NewOrderDialogProps) {
    const { t, i18n } = useTranslation('admin');
    const { supabase } = useAuth();

    const [orgs, setOrgs] = useState<OrgRow[]>([]);
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [wallets, setWallets] = useState<WalletRow[]>([]);

    const [orgId, setOrgId] = useState('');
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState('0');
    const [notes, setNotes] = useState('');
    const [periodStart, setPeriodStart] = useState<string>(() => new Date().toISOString().slice(0, 10));

    // New subscription fields
    const [walletId, setWalletId] = useState('');
    const [planKind, setPlanKind] = useState<PlanKind>('fixed_term');
    const [termMonths, setTermMonths] = useState(12);
    const [monthlyAmount, setMonthlyAmount] = useState('0');

    const [submitting, setSubmitting] = useState(false);

    const selectedProduct = products.find((p) => p.id === productId) ?? null;
    const billingType: ProductBillingType = selectedProduct?.billing_type ?? 'onetime';
    const currency = selectedProduct?.currency ?? 'USD';
    const localeTag = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    const total = planKind === 'fixed_term'
        ? termMonths * Number(monthlyAmount)
        : null;

    useEffect(() => {
        if (!open) return;
        setOrgId(prefillOrgId ?? '');
        setProductId('');
        setQuantity(1);
        setUnitPrice('0');
        setNotes('');
        setPeriodStart(new Date().toISOString().slice(0, 10));
        setWalletId('');
        setPlanKind('fixed_term');
        setTermMonths(12);
        setMonthlyAmount('0');

        void (async () => {
            const hasBilling = await hasProductsBilling(supabase);
            const productCols = hasBilling
                ? 'id, name, base_price, currency, billing_type, setup_fee'
                : 'id, name, base_price, currency';
            const [{ data: orgsData }, { data: productsData }, { data: walletsData }] = await Promise.all([
                supabase.from('organizations').select('id, name').order('name'),
                supabase.from('products').select(productCols).eq('is_active', true).order('name'),
                supabase
                    .from('payment_wallets')
                    .select('id, network, address, label, display_order')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true })
                    .order('network', { ascending: true }),
            ]);
            if (orgsData) setOrgs(orgsData as OrgRow[]);
            const rawProducts = (productsData as Array<Partial<ProductRow>>) ?? [];
            setProducts(rawProducts.map((p) => ({
                ...(p as ProductRow),
                billing_type: p.billing_type ?? ('onetime' as ProductBillingType),
                setup_fee: p.setup_fee ?? 0,
            })));
            if (walletsData) setWallets(walletsData as WalletRow[]);
        })();
    }, [open, supabase, prefillOrgId]);

    // Autofill unit price + monthly_amount from product.
    useEffect(() => {
        if (!productId) return;
        const p = products.find((x) => x.id === productId);
        if (p) {
            setUnitPrice(String(p.base_price));
            setMonthlyAmount(String(p.base_price));
        }
    }, [productId, products]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);

        const payload: Record<string, unknown> = {
            organization_id: orgId,
            product_id: productId,
            quantity: Number(quantity),
            unit_price: Number(unitPrice),
            payment_wallet_id: walletId,
            plan_kind: planKind,
            monthly_amount: Number(monthlyAmount),
            period_start: periodStart,
            notes: notes || null,
            locale: i18n.language === 'tr' ? 'tr' : 'en',
        };
        if (planKind === 'fixed_term') {
            payload.term_months = termMonths;
        }

        const { error } = await callEdgeFunction(supabase, 'admin-create-order', payload);

        setSubmitting(false);

        if (error) {
            toast.error(error.message || t('orders.dialog.error'));
            // eslint-disable-next-line no-console
            console.error('[NewOrderDialog] edge function failed:', error);
            return;
        }

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
                {/* Organization */}
                <Field label={t('orders.dialog.organization')} required>
                    <Select value={orgId} onChange={(e) => setOrgId(e.target.value)} required>
                        <option value="">—</option>
                        {orgs.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </Select>
                </Field>

                {/* Product */}
                <Field label={t('orders.dialog.product')} required>
                    <Select value={productId} onChange={(e) => setProductId(e.target.value)} required>
                        <option value="">—</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </Select>
                </Field>

                {/* Quantity + unit price */}
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

                {/* Product billing info summary */}
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

                {/* Pinned wallet */}
                <Field label={t('orders.walletLabel')} required>
                    <Select value={walletId} onChange={(e) => setWalletId(e.target.value)} required>
                        <option value="">—</option>
                        {wallets.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.network} — {w.label ?? maskAddress(w.address)}
                            </option>
                        ))}
                    </Select>
                </Field>

                {/* Plan kind toggle */}
                <Field label={t('orders.planKind.label')}>
                    <div className="flex rounded-md border border-line overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setPlanKind('fixed_term')}
                            className={[
                                'flex-1 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand/40',
                                planKind === 'fixed_term'
                                    ? 'bg-brand text-white'
                                    : 'bg-white text-ink hover:bg-surface-muted',
                            ].join(' ')}
                        >
                            {t('orders.planKind.fixedTerm')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setPlanKind('open_ended')}
                            className={[
                                'flex-1 py-2 text-sm font-medium transition-colors border-l border-line focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand/40',
                                planKind === 'open_ended'
                                    ? 'bg-brand text-white'
                                    : 'bg-white text-ink hover:bg-surface-muted',
                            ].join(' ')}
                        >
                            {t('orders.planKind.openEnded')}
                        </button>
                    </div>
                </Field>

                {/* Term months — only for fixed_term */}
                {planKind === 'fixed_term' && (
                    <Field label={t('orders.termMonths')} required>
                        <Input
                            type="number"
                            min={1}
                            max={60}
                            value={termMonths}
                            onChange={(e) =>
                                setTermMonths(Math.min(60, Math.max(1, Number(e.target.value))))
                            }
                            required
                        />
                    </Field>
                )}

                {/* Monthly amount */}
                <Field label={t('orders.monthlyAmount')} required>
                    <Input
                        type="number"
                        step="0.01"
                        min={0.01}
                        value={monthlyAmount}
                        onChange={(e) => setMonthlyAmount(e.target.value)}
                        required
                    />
                </Field>

                {/* Period start */}
                <Field label={t('orders.periodStart')} required hint={t('orders.dialog.periodStartHint')}>
                    <Input
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        required
                    />
                </Field>

                {/* Read-only total preview */}
                <div className="rounded-md border border-line bg-surface-muted px-3 py-2 text-xs text-ink-secondary">
                    <span className="text-ink-muted">{t('orders.totalPreview')}: </span>
                    {planKind === 'fixed_term' ? (
                        <strong className="text-ink tabular-nums">
                            {termMonths} ay &times; {formatMoney(Number(monthlyAmount), currency, localeTag)}
                            {' = '}
                            {formatMoney(total ?? 0, currency, localeTag)}
                        </strong>
                    ) : (
                        <strong className="text-ink tabular-nums">
                            {formatMoney(Number(monthlyAmount), currency, localeTag)}/ay
                        </strong>
                    )}
                </div>

                {/* Notes */}
                <Field label={t('orders.dialog.notes')}>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </Field>
            </form>
        </Dialog>
    );
}

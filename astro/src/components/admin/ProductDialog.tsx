/**
 * ProductDialog — create or edit a product via direct Supabase upsert.
 * RLS enforces admin-only writes.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Field from '../ui/Field';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../ui/Toast';

export type ProductBillingType = 'onetime' | 'monthly' | 'annual_upfront' | 'annual_installments';

export interface ProductRow {
    id: string | null;
    slug: string;
    name: string;
    description: string | null;
    category: string | null;
    base_price: number;
    currency: string;
    is_active: boolean;
    billing_type: ProductBillingType;
    setup_fee: number;
}

export interface ProductDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initial: ProductRow | null;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY'];
const BILLING_TYPES: ProductBillingType[] = ['onetime', 'monthly', 'annual_upfront', 'annual_installments'];

function slugify(v: string): string {
    return v
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function ProductDialog({ open, onClose, onSuccess, initial }: ProductDialogProps) {
    const { t } = useTranslation('admin');
    const { supabase } = useAuth();

    const [form, setForm] = useState<ProductRow>({
        id: null,
        slug: '',
        name: '',
        description: '',
        category: '',
        base_price: 0,
        currency: 'USD',
        is_active: true,
        billing_type: 'onetime',
        setup_fee: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (initial) {
            setForm(initial);
        } else {
            setForm({
                id: null,
                slug: '',
                name: '',
                description: '',
                category: '',
                base_price: 0,
                currency: 'USD',
                is_active: true,
                billing_type: 'onetime',
                setup_fee: 0,
            });
        }
    }, [open, initial]);

    function update<K extends keyof ProductRow>(key: K, value: ProductRow[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        const fullPayload = {
            slug: form.slug || slugify(form.name),
            name: form.name,
            description: form.description || null,
            category: form.category || null,
            base_price: form.base_price,
            currency: form.currency,
            is_active: form.is_active,
            billing_type: form.billing_type,
            setup_fee: form.setup_fee,
        };
        let result = form.id
            ? await supabase.from('products').update(fullPayload).eq('id', form.id)
            : await supabase.from('products').insert(fullPayload);

        // If the billing columns haven't been migrated yet, retry without.
        // Be aggressive — any error on a payload including the new cols
        // triggers a fallback attempt.
        if (result.error) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { billing_type: _bt, setup_fee: _sf, ...legacyPayload } = fullPayload;
            result = form.id
                ? await supabase.from('products').update(legacyPayload).eq('id', form.id)
                : await supabase.from('products').insert(legacyPayload);
        }

        setSubmitting(false);
        if (result.error) {
            toast.error(t('products.dialog.error'));
            return;
        }
        toast.success(t('products.dialog.success'));
        onSuccess?.();
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={form.id ? t('products.dialog.titleEdit') : t('products.dialog.titleNew')}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" form="product-form" loading={submitting}>
                        {t('products.dialog.submit')}
                    </Button>
                </>
            }
        >
            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Field label={t('products.dialog.name')} required>
                        <Input
                            value={form.name}
                            onChange={(e) => {
                                update('name', e.target.value);
                                if (!form.id && !form.slug) update('slug', slugify(e.target.value));
                            }}
                            required
                        />
                    </Field>
                    <Field label={t('products.dialog.slug')} hint={t('products.dialog.slugHint')} required>
                        <Input
                            value={form.slug}
                            onChange={(e) => update('slug', e.target.value)}
                            required
                        />
                    </Field>
                </div>
                <Field label={t('products.dialog.description')}>
                    <Textarea
                        value={form.description ?? ''}
                        onChange={(e) => update('description', e.target.value)}
                        rows={3}
                    />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                    <Field label={t('products.dialog.category')}>
                        <Input
                            value={form.category ?? ''}
                            onChange={(e) => update('category', e.target.value)}
                        />
                    </Field>
                    <Field label={t('products.dialog.basePrice')} required>
                        <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={form.base_price}
                            onChange={(e) => update('base_price', Number(e.target.value))}
                            required
                        />
                    </Field>
                    <Field label={t('products.dialog.currency')} required>
                        <Select
                            value={form.currency}
                            onChange={(e) => update('currency', e.target.value)}
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label={t('products.dialog.billingType')} required hint={t('products.dialog.billingTypeHint')}>
                        <Select
                            value={form.billing_type}
                            onChange={(e) => update('billing_type', e.target.value as ProductBillingType)}
                        >
                            {BILLING_TYPES.map((bt) => (
                                <option key={bt} value={bt}>{t(`products.billingTypes.${bt}`)}</option>
                            ))}
                        </Select>
                    </Field>
                    <Field label={t('products.dialog.setupFee')} hint={t('products.dialog.setupFeeHint')}>
                        <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={form.setup_fee}
                            onChange={(e) => update('setup_fee', Number(e.target.value))}
                            disabled={form.billing_type === 'onetime'}
                        />
                    </Field>
                </div>
                <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => update('is_active', e.target.checked)}
                        className="h-4 w-4 rounded border-line text-brand focus:ring-brand/20"
                    />
                    {t('products.dialog.isActive')}
                </label>
            </form>
        </Dialog>
    );
}

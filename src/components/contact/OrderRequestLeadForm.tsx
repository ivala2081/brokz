/**
 * OrderRequestLeadForm
 *
 * Lead form for product order requests. Fetches active products from
 * the public products catalog (anon read RLS allows this) and lets the
 * visitor pick a product + quantity before submitting via LeadFormShell.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserSupabase } from '../../lib/supabase/browser';
import LeadFormShell from './LeadFormShell';
import '../../i18n';

interface Product {
    id: string;
    name: string;
    base_price: number | null;
    currency: string | null;
}

interface OrderRequestLeadFormProps {
    onBack: () => void;
}

export default function OrderRequestLeadForm({ onBack }: OrderRequestLeadFormProps) {
    const { t } = useTranslation('contact');

    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState(false);
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const supabase = createBrowserSupabase();

        supabase
            .from('products')
            .select('id, name, base_price, currency')
            .eq('is_active', true)
            .order('name')
            .then(({ data, error }) => {
                if (error || !data) {
                    setProductsError(true);
                } else {
                    setProducts(data as Product[]);
                }
                setProductsLoading(false);
            });
    }, []);

    const handleExtraValidate = useCallback((): Record<string, unknown> | null => {
        const errs: Record<string, string> = {};
        if (!productId) errs.productId = t('form.required');
        if (quantity < 1 || quantity > 10000) errs.quantity = '1–10000';
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return null;
        return { product_id: productId, quantity };
    }, [productId, quantity, t]);

    const extraFields = (
        <>
            {/* Product picker */}
            <div>
                <label className="input-label" htmlFor="or-product">
                    {t('leadForms.order.productLabel')}
                    <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                </label>
                {productsLoading ? (
                    <div className="input flex items-center gap-2 text-ink-muted text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-brand">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        {t('leadForms.order.productLoading')}
                    </div>
                ) : productsError ? (
                    <p className="mt-1 text-xs text-red-600">{t('leadForms.order.productError')}</p>
                ) : (
                    <select
                        id="or-product"
                        name="product_id"
                        value={productId}
                        onChange={e => {
                            setProductId(e.target.value);
                            setFieldErrors(prev => { const { productId: _, ...rest } = prev; return rest; });
                        }}
                        className="input"
                        aria-invalid={!!fieldErrors.productId}
                    >
                        <option value="">{t('leadForms.order.productPlaceholder')}</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                                {p.base_price != null && p.currency
                                    ? ` — ${p.currency} ${p.base_price.toLocaleString()}`
                                    : ''}
                            </option>
                        ))}
                    </select>
                )}
                {fieldErrors.productId && (
                    <p className="mt-2 text-xs text-red-600">{fieldErrors.productId}</p>
                )}
            </div>

            {/* Quantity */}
            <div>
                <label className="input-label" htmlFor="or-quantity">
                    {t('leadForms.order.quantityLabel')}
                    <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                </label>
                <input
                    id="or-quantity"
                    type="number"
                    name="quantity"
                    min={1}
                    max={10000}
                    value={quantity}
                    onChange={e => {
                        setQuantity(Number(e.target.value));
                        setFieldErrors(prev => { const { quantity: _, ...rest } = prev; return rest; });
                    }}
                    className="input"
                    aria-invalid={!!fieldErrors.quantity}
                />
                {fieldErrors.quantity && (
                    <p className="mt-2 text-xs text-red-600">{fieldErrors.quantity}</p>
                )}
            </div>
        </>
    );

    return (
        <LeadFormShell
            title={t('leadForms.order.title')}
            subtitle={t('leadForms.order.subtitle')}
            inquiryType="order_request"
            extraFields={extraFields}
            onExtraValidate={handleExtraValidate}
            onBack={onBack}
        />
    );
}

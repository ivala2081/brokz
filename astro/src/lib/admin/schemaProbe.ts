/**
 * Lightweight schema presence probe — caches "does this table/column exist?"
 * at the module level so the UI makes the failing query AT MOST once per
 * browser tab. Useful while DB migrations haven't all landed yet.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

let paymentSubmissionsCache: Promise<boolean> | null = null;
let productsBillingCache: Promise<boolean> | null = null;
let ordersBillingCache: Promise<boolean> | null = null;

async function probeTable(supabase: SupabaseClient, table: string, column: string): Promise<boolean> {
    const res = await supabase.from(table).select(column, { head: true, count: 'exact' }).limit(1);
    return !res.error;
}

export function hasPaymentSubmissions(supabase: SupabaseClient): Promise<boolean> {
    if (!paymentSubmissionsCache) {
        paymentSubmissionsCache = probeTable(supabase, 'payment_submissions', 'id');
    }
    return paymentSubmissionsCache;
}

export function hasProductsBilling(supabase: SupabaseClient): Promise<boolean> {
    if (!productsBillingCache) {
        productsBillingCache = probeTable(supabase, 'products', 'billing_type');
    }
    return productsBillingCache;
}

export function hasOrdersBilling(supabase: SupabaseClient): Promise<boolean> {
    if (!ordersBillingCache) {
        ordersBillingCache = probeTable(supabase, 'orders', 'billing_type');
    }
    return ordersBillingCache;
}

/** Reset module-level caches. Used by tests. */
export function _resetSchemaProbe(): void {
    paymentSubmissionsCache = null;
    productsBillingCache = null;
    ordersBillingCache = null;
}

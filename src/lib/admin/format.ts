/**
 * format.ts — locale-aware formatters used across admin tables.
 *
 * Keeps locale + currency formatting centralized so we swap Intl options
 * in one place when, e.g., TRY becomes the default for Turkish customers.
 */

export function formatMoney(
    amount: number | string | null | undefined,
    currency: string = 'USD',
    locale: string = 'en-US',
): string {
    if (amount === null || amount === undefined || amount === '') return '—';
    const n = typeof amount === 'string' ? Number(amount) : amount;
    if (Number.isNaN(n)) return '—';
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(n);
    } catch {
        return `${currency} ${n.toFixed(2)}`;
    }
}

export function formatDate(
    iso: string | null | undefined,
    locale: string = 'en-US',
): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        }).format(new Date(iso));
    } catch {
        return '—';
    }
}

export function formatDateTime(
    iso: string | null | undefined,
    locale: string = 'en-US',
): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return '—';
    }
}

export function maskLicenseKey(key: string | null | undefined): string {
    if (!key) return '—';
    if (key.length <= 8) return `${'•'.repeat(key.length)}`;
    return `${key.slice(0, 4)}•••••••••••••${key.slice(-4)}`;
}

export function truncate(text: string | null | undefined, max = 80): string {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

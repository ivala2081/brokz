/**
 * Admin-panel locale preference.
 *
 * Admin doesn't use URL-based locale routing like the marketing site.
 * Instead we remember the user's choice in localStorage and let every
 * admin island override the SSR-provided `locale` prop via
 * `resolveAdminLocale(prop)`.
 */

export type AdminLocale = 'tr' | 'en';

const STORAGE_KEY = 'brokz:admin:lang';

function isLocale(v: unknown): v is AdminLocale {
    return v === 'tr' || v === 'en';
}

/** Read the stored admin locale. Returns null if unset or on SSR. */
export function readStoredAdminLocale(): AdminLocale | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return isLocale(raw) ? raw : null;
    } catch {
        return null;
    }
}

/** Effective locale: localStorage → prop → 'tr' default. */
export function resolveAdminLocale(fallback: AdminLocale = 'tr'): AdminLocale {
    return readStoredAdminLocale() ?? fallback;
}

/** Persist and hard-reload so every island picks up the change. */
export function setAdminLocale(next: AdminLocale): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
        /* ignore */
    }
    window.location.reload();
}

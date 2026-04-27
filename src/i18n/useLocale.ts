import { useEffect, useState } from 'react';
import i18n from 'i18next';

import {
    type Locale,
    type RouteKey,
    alternatePath,
    localeFromPath,
    pathFor,
} from '../lib/routes';

const STORAGE_KEY = 'brokz:lang';

/** Client-side hook that returns the current pathname. Empty on SSR. */
function usePathname(): string {
    const [pathname, setPathname] = useState(
        typeof window !== 'undefined' ? window.location.pathname : '',
    );
    useEffect(() => {
        setPathname(window.location.pathname);
    }, []);
    return pathname;
}

/** Current locale — derived from URL path. */
export function useCurrentLocale(): Locale {
    const pathname = usePathname();
    return localeFromPath(pathname);
}

/**
 * Syncs i18next + localStorage with the current URL. Mount once at the top
 * of any React island tree that needs translated strings.
 */
export function useLocaleSync(): void {
    const locale = useCurrentLocale();
    useEffect(() => {
        if (i18n.language !== locale) {
            void i18n.changeLanguage(locale);
        }
        document.documentElement.setAttribute('lang', locale);
        try {
            localStorage.setItem(STORAGE_KEY, locale);
        } catch {
            /* private-mode / storage-blocked — non-fatal */
        }
    }, [locale]);
}

/** Returns a stable helper that builds the current-locale path for a route key. */
export function useLocalePath(): (key: RouteKey) => string {
    const locale = useCurrentLocale();
    return (key: RouteKey) => pathFor(key, locale);
}

/** Returns the alternate-language path for the current pathname (or null). */
export function useAlternatePath(): string | null {
    const pathname = usePathname();
    const locale = useCurrentLocale();
    return alternatePath(pathname, locale);
}

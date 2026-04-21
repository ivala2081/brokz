import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import i18n from 'i18next';

import {
  type Locale,
  type RouteKey,
  DEFAULT_LOCALE,
  alternatePath,
  localeFromPath,
  pathFor,
} from './routes';

const STORAGE_KEY = 'brokz:lang';

/** Current locale — derived from URL path. */
export function useCurrentLocale(): Locale {
  const { pathname } = useLocation();
  return localeFromPath(pathname);
}

/**
 * Keeps i18next language + localStorage in sync with the current URL.
 * Mount once near the root (in App shell, after Router).
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
      /* private-mode / storage-blocked environments — non-fatal */
    }
  }, [locale]);
}

/** Returns a stable helper that builds the current-locale path for a route key. */
export function useLocalePath(): (key: RouteKey) => string {
  const locale = useCurrentLocale();
  return (key: RouteKey) => pathFor(key, locale);
}

/**
 * Returns the alternate-language path for the current pathname (or null).
 * Used by the language switcher and hreflang tags.
 */
export function useAlternatePath(): string | null {
  const { pathname } = useLocation();
  const locale = useCurrentLocale();
  return alternatePath(pathname, locale);
}

/** First-visit browser detection: if user lands on EN and their browser is TR,
 *  redirect to the TR equivalent. Runs once per session (localStorage gate). */
export function shouldAutoRedirectToTurkish(pathname: string): string | null {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return null;
  } catch {
    /* storage blocked — skip detection rather than risk redirect loops */
    return null;
  }
  if (localeFromPath(pathname) !== DEFAULT_LOCALE) return null;
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
  if (!nav.startsWith('tr')) return null;
  return alternatePath(pathname, 'en');
}

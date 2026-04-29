/**
 * Central route map — single source of truth for every localized URL.
 *
 * Adding a new page: add an entry here, then register both `en` and `tr`
 * paths in `App.tsx`. Use `<LocalizedLink to="<key>">` throughout the app
 * instead of hard-coded paths so language switching works automatically.
 *
 * Blog post slugs are NOT in this config — they are resolved per-post from
 * the markdown frontmatter's optional `translationSlug` field.
 */

export type Locale = 'en' | 'tr';
export const LOCALES: readonly Locale[] = ['en', 'tr'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

export const ROUTES = {
  home:             { en: '/',                       tr: '/tr' },
  solutions:        { en: '/solutions',              tr: '/tr/cozumler' },
  products:         { en: '/products',               tr: '/tr/urunler' },
  productWebtrader: { en: '/products/webtrader',             tr: '/tr/urunler/webtrader' },
  productManager:   { en: '/products/whitelabel-manager',    tr: '/tr/urunler/whitelabel-manager' },
  productAlgo:      { en: '/products/algo-trading',          tr: '/tr/urunler/algo-trading' },
  productMt:        { en: '/products/mt-plugins',            tr: '/tr/urunler/mt-plugins' },
  about:            { en: '/about',                  tr: '/tr/hakkimizda' },
  contact:          { en: '/contact',                tr: '/tr/iletisim' },
  blog:             { en: '/blog',                   tr: '/tr/blog' },
  blogPost:         { en: '/blog/:slug',             tr: '/tr/blog/:slug' },
  legal:            { en: '/legal',                  tr: '/tr/yasal' },
  legalTerms:       { en: '/legal/terms',            tr: '/tr/yasal/kullanim-kosullari' },
  legalPrivacy:     { en: '/legal/privacy',          tr: '/tr/yasal/gizlilik-politikasi' },
  legalRisk:        { en: '/legal/risk-disclosure',  tr: '/tr/yasal/risk-aciklamasi' },
  legalDisclaimer:  { en: '/legal/disclaimer',       tr: '/tr/yasal/feragat-beyani' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof ROUTES;

/** Strip `/tr` prefix → determine locale from pathname. */
export function localeFromPath(pathname: string): Locale {
  return pathname === '/tr' || pathname.startsWith('/tr/') ? 'tr' : 'en';
}

/** Given a page key and locale, return the localized path (with unfilled :params). */
export function pathFor(key: RouteKey, locale: Locale): string {
  return ROUTES[key][locale];
}

/**
 * Resolve the "alternate language" URL for a given pathname — used by the
 * language switcher and hreflang tags. Returns null if no alternate exists
 * (e.g. a blog post that isn't translated yet).
 */
export function alternatePath(pathname: string, currentLocale: Locale): string | null {
  const otherLocale: Locale = currentLocale === 'en' ? 'tr' : 'en';

  // Direct match on static routes
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    const route = ROUTES[key];
    if (route[currentLocale] === pathname) {
      return route[otherLocale];
    }
  }

  // Dynamic routes (blog posts) — match pattern prefix
  // e.g. /blog/my-post → /tr/blog/my-post (caller should override with
  // the post's actual translation slug when available).
  const blogEn = ROUTES.blog.en; // /blog
  const blogTr = ROUTES.blog.tr; // /tr/blog
  if (currentLocale === 'en' && pathname.startsWith(`${blogEn}/`)) {
    const slug = pathname.slice(blogEn.length + 1);
    return `${blogTr}/${slug}`;
  }
  if (currentLocale === 'tr' && pathname.startsWith(`${blogTr}/`)) {
    const slug = pathname.slice(blogTr.length + 1);
    return `${blogEn}/${slug}`;
  }

  // Legal sub-paths are all in ROUTES, so if we got here there's no alt.
  return null;
}

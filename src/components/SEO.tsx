import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { alternatePath, localeFromPath } from '../i18n/routes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLd = Record<string, any>;

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    /** Override canonical path. Defaults to current pathname. */
    canonical?: string;
    noindex?: boolean;
    /** Page-specific structured data. Pass a single schema object or an
     *  array. Helpers live in `src/lib/jsonld.ts`. */
    jsonLd?: JsonLd | JsonLd[];
}

const BASE_URL = 'https://brokz.io';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Page-level meta tags. Reads the current URL to auto-emit canonical and
 * hreflang alternate pairs so translated pages are correctly indexed per
 * language. Pages can override `canonical` if needed (rare).
 */
export default function SEO({
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage = DEFAULT_OG_IMAGE,
    canonical,
    noindex = false,
    jsonLd,
}: SEOProps) {
    const { pathname } = useLocation();
    const currentLocale = localeFromPath(pathname);
    const canonicalPath = canonical ?? pathname;
    const canonicalUrl = canonicalPath.startsWith('http')
        ? canonicalPath
        : `${BASE_URL}${canonicalPath}`;

    const alt = alternatePath(pathname, currentLocale);
    const alternateUrl = alt ? `${BASE_URL}${alt}` : null;

    // x-default points to the English (default-locale) version of the page
    const xDefaultPath = currentLocale === 'en' ? pathname : alt;
    const xDefaultUrl = xDefaultPath ? `${BASE_URL}${xDefaultPath}` : null;

    return (
        <Helmet>
            <html lang={currentLocale} />
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {noindex
                ? <meta name="robots" content="noindex, nofollow" />
                : <meta name="robots" content="index, follow" />
            }

            <link rel="canonical" href={canonicalUrl} />

            {/* hreflang — self + alternate + x-default */}
            <link rel="alternate" hrefLang={currentLocale} href={canonicalUrl} />
            {alternateUrl && (
                <link
                    rel="alternate"
                    hrefLang={currentLocale === 'en' ? 'tr' : 'en'}
                    href={alternateUrl}
                />
            )}
            {xDefaultUrl && <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />}

            {/* Open Graph */}
            <meta property="og:title" content={ogTitle || title} />
            <meta property="og:description" content={ogDescription || description} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:locale" content={currentLocale === 'tr' ? 'tr_TR' : 'en_US'} />
            {alternateUrl && (
                <meta
                    property="og:locale:alternate"
                    content={currentLocale === 'en' ? 'tr_TR' : 'en_US'}
                />
            )}
            <meta property="og:site_name" content="Brokz" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle || title} />
            <meta name="twitter:description" content={ogDescription || description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured data (JSON-LD) — per-page schemas. Site-wide
                Organization + WebSite live in index.html. */}
            {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
}

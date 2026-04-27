import { forwardRef, type AnchorHTMLAttributes, useEffect, useState } from 'react';

import { type RouteKey, pathFor, localeFromPath } from '../lib/routes';
// Side-effect — ensure i18next is initialized before any island tree renders.
import './index';

type LocalizedLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    /** Route key from ROUTES map — resolved to the correct locale path at render. */
    to: RouteKey;
    /** Optional :slug replacement for dynamic routes (e.g. blogPost). */
    params?: Record<string, string>;
};

/**
 * Astro-native replacement for the Vite-era LocalizedLink. Renders a plain
 * <a> — Astro static pages have no client-side router, so every navigation
 * is a real page request. On first render we derive the locale from a
 * globalThis-provided hint if available, then re-derive from
 * `window.location.pathname` after mount so any React island on a TR page
 * sees the TR locale.
 */
const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
    ({ to, params, ...rest }, ref) => {
        // Initial guess: read from window.location (SSR: empty string → 'en')
        const initialPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const [locale, setLocale] = useState(localeFromPath(initialPath));

        useEffect(() => {
            setLocale(localeFromPath(window.location.pathname));
        }, []);

        let path = pathFor(to, locale);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                path = path.replace(`:${key}`, value);
            }
        }
        return <a ref={ref} href={path} {...rest} />;
    },
);

LocalizedLink.displayName = 'LocalizedLink';

export default LocalizedLink;

/**
 * Server-side translator for Astro frontmatter / components.
 *
 * Loads all translation JSON bundles at build time and exposes a typed
 * `getT(locale, namespace)` helper that returns a translator function
 * compatible with react-i18next's `t()` (dot-path key resolution, with
 * fallback to the key itself if missing).
 *
 * React islands continue to use react-i18next via `./index.ts` — same
 * resources, same key paths, identical call sites.
 */

import enCommon from './en/common.json';
import enHome from './en/home.json';
import enSolutions from './en/solutions.json';
import enProducts from './en/products.json';
import enAbout from './en/about.json';
import enContact from './en/contact.json';
import enLegal from './en/legal.json';

import trCommon from './tr/common.json';
import trHome from './tr/home.json';
import trSolutions from './tr/solutions.json';
import trProducts from './tr/products.json';
import trAbout from './tr/about.json';
import trContact from './tr/contact.json';
import trLegal from './tr/legal.json';

export type Locale = 'en' | 'tr';
export type Namespace = 'common' | 'home' | 'solutions' | 'products' | 'about' | 'contact' | 'legal';

const BUNDLES: Record<Locale, Record<Namespace, unknown>> = {
    en: {
        common: enCommon,
        home: enHome,
        solutions: enSolutions,
        products: enProducts,
        about: enAbout,
        contact: enContact,
        legal: enLegal,
    },
    tr: {
        common: trCommon,
        home: trHome,
        solutions: trSolutions,
        products: trProducts,
        about: trAbout,
        contact: trContact,
        legal: trLegal,
    },
};

/** Resolve a dot-path (e.g. "hero.title") inside a bundle. Returns the key
 *  itself on miss so UI shows an obvious signal rather than an empty string. */
function resolve(bundle: unknown, path: string): unknown {
    const parts = path.split('.');
    let node: unknown = bundle;
    for (const part of parts) {
        if (typeof node === 'object' && node !== null && part in node) {
            node = (node as Record<string, unknown>)[part];
        } else {
            return path;
        }
    }
    return node;
}

export interface TFunction {
    (key: string): string;
    <T>(key: string, options: { returnObjects: true }): T;
}

/** Build a translator for the given locale + namespace. */
export function getT(locale: Locale, namespace: Namespace = 'common'): TFunction {
    const bundle = BUNDLES[locale]?.[namespace] ?? {};

    const t = ((key: string, options?: { returnObjects?: boolean }) => {
        const value = resolve(bundle, key);
        if (options?.returnObjects) {
            return value;
        }
        return typeof value === 'string' ? value : key;
    }) as TFunction;

    return t;
}

/** Given a pathname, return the active locale. Re-exported for convenience. */
export { localeFromPath } from '../lib/routes';

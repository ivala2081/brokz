// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * Brokz Astro config — static output for shared-hosting deployment.
 *
 * i18n: English default at root, Turkish under /tr. Localized URL slugs
 * are declared per-page via Astro dynamic routes (matches existing Vite
 * ROUTES map in ../src/i18n/routes.ts).
 *
 * Integrations:
 *   - React islands for existing motion/interactive components
 *   - Tailwind via @astrojs/tailwind (Tailwind 3 config ported 1:1)
 *   - MDX for blog posts (replaces markdown-only pipeline)
 *   - Sitemap auto-generated at build time with hreflang alternates
 */
export default defineConfig({
    site: 'https://brokztech.com',
    output: 'static',
    trailingSlash: 'ignore',
    build: {
        format: 'directory',
    },
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'tr'],
        routing: {
            prefixDefaultLocale: false,
            redirectToDefaultLocale: false,
        },
    },
    integrations: [
        react(),
        tailwind({
            applyBaseStyles: false,
            configFile: './tailwind.config.mjs',
        }),
        mdx(),
        sitemap({
            i18n: {
                defaultLocale: 'en',
                locales: { en: 'en', tr: 'tr' },
            },
            changefreq: 'weekly',
            priority: 0.7,
        }),
    ],
});

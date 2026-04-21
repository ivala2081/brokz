import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

const BASE_URL = 'https://brokz.io';

/**
 * Static routes with localized paths.
 *
 * Keep in sync with src/i18n/routes.ts. Each entry emits two <url> entries
 * in the sitemap (EN + TR) plus hreflang alternate pairs so Google indexes
 * both language variants without duplicate-content penalty.
 *
 * Blog post slugs are appended dynamically below; for now, EN and TR posts
 * are assumed to share the same slug. Per-post translation mapping can be
 * added via a frontmatter field when TR content is authored.
 */
const STATIC_ROUTES: Array<{
  en: string;
  tr: string;
  priority: string;
  changefreq: string;
}> = [
  { en: '/',          tr: '/tr',                             priority: '1.0', changefreq: 'weekly' },
  { en: '/solutions', tr: '/tr/cozumler',                    priority: '0.9', changefreq: 'weekly' },
  { en: '/products',  tr: '/tr/urunler',                     priority: '0.9', changefreq: 'weekly' },
  { en: '/about',     tr: '/tr/hakkimizda',                  priority: '0.8', changefreq: 'monthly' },
  { en: '/blog',      tr: '/tr/blog',                        priority: '0.9', changefreq: 'daily' },
  { en: '/contact',   tr: '/tr/iletisim',                    priority: '0.7', changefreq: 'monthly' },
  { en: '/legal',                    tr: '/tr/yasal',                           priority: '0.4', changefreq: 'yearly' },
  { en: '/legal/terms',              tr: '/tr/yasal/kullanim-kosullari',        priority: '0.3', changefreq: 'yearly' },
  { en: '/legal/privacy',            tr: '/tr/yasal/gizlilik-politikasi',       priority: '0.3', changefreq: 'yearly' },
  { en: '/legal/risk-disclosure',    tr: '/tr/yasal/risk-aciklamasi',           priority: '0.3', changefreq: 'yearly' },
  { en: '/legal/disclaimer',         tr: '/tr/yasal/feragat-beyani',            priority: '0.3', changefreq: 'yearly' },
];

function urlEntry(
  loc: string,
  enAlt: string,
  trAlt: string,
  lastmod: string,
  changefreq: string,
  priority: string,
): string {
  return `
  <url>
    <loc>${BASE_URL}${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${enAlt}"/>
    <xhtml:link rel="alternate" hreflang="tr" href="${BASE_URL}${trAlt}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${enAlt}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const readSlugs = (dir: string): string[] => {
        try {
          return readdirSync(resolve(__dirname, dir))
            .filter(f => f.endsWith('.md'))
            .map(f => f.replace(/\.md$/, ''));
        } catch {
          return [];
        }
      };
      const blogSlugs   = readSlugs('content/blog');
      const blogSlugsTr = readSlugs('content/blog-tr');

      const today = new Date().toISOString().split('T')[0];

      const staticEntries = STATIC_ROUTES.flatMap(r => [
        urlEntry(r.en, r.en, r.tr, today, r.changefreq, r.priority),
        urlEntry(r.tr, r.en, r.tr, today, r.changefreq, r.priority),
      ]);

      // Blog posts — only emit URLs for locales where the content file
      // actually exists on disk. EN-only posts get one entry without a TR
      // alternate; same for TR-only posts. Prevents sitemap-declared 404s.
      const blogEntries: string[] = [];
      const hasTr = new Set(blogSlugsTr);
      for (const slug of blogSlugs) {
        const en = `/blog/${slug}`;
        if (hasTr.has(slug)) {
          const tr = `/tr/blog/${slug}`;
          blogEntries.push(urlEntry(en, en, tr, today, 'monthly', '0.7'));
          blogEntries.push(urlEntry(tr, en, tr, today, 'monthly', '0.7'));
        } else {
          // EN-only — no alternate link
          blogEntries.push(`
  <url>
    <loc>${BASE_URL}${en}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
        }
      }
      // TR-only posts (no EN counterpart)
      const hasEn = new Set(blogSlugs);
      for (const slug of blogSlugsTr) {
        if (hasEn.has(slug)) continue;
        const tr = `/tr/blog/${slug}`;
        blogEntries.push(`
  <url>
    <loc>${BASE_URL}${tr}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }

      const urlEntries = [...staticEntries, ...blogEntries].join('');

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>${urlEntries}
</urlset>`;

      const outDir = resolve(__dirname, 'dist');
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf-8');
      const total = staticEntries.length + blogEntries.length;
      console.log(`\n✓ sitemap.xml generated with ${total} URLs (EN + TR pairs)`);
    },
  };
}

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
});

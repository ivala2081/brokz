/**
 * generate-sitemap.ts
 *
 * Emits `public/sitemap.xml` from the central ROUTES map + blog post files.
 * Run automatically as part of `npm run build`. For each static route, emits
 * BOTH the EN and TR variant as separate <url> entries with mutual
 * <xhtml:link rel="alternate" hreflang="..."> pairs and an x-default pointing
 * to EN — the exact structure Google requires for cross-language indexing.
 *
 * Blog posts are read from `content/blog/*.md`. If a post's frontmatter
 * includes `translationSlug`, the TR variant is emitted too; otherwise only
 * the EN URL is listed (no TR alternate).
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { ROUTES, type RouteKey, type Locale } from '../src/i18n/routes';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const BASE_URL = 'https://brokz.io';

type Priority = '1.0' | '0.9' | '0.8' | '0.7' | '0.6' | '0.5';
type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface StaticEntry {
  key: RouteKey;
  priority: Priority;
  changefreq: ChangeFreq;
}

/** Static routes to include in the sitemap. Dynamic routes (blogPost) are
 *  handled separately below. */
const STATIC_ENTRIES: StaticEntry[] = [
  { key: 'home',            priority: '1.0', changefreq: 'weekly' },
  { key: 'solutions',       priority: '0.9', changefreq: 'monthly' },
  { key: 'products',        priority: '0.9', changefreq: 'monthly' },
  { key: 'about',           priority: '0.7', changefreq: 'monthly' },
  { key: 'contact',         priority: '0.8', changefreq: 'monthly' },
  { key: 'blog',            priority: '0.8', changefreq: 'weekly' },
  { key: 'legal',           priority: '0.5', changefreq: 'yearly' },
  { key: 'legalTerms',      priority: '0.5', changefreq: 'yearly' },
  { key: 'legalPrivacy',    priority: '0.5', changefreq: 'yearly' },
  { key: 'legalRisk',       priority: '0.5', changefreq: 'yearly' },
  { key: 'legalDisclaimer', priority: '0.5', changefreq: 'yearly' },
];

interface UrlEntry {
  loc: string;
  lastmod: string;
  priority: Priority;
  changefreq: ChangeFreq;
  alternates: { hreflang: string; href: string }[];
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Crude YAML frontmatter reader — pulls `key: "value"` or `key: value` from
 *  the leading `---`-delimited block. Good enough for the known schema. */
function readFrontmatter(filePath: string): Record<string, string> {
  const src = readFileSync(filePath, 'utf8');
  const match = src.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-zA-Z][\w]*)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    const value = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    out[key] = value;
  }
  return out;
}

function buildStaticEntries(): UrlEntry[] {
  const today = isoDate(new Date());
  const entries: UrlEntry[] = [];

  for (const entry of STATIC_ENTRIES) {
    const paths: Record<Locale, string> = ROUTES[entry.key];
    const enHref = `${BASE_URL}${paths.en}`;
    const trHref = `${BASE_URL}${paths.tr}`;

    const alternates = [
      { hreflang: 'en',        href: enHref },
      { hreflang: 'tr',        href: trHref },
      { hreflang: 'x-default', href: enHref },
    ];

    entries.push({
      loc: enHref,
      lastmod: today,
      priority: entry.priority,
      changefreq: entry.changefreq,
      alternates,
    });
    entries.push({
      loc: trHref,
      lastmod: today,
      priority: entry.priority,
      changefreq: entry.changefreq,
      alternates,
    });
  }

  return entries;
}

function buildBlogEntries(): UrlEntry[] {
  const blogDir = resolve(root, 'content/blog');
  let files: string[] = [];
  try {
    files = readdirSync(blogDir).filter(f => f.endsWith('.md'));
  } catch {
    return [];
  }

  const entries: UrlEntry[] = [];
  for (const file of files) {
    const fullPath = resolve(blogDir, file);
    const stat = statSync(fullPath);
    const fm = readFrontmatter(fullPath);

    const slug = file.replace(/\.md$/, '');
    const enHref = `${BASE_URL}/blog/${slug}`;

    const lastmod = fm.date && /^\d{4}-\d{2}-\d{2}/.test(fm.date)
      ? fm.date.slice(0, 10)
      : isoDate(stat.mtime);

    const alternates: UrlEntry['alternates'] = [
      { hreflang: 'en',        href: enHref },
      { hreflang: 'x-default', href: enHref },
    ];

    if (fm.translationSlug) {
      const trHref = `${BASE_URL}/tr/blog/${fm.translationSlug}`;
      alternates.push({ hreflang: 'tr', href: trHref });
      entries.push({
        loc: trHref,
        lastmod,
        priority: '0.6',
        changefreq: 'monthly',
        alternates,
      });
    }

    entries.push({
      loc: enHref,
      lastmod,
      priority: '0.6',
      changefreq: 'monthly',
      alternates,
    });
  }

  return entries;
}

function renderXml(entries: UrlEntry[]): string {
  const body = entries
    .map(e => {
      const alts = e.alternates
        .map(a => `    <xhtml:link rel="alternate" hreflang="${xmlEscape(a.hreflang)}" href="${xmlEscape(a.href)}" />`)
        .join('\n');
      return [
        '  <url>',
        `    <loc>${xmlEscape(e.loc)}</loc>`,
        `    <lastmod>${e.lastmod}</lastmod>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        alts,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

function main() {
  const entries = [...buildStaticEntries(), ...buildBlogEntries()];
  const xml = renderXml(entries);
  const outPath = resolve(root, 'public/sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');
  console.log(`✓ sitemap.xml — ${entries.length} URLs → ${outPath.replace(root + '/', '').replace(root + '\\', '')}`);
}

main();

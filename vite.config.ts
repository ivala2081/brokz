import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

const BASE_URL = 'https://brokz.io';

const STATIC_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/',           priority: '1.0', changefreq: 'weekly' },
  { path: '/solutions',  priority: '0.9', changefreq: 'weekly' },
  { path: '/products',   priority: '0.9', changefreq: 'weekly' },
  { path: '/about',      priority: '0.8', changefreq: 'monthly' },
  { path: '/blog',       priority: '0.9', changefreq: 'daily' },
  { path: '/contact',    priority: '0.7', changefreq: 'monthly' },
  { path: '/legal',      priority: '0.4', changefreq: 'yearly' },
];

function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const blogDir = resolve(__dirname, 'content/blog');
      let blogSlugs: string[] = [];
      try {
        blogSlugs = readdirSync(blogDir)
          .filter(f => f.endsWith('.md'))
          .map(f => f.replace(/\.md$/, ''));
      } catch {
        // content/blog not present — skip dynamic routes
      }

      const today = new Date().toISOString().split('T')[0];

      const urlEntries = [
        ...STATIC_ROUTES.map(r => `
  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
        ...blogSlugs.map(slug => `
  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`),
      ].join('');

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

      const outDir = resolve(__dirname, 'dist');
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf-8');
      console.log(`\n✓ sitemap.xml generated with ${STATIC_ROUTES.length + blogSlugs.length} URLs`);
    },
  };
}

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
});

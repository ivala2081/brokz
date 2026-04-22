import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Sitemap generation lives in `scripts/generate-sitemap.ts` and is wired as
 * the `prebuild` npm hook — it reads `src/i18n/routes.ts` + blog frontmatter
 * and writes `public/sitemap.xml`. Vite copies public/ into dist/ during
 * build, so no in-Vite plugin is needed.
 */

export default defineConfig({
  plugins: [react()],
});

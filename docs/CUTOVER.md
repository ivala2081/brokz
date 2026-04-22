# Astro Migration Cutover Plan

**Current state (branch `feat/astro-migration`):**
- Root = Vite React SPA (production, deploys to `brokztech.vercel.app` via `main` branch)
- `astro/` subfolder = full Astro rebuild, 26 pages, SEO-complete, ready to ship

**Destination:**
- Root = Astro app
- Vite files deleted
- Preview on Vercel + final production deploy to shared hosting (cPanel/FTP)

## Pre-flight checks

Before cutover, verify in astro/ subfolder:

- [ ] `cd astro && bun run build` succeeds, output dir `astro/dist/` has 26 HTML pages
- [ ] `astro/dist/sitemap-index.xml` exists and lists 26+ URLs
- [ ] Open `astro/dist/index.html` in a browser (`python -m http.server 8000 -d astro/dist` or similar) — hero + navbar + footer render, no console errors, i18n links work
- [ ] TR locale works: `/tr/index.html` shows Turkish content
- [ ] 404 page works: any non-existent URL returns `404.html`
- [ ] Blog post pages render — navigate from `/blog/` to a post
- [ ] Legal pages render — navigate from `/legal/` to each doc
- [ ] Contact form works (will continue hitting `/api/contact.ts` from main app on shared host we'll move this to Supabase Edge Function per `memory/hosting_migration_plan.md`)

## Preview on Vercel (non-destructive)

Safest first step — deploy Astro as a Vercel preview without touching main:

1. Push `feat/astro-migration` branch (already done — Vercel auto-creates preview URL per push)
2. In Vercel dashboard → Project → Settings → Git → set Branch Previews to include `feat/astro-migration`
3. Set Root Directory to `astro` for preview-only deploys, OR add `rootDirectory: "astro"` via the Vercel CLI
4. Alternatively: `cd astro && vercel --prod=false` (Vercel CLI, picks up astro/vercel.json in this folder)

Preview URL served Astro output. Share with stakeholders, click-test every page, check mobile, check OG previews (paste URLs into LinkedIn/Slack to see preview cards).

## Final cutover (destructive — do when preview is approved)

Run these from repo root on a fresh checkout of `feat/astro-migration`:

```bash
# 1) Stash any WIP
git status

# 2) Delete Vite app files (root-level)
rm -rf \
  src \
  public \
  dist \
  index.html \
  vite.config.ts \
  postcss.config.js \
  tailwind.config.js \
  package.json \
  package-lock.json \
  bun.lock \
  vercel.json \
  api

# 3) Move astro/ contents to root
mv astro/* astro/.* . 2>/dev/null || true
rmdir astro

# 4) Sanity check
ls
bun install
bun run build

# 5) Commit
git add -A
git commit -m "chore(cutover): Astro migration — elevate astro/ to repo root

Deletes the Vite React SPA at root and moves the Astro app up one level.
Vercel build picks up the new root. From this commit forward, main branch
is pure Astro."

# 6) Merge to main
git checkout main
git merge feat/astro-migration

# 7) Push
git push origin main
```

## Rollback plan

If anything goes wrong post-cutover:

```bash
git reset --hard <commit-sha-before-cutover>
git push --force-with-lease origin main
```

`<commit-sha-before-cutover>` is the last main commit before the merge. Before cutover, note it: `git log --oneline main -1`.

## After cutover — outstanding items

- Update `api/contact.ts` → migrate to Supabase Edge Function (see `memory/hosting_migration_plan.md` + `memory/admin_panel_plan.md`)
- Shared hosting provider selection + DNS point for `brokztech.com`
- Activate GA4 + GSC + Clarity (see `astro/.env.example`, all placeholders already wired in BaseLayout)
- First pillar post — Turgut writes from `content/briefs/pillar-01-b-book-web-trader.md`

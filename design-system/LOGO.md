# Brokz Logo System

Brand governance for all logo variants, usage rules, and asset files.

---

## Core Palette (mandated)

| Token | Hex | Role in logo |
|---|---|---|
| `brand` | `#087331` | Mark color (on light), bg (on dark app icons) |
| `brand-hover` | `#065A26` | Reserved — do not use in logo |
| `surface-inverse` | `#050A06` | Dark bg contexts |
| `surface-muted` | `#F9FAFB` | Mark color (on dark/brand), bg (on light) |

**Never** recolor the logo outside these four values.

---

## Two Distinct Marks

The brand uses two marks for different contexts — **do not mix**.

### 1. Full Logo (3 ascending bars + "Brokz" wordmark)

Used in-product: NavBar, Footer, document headers. Rendered as inline SVG via the `BrokzLogoCompact` component.

- **Variants:** `brand` (green mark + ink wordmark), `light` (F9FAFB mark + F9FAFB wordmark), `dark` (ink mark + ink wordmark), `mono` (currentColor)
- **Wordmark:** optional via `withWordmark` prop
- **Geometry:** 3 horizontal bars, left-aligned, ascending height (14, 26, 40 units in a 48-unit viewBox), 5-unit gaps, 1.5-unit corner radius

### 2. Favicon Monogram ("B" glyph in rounded square)

Used where the full logo can't survive: favicon, app icons, social share previews at small scale.

- **Light variant:** brand green rounded square (112r on 512 viewBox) + F9FAFB geometric "B"
- **Dark variant:** F9FAFB rounded square + brand green "B" (for prefers-color-scheme: dark)
- **Geometry:** vertical spine (72×256) + upper lobe (144-unit width, 144-unit height) + lower lobe (184-unit width, 144-unit height, slightly wider than upper — classic B proportion)

The favicon mark is **NOT a miniaturized full logo**. Three-bar mark at 16×16 is unreadable; monogram survives.

---

## Minimum Sizes

| Element | Min size | Below this: do not use |
|---|---|---|
| Full logo + wordmark | 24px height | fallback: wordmark-only OR monogram |
| Full logo (mark only, no wordmark) | 24px | below: monogram |
| Wordmark only ("Brokz" text) | 16px height | below: illegible |
| Favicon monogram ("B" glyph) | 16×16 | — (designed for this size) |

---

## Clear Space

Minimum padding around logo: **logo height / 2** on all sides.

Example: a 48px logo needs at least 24px clear space on every side — no text, images, or borders within this zone.

---

## Asset Inventory

All static assets live in `public/`. Source SVGs in `src/assets/logo/`.

| File | Purpose | Size | Source |
|---|---|---|---|
| `public/favicon.svg` | Browser tab (light mode) | 512 viewBox | `src/assets/logo/favicon-mark.svg` |
| `public/favicon-dark.svg` | Browser tab (dark mode) | 512 viewBox | `src/assets/logo/favicon-mark-dark.svg` |
| `public/favicon-16.png` | Legacy tab fallback | 16×16 | generated |
| `public/favicon-32.png` | Tab high-res | 32×32 | generated |
| `public/favicon-48.png` | Windows tile | 48×48 | generated |
| `public/apple-touch-icon.png` | iOS home screen | 180×180 | `src/assets/logo/apple-touch-icon.svg` |
| `public/icon-192.png` | PWA / Android home screen | 192×192 | apple-touch source |
| `public/icon-512.png` | PWA splash / large icon | 512×512 | apple-touch source |
| `public/og-image.png` | Social share (OG + Twitter Card) | 1200×630 | `src/assets/logo/og-image.svg` |
| `public/site.webmanifest` | PWA manifest | — | hand-written |

### Regeneration

Whenever a source SVG changes:

```bash
npm run icons
```

This runs `scripts/generate-icons.ts` — rebuilds all PNGs from the SVG sources.

---

## Do

- ✅ Use `BrokzLogoCompact` component in all in-product surfaces (NavBar, Footer, headers)
- ✅ Use favicon monogram ONLY for favicon/app-icon/share contexts
- ✅ Maintain at least logo-height / 2 clear space around any logo
- ✅ Use `variant="brand"` on light surfaces, `variant="light"` on `surface-inverse`
- ✅ Match wordmark color to context (ink on light, F9FAFB on dark)
- ✅ Regenerate all PNGs via `npm run icons` after any SVG change
- ✅ Version-control source SVGs in `src/assets/logo/`

## Don't

- ❌ Do not stretch, skew, or rotate the logo
- ❌ Do not recolor outside the 4 mandated palette values
- ❌ Do not apply drop shadow, glow, outline, or gradient effects to the logo
- ❌ Do not use the full 3-bar logo below 24px (use monogram instead)
- ❌ Do not use the favicon monogram at large sizes (>48px) on web surfaces — use the full logo
- ❌ Do not recreate the logo in another tool; always use the SVG sources
- ❌ Do not hand-edit generated PNGs in `public/` — edit the source SVG + regenerate

---

## Accessibility

All logo instances must:

- Have `role="img"` + descriptive `aria-label="Brokz"` when clickable
- Pair `text-F9FAFB` mark with `#087331` bg → contrast ratio **~9:1** ✓ AAA
- Pair `#087331` mark with `#F9FAFB` bg → contrast ratio **~7.2:1** ✓ AAA

Avoid `#087331` text on `#050A06` bg (ratio 2.8:1 — fails AA). Use `brand-accent` (`#4ade80`) for green text on dark surfaces.

---

## Migration: When the Final Logo Arrives

The 3-bar mark and "B" monogram are placeholders pending the final brand. When the final logo arrives:

1. Replace the `<g>` contents in `BrokzLogo.tsx` with the new paths (keep the variant prop API)
2. Replace `src/assets/logo/favicon-mark.svg` and `favicon-mark-dark.svg` with the new monogram
3. Replace `src/assets/logo/apple-touch-icon.svg` if the app-icon composition changes
4. Replace `src/assets/logo/og-image.svg` with updated wordmark
5. Run `npm run icons` to regenerate all PNGs
6. Increment a version query string on static references if cache-busting is needed
7. Update this document (`LOGO.md`) with the new geometry specs

No other code changes required — the component API and CSS tokens stay the same.

---

*Last updated: 2026-04-20. Any change to this document requires review; logo drift is a brand risk.*

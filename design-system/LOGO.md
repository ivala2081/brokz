# Brokz Logo System

Brand governance for all logo variants, usage rules, and asset files.
Aligned with the official Brokz brand package (`brokzlogo/Brokz/`).

---

## Core Palette (mandated)

| Token | Hex | Role in logo |
|---|---|---|
| `brand` | `#00C033` | Mark on light surfaces (container bg: F9FAFB) |
| `brand-hover` | `#009A29` | Hover states — not used in static logo |
| `brand-accent` | `#5FDD82` | Mark on dark surfaces (container bg: #050A06) |
| `surface-inverse` | `#050A06` | Dark container bg |
| `surface-muted` | `#F9FAFB` | Light container bg, wordmark on dark |

**Never** recolor the logo outside these five values.

---

## Logo Geometry (official brand package)

The brand mark is two diagonal slash forms inside a rounded square container.
Paths and proportions are from the designer-supplied `brokzlogo/Brokz/SVG/ICON/main icon.svg`.

- **Native viewBox:** `3006×3006`
- **Container rect:** `520.012, 519.258, 1966.57×1966.57, rx 188.791` (~9.4% corner radius)
- **Mark:** two curved paths that extend beyond the container — clipped by the container shape for a "slashing through" effect

The `BrokzLogoCompact` component renders this geometry as inline SVG using a `viewBox="520 519 1968 1968"` crop plus a clipPath, so the clipped slashes render correctly at any size.

---

## Two Logo Contexts

### 1. In-product logo (NavBar, Footer, document headers)

Rendered via `<BrokzLogoCompact>` React component (inline SVG).

**Variants:**
- `brand` / `on-light` / `dark` → container `#F9FAFB` + mark `#00C033` (for white/light surfaces)
- `light` / `on-dark` → container `#050A06` + mark `#5FDD82` (for dark surfaces)
- `mono` → transparent container + `currentColor` mark (utility)

**Wordmark:** optional via `withWordmark` prop — renders "Brokz" in Geist Bold next to the mark, colored `#050A06` (on light) or `#F9FAFB` (on dark).

### 2. Favicon / social / app icon

Generated PNGs from `src/assets/logo/` SVG sources via `npm run icons`.

- `favicon.svg` — light-mode favicon (F9FAFB container + #00C033 mark)
- `favicon-dark.svg` — dark-mode favicon (#050A06 container + #5FDD82 mark)
- `apple-touch-icon.png` — 180×180, light-mode variant
- `icon-192.png` / `icon-512.png` — PWA
- `og-image.png` — 1200×630, dark surface + full wordmark+mark composition

---

## Minimum Sizes

| Element | Min size | Below this: fallback |
|---|---|---|
| Full logo + wordmark | 24px | wordmark-only OR mark-only |
| Mark only (no wordmark) | 20px | use favicon variant |
| Wordmark only ("Brokz" text) | 16px | illegible — don't use |
| Favicon mark (in rounded square) | 16×16 | — (designed for this size) |

---

## Clear Space

Minimum padding around any logo rendering: **logo height / 2** on all sides.

Example: a 48px logo needs ≥24px clear space on every side — no text, images, or borders within this zone.

---

## Asset Inventory

Sources: `src/assets/logo/` (copied from official brand package).
Generated outputs: `public/` (via `npm run icons`).

| File | Purpose | Size | Source |
|---|---|---|---|
| `public/favicon.svg` | Browser tab (light mode) | 3006 viewBox | `brokzlogo/.../main icon.svg` |
| `public/favicon-dark.svg` | Browser tab (dark mode) | 3006 viewBox | `brokzlogo/.../main icon - black.svg` |
| `public/favicon-16.png` | Legacy fallback | 16×16 | generated |
| `public/favicon-32.png` | Tab high-res | 32×32 | generated |
| `public/favicon-48.png` | Windows tile | 48×48 | generated |
| `public/apple-touch-icon.png` | iOS home screen | 180×180 | `src/assets/logo/apple-touch-icon.svg` |
| `public/icon-192.png` | PWA / Android home | 192×192 | apple-touch source |
| `public/icon-512.png` | PWA splash | 512×512 | apple-touch source |
| `public/og-image.png` | Social share | 1200×630 | `src/assets/logo/og-image.svg` |
| `public/site.webmanifest` | PWA manifest | — | hand-written |

### Regeneration

Whenever a source SVG changes:

```bash
npm run icons
```

Runs `scripts/generate-icons.ts` — rebuilds all PNGs from SVG sources using `sharp`.

---

## Do

- ✅ Use `BrokzLogoCompact` component for all in-product surfaces (NavBar, Footer, headers)
- ✅ Use favicon/icon PNGs for browser tabs, OS home screens, social shares
- ✅ Maintain ≥ logo-height / 2 clear space around any logo
- ✅ Use `variant="brand"` (or `on-light`) on light surfaces, `variant="light"` (or `on-dark`) on `surface-inverse`
- ✅ Regenerate all PNGs via `npm run icons` after any SVG source change
- ✅ Keep source SVGs in `src/assets/logo/` — do not hand-edit generated PNGs

## Don't

- ❌ Do not stretch, skew, or rotate the logo
- ❌ Do not recolor outside the 5 mandated palette values
- ❌ Do not apply drop shadow, glow, outline, or gradient effects directly on the logo
- ❌ Do not use wordmark-only below 16px
- ❌ Do not use mark-only below 20px (swap to favicon in rounded square below 20px)
- ❌ Do not recreate the logo in another tool — always use SVG sources
- ❌ Do not hand-edit `public/*.png` — edit the source SVG + regenerate

---

## Accessibility / Contrast

Contrast ratios vs WCAG AA (4.5:1 for text, 3:1 for UI):

| Mark color | Bg color | Ratio | Verdict |
|---|---|---|---|
| `#00C033` | `#F9FAFB` | ~4.1:1 | ✓ UI elements, ✗ body text |
| `#5FDD82` | `#050A06` | ~11.8:1 | ✓ AAA |
| `#F9FAFB` | `#050A06` | ~19:1 | ✓ AAA (wordmark on dark) |
| `#050A06` | `#F9FAFB` | ~19:1 | ✓ AAA (wordmark on light) |

**Note:** `#00C033` as text-color on white is borderline (4.1:1, below 4.5 AA for small body text). Use only as accent / link / button-bg contexts. For body text on light surfaces, use `#050A06` (ink).

All logo instances must have:
- `role="img"` on the SVG
- `aria-label="Brokz"` or equivalent

---

## Migration Path

If the brand package is updated (new paths, new colors, etc.):

1. Replace `src/assets/logo/favicon-mark.svg` with the new light variant
2. Replace `src/assets/logo/favicon-mark-dark.svg` with the new dark variant
3. Replace `src/assets/logo/apple-touch-icon.svg` if app-icon composition changes
4. Replace `src/assets/logo/og-image.svg` if social composition changes
5. Update `MARK_PATH_UPPER`, `MARK_PATH_LOWER`, and `BRAND_RECT` constants in `src/components/BrokzLogo.tsx`
6. Run `npm run icons` to regenerate all PNGs
7. Update color tokens in `tailwind.config.js` if palette shifts
8. Update this document with new geometry specs

No other code changes required — the component API stays stable.

---

*Last updated: 2026-04-21 — aligned with official Brokz brand package. Any change to this document requires review; logo drift is a brand risk.*

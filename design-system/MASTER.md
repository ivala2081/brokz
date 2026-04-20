# Brokz Design System — MASTER

> Source of truth for all pages. Page-specific overrides live in `design-system/pages/<page>.md`.
> Generated with UI UX Pro Max skill recommendations, adapted to match mandatory brand constraints.

## Direction

**Pattern:** Trust & Authority
Hero → Features → CTA. CTA above the fold. Minimum sections, maximum signal.

**Style:** Exaggerated Minimalism
Bold statement design. Oversized typography. High contrast. Massive negative space.
Mode Support: Light ✓ | Dark ✓

**Audience:** Institutional B2B — brokerages, prop firms, fintech startups, liquidity providers.

## Colors (MANDATED — do not change)

| Role | Hex | Token |
|---|---|---|
| Primary / Brand | `#087331` | `brand` |
| Brand hover | `#065A26` | `brand-hover` |
| Dark surface | `#050A06` | `surface-inverse` |
| Soft background | `#F9FAFB` | `surface-muted` |
| Foreground (ink) | `#0F172A` | `ink` |
| Text secondary | `#475569` | `ink-secondary` |
| Border | `#E2E8F0` | `line` |
| Destructive | `#DC2626` | `status-danger` |

Brand green is the single accent. No blue, no purple, no navy primary.

## Typography

- **Sans:** Geist (300–800)
- **Mono:** Geist Mono (for data, stats, code)

### On-Dark Text Convention

Semantic `ink-*` tokens target **light surfaces**. On dark surfaces (`bg-surface-inverse`), use Tailwind's gray scale for text hierarchy:

| Role on dark | Class | Hex | Use |
|---|---|---|---|
| Primary | `text-white` | `#FFFFFF` | Headlines |
| Secondary | `text-gray-300` | `#D1D5DB` | Body text, hero subhead |
| Muted | `text-gray-400` | `#9CA3AF` | Metadata, caption |
| Subtle | `text-gray-500` | `#6B7280` | Fine print, separators |

These are **intentional** — do not replace with ink-* tokens.

### Scale (Exaggerated Minimalism)

| Purpose | Recipe | Example |
|---|---|---|
| Hero display | `heading-hero` — clamp(3rem, 10vw, 9rem), weight 800, track -0.05em | "Fintech infrastructure, engineered." |
| H1 | `heading-1` — 4–5xl, weight 700, track -0.02em | Page titles |
| H2 | `heading-2` — 3–4xl, weight 700, track -0.015em | Section titles |
| H3 | `heading-3` — xl–2xl, weight 600 | Card / sub-section |
| Body Large | `body-lg` — 1.125rem, leading-relaxed | Hero subhead, section intros |
| Body | `body` — 1rem, leading-relaxed | Prose |
| Caption | `caption` — 0.75rem | Timestamps, fine print |
| Eyebrow | `eyebrow` — 0.6875rem, tracking 0.14em, uppercase, bold | Section labels |

Use `font-mono tabular` for any numeric display (stats, prices, latency, uptime).

## Layout & Spacing

- Container max width: `max-w-layout` (1200px)
- Narrow content: `max-w-content` (1100px) or `max-w-prose` (65ch) for reading
- Section padding: `section-padding` (80–112px vertical)
- Grid gutter: 24–32px

**Whitespace principle:** when in doubt, double the spacing. Minimalism requires room to breathe.

## Effects

- Transition duration: `duration-base` (200ms) default, `duration-slow` (320ms) for emphasis
- Easing: `ease-emphasis` `cubic-bezier(0.21, 0.47, 0.32, 0.98)` for hero entrances
- Hover: `translate-y-1` lift + shadow bump
- Focus: `ring-2 ring-brand-ring` (mandatory for accessibility)
- Motion: respect `prefers-reduced-motion`

## Anti-Patterns (AVOID)

- ❌ Playful illustrations, rounded cartoonish shapes
- ❌ AI purple/pink gradients
- ❌ Unclear pricing or fees
- ❌ Emojis as icons (use SVG: Lucide / Heroicons / custom)
- ❌ Loud animated entrances that delay content
- ❌ Small text without sufficient contrast (<4.5:1)
- ❌ Crowded section stacks (>4 sections per page)

## Pre-Delivery Checklist

- [ ] No emojis as icons (SVG only: Lucide / Heroicons / custom)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode text contrast ≥ 4.5:1
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] All links use semantic tokens, no hardcoded hex
- [ ] Images: WebP/SVG, explicit width/height for LCP
- [ ] `aria-label` on all icon-only buttons

## Components (see `src/index.css`)

Recipes live in `src/index.css` and are the only correct way to compose UI:
- Buttons: `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-link`, `btn-link-light`
- Cards: `card`, `card-muted`, `card-dark`, `card-feature`, `card-interactive`
- Inputs: `input`, `input-label`
- Badges: `badge-brand`, `badge-neutral`, `badge-success`, `badge-warning`, `badge-info`
- Surfaces: `surface-grid-dark`, `surface-grid-light`, `surface-brand-radial`

Add new recipes only when a pattern repeats 3+ times.

## Sources

- Generated with [UI UX Pro Max skill](https://uupm.cc) (fintech b2b trading infrastructure institutional)
- Brand color mandate: Turgut, 2026-04-20
- Live style guide: `/design-system` route

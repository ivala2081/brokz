import logoOnDark from '../assets/logo/brokz-logo-on-dark.svg';
import logoOnLight from '../assets/logo/brokz-logo-on-light.svg';

interface BrokzLogoProps {
  size?: number;
  className?: string;
  /**
   * Color context for the logo.
   * - 'brand' | 'on-light' | 'dark' → for light/white surfaces (dark wordmark)
   * - 'light' | 'on-dark'          → for dark surfaces (white wordmark)
   * - 'mono'                       → currentColor mark only (withWordmark unsupported)
   */
  variant?: 'brand' | 'light' | 'dark' | 'mono' | 'on-light' | 'on-dark';
  /** Render the full brand lockup (mark + wordmark) using the official SVG asset */
  withWordmark?: boolean;
}

// Full-lockup SVG aspect (from official brand package): 6391 × 2386
const LOCKUP_ASPECT = 6391 / 2386;

// Inline mark geometry — extracted from brokzlogo/Brokz/SVG/ICON/main icon.svg.
// Kept inline so the icon-only usage stays theme-aware (runtime color switching).
const MARK_VIEWBOX = '520 519 1968 1968';
const MARK_RECT = { x: 520.012, y: 519.258, w: 1966.57, h: 1966.57, rx: 188.791 };
const MARK_PATH_UPPER =
  'M2130.94 2210.16C2113.9 2242.36 2080.45 2262.5 2044.02 2262.5L1505.56 2262.45C1430.35 2262.45 1382.99 2181.44 1419.88 2115.9L1513.08 1950.3L2214.45 584.795L2220.11 571.992C2235.86 536.409 2271.11 513.46 2310.02 513.457L2858.02 513.42C2931.07 513.415 2978.62 590.233 2946.04 655.607L2825.66 897.157L2130.94 2210.16Z';
const MARK_PATH_LOWER =
  'M585.973 2682.87C568.934 2715.08 535.485 2735.22 499.052 2735.22L-94.3012 2735.16C-169.513 2735.16 -216.871 2654.15 -179.981 2588.61L-74.1843 2400.64L677.454 937.252L685.383 919.336C701.131 883.753 736.381 860.804 775.293 860.801L1378.55 860.76C1451.59 860.755 1499.14 937.573 1466.56 1002.95L1332.47 1272L585.973 2682.87Z';

type Context = 'onLight' | 'onDark' | 'mono';

function resolveContext(variant: NonNullable<BrokzLogoProps['variant']>): Context {
  if (variant === 'brand' || variant === 'dark' || variant === 'on-light') return 'onLight';
  if (variant === 'light' || variant === 'on-dark') return 'onDark';
  return 'mono';
}

/**
 * Brokz brand logo.
 *
 * - `withWordmark={false}` (default): renders only the brand mark as inline SVG
 *   so its color can switch with the surface (theme-aware).
 * - `withWordmark={true}`: renders the official full-lockup SVG delivered in the
 *   brand package — preserves custom wordmark typography and accent glyphs that
 *   cannot be faithfully recreated with a system font.
 */
export function BrokzLogoCompact({
  size = 36,
  className = '',
  variant = 'brand',
  withWordmark = false,
}: BrokzLogoProps) {
  const context = resolveContext(variant);

  if (withWordmark) {
    if (context === 'mono') {
      // No mono lockup exists in the brand package — fall through to mark-only.
    } else {
      const src = context === 'onLight' ? logoOnLight : logoOnDark;
      const width = Math.round(size * LOCKUP_ASPECT);
      return (
        <img
          src={src}
          alt="Brokz"
          width={width}
          height={size}
          className={`inline-block select-none ${className}`}
          draggable={false}
        />
      );
    }
  }

  // ─── Mark-only (inline, theme-aware) ─────────────────────────────────
  const bgColor =
    context === 'onLight' ? '#F9FAFB'
    : context === 'onDark' ? '#050A06'
    : 'transparent';

  const markColor =
    context === 'onLight' ? '#00C033'
    : context === 'onDark' ? '#5FDD82'
    : 'currentColor';

  const clipId = `brokz-clip-${context}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={MARK_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Brokz"
      className={`inline-block ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={MARK_RECT.x} y={MARK_RECT.y} width={MARK_RECT.w} height={MARK_RECT.h} rx={MARK_RECT.rx} />
        </clipPath>
      </defs>
      <rect
        x={MARK_RECT.x}
        y={MARK_RECT.y}
        width={MARK_RECT.w}
        height={MARK_RECT.h}
        rx={MARK_RECT.rx}
        fill={bgColor}
      />
      <g clipPath={`url(#${clipId})`}>
        <path d={MARK_PATH_UPPER} fill={markColor} />
        <path d={MARK_PATH_LOWER} fill={markColor} />
      </g>
    </svg>
  );
}

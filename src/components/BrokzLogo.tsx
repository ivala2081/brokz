interface BrokzLogoProps {
  size?: number;
  className?: string;
  /**
   * Color context for the logo.
   * - 'brand' | 'on-light' | 'dark' → rounded F9FAFB container + #00C033 mark (for white/light surfaces)
   * - 'light' | 'on-dark'  → rounded #050A06 container + #5FDD82 mark (for dark surfaces)
   * - 'mono' → currentColor mark, transparent container
   */
  variant?: 'brand' | 'light' | 'dark' | 'mono' | 'on-light' | 'on-dark';
  /** Include "Brokz" wordmark next to the mark */
  withWordmark?: boolean;
}

// ─── Brand asset geometry ───────────────────────────────────────────────
// Paths extracted from the official Brokz brand package
// (brokzlogo/Brokz/SVG/ICON/main icon.svg). Two diagonal slash forms inside
// a rounded square container. ViewBox spans the full brand canvas so the
// mark paths can bleed outside the container and be clipped.

const BRAND_VIEWBOX = '520 519 1968 1968';
const BRAND_RECT = { x: 520.012, y: 519.258, w: 1966.57, h: 1966.57, rx: 188.791 };
const MARK_PATH_UPPER =
  'M2130.94 2210.16C2113.9 2242.36 2080.45 2262.5 2044.02 2262.5L1505.56 2262.45C1430.35 2262.45 1382.99 2181.44 1419.88 2115.9L1513.08 1950.3L2214.45 584.795L2220.11 571.992C2235.86 536.409 2271.11 513.46 2310.02 513.457L2858.02 513.42C2931.07 513.415 2978.62 590.233 2946.04 655.607L2825.66 897.157L2130.94 2210.16Z';
const MARK_PATH_LOWER =
  'M585.973 2682.87C568.934 2715.08 535.485 2735.22 499.052 2735.22L-94.3012 2735.16C-169.513 2735.16 -216.871 2654.15 -179.981 2588.61L-74.1843 2400.64L677.454 937.252L685.383 919.336C701.131 883.753 736.381 860.804 775.293 860.801L1378.55 860.76C1451.59 860.755 1499.14 937.573 1466.56 1002.95L1332.47 1272L585.973 2682.87Z';

/**
 * Brokz brand mark. Uses official brand package geometry, theme-aware colors.
 * Renders inline SVG (zero network cost, scalable, a11y-ready).
 */
export function BrokzLogoCompact({
  size = 36,
  className = '',
  variant = 'brand',
  withWordmark = false,
}: BrokzLogoProps) {
  // Normalize variant aliases → onLight | onDark | mono
  const context =
    variant === 'brand' || variant === 'dark' || variant === 'on-light'
      ? 'onLight'
      : variant === 'light' || variant === 'on-dark'
        ? 'onDark'
        : 'mono';

  const bgColor =
    context === 'onLight' ? '#F9FAFB'
    : context === 'onDark' ? '#050A06'
    : 'transparent';

  const markColor =
    context === 'onLight' ? '#00C033'
    : context === 'onDark' ? '#5FDD82'
    : 'currentColor';

  const wordmarkColor =
    context === 'onLight' ? '#050A06'
    : context === 'onDark' ? '#F9FAFB'
    : 'currentColor';

  const wordmarkFontPx = Math.round(size * 0.78);
  const clipId = `brokz-clip-${context}`;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={BRAND_VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Brokz"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={BRAND_RECT.x} y={BRAND_RECT.y} width={BRAND_RECT.w} height={BRAND_RECT.h} rx={BRAND_RECT.rx} />
          </clipPath>
        </defs>
        <rect
          x={BRAND_RECT.x}
          y={BRAND_RECT.y}
          width={BRAND_RECT.w}
          height={BRAND_RECT.h}
          rx={BRAND_RECT.rx}
          fill={bgColor}
        />
        <g clipPath={`url(#${clipId})`}>
          <path d={MARK_PATH_UPPER} fill={markColor} />
          <path d={MARK_PATH_LOWER} fill={markColor} />
        </g>
      </svg>

      {withWordmark && (
        <span
          className="font-sans font-bold leading-none tracking-tight"
          style={{
            color: wordmarkColor,
            fontSize: `${wordmarkFontPx}px`,
            letterSpacing: '-0.035em',
          }}
        >
          Brokz
        </span>
      )}
    </span>
  );
}

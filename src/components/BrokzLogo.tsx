interface BrokzLogoProps {
  size?: number;
  className?: string;
  /** Color variant: 'brand' (green mark), 'light' (F9FAFB mark on dark), 'dark' (ink mark), 'mono' (current color) */
  variant?: 'brand' | 'light' | 'dark' | 'mono';
  /** Include "Brokz" wordmark next to the mark */
  withWordmark?: boolean;
}

/**
 * Brokz logo mark — three ascending bars (infrastructure + growth metaphor).
 * Abstract, not a monogram. Fintech B2B, engineering-first.
 */
export function BrokzLogoCompact({
  size = 36,
  className = '',
  variant = 'brand',
  withWordmark = false,
}: BrokzLogoProps) {
  const markFill =
    variant === 'brand' ? '#087331' :
    variant === 'light' ? '#F9FAFB' :
    variant === 'dark'  ? '#050A06' :
    'currentColor';

  const wordmarkColor =
    variant === 'brand' ? '#050A06' :
    variant === 'light' ? '#F9FAFB' :
    variant === 'dark'  ? '#050A06' :
    'currentColor';

  // Mark is 48x48. Wordmark height roughly matches mark height.
  const markPx = size;
  const wordmarkFontPx = Math.round(size * 0.78);

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={markPx}
        height={markPx}
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Brokz"
      >
        {/* Three ascending bars — infrastructure + growth */}
        <g fill={markFill}>
          <rect x="4"  y="30" width="10" height="14" rx="1.5" />
          <rect x="19" y="18" width="10" height="26" rx="1.5" />
          <rect x="34" y="4"  width="10" height="40" rx="1.5" />
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

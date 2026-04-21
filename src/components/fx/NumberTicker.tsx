import { useEffect, useRef, useState } from 'react';

interface NumberTickerProps {
  /** Target value to animate to. If it's non-numeric (e.g. "B2B"), no animation — renders as-is. */
  value: string | number;
  /** Animation duration in ms */
  duration?: number;
  /** Decimals for numeric values */
  decimals?: number;
  /** Start value (default 0) */
  from?: number;
  /** Extra className for the output span */
  className?: string;
}

/**
 * Counts from `from` to numeric `value` once the element enters the viewport.
 * Handles prefixes/suffixes in string values (e.g. "<1ms", "99.99%", "+150").
 * For non-numeric strings (e.g. "B2B"), renders as static text.
 * Respects prefers-reduced-motion (snaps to final value).
 */
export default function NumberTicker({
  value,
  duration = 1400,
  decimals,
  from = 0,
  className = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string>(() => String(value));
  const startedRef = useRef(false);

  // Parse target: extract numeric portion + prefix + suffix
  const parsed = parseNumeric(value);

  useEffect(() => {
    if (!parsed) {
      setDisplay(String(value));
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Initial display: from value formatted same way
    const initialDecimals = decimals ?? parsed.decimals;
    setDisplay(
      parsed.prefix + from.toFixed(initialDecimals) + parsed.suffix
    );

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisplay(String(value));
      return;
    }

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            animate();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    obs.observe(el);

    function animate() {
      if (!parsed) return;
      const startTime = performance.now();
      const diff = parsed.number - from;
      const d = decimals ?? parsed.decimals;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // easeOutExpo — fast start, slow end
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        const current = from + diff * eased;
        setDisplay(parsed.prefix + current.toFixed(d) + parsed.suffix);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    return () => obs.disconnect();
  }, [value, duration, decimals, from, parsed]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────

function parseNumeric(value: string | number):
  | { prefix: string; suffix: string; number: number; decimals: number }
  | null {
  if (typeof value === 'number') {
    return { prefix: '', suffix: '', number: value, decimals: 0 };
  }
  const match = value.match(/^(.*?)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  const num = parseFloat(numStr);
  if (isNaN(num)) return null;
  const decimalPart = numStr.split('.')[1];
  return {
    prefix,
    suffix,
    number: num,
    decimals: decimalPart ? decimalPart.length : 0,
  };
}

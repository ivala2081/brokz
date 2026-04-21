import { useEffect, useRef } from 'react';

interface InteractiveGridProps {
  /** Grid cell size in px */
  cellSize?: number;
  /** Line color (dark theme default) */
  lineColor?: string;
  /** Highlight color near cursor */
  highlightColor?: string;
  /** Radius around cursor where cells light up */
  highlightRadius?: number;
}

/**
 * Cursor-reactive grid pattern. Base lines always visible (static grid look).
 * Additional overlay mask brightens cells within radius of cursor.
 * Works on dark surfaces. Falls back to static grid with prefers-reduced-motion.
 */
export default function InteractiveGrid({
  cellSize = 48,
  lineColor = 'rgba(255, 255, 255, 0.04)',
  highlightColor = 'rgba(8, 115, 49, 0.18)',
  highlightRadius = 240,
}: InteractiveGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    let raf = 0;
    let targetX = -highlightRadius * 2;
    let targetY = -highlightRadius * 2;
    let currentX = targetX;
    let currentY = targetY;

    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };
    const onLeave = () => {
      targetX = -highlightRadius * 2;
      targetY = -highlightRadius * 2;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      el.style.setProperty('--mx', `${currentX}px`);
      el.style.setProperty('--my', `${currentY}px`);
      raf = requestAnimationFrame(tick);
    };

    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [highlightRadius]);

  // Grid is rendered via CSS background: two perpendicular linear gradients.
  // A second layer uses the same grid but with brighter color, masked to a
  // radial gradient that follows cursor via CSS custom props.
  const baseBg = `
    linear-gradient(${lineColor} 1px, transparent 1px),
    linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
  `;
  const highlightBg = `
    linear-gradient(${highlightColor} 1px, transparent 1px),
    linear-gradient(90deg, ${highlightColor} 1px, transparent 1px)
  `;

  return (
    <>
      {/* Base static grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: baseBg,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      />
      {/* Cursor-reactive highlight overlay */}
      <div
        ref={ref}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none motion-reduce:hidden"
        style={{
          backgroundImage: highlightBg,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          maskImage: `radial-gradient(${highlightRadius}px circle at var(--mx) var(--my), black 0%, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(${highlightRadius}px circle at var(--mx) var(--my), black 0%, transparent 70%)`,
        }}
      />
    </>
  );
}

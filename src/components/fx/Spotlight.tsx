import { useEffect, useRef } from 'react';

interface SpotlightProps {
  /** Size of the spotlight in pixels */
  size?: number;
  /** Brand color at high opacity (close to cursor) */
  color?: string;
}

/**
 * Cursor-reactive ambient spotlight for dark surfaces.
 * Tracks pointer position and renders a subtle radial glow at that location.
 * Respects prefers-reduced-motion.
 */
export default function Spotlight({
  size = 600,
  color = 'rgba(0, 192, 51, 0.25)',
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    const onLeave = () => {
      // Drift offscreen
      targetX = -size * 2;
      targetY = -size * 2;
    };

    const tick = () => {
      // Smoothing factor — lower = more lag, higher = snappier
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      el.style.transform = `translate3d(${currentX - size / 2}px, ${currentY - size / 2}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);
    onLeave(); // start offscreen
    raf = requestAnimationFrame(tick);

    return () => {
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [size]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute top-0 left-0 pointer-events-none rounded-full motion-reduce:hidden"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        filter: 'blur(40px)',
        transition: 'opacity 300ms ease-out',
      }}
    />
  );
}

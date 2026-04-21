import { useRef, type ReactNode, type HTMLAttributes } from 'react';

interface GlareCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Glare radius in px */
  radius?: number;
  /** Glare color (should be subtle on target surface) */
  color?: string;
}

/**
 * Wrapper that adds a cursor-reactive radial glare overlay to its content.
 * Glare appears only on hover, follows pointer, fades out on leave.
 * Uses CSS custom properties for GPU-efficient updates (no re-renders).
 *
 * Usage:
 *   <GlareCard className="card">...</GlareCard>
 *   <GlareCard className="card-muted" color="rgba(0, 192, 51,0.16)">...</GlareCard>
 */
export default function GlareCard({
  children,
  radius = 420,
  color = 'rgba(0, 192, 51, 0.12)',
  className = '',
  style,
  ...rest
}: GlareCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--glare-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--glare-y', `${e.clientY - rect.top}px`);
    el.style.setProperty('--glare-opacity', '1');
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--glare-opacity', '0');
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        // CSS vars read by the ::after pseudo-element below
        ['--glare-radius' as string]: `${radius}px`,
        ['--glare-color' as string]: color,
      }}
      {...rest}
    >
      {children}
      {/* Glare overlay — pointer-events-none so it doesn't block clicks */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] motion-reduce:hidden"
        style={{
          background: `radial-gradient(var(--glare-radius, 420px) circle at var(--glare-x, 50%) var(--glare-y, 50%), var(--glare-color, rgba(0, 192, 51,0.12)), transparent 45%)`,
          opacity: 'var(--glare-opacity, 0)',
          transition: 'opacity 280ms ease',
        }}
      />
    </div>
  );
}

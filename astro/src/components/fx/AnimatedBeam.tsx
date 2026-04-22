import { useEffect, useId, useRef, useState, type RefObject } from 'react';

interface AnimatedBeamProps {
  /** Container element (positioned ancestor) */
  containerRef: RefObject<HTMLElement | null>;
  /** Start element ref */
  fromRef: RefObject<HTMLElement | null>;
  /** End element ref */
  toRef: RefObject<HTMLElement | null>;
  /** Path curvature — 0 = straight line, higher = more curve */
  curvature?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Base path color (faint) */
  pathColor?: string;
  /** Animated beam colors */
  gradientStart?: string;
  gradientStop?: string;
  /** Reverse flow direction */
  reverse?: boolean;
}

/**
 * Draws an SVG path between two DOM nodes inside a container, with a
 * flowing gradient beam animating along the path. Positions are measured
 * on mount and on window resize. Respects prefers-reduced-motion.
 */
export default function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration = 3.5,
  delay = 0,
  strokeWidth = 1.5,
  pathColor = 'rgba(255, 255, 255, 0.08)',
  gradientStart = 'rgba(95, 221, 130, 0)',
  gradientStop = '#00C033',
  reverse = false,
}: AnimatedBeamProps) {
  const id = useId();
  const [path, setPath] = useState<string>('');
  const [viewBox, setViewBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      const fRect = fromRef.current.getBoundingClientRect();
      const tRect = toRef.current.getBoundingClientRect();

      const startX = fRect.left - cRect.left + fRect.width;
      const startY = fRect.top - cRect.top + fRect.height / 2;
      const endX = tRect.left - cRect.left;
      const endY = tRect.top - cRect.top + tRect.height / 2;

      const midX = (startX + endX) / 2;
      const controlY1 = startY - curvature;
      const controlY2 = endY - curvature;

      setPath(
        `M ${startX},${startY} C ${midX},${controlY1} ${midX},${controlY2} ${endX},${endY}`
      );
      setViewBox({ w: cRect.width, h: cRect.height });
    };

    update();

    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', update);
    // Re-measure after fonts/layout settle
    const t = setTimeout(update, 50);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      clearTimeout(t);
    };
  }, [containerRef, fromRef, toRef, curvature]);

  if (!path) return null;

  const gid = `beam-${id}`;

  return (
    <svg
      aria-hidden="true"
      className="absolute top-0 left-0 pointer-events-none motion-reduce:hidden"
      width={viewBox.w}
      height={viewBox.h}
      viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
      fill="none"
    >
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse">
          <stop stopColor={gradientStart} stopOpacity="0" />
          <stop offset="0.3" stopColor={gradientStop} stopOpacity="0.9" />
          <stop offset="1" stopColor={gradientStart} stopOpacity="0" />
          <animate
            attributeName="x1"
            values={reverse ? `${viewBox.w};-200` : `-200;${viewBox.w}`}
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values={reverse ? `${viewBox.w + 200};0` : `0;${viewBox.w + 200}`}
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      {/* Faint base path */}
      <path d={path} stroke={pathColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Animated beam */}
      <path
        d={path}
        stroke={`url(#${gid})`}
        strokeWidth={strokeWidth + 0.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

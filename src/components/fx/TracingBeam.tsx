import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

interface TracingBeamProps {
  children: ReactNode;
  className?: string;
}

/**
 * Editorial scroll beam for long-form content (blog posts).
 * A thin vertical track on the left edge fills with brand-green
 * proportional to reading progress. A small accent dot leads the beam.
 *
 * Progress is derived from the beam container's scroll offset within
 * the viewport — NOT the full page. This makes it behave correctly
 * even with headers/footers above and below the article.
 *
 * Respects prefers-reduced-motion (beam snaps to full length).
 */
export default function TracingBeam({ children, className = '' }: TracingBeamProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 30%', 'end 70%'],
  });

  // Smooth spring for the progress value
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 500,
    damping: 90,
  });

  // Transform 0..1 into height percentage for the filled beam
  const filledHeight = useTransform(smoothed, [0, 1], ['0%', '100%']);
  const dotY = useTransform(smoothed, [0, 1], ['0%', '100%']);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Track — hidden on small viewports (not enough space) */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute -left-10 xl:-left-14 top-0 bottom-0 w-px motion-reduce:hidden"
      >
        {/* Background faint track */}
        <div className="absolute inset-0 w-px bg-line" />
        {/* Filled beam (brand green) */}
        <motion.div
          className="absolute top-0 left-0 w-px bg-gradient-to-b from-brand via-brand to-brand-accent"
          style={{ height: filledHeight }}
        />
        {/* Leading accent dot */}
        <motion.div
          className="absolute -left-[3px] w-[7px] h-[7px] rounded-full bg-brand-accent shadow-[0_0_12px_rgba(74,222,128,0.6)]"
          style={{ top: dotY, translateY: '-50%' }}
        />
      </div>
      {children}
    </div>
  );
}

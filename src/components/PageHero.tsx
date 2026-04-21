import { motion } from 'framer-motion';
import Spotlight from './fx/Spotlight';
import InteractiveGrid from './fx/InteractiveGrid';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

interface PageHeroProps {
  label: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Highlight substring — renders in brand-accent color */
  highlight?: string;
  /** Use smaller hero scale (for inner pages with long titles). Default: true */
  compact?: boolean;
}

export default function PageHero({
  label,
  title,
  description,
  children,
  highlight,
  compact = true,
}: PageHeroProps) {
  const titleClass = compact ? 'heading-hero-sm' : 'heading-hero';

  const renderTitle = () => {
    if (!highlight) return title;
    const parts = title.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="text-brand-accent">{highlight}</span>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  return (
    <section className="relative bg-surface-inverse text-white overflow-hidden">
      <InteractiveGrid cellSize={64} />
      <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
      <Spotlight size={600} />

      <div className="relative section-container pt-24 md:pt-36 pb-20 md:pb-28">
        <motion.p
          className="section-label-light"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
        >
          {label}
        </motion.p>

        <motion.h1
          className={`${titleClass} text-white mt-6 mb-8 max-w-[18ch]`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        >
          {renderTitle()}
        </motion.h1>

        {description && (
          <motion.p
            className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          >
            {description}
          </motion.p>
        )}

        {children && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease: EASE }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

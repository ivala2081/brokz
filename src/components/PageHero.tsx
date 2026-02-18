import { motion } from 'framer-motion';

const ease = [0.21, 0.47, 0.32, 0.98];

interface PageHeroProps {
  label: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function PageHero({ label, title, description, children }: PageHeroProps) {
  return (
    <section className="relative bg-brand-dark text-white overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(8,115,49,0.12),transparent)] pointer-events-none" />

      <div className="relative section-container py-24 md:py-32">
        <motion.p
          className="section-label-light mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          {label}
        </motion.p>
        <motion.h1
          className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl mb-5 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-gray-300 text-lg max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
        >
          {description}
        </motion.p>
        {children && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.44, ease }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

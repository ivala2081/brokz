import { motion } from 'framer-motion';

interface AnimateInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'left' | 'none';
  duration?: number;
}

const easing = [0.21, 0.47, 0.32, 0.98] as const;

export default function AnimateIn({
  children,
  delay = 0,
  className,
  direction = 'up',
  duration = 0.55,
}: AnimateInProps) {
  const y = direction === 'up' ? 28 : 0;
  const x = direction === 'left' ? -28 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: easing }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger wrapper — animates children one by one
interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export function Stagger({ children, className, staggerDelay = 0.08, initialDelay = 0 }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

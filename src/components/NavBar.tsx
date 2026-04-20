import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrokzLogoCompact } from './BrokzLogo';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

// Threshold (px): scroll past this = "scrolled" state (white bg, dark text)
// Below = "at-top" state (transparent over dark hero, light text)
const SCROLL_THRESHOLD = 80;

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Solutions', path: '/solutions' },
  { label: 'Products', path: '/products' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blog' },
];

// ─── Animation variants ───────────────────────────────────────────────

const menuVariants = {
  open: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
  closed: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: EASE },
  },
  closed: {
    y: 32,
    opacity: 0,
    transition: { duration: 0.3, ease: EASE },
  },
};

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > SCROLL_THRESHOLD);

      // Scroll progress 0..1
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Reset progress when route changes (scrollTop happens after)
  useEffect(() => {
    setOpen(false);
    setScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, [location.pathname]);

  // Lock body scroll + handle Escape when mobile menu open
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Navbar always in light mode — solid white bg, brand logo, dark text.
  // Scrolled state only changes intensity (slight bg opacity + shadow).
  const navClasses = scrolled
    ? 'bg-white/98 backdrop-blur-md shadow-sm border-b border-line'
    : 'bg-white backdrop-blur border-b border-line-subtle';

  return (
    <>
      {/* ─── Skip link (visible on keyboard focus) ─── */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-tooltip focus-visible:bg-brand focus-visible:text-white focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-pill focus-visible:text-sm focus-visible:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2"
      >
        Skip to main content
      </a>

      <nav
        className={`w-full sticky top-0 z-sticky transition-all duration-base ease-standard ${navClasses}`}
      >
        <div className="max-w-layout mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 rounded-md -ml-1 px-1 py-1"
            aria-label="Brokz — Home"
          >
            <BrokzLogoCompact size={32} withWordmark variant="brand" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-base relative focus-visible:outline-none ${
                  location.pathname === link.path
                    ? 'text-brand'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-brand rounded-pill" />
                )}
              </Link>
            ))}
          </div>

          <Link
            to="/contact"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold bg-brand text-white px-5 py-2.5 rounded-pill hover:bg-brand-hover transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2"
          >
            Start a Project
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-ink-secondary hover:text-ink transition-colors duration-base rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring relative z-modal"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <div className="relative w-[22px] h-[22px]">
              <motion.span
                className="absolute left-0 right-0 h-[2px] bg-current rounded-pill"
                animate={open ? { top: '50%', rotate: 45, y: '-50%' } : { top: '33%', rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              />
              <motion.span
                className="absolute left-0 right-0 h-[2px] bg-current rounded-pill"
                animate={open ? { top: '50%', rotate: -45, y: '-50%' } : { top: '66%', rotate: 0, y: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              />
            </div>
          </button>
        </div>

        {/* ─── Scroll progress bar ─── */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="h-full bg-brand origin-left"
            style={{
              transform: `scaleX(${progress})`,
              transition: 'transform 120ms linear',
            }}
          />
        </div>
      </nav>

      {/* Skip-link target — focused when user activates "Skip to main content" */}
      <span id="main" tabIndex={-1} className="sr-only" aria-hidden="true">
        Main content
      </span>

      {/* ═══ Mobile Menu — Exaggerated Minimalism Full-Screen ═══ */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            className="md:hidden fixed inset-0 z-modal bg-surface-inverse text-white overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE } }}
            transition={{ duration: 0.3, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="absolute inset-0 pointer-events-none bg-grid-dark bg-[length:48px_48px]" />
            <div className="absolute inset-0 bg-brand-radial pointer-events-none" />

            <div className="relative min-h-full flex flex-col px-6 pt-24 pb-12">
              <motion.nav
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex flex-col"
              >
                {navLinks.map((link, i) => {
                  const active = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      variants={itemVariants}
                      className="border-b border-line-inverse"
                    >
                      <Link
                        to={link.path}
                        className="flex items-baseline justify-between py-6 group focus-visible:outline-none"
                      >
                        <div className="flex items-baseline gap-5">
                          <span className="font-mono tabular text-xs text-ink-muted">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1] transition-colors duration-base ${
                              active ? 'text-brand-accent' : 'text-white group-hover:text-brand-accent'
                            }`}
                            style={{ letterSpacing: '-0.04em' }}
                          >
                            {link.label}
                          </span>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="text-ink-muted group-hover:text-brand-accent transition-colors"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>

              <motion.div
                className="mt-auto pt-12 flex flex-col gap-8"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.5, ease: EASE } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <Link to="/contact" className="btn-primary w-full justify-center">
                  Start a Project
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>

                <div className="flex flex-col gap-4 pt-6 border-t border-line-inverse">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                    </span>
                    <span className="text-xs font-mono tabular text-ink-subtle">
                      All systems operational
                    </span>
                  </div>
                  <a
                    href="mailto:contact@brokz.io"
                    className="text-sm font-mono tabular text-ink-subtle hover:text-brand-accent transition-colors focus-visible:outline-none focus-visible:text-brand-accent w-fit"
                  >
                    contact@brokz.io
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

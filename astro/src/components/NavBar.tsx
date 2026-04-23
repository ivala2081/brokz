import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BrokzLogoCompact } from './BrokzLogo';
import LocalizedLink from '../i18n/LocalizedLink';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import { useCurrentLocale, useLocalePath } from '../i18n/useLocale';
import type { RouteKey } from '../lib/routes';
// Side-effect import — initializes i18next + resources on first island mount.
import '../i18n';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

// Scroll past this (px) → we're over light content. Below → over dark hero.
// All page heroes are at least 400px tall, so this threshold works globally.
const HERO_EXIT = 400;

const NAV_ITEMS: { key: RouteKey; label: string }[] = [
  { key: 'home',      label: 'nav.home' },
  { key: 'solutions', label: 'nav.solutions' },
  { key: 'products',  label: 'nav.products' },
  { key: 'about',     label: 'nav.about' },
  { key: 'blog',      label: 'nav.blog' },
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
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const localePath = useLocalePath();
  const [open, setOpen] = useState(false);
  // mode === 'over-dark' → header renders WHITE (contrasts with dark hero)
  // mode === 'over-light' → header renders DARK (contrasts with white content)
  const [mode, setMode] = useState<'over-dark' | 'over-light'>('over-dark');
  const [progress, setProgress] = useState(0);
  // Astro is static-router-free: reflect the real pathname client-side
  // after hydration, then re-read whenever a navigation happens (popstate).
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '',
  );

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setMode(y < HERO_EXIT ? 'over-dark' : 'over-light');

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

  useEffect(() => {
    setOpen(false);
    const y = window.scrollY;
    setMode(y < HERO_EXIT ? 'over-dark' : 'over-light');
  }, [pathname]);

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

  // ─── Mode-dependent classes ──────────────────────────────────────────

  const overDark = mode === 'over-dark';

  const navClasses = overDark
    // WHITE header over dark hero — solid, no blur, sharp shadow
    ? 'bg-white border-b border-line shadow-[0_1px_0_rgba(0,0,0,0.04)]'
    // DARK header over light content
    : 'bg-surface-inverse border-b border-line-inverse';

  const linkIdle = overDark
    ? 'text-ink-secondary hover:text-ink'
    : 'text-gray-300 hover:text-white';
  const linkActive = overDark ? 'text-brand' : 'text-brand-accent';
  const activeBar = overDark ? 'bg-brand' : 'bg-brand-accent';

  // CTA stays brand-green on both modes — brand color is context-independent
  const ctaClasses = 'bg-brand text-white hover:bg-brand-hover';

  const hamburger = overDark ? 'text-ink-secondary hover:text-ink' : 'text-white hover:text-gray-200';
  const logoVariant = overDark ? 'brand' : 'light';
  const progressColor = overDark ? 'bg-brand' : 'bg-brand-accent';

  // Active-link detection — compare against the current-locale path for each item.
  const isActiveKey = (key: RouteKey) => pathname === localePath(key);

  return (
    <>
      {/* ─── Skip link (visible on keyboard focus) ─── */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-tooltip focus-visible:bg-brand focus-visible:text-white focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-pill focus-visible:text-sm focus-visible:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2"
      >
        {t('a11y.skipToMain')}
      </a>

      <nav
        className={`w-full sticky top-0 z-sticky transition-colors duration-base ease-standard ${navClasses}`}
      >
        <div className="max-w-layout mx-auto px-6 md:px-8 h-20 flex items-center justify-between gap-6">
          <LocalizedLink
            to="home"
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-4 rounded-md"
            aria-label={t('a11y.brokzHome')}
          >
            <BrokzLogoCompact size={56} withWordmark variant={logoVariant} />
          </LocalizedLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map(item => {
              const active = isActiveKey(item.key);
              return (
                <LocalizedLink
                  key={item.key}
                  to={item.key}
                  className={`text-sm font-medium transition-colors duration-base relative focus-visible:outline-none ${
                    active ? linkActive : linkIdle
                  }`}
                >
                  {t(item.label)}
                  {active && (
                    <span className={`absolute -bottom-[30px] left-0 right-0 h-[2px] rounded-pill ${activeBar}`} />
                  )}
                </LocalizedLink>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <LanguageSwitcher tone={overDark ? 'on-light' : 'on-dark'} />
            <a
              href="/auth/login"
              className={`text-sm font-medium transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 rounded-md ${linkIdle} hover:text-brand`}
            >
              {t('cta.signIn')}
            </a>
            <LocalizedLink
              to="contact"
              className={`inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-pill transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 ${ctaClasses}`}
            >
              {t('cta.startProject')}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </LocalizedLink>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={`md:hidden p-2 transition-colors duration-base rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring relative z-modal ${hamburger}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? t('a11y.closeMenu') : t('a11y.openMenu')}
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
            className={`h-full origin-left ${progressColor}`}
            style={{
              transform: `scaleX(${progress})`,
              transition: 'transform 120ms linear',
            }}
          />
        </div>
      </nav>

      {/* Skip-link target — focused when user activates "Skip to main content" */}
      <span id="main" tabIndex={-1} className="sr-only" aria-hidden="true">
        {t('a11y.mainContent')}
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
            aria-label={t('a11y.openMenu')}
            lang={locale}
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
                {NAV_ITEMS.map((item, i) => {
                  const active = isActiveKey(item.key);
                  return (
                    <motion.div
                      key={item.key}
                      variants={itemVariants}
                      className="border-b border-line-inverse"
                    >
                      <LocalizedLink
                        to={item.key}
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
                            {t(item.label)}
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
                      </LocalizedLink>
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
                <LocalizedLink to="contact" className="btn-primary w-full justify-center">
                  {t('cta.startProject')}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </LocalizedLink>
                <a
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full py-3 text-sm font-medium text-white/80 border border-line-inverse rounded-pill hover:text-brand-accent hover:border-brand-accent transition-colors"
                >
                  {t('nav.portal')}
                </a>

                <div className="flex flex-col gap-4 pt-6 border-t border-line-inverse">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                    </span>
                    <span className="text-xs font-mono tabular text-ink-subtle">
                      {t('status.operational')}
                    </span>
                  </div>
                  <a
                    href="mailto:contact@brokztech.com"
                    className="text-sm font-mono tabular text-ink-subtle hover:text-brand-accent transition-colors focus-visible:outline-none focus-visible:text-brand-accent w-fit"
                  >
                    contact@brokztech.com
                  </a>
                  <div className="pt-2">
                    <LanguageSwitcher tone="on-dark" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

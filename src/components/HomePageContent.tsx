import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AnimateIn, { Stagger, StaggerItem } from './AnimateIn';
import Spotlight from './fx/Spotlight';
import InteractiveGrid from './fx/InteractiveGrid';
import GlareCard from './fx/GlareCard';
import ReferenceArchitecture from './sections/ReferenceArchitecture';
import BrandIntroSection from './sections/BrandIntroSection';
import HowWeEngage from './sections/HowWeEngage';
import LocalizedLink from '../i18n/LocalizedLink';
// Side-effect: ensures i18next is initialized before translations run.
import '../i18n';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

// ─── icons (SVG only — no emoji) ─────────────────────────────────────────

const Icons = {
  arrow: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  layers: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  cpu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="2" x2="9" y2="4" /><line x1="15" y1="2" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="22" /><line x1="15" y1="20" x2="15" y2="22" />
      <line x1="20" y1="9" x2="22" y2="9" /><line x1="20" y1="15" x2="22" y2="15" />
      <line x1="2" y1="9" x2="4" y2="9" /><line x1="2" y1="15" x2="4" y2="15" />
    </svg>
  ),
  activity: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  network: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
};

// ─── content (icons stay here, copy comes from i18n) ─────────────────────

const CAPABILITY_KEYS = [
  { key: 'platforms', icon: Icons.layers },
  { key: 'algo',      icon: Icons.cpu },
  { key: 'mt',        icon: Icons.network },
  { key: 'data',      icon: Icons.activity },
] as const;

const TRUST_KEYS = ['brokerages', 'prop', 'fintech', 'lp'] as const;

// ─── page ────────────────────────────────────────────────────────────────

export default function HomePageContent() {
  const { t } = useTranslation(['home', 'common']);

  return (
    <>
      {/* ═══ HERO — Exaggerated Minimalism ═══ */}
      <section className="relative bg-surface-inverse text-white overflow-hidden">
        <InteractiveGrid cellSize={64} />
        <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
        <Spotlight size={700} />

        <div className="relative section-container pt-20 md:pt-28 pb-16 md:pb-20">
          <motion.p
            className="section-label-light"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          >
            {t('home:hero.eyebrow')}
          </motion.p>

          <motion.h1
            className="heading-hero text-white max-w-[18ch] mt-6 mb-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            {t('home:hero.titleLead')}{' '}
            <span className="text-brand-accent">{t('home:hero.titleAccent')}</span>{' '}
            {t('home:hero.titleTail')}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          >
            {t('home:hero.body')}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease: EASE }}
          >
            <LocalizedLink to="contact" className="btn-primary btn-shimmer">
              {t('common:cta.startProject')}
              {Icons.arrow}
            </LocalizedLink>
            <LocalizedLink to="solutions" className="btn-ghost">
              {t('common:cta.exploreSolutions')}
            </LocalizedLink>
          </motion.div>
        </div>
      </section>

      {/* ═══ CAPABILITIES — Features ═══ */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="max-w-3xl mb-20 md:mb-28">
            <AnimateIn>
              <p className="section-label">{t('home:capabilities.eyebrow')}</p>
              <h2 className="heading-hero-sm text-ink mb-8">
                {t('home:capabilities.titleLead')}{' '}
                <span className="text-brand">{t('home:capabilities.titleAccent')}</span>{' '}
                {t('home:capabilities.titleTail')}
              </h2>
              <p className="body-lg max-w-2xl">
                {t('home:capabilities.body')}
              </p>
            </AnimateIn>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line rounded-card overflow-hidden border border-line">
            {CAPABILITY_KEYS.map(cap => (
              <StaggerItem key={cap.key}>
                <GlareCard className="bg-surface p-10 md:p-12 h-full group cursor-default">
                  <div className="text-brand mb-8 transition-transform duration-base group-hover:scale-110 origin-left w-fit">
                    {cap.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-ink mb-4 tracking-tight leading-tight">
                    {t(`home:capabilities.items.${cap.key}.title`)}
                  </h3>
                  <p className="body text-ink-secondary max-w-md">
                    {t(`home:capabilities.items.${cap.key}.desc`)}
                  </p>
                </GlareCard>
              </StaggerItem>
            ))}
          </Stagger>

          <AnimateIn>
            <div className="mt-12 flex justify-end">
              <LocalizedLink to="products" className="btn-link">
                {t('home:capabilities.viewAll')}
                {Icons.arrow}
              </LocalizedLink>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ═══ REFERENCE ARCHITECTURE — How the stack composes ═══ */}
      <ReferenceArchitecture />

      {/* ═══ BRAND INTRO — Identity reveal (visual-only, no copy) ═══ */}
      <BrandIntroSection />

      {/* ═══ TRUST BAND — Who we work with ═══ */}
      <section className="section-padding bg-surface-muted border-y border-line">
        <div className="section-container">
          <AnimateIn>
            <p className="section-label">{t('home:trust.eyebrow')}</p>
            <h2 className="heading-2 text-ink max-w-3xl mb-14">
              {t('home:trust.title')}
            </h2>
          </AnimateIn>

          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {TRUST_KEYS.map(key => (
              <StaggerItem key={key}>
                <div className="border-t-2 border-brand pt-5">
                  <p className="text-lg font-semibold text-ink mb-2 tracking-tight">
                    {t(`home:trust.items.${key}.label`)}
                  </p>
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    {t(`home:trust.items.${key}.desc`)}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ HOW WE ENGAGE — Process transparency ═══ */}
      <HowWeEngage />
    </>
  );
}

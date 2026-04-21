import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Spotlight from '../components/fx/Spotlight';
import InteractiveGrid from '../components/fx/InteractiveGrid';
import LocalizedLink from '../i18n/LocalizedLink';
import type { RouteKey } from '../i18n/routes';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const SUGGESTIONS: { i18nKey: string; route: RouteKey }[] = [
  { i18nKey: 'home',      route: 'home' },
  { i18nKey: 'solutions', route: 'solutions' },
  { i18nKey: 'products',  route: 'products' },
  { i18nKey: 'blog',      route: 'blog' },
  { i18nKey: 'contact',   route: 'contact' },
];

export default function NotFoundPage() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <SEO
        title={t('notFound.seoTitle')}
        description={t('notFound.seoDescription')}
        noindex
      />

      <NavBar />

      {/* Hero */}
      <section className="relative bg-surface-inverse text-white overflow-hidden flex-1 flex items-center">
        <InteractiveGrid cellSize={48} />
        <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
        <Spotlight size={600} />

        <div className="relative section-container py-24 md:py-32 w-full">
          <div className="max-w-3xl">
            <motion.p
              className="section-label-light"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            >
              {t('notFound.eyebrow')}
            </motion.p>

            <motion.h1
              className="heading-display text-white mb-6 font-mono tabular"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            >
              404
            </motion.h1>

            <motion.h2
              className="heading-2 text-white mb-5 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            >
              {t('notFound.subtitle')}
            </motion.h2>

            <motion.p
              className="text-gray-300 text-lg leading-relaxed max-w-xl mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
            >
              {t('notFound.body')}
            </motion.p>

            {location.pathname && (
              <motion.p
                className="text-sm text-ink-subtle font-mono mb-10 truncate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {t('notFound.requestedLabel')} <span className="text-brand-accent">{location.pathname}</span>
              </motion.p>
            )}

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
            >
              <LocalizedLink to="home" className="btn-primary">
                {t('notFound.ctaReturnHome')}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </LocalizedLink>
              <LocalizedLink to="contact" className="btn-ghost">
                {t('notFound.ctaReportLink')}
              </LocalizedLink>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Suggested destinations */}
      <section className="section-padding-sm bg-surface">
        <div className="section-container">
          <p className="section-label">{t('notFound.suggestionsLabel')}</p>
          <h2 className="heading-3 text-ink mb-8">{t('notFound.suggestionsTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUGGESTIONS.map((item, i) => {
              const label = t(`notFound.suggestions.${item.i18nKey}.label`);
              return (
                <motion.div
                  key={item.i18nKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
                >
                  <LocalizedLink to={item.route} className="card-interactive block group">
                    <h3 className="heading-4 text-ink mb-2 group-hover:text-brand transition-colors">
                      {label}
                    </h3>
                    <p className="body-sm">{t(`notFound.suggestions.${item.i18nKey}.description`)}</p>
                    <span className="btn-link mt-4">
                      {t('notFound.visitPrefix')} {label}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </LocalizedLink>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

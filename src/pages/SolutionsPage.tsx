import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import { Stagger, StaggerItem } from '../components/AnimateIn';
import { service, breadcrumbList } from '../lib/jsonld';
import { useLocation } from 'react-router-dom';
import { localeFromPath } from '../i18n/routes';

type SolutionItem = {
  key: string;
  title: string;
  description: string;
  capabilities: string[];
};

export default function SolutionsPage() {
  const { t } = useTranslation('solutions');
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);
  const items = t('items', { returnObjects: true }) as SolutionItem[];

  const serviceSchema = service({
    name: t('seo.title'),
    description: t('seo.description'),
    path: pathname,
    serviceType: 'Fintech infrastructure & solutions',
  });

  const breadcrumbSchema = breadcrumbList([
    { name: locale === 'tr' ? 'Ana Sayfa' : 'Home',      path: locale === 'tr' ? '/tr' : '/' },
    { name: t('hero.label'),                              path: pathname },
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        keywords={t('seo.keywords')}
        jsonLd={[serviceSchema, breadcrumbSchema]}
      />

      <NavBar />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        highlight={t('hero.highlight')}
        description={t('hero.description')}
      />

      {/* Solutions — massive typography, alternating layout */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <Stagger className="flex flex-col divide-y divide-line">
            {items.map((sol, i) => (
              <StaggerItem key={sol.key}>
                <motion.div
                  className="py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 group"
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.4)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="lg:col-span-5">
                    <div className="flex items-baseline gap-5 mb-5">
                      <span className="font-mono tabular text-lg md:text-xl font-semibold text-brand">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink tracking-tight leading-[1.1]">
                      {sol.title}
                    </h2>
                  </div>
                  <div className="lg:col-span-7">
                    <p className="body mb-8 max-w-2xl">{sol.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {sol.capabilities.map((cap, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-ink-secondary leading-relaxed">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Footer />
    </div>
  );
}

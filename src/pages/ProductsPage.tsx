import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn, { Stagger, StaggerItem } from '../components/AnimateIn';
import { service, breadcrumbList } from '../lib/jsonld';
import { useLocation } from 'react-router-dom';
import { localeFromPath } from '../i18n/routes';

type ProductItem = {
  key: string;
  name: string;
  tag: string;
  description: string;
  features: string[];
};

export default function ProductsPage() {
  const { t } = useTranslation('products');
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);
  const items = t('items', { returnObjects: true }) as ProductItem[];

  const serviceSchema = service({
    name: t('seo.title'),
    description: t('seo.description'),
    path: pathname,
    serviceType: 'Fintech software products',
  });

  const breadcrumbSchema = breadcrumbList([
    { name: locale === 'tr' ? 'Ana Sayfa' : 'Home', path: locale === 'tr' ? '/tr' : '/' },
    { name: t('hero.label'),                         path: pathname },
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

      {/* Products */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="flex flex-col divide-y divide-line">
            {items.map(product => (
              <AnimateIn key={product.key} delay={0.05}>
                <div className="py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-5">
                    <span className="badge-brand mb-5">{product.tag}</span>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink tracking-tight leading-[1.1] mt-1">
                      {product.name}
                    </h2>
                  </div>
                  <div className="lg:col-span-7">
                    <p className="body mb-8 max-w-2xl">{product.description}</p>
                    <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-3" staggerDelay={0.04}>
                      {product.features.map((feat, j) => (
                        <StaggerItem key={j}>
                          <motion.div
                            className="flex items-start gap-3 p-4 rounded-card-sm bg-surface-muted border border-line"
                            whileHover={{ borderColor: 'rgba(0, 192, 51,0.3)', backgroundColor: '#ffffff' }}
                            transition={{ duration: 0.15 }}
                          >
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                            <span className="text-sm text-ink-secondary leading-relaxed">{feat}</span>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

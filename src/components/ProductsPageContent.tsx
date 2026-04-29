import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PageHero from './PageHero';
import AnimateIn, { Stagger, StaggerItem } from './AnimateIn';
import LocalizedLink from '../i18n/LocalizedLink';
import type { RouteKey } from '../lib/routes';
import '../i18n';

const ArrowIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const PRODUCT_DETAIL_ROUTES: Record<string, RouteKey> = {
  webTrader: 'productWebtrader',
  dashboard: 'productManager',
};

type ProductItem = {
  key: string;
  name: string;
  tag: string;
  description: string;
  features: string[];
};

export default function ProductsPageContent() {
  const { t } = useTranslation('products');
  const items = t('items', { returnObjects: true }) as ProductItem[];

  return (
    <>
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
                    {PRODUCT_DETAIL_ROUTES[product.key] && (
                      <div className="mt-6">
                        <LocalizedLink
                          to={PRODUCT_DETAIL_ROUTES[product.key]!}
                          className="btn-link text-sm inline-flex items-center gap-1.5"
                        >
                          Learn more
                          {ArrowIcon}
                        </LocalizedLink>
                      </div>
                    )}
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}

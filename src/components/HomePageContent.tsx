import { useTranslation } from 'react-i18next';
import AnimateIn, { Stagger, StaggerItem } from './AnimateIn';
import { Hero195 } from './ui/hero-195';
import { BentoGrid } from './ui/bento-grid';
import { Layers, Cpu, Activity, Network } from 'lucide-react';
import { useLocalePath } from '../i18n/useLocale';
import type { RouteKey } from '../lib/routes';
// Side-effect: ensures i18next is initialized before translations run.
import '../i18n';

// ─── content (icons stay here, copy comes from i18n) ─────────────────────

const CAPABILITY_KEYS: Array<{
  key: string;
  icon: React.ReactNode;
  colSpan: number;
  hasPersistentHover?: boolean;
  routeKey: RouteKey;
}> = [
  { key: 'platforms', icon: <Layers className="w-4 h-4 text-brand" />,   colSpan: 2, hasPersistentHover: true, routeKey: 'productWebtrader' },
  { key: 'algo',      icon: <Cpu     className="w-4 h-4 text-brand" />,  colSpan: 1, routeKey: 'productAlgo' },
  { key: 'mt',        icon: <Network className="w-4 h-4 text-brand" />,  colSpan: 1, routeKey: 'productMt' },
  { key: 'data',      icon: <Activity className="w-4 h-4 text-brand" />, colSpan: 2, routeKey: 'productManager' },
];

const TRUST_KEYS = ['brokerages', 'prop', 'fintech', 'lp'] as const;

// ─── page ────────────────────────────────────────────────────────────────

export default function HomePageContent() {
  const { t } = useTranslation(['home', 'common']);
  const localePath = useLocalePath();

  return (
    <>
      {/* ═══ HERO — hero-195 ═══ */}
      <Hero195 />

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

          <AnimateIn>
            <BentoGrid
              items={CAPABILITY_KEYS.map(cap => ({
                title: t(`home:capabilities.items.${cap.key}.title`),
                description: t(`home:capabilities.items.${cap.key}.desc`),
                icon: cap.icon,
                colSpan: cap.colSpan,
                hasPersistentHover: cap.hasPersistentHover ?? false,
                href: localePath(cap.routeKey),
              }))}
            />
          </AnimateIn>

        </div>
      </section>

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

    </>
  );
}

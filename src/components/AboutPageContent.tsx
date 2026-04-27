import { useTranslation } from 'react-i18next';
import PageHero from './PageHero';
import AnimateIn, { Stagger, StaggerItem } from './AnimateIn';
import Spotlight from './fx/Spotlight';
import InteractiveGrid from './fx/InteractiveGrid';
import GlareCard from './fx/GlareCard';
import '../i18n';

type PhilosophyItem = { key: string; title: string; body: string };
type ExpertiseItem  = { key: string; label: string; desc: string };

export default function AboutPageContent() {
  const { t } = useTranslation('about');

  const philosophyItems = t('philosophy.items', { returnObjects: true }) as PhilosophyItem[];
  const expertiseItems  = t('expertise.items',  { returnObjects: true }) as ExpertiseItem[];
  const infraItems      = t('infrastructure.items', { returnObjects: true }) as string[];

  return (
    <>
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        highlight={t('hero.highlight')}
        description={t('hero.description')}
      />

      {/* Mission */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <AnimateIn>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="section-label">{t('mission.label')}</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="heading-hero-sm text-ink mb-10 max-w-[18ch]">
                  {t('mission.titleLead')}{' '}
                  <span className="text-brand">{t('mission.titleAccent')}</span>
                  {t('mission.titleTail')}
                </h2>
                <p className="body-lg max-w-2xl">
                  {t('mission.body')}
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-surface-muted border-y border-line">
        <div className="section-container">
          <AnimateIn>
            <div className="max-w-3xl mb-16">
              <p className="section-label">{t('philosophy.label')}</p>
              <h2 className="heading-hero-sm text-ink max-w-[14ch]">
                {t('philosophy.title')}
              </h2>
            </div>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line rounded-card overflow-hidden border border-line">
            {philosophyItems.map((item, i) => (
              <StaggerItem key={item.key}>
                <GlareCard className="bg-surface p-10 md:p-12 h-full">
                  <div className="flex items-baseline gap-4 mb-5">
                    <span className="font-mono tabular text-sm font-semibold text-brand">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-ink mb-4 tracking-tight">{item.title}</h3>
                  <p className="body text-ink-secondary">{item.body}</p>
                </GlareCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Expertise */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <AnimateIn>
            <div className="max-w-3xl mb-16">
              <p className="section-label">{t('expertise.label')}</p>
              <h2 className="heading-hero-sm text-ink mb-8 max-w-[16ch]">
                {t('expertise.titleLead')}{' '}
                <span className="text-brand">{t('expertise.titleAccent')}</span>
              </h2>
              <p className="body-lg max-w-2xl">
                {t('expertise.body')}
              </p>
            </div>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertiseItems.map((item, i) => (
              <StaggerItem key={item.key}>
                <GlareCard className="card h-full transition-transform duration-base hover:-translate-y-1 hover:border-brand/30">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-mono tabular text-xs font-semibold text-brand bg-brand-subtle px-2 py-1 rounded-md">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2 tracking-tight">{item.label}</h3>
                  <p className="body-sm">{item.desc}</p>
                </GlareCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="section-padding bg-surface-inverse text-white relative overflow-hidden">
        <InteractiveGrid cellSize={64} />
        <Spotlight size={600} />

        <div className="relative section-container">
          <AnimateIn>
            <div className="max-w-3xl mb-16">
              <p className="section-label-light">{t('infrastructure.label')}</p>
              <h2 className="heading-hero-sm text-white mb-8 max-w-[16ch]">
                {t('infrastructure.title')}
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                {t('infrastructure.body')}
              </p>
            </div>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {infraItems.map(cap => (
              <StaggerItem key={cap}>
                <div className="flex items-start gap-3 border border-line-inverse rounded-card-sm p-5 h-full">
                  <svg className="mt-0.5 w-4 h-4 text-brand-accent flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-sm text-gray-300 leading-relaxed">{cap}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

    </>
  );
}

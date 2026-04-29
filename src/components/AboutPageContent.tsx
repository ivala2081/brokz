import { useTranslation } from 'react-i18next';
import AnimateIn, { Stagger, StaggerItem } from './AnimateIn';
import GlareCard from './fx/GlareCard';
import BrandIntroSection from './sections/BrandIntroSection';
import '../i18n';

type PhilosophyItem = { key: string; title: string; body: string };
type ExpertiseItem  = { key: string; label: string; desc: string };

export default function AboutPageContent() {
  const { t } = useTranslation('about');

  const philosophyItems = t('philosophy.items', { returnObjects: true }) as PhilosophyItem[];
  const expertiseItems  = t('expertise.items',  { returnObjects: true }) as ExpertiseItem[];

  return (
    <>
      <BrandIntroSection />

      {/* Mission */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <AnimateIn>
            <div className="max-w-3xl mb-10">
              <p className="section-label">{t('mission.label')}</p>
              <h2 className="heading-hero-sm text-ink mb-8 max-w-[18ch]">
                {t('mission.titleLead')}{' '}
                <span className="text-brand">{t('mission.titleAccent')}</span>
                {t('mission.titleTail')}
              </h2>
              <p className="body-lg max-w-2xl">
                {t('mission.body')}
              </p>
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

    </>
  );
}

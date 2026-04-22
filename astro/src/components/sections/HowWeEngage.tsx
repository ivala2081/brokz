import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AnimateIn, { Stagger, StaggerItem } from '../AnimateIn';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const PHASE_KEYS = ['discovery', 'architecture', 'build', 'deploy'] as const;

export default function HowWeEngage() {
  const { t } = useTranslation('home');

  return (
    <section className="section-padding bg-surface">
      <div className="section-container">
        <AnimateIn>
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="section-label">{t('howWeEngage.eyebrow')}</p>
            <h2 className="heading-hero-sm text-ink mb-8 max-w-[16ch]">
              {t('howWeEngage.titleLead')}{' '}
              <span className="text-brand">{t('howWeEngage.titleAccent')}</span>
            </h2>
            <p className="body-lg max-w-2xl">
              {t('howWeEngage.body')}
            </p>
          </div>
        </AnimateIn>

        <Stagger className="flex flex-col divide-y divide-line">
          {PHASE_KEYS.map((key, i) => {
            const deliverables = t(`howWeEngage.phases.${key}.deliverables`, {
              returnObjects: true,
            }) as string[];
            return (
              <StaggerItem key={key}>
                <motion.div
                  className="py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 group"
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.4)' }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  {/* Number + phase title + duration */}
                  <div className="lg:col-span-4">
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="font-mono tabular text-lg md:text-xl font-semibold text-brand">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-ink tracking-tight leading-[1.1] mb-2">
                      {t(`howWeEngage.phases.${key}.title`)}
                    </h3>
                    <p className="text-xs font-mono tabular text-ink-muted uppercase tracking-[0.08em]">
                      {t('howWeEngage.typicalPrefix')} {t(`howWeEngage.phases.${key}.duration`)}
                    </p>
                  </div>

                  {/* Body + deliverables */}
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-7">
                      <p className="body text-ink-secondary">
                        {t(`howWeEngage.phases.${key}.body`)}
                      </p>
                    </div>
                    <div className="md:col-span-5">
                      <p className="eyebrow text-ink-muted mb-3">
                        {t('howWeEngage.deliverablesLabel')}
                      </p>
                      <ul className="flex flex-col gap-2">
                        {deliverables.map((d, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2.5 text-sm text-ink-secondary leading-relaxed"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Phase connector line on lg+ (except last) */}
                  {i < PHASE_KEYS.length - 1 && (
                    <div
                      className="hidden lg:block absolute left-6 top-full h-10 w-px bg-line"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AnimateIn, { Stagger, StaggerItem } from '../AnimateIn';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const PHASE_KEYS = ['discovery', 'architecture', 'build', 'deploy'] as const;
type PhaseKey = (typeof PHASE_KEYS)[number];

// Proportional segment weights — mid-point of each duration range (weeks)
// Discovery 1–2w → 1.5 · Architecture 2–3w → 2.5 · Build 8–16w → 12 · Deploy 2–4w → 3
// Scaled ×2 for integer flex-grow values.
const PHASE_WEIGHTS: Record<PhaseKey, number> = {
  discovery: 3,
  architecture: 5,
  build: 24,
  deploy: 6,
};

export default function HowWeEngage() {
  const { t } = useTranslation('home');

  return (
    <section className="section-padding bg-surface">
      <div className="section-container">
        {/* ═══ HEADER ═══ */}
        <AnimateIn>
          <div className="max-w-3xl mb-14 md:mb-16">
            <p className="section-label">{t('howWeEngage.eyebrow')}</p>
            <h2 className="heading-hero-sm text-ink mb-8 max-w-[16ch]">
              {t('howWeEngage.titleLead')}{' '}
              <span className="text-brand">{t('howWeEngage.titleAccent')}</span>
            </h2>
            <p className="body-lg max-w-2xl">{t('howWeEngage.body')}</p>
          </div>
        </AnimateIn>

        {/* ═══ PROPORTIONAL TIMELINE BAR ═══ */}
        <AnimateIn>
          <div className="mb-14 md:mb-20">
            <div className="flex gap-1">
              {PHASE_KEYS.map((key, i) => (
                <div
                  key={key}
                  className="h-2 rounded-full bg-line overflow-hidden relative"
                  style={{ flexGrow: PHASE_WEIGHTS[key] }}
                >
                  <motion.div
                    className="absolute inset-0 bg-brand origin-left"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: EASE }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-1">
              {PHASE_KEYS.map(key => (
                <div
                  key={key}
                  className="min-w-0"
                  style={{ flexGrow: PHASE_WEIGHTS[key] }}
                >
                  <p className="font-mono tabular text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-ink-muted truncate">
                    {t(`howWeEngage.phases.${key}.duration`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* ═══ TILTED ENGAGEMENT DIAGRAM — desktop only ═══ */}
        <AnimateIn>
          <div
            className="hidden md:block mb-16 md:mb-24"
            style={{ perspective: '1600px' }}
          >
            <div
              className="relative grid grid-cols-4 gap-5 lg:gap-8 rounded-2xl border border-line bg-surface-muted p-10 lg:p-14 shadow-[0_40px_80px_-30px_rgba(5,10,6,0.16),0_2px_8px_-2px_rgba(5,10,6,0.05)]"
              style={{
                transform: 'rotateX(10deg)',
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 100%',
              }}
            >
              {/* Spine — static horizontal connector behind cards */}
              <div
                className="pointer-events-none absolute top-1/2 left-10 right-10 lg:left-14 lg:right-14 -translate-y-1/2 h-px bg-line overflow-hidden"
                aria-hidden="true"
              >
                <motion.div
                  className="absolute inset-y-0 left-0 right-0 bg-brand origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.4, delay: 0.25, ease: EASE }}
                />
              </div>

              {PHASE_KEYS.map((key, i) => (
                <div
                  key={key}
                  className="relative z-10 rounded-lg border border-line bg-surface px-5 py-6 shadow-[0_2px_6px_-1px_rgba(5,10,6,0.06),0_1px_2px_rgba(5,10,6,0.04)]"
                >
                  <p className="font-mono tabular text-2xl lg:text-3xl font-semibold text-brand leading-none mb-3">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-sm lg:text-base font-bold text-ink tracking-tight leading-tight mb-1.5">
                    {t(`howWeEngage.phases.${key}.title`)}
                  </h3>
                  <p className="font-mono tabular text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                    {t(`howWeEngage.phases.${key}.duration`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* ═══ PHASE DETAILS — full copy + deliverables ═══ */}
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
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

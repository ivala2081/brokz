import { motion } from 'framer-motion';
import AnimateIn, { Stagger, StaggerItem } from '../AnimateIn';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const phases = [
  {
    number: '01',
    title: 'Discovery',
    duration: '1–2 weeks',
    body: 'Technical scoping with your engineering team. We audit existing infrastructure, identify integration surfaces, and document latency, compliance, and operational constraints.',
    deliverables: [
      'Architecture assessment',
      'Integration map',
      'Scope + timeline draft',
    ],
  },
  {
    number: '02',
    title: 'Architecture',
    duration: '2–3 weeks',
    body: 'System design before implementation. We specify module boundaries, data flows, failure modes, and monitoring surfaces. Every decision is reviewed with your team before code is written.',
    deliverables: [
      'System design document',
      'API + schema specifications',
      'Risk & observability plan',
    ],
  },
  {
    number: '03',
    title: 'Build',
    duration: '8–16 weeks',
    body: 'Iterative delivery with weekly demos. We build the core stack, integrate upstream connectivity, harden the risk layer, and ship client-facing surfaces against production-like environments from week one.',
    deliverables: [
      'Weekly release cadence',
      'Documented, reviewed codebase',
      'Staging environment',
    ],
  },
  {
    number: '04',
    title: 'Deploy & Handover',
    duration: '2–4 weeks',
    body: 'Production cutover with full knowledge transfer. Your team owns the system — the codebase, the infrastructure, the operational runbook. No vendor lock, no hidden dependencies.',
    deliverables: [
      'Production deployment',
      'Runbook + handover docs',
      'Knowledge transfer sessions',
    ],
  },
];

export default function HowWeEngage() {
  return (
    <section className="section-padding bg-surface">
      <div className="section-container">
        <AnimateIn>
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="section-label">How We Engage</p>
            <h2 className="heading-hero-sm text-ink mb-8 max-w-[16ch]">
              Four phases. <span className="text-brand">One delivery.</span>
            </h2>
            <p className="body-lg max-w-2xl">
              Every engagement moves through the same structured path — scoped
              before commitment, architected before code, delivered with ownership.
            </p>
          </div>
        </AnimateIn>

        <Stagger className="flex flex-col divide-y divide-line">
          {phases.map((phase, i) => (
            <StaggerItem key={phase.number}>
              <motion.div
                className="py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 group"
                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.4)' }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                {/* Number + phase title + duration */}
                <div className="lg:col-span-4">
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="font-mono tabular text-lg md:text-xl font-semibold text-brand">
                      {phase.number}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-ink tracking-tight leading-[1.1] mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-xs font-mono tabular text-ink-muted uppercase tracking-[0.08em]">
                    Typical: {phase.duration}
                  </p>
                </div>

                {/* Body + deliverables */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-7">
                    <p className="body text-ink-secondary">{phase.body}</p>
                  </div>
                  <div className="md:col-span-5">
                    <p className="eyebrow text-ink-muted mb-3">Deliverables</p>
                    <ul className="flex flex-col gap-2">
                      {phase.deliverables.map((d, j) => (
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
                {i < phases.length - 1 && (
                  <div
                    className="hidden lg:block absolute left-6 top-full h-10 w-px bg-line"
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

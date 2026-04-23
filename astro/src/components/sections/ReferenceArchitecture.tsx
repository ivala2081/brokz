import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AnimateIn from '../AnimateIn';
import AnimatedBeam from '../fx/AnimatedBeam';

// ─── architecture model — structural keys only; copy comes from i18n ─────

type NodeKey = 'lp' | 'md' | 'pb' | 'reg' | 'gw' | 'risk' | 'bridge' | 'term' | 'dash' | 'analytics';

const UPSTREAM: NodeKey[]   = ['lp', 'md', 'pb', 'reg'];
const CORE: NodeKey[]       = ['gw', 'risk', 'bridge'];
const DOWNSTREAM: NodeKey[] = ['term', 'dash', 'analytics'];

// Beam connections — selective primary flows, not all-to-all
const connections: Array<{ from: NodeKey; to: NodeKey; delay: number }> = [
  // upstream → core
  { from: 'lp',   to: 'gw',        delay: 0.0 },
  { from: 'md',   to: 'gw',        delay: 0.6 },
  { from: 'md',   to: 'risk',      delay: 1.2 },
  { from: 'pb',   to: 'bridge',    delay: 0.3 },
  { from: 'reg',  to: 'risk',      delay: 0.9 },
  // core → downstream
  { from: 'gw',     to: 'term',      delay: 1.5 },
  { from: 'risk',   to: 'dash',      delay: 2.0 },
  { from: 'risk',   to: 'analytics', delay: 1.7 },
  { from: 'bridge', to: 'term',      delay: 2.2 },
  { from: 'bridge', to: 'analytics', delay: 2.5 },
];

// ─── layout helpers ──────────────────────────────────────────────────────

function Node({
  label,
  desc,
  nodeRef,
}: {
  label: string;
  desc: string;
  nodeRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={nodeRef}
      className="relative z-10 rounded-lg border border-line-inverse bg-surface-inverse/90 backdrop-blur px-4 py-3 md:px-5 md:py-4"
    >
      <p className="text-sm md:text-base font-semibold text-white leading-tight tracking-tight">
        {label}
      </p>
      <p className="mt-1 text-[11px] md:text-xs text-ink-subtle font-mono tabular">
        {desc}
      </p>
    </div>
  );
}

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow text-ink-muted text-center mb-5 md:mb-8">{children}</p>
  );
}

// ─── section ─────────────────────────────────────────────────────────────

export default function ReferenceArchitecture() {
  const { t } = useTranslation('home');
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for every node, keyed by id
  const refs: Record<NodeKey, React.RefObject<HTMLDivElement | null>> = {
    lp: useRef(null), md: useRef(null), pb: useRef(null), reg: useRef(null),
    gw: useRef(null), risk: useRef(null), bridge: useRef(null),
    term: useRef(null), dash: useRef(null), analytics: useRef(null),
  };

  const renderNodes = (keys: NodeKey[]) =>
    keys.map(k => (
      <Node
        key={k}
        label={t(`referenceArch.nodes.${k}.label`)}
        desc={t(`referenceArch.nodes.${k}.desc`)}
        nodeRef={refs[k]}
      />
    ));

  return (
    <section className="section-padding bg-surface-inverse text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-grid-dark bg-[length:64px_64px]" />
      <div className="absolute inset-0 bg-brand-radial pointer-events-none" />

      <div className="relative section-container">
        <AnimateIn>
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="section-label-light">{t('referenceArch.eyebrow')}</p>
            <h2 className="heading-hero-sm text-white mb-8 max-w-[16ch]">
              {t('referenceArch.titleLead')}{' '}
              <span className="text-brand-accent">{t('referenceArch.titleAccent')}</span>
              {t('referenceArch.titleTail')}
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
              {t('referenceArch.body')}
            </p>
          </div>
        </AnimateIn>

        {/* ═══ Diagram ═══ */}
        <div
          ref={containerRef}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 lg:gap-24"
        >
          {/* UPSTREAM */}
          <div className="flex flex-col">
            <ColumnLabel>{t('referenceArch.columns.upstream')}</ColumnLabel>
            <div className="flex flex-col gap-3 md:gap-4">
              {renderNodes(UPSTREAM)}
            </div>
          </div>

          {/* CORE */}
          <div className="flex flex-col">
            <ColumnLabel>
              <span className="text-brand-accent">{t('referenceArch.columns.core')}</span>
            </ColumnLabel>
            <div className="flex flex-col gap-3 md:gap-4 justify-center h-full">
              {renderNodes(CORE)}
            </div>
          </div>

          {/* DOWNSTREAM */}
          <div className="flex flex-col">
            <ColumnLabel>{t('referenceArch.columns.downstream')}</ColumnLabel>
            <div className="flex flex-col gap-3 md:gap-4 justify-center h-full">
              {renderNodes(DOWNSTREAM)}
            </div>
          </div>

          {/* Animated beams — only rendered on md+ (diagram is columnar) */}
          <div className="hidden md:contents">
            {connections.map(c => (
              <AnimatedBeam
                key={`${c.from}-${c.to}`}
                containerRef={containerRef}
                fromRef={refs[c.from]}
                toRef={refs[c.to]}
                duration={4}
                delay={c.delay}
                curvature={20}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

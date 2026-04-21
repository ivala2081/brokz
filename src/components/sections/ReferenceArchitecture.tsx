import { useRef } from 'react';
import AnimateIn from '../AnimateIn';
import AnimatedBeam from '../fx/AnimatedBeam';

// ─── architecture model ──────────────────────────────────────────────────

const upstream = [
  { id: 'lp',   label: 'Liquidity Providers',  desc: 'Multi-venue aggregation' },
  { id: 'md',   label: 'Market Data Feeds',    desc: 'Tick-level, normalized' },
  { id: 'pb',   label: 'Prime Brokers',        desc: 'Settlement & clearing' },
  { id: 'reg',  label: 'KYC / Regulatory',     desc: 'Compliance feeds' },
];

const core = [
  { id: 'gw',     label: 'Execution Gateway',         desc: 'Order routing, FIX/REST/WS' },
  { id: 'risk',   label: 'Risk Engine',               desc: 'Pre/post-trade risk, limits' },
  { id: 'bridge', label: 'Bridge & Normalization',    desc: 'Multi-broker, data pipelines' },
];

const downstream = [
  { id: 'term',     label: 'Trading Terminal',        desc: 'Web / institutional' },
  { id: 'dash',     label: 'Management Dashboard',    desc: 'Back-office, ops' },
  { id: 'analytics',label: 'Analytics & Reporting',   desc: 'P&L, execution quality, compliance' },
];

// Beam connections — selective primary flows, not all-to-all
const connections: Array<{ from: string; to: string; delay: number }> = [
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for every node, keyed by id
  const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    lp: useRef(null), md: useRef(null), pb: useRef(null), reg: useRef(null),
    gw: useRef(null), risk: useRef(null), bridge: useRef(null),
    term: useRef(null), dash: useRef(null), analytics: useRef(null),
  };

  return (
    <section className="section-padding bg-surface-inverse text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-grid-dark bg-[length:64px_64px]" />
      <div className="absolute inset-0 bg-brand-radial pointer-events-none" />

      <div className="relative section-container">
        <AnimateIn>
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="section-label-light">Reference Architecture</p>
            <h2 className="heading-hero-sm text-white mb-8 max-w-[16ch]">
              From market data to <span className="text-brand-accent">execution</span>.
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
              A composable three-layer stack. We build upstream connectivity, the
              institutional core, and client-facing surfaces — end to end,
              fully owned by the client.
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
            <ColumnLabel>Upstream</ColumnLabel>
            <div className="flex flex-col gap-3 md:gap-4">
              {upstream.map(n => (
                <Node key={n.id} label={n.label} desc={n.desc} nodeRef={refs[n.id]} />
              ))}
            </div>
          </div>

          {/* CORE */}
          <div className="flex flex-col">
            <ColumnLabel>
              <span className="text-brand-accent">Brokz Core</span>
            </ColumnLabel>
            <div className="flex flex-col gap-3 md:gap-4 justify-center h-full">
              {core.map(n => (
                <Node key={n.id} label={n.label} desc={n.desc} nodeRef={refs[n.id]} />
              ))}
            </div>
          </div>

          {/* DOWNSTREAM */}
          <div className="flex flex-col">
            <ColumnLabel>Client Surfaces</ColumnLabel>
            <div className="flex flex-col gap-3 md:gap-4 justify-center h-full">
              {downstream.map(n => (
                <Node key={n.id} label={n.label} desc={n.desc} nodeRef={refs[n.id]} />
              ))}
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

        {/* Footnote */}
        <p className="mt-12 md:mt-16 text-sm text-ink-subtle font-mono tabular text-center">
          Every engagement delivered end-to-end. Documented. Unlocked.
        </p>
      </div>
    </section>
  );
}

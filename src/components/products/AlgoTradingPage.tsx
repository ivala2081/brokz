import { useState } from 'react';

const CheckIcon = (
  <svg
    aria-hidden="true"
    className="w-4 h-4 text-brand flex-shrink-0 mt-0.5"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8.5L6.5 12L13 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = (
  <svg
    aria-hidden="true"
    className="w-4 h-4"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8H13M9 4L13 8L9 12"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PIPELINE = [
  { step: '01', title: 'Data Ingestion', body: 'Tick & OHLCV pipelines from your liquidity providers, exchanges, or vendors. Normalised, deduped, time-synced.' },
  { step: '02', title: 'Backtest', body: 'Event-driven engine with realistic fills, slippage, and latency models. No look-ahead, no survivorship bias.' },
  { step: '03', title: 'Optimise', body: 'Walk-forward, Monte Carlo, parameter grids, genetic and Bayesian search. Cluster-parallel runs.' },
  { step: '04', title: 'Deploy Live', body: 'Same strategy code, same fill model. Promote to live with one config switch. No "rewriting for prod".' },
];

const FEATURES = [
  { title: 'Tick-level Backtesting', body: 'Sub-second resolution with bid/ask bookkeeping. Full L1 reconstruction; L2 optional.' },
  { title: 'Slippage & Latency Models', body: 'Per-venue latency, partial fills, queue position. Plug your own models if you have them.' },
  { title: 'Walk-Forward Analysis', body: 'In-sample / out-of-sample windows, rolling re-optimisation. Surface overfitting before capital does.' },
  { title: 'Live Execution Engine', body: 'Co-located on your venue when needed. FIX / REST / WebSocket adapters. Risk-checked at every order.' },
  { title: 'Strategy Library', body: 'Mean-reversion, trend, stat-arb, market-making templates. Starting point, not a black box.' },
  { title: 'Performance Dashboards', body: 'Sharpe, Sortino, Calmar, drawdown, regime breakdown. Export to your data warehouse.' },
];

const SPECS = [
  { label: 'Languages', value: 'Python (research), Rust / C++ (low-latency execution)' },
  { label: 'Data', value: 'TimescaleDB / ClickHouse for tick storage, Parquet for archives' },
  { label: 'Backtest', value: 'Event-driven engine, deterministic replay, distributed runner' },
  { label: 'Execution', value: 'FIX 4.4 / 5.0, REST, WebSocket. Risk gateway with kill-switch' },
  { label: 'Infra', value: 'Containerised, deployable on AWS / GCP / co-lo. Your infrastructure' },
  { label: 'Observability', value: 'Per-strategy P&L, fill quality, slippage attribution, alerting' },
];

const FAQS = [
  { q: 'Who is this built for?', a: 'Brokerages running prop desks, market-making books, or systematic execution; quant funds; treasury teams that need execution algos. Not retail "EA marketplaces".' },
  { q: 'Do you write strategies for us?', a: 'We can deliver strategy templates and execution algos (TWAP, VWAP, IS, market-making). Alpha research is your domain — the platform is the rails.' },
  { q: 'Can we keep our existing research stack?', a: 'Yes. The platform is modular. Bring your own research notebooks, plug into our execution and backtest engine via Python or REST.' },
  { q: 'What about latency?', a: 'Hot path is Rust / C++. Co-location supported when the venue offers it. End-to-end tick-to-trade is benchmarked per deployment.' },
  { q: 'How long does delivery take?', a: 'A baseline platform — data pipelines, backtest engine, one live adapter — is 8–14 weeks. Full multi-venue execution stack is 16–24 weeks.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="heading-4 text-ink group-hover:text-brand transition-colors duration-base">{q}</span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-line flex items-center justify-center text-ink-muted group-hover:border-brand group-hover:text-brand transition-colors duration-base">
          {open ? (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </button>
      {open && <p className="body pb-5 max-w-3xl">{a}</p>}
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[24px] blur-2xl opacity-40"
        style={{
          background:
            'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.10) 60%, transparent 100%)',
        }}
      />
      <div className="relative rounded-[14px] overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl ring-1 ring-white/5 font-mono text-[12px] leading-relaxed">
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-neutral-400 truncate">strategy.py — backtest</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <pre className="p-5 text-neutral-300 overflow-hidden">
{`from brokz.algo import Strategy, Order

class MeanReversion(Strategy):
    lookback = 60
    z = 2.0

    def on_bar(self, bar):
        mu, sd = self.window.stats()
        if bar.close < mu - self.z*sd:
            self.buy(qty=10)
        elif bar.close > mu + self.z*sd:
            self.sell(qty=10)

# backtest 2019-2024
result = run(MeanReversion, "EURUSD")`}
          </pre>
          <div className="p-5 text-[11px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-400">Backtest · EURUSD · 1m</span>
              <span className="text-emerald-400">+18.4%</span>
            </div>
            <svg viewBox="0 0 200 80" className="w-full h-20" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.4)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                </linearGradient>
              </defs>
              <path d="M0,60 L20,55 L40,58 L60,45 L80,48 L100,38 L120,32 L140,28 L160,22 L180,15 L200,10 L200,80 L0,80 Z" fill="url(#g)" />
              <path d="M0,60 L20,55 L40,58 L60,45 L80,48 L100,38 L120,32 L140,28 L160,22 L180,15 L200,10" stroke="rgb(16,185,129)" strokeWidth="1.5" fill="none" />
            </svg>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-neutral-400">
              <div className="flex justify-between"><span>Sharpe</span><span className="text-white">2.31</span></div>
              <div className="flex justify-between"><span>Max DD</span><span className="text-white">-4.2%</span></div>
              <div className="flex justify-between"><span>Trades</span><span className="text-white">1,284</span></div>
              <div className="flex justify-between"><span>Win %</span><span className="text-white">58.7</span></div>
              <div className="flex justify-between"><span>Slippage</span><span className="text-white">0.4 bp</span></div>
              <div className="flex justify-between"><span>Calmar</span><span className="text-white">4.4</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex absolute -bottom-4 -left-4 items-center gap-2 px-3 py-2 rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold">Tick-level · Deterministic</span>
      </div>
    </div>
  );
}

export default function AlgoTradingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-surface-inverse text-ink-inverse section-padding">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(60% 50% at 15% 20%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(50% 40% at 85% 80%, rgba(16,185,129,0.10) 0%, transparent 60%)',
          }}
        />
        <div className="relative section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="section-label-light">Algorithmic Trading & Strategy Testing</p>
              <h1 className="heading-hero-sm text-white mt-4 mb-6 max-w-[22ch]">
                From Idea to Live Execution — One Stack
              </h1>
              <p className="body-lg text-neutral-300 max-w-xl mb-10">
                Tick-level backtesting, walk-forward optimisation, and a low-latency
                execution engine. The same code path from research notebook to production
                fills.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/contact" className="btn-primary">Request Pricing</a>
                <a
                  href="https://brokztrader.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lg border border-line-inverse text-white hover:border-brand-accent hover:text-brand-accent transition-colors duration-base"
                >
                  Try Free Demo
                </a>
              </div>
            </div>
            <div className="lg:col-span-6"><HeroMockup /></div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">What Is It</p>
              <h2 className="heading-2 text-ink mb-6">A Quant Stack, Not a Trading Bot Marketplace</h2>
              <p className="body mb-4">
                A complete infrastructure stack for systematic trading — data ingestion,
                backtesting, optimisation, and live execution. Built for desks that run
                their own alpha and need a platform that won't lie to them.
              </p>
              <p className="body">
                No fake fills. No look-ahead bias. No "EA" black boxes. Same code from
                research to production, deterministic replay, and execution that respects
                queue position.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: 'Tick-level', label: 'Backtest resolution' },
                { stat: 'Sub-ms', label: 'Hot path latency' },
                { stat: '1 codebase', label: 'Research → live' },
                { stat: 'Multi-venue', label: 'FIX / REST / WS' },
              ].map(({ stat, label }) => (
                <div key={label} className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-2">
                  <span className="text-2xl font-bold tracking-tight text-ink">{stat}</span>
                  <span className="text-sm text-ink-muted leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Pipeline</p>
          <h2 className="heading-2 text-ink mb-4">Data → Backtest → Optimise → Live</h2>
          <p className="body mb-12 max-w-2xl">
            Four stages, one platform, no glue code between them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PIPELINE.map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-4">
                <span className="text-5xl font-extrabold tracking-tighter text-line-strong select-none">{step}</span>
                <h3 className="heading-3 text-ink">{title}</h3>
                <p className="body-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Features</p>
          <h2 className="heading-2 text-ink mb-10">Built for Real Money</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ title, body }) => (
              <div key={title} className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-3">
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Architecture</p>
              <h2 className="heading-2 text-ink mb-6">Technical Architecture</h2>
              <p className="body">
                Python where it helps research velocity, Rust / C++ where microseconds
                matter. Deterministic replay for compliance and debugging. Cloud-agnostic.
              </p>
            </div>
            <ol className="flex flex-col gap-5">
              {SPECS.map(({ label, value }, i) => (
                <li key={label} className="flex gap-5 items-start">
                  <span className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <span className="font-semibold text-ink text-sm">{label}: </span>
                    <span className="text-sm text-ink-secondary">{value}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Pricing</p>
          <h2 className="heading-2 text-ink mb-4">Engagement Models</h2>
          <p className="body mb-10 max-w-2xl">
            Fixed-price platform delivery, or ongoing retainer. Pricing depends on data
            volume, venue count, and latency targets.
          </p>
          <p className="body text-ink-secondary">
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-semibold transition-colors duration-base"
            >
              Request a detailed quote {ArrowIcon}
            </a>
          </p>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">FAQ</p>
          <h2 className="heading-2 text-ink mb-10">Frequently Asked Questions</h2>
          <div className="max-w-3xl">{FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}</div>
        </div>
      </section>

      <section className="section-padding bg-surface-inverse">
        <div className="section-container text-center">
          <p className="section-label-light mb-4">Get Started</p>
          <h2 className="heading-2 text-white mb-5">Ready to put your alpha on real rails?</h2>
          <p className="body-lg text-neutral-300 max-w-xl mx-auto mb-10">
            Tell us about your strategies, venues, and latency targets. We respond in one
            business day.
          </p>
          <a href="/contact" className="btn-primary">Start a Conversation</a>
        </div>
      </section>
    </>
  );
}

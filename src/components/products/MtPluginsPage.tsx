import { useState } from 'react';

const ArrowIcon = (
  <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PLUGIN_TYPES = [
  { title: 'Risk & Exposure', body: 'Real-time exposure plug-ins, A-book / B-book router, dynamic margin, pre-trade checks, kill-switch.' },
  { title: 'Liquidity Bridges', body: 'FIX bridges to LPs, ECNs, prime brokers. Smart routing by symbol, spread, or venue health.' },
  { title: 'Reporting & BI', body: 'Custom reports inside the manager, push to your BI tool, regulatory exports (MiFID II, EMIR).' },
  { title: 'Bonus & Promotions', body: 'Deposit bonus, lot rebate, contest engines — fully configurable, fully audited.' },
  { title: 'IB & Affiliate', body: 'Multi-tier IB hierarchy, commission rules, affiliate tracking, CRM hand-off.' },
  { title: 'Custom EAs & Indicators', body: 'Bespoke MQL4 / MQL5 development for proprietary indicators, signal services, or execution algos.' },
];

const STEPS = [
  { step: '01', title: 'Audit', body: 'We map your current MT4/MT5 setup — server build, plug-ins in place, broken integrations.' },
  { step: '02', title: 'Spec & Build', body: 'Fixed-price spec for the plug-in or extension. We build, test on a staging server, hand off MT5 binaries.' },
  { step: '03', title: 'Deploy & Support', body: 'Production deploy with rollback plan. Optional retainer for ongoing maintenance and broker upgrades.' },
];

const FAQS = [
  { q: 'Do you build for both MT4 and MT5?', a: 'Yes. We support MT4 server-side plug-ins, MT5 server gateways, and client-side EAs / indicators in MQL4 and MQL5.' },
  { q: 'Can you fix our existing plug-in?', a: 'Often, yes — we can audit and patch plug-ins from prior vendors, including ones whose source you no longer have access to (subject to legal review).' },
  { q: 'Will this work with MetaQuotes server upgrades?', a: 'Yes. We track MetaQuotes server build releases and offer a maintenance retainer for breaking-change windows.' },
  { q: 'Can you build a custom liquidity bridge?', a: 'Yes. FIX 4.4 / 5.0 bridges to LPs, ECNs, or prime brokers. Smart routing, A/B-book, latency monitoring built in.' },
  { q: 'Do you do MQL4 / MQL5 only?', a: 'No. Server-side plug-ins are typically C++. Client-side EAs and indicators are MQL4 / MQL5. We deliver both.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button type="button" onClick={() => setOpen(prev => !prev)} className="w-full flex items-center justify-between py-5 text-left gap-4 group" aria-expanded={open}>
        <span className="heading-4 text-ink group-hover:text-brand transition-colors duration-base">{q}</span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-line flex items-center justify-center text-ink-muted group-hover:border-brand group-hover:text-brand transition-colors duration-base">
          {open ? (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
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
      <div aria-hidden="true" className="absolute -inset-6 rounded-[24px] blur-2xl opacity-40" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.10) 60%, transparent 100%)' }} />
      <div className="relative rounded-[14px] overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl ring-1 ring-white/5">
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-neutral-400 truncate font-mono">MT5 Server Manager · Plugins</span>
        </div>
        <div className="p-5 space-y-2.5">
          {[
            { name: 'BrokzRiskGateway.dll', ver: 'v2.4.1', status: 'Running', tone: 'emerald' },
            { name: 'BrokzLPBridge.dll', ver: 'v3.1.0', status: 'Running', tone: 'emerald' },
            { name: 'BrokzReporter.dll', ver: 'v1.8.2', status: 'Running', tone: 'emerald' },
            { name: 'BrokzBonusEngine.dll', ver: 'v1.2.0', status: 'Running', tone: 'emerald' },
            { name: 'LegacyVendor.dll', ver: 'v0.9.4', status: 'Disabled', tone: 'neutral' },
          ].map(p => (
            <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-neutral-900 border border-white/5">
              <div className="w-8 h-8 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(16,185,129)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-mono text-white truncate">{p.name}</div>
                <div className="text-[10px] text-neutral-500">{p.ver}</div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.tone === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-neutral-700/50 text-neutral-400'}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:flex absolute -bottom-4 -left-4 items-center gap-2 px-3 py-2 rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold">MT4 · MT5 · MQL5</span>
      </div>
    </div>
  );
}

export default function MtPluginsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-surface-inverse text-ink-inverse section-padding">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ background: 'radial-gradient(60% 50% at 15% 20%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(50% 40% at 85% 80%, rgba(16,185,129,0.10) 0%, transparent 60%)' }} />
        <div className="relative section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="section-label-light">MT4 / MT5 Plug-ins & Extensions</p>
              <h1 className="heading-hero-sm text-white mt-4 mb-6 max-w-[22ch]">
                Custom MT4 & MT5 Plug-ins, Built for Brokers
              </h1>
              <p className="body-lg text-neutral-300 max-w-xl mb-10">
                Server-side plug-ins, liquidity bridges, custom EAs, and broker
                extensions. Whether you’re extending MT5 or rescuing legacy MT4 — we
                ship production binaries.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/contact" className="btn-primary">Request Pricing</a>
                <a href="https://brokztrader.com/" target="_blank" rel="noopener noreferrer" className="btn btn-lg border border-line-inverse text-white hover:border-brand-accent hover:text-brand-accent transition-colors duration-base">Try Free Demo</a>
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
              <p className="section-label">What We Build</p>
              <h2 className="heading-2 text-ink mb-6">From Risk Gateways to Custom EAs</h2>
              <p className="body mb-4">
                MetaTrader is the rails most retail brokers still run on. The platform
                works — but every broker’s edge lives in the plug-ins layered on top.
              </p>
              <p className="body">
                We build that layer. Server-side C++ plug-ins, FIX bridges, MQL4 / MQL5
                EAs and indicators, broker extensions. From scratch, or fixing what a
                previous vendor left broken.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: 'MT4 + MT5', label: 'Server & client side' },
                { stat: 'C++ / MQL', label: 'Native plug-in dev' },
                { stat: 'FIX bridges', label: 'LPs, ECNs, primes' },
                { stat: 'Audit-ready', label: 'Compliance-aware code' },
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
          <p className="section-label">Plug-in Types</p>
          <h2 className="heading-2 text-ink mb-10">What We Ship</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLUGIN_TYPES.map(({ title, body }) => (
              <div key={title} className="p-7 rounded-card border border-line bg-surface flex flex-col gap-3">
                <div className="w-2 h-2 rounded-full bg-brand" />
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Process</p>
          <h2 className="heading-2 text-ink mb-4">Audit → Build → Deploy</h2>
          <p className="body mb-12 max-w-2xl">Three steps from broken plug-in or new requirement to production deploy.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-4">
                <span className="text-5xl font-extrabold tracking-tighter text-line-strong select-none">{step}</span>
                <h3 className="heading-3 text-ink">{title}</h3>
                <p className="body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Pricing</p>
          <h2 className="heading-2 text-ink mb-4">Per-Plug-in or Retainer</h2>
          <p className="body mb-10 max-w-2xl">
            Single plug-in delivery on fixed price, or ongoing retainer for brokers who
            need a permanent MT4/MT5 engineering bench.
          </p>
          <p className="body text-ink-secondary">
            <a href="/contact" className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-semibold transition-colors duration-base">
              Request a detailed quote {ArrowIcon}
            </a>
          </p>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">FAQ</p>
          <h2 className="heading-2 text-ink mb-10">Frequently Asked Questions</h2>
          <div className="max-w-3xl">{FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}</div>
        </div>
      </section>

      <section className="section-padding bg-surface-inverse">
        <div className="section-container text-center">
          <p className="section-label-light mb-4">Get Started</p>
          <h2 className="heading-2 text-white mb-5">Need a plug-in built — or fixed?</h2>
          <p className="body-lg text-neutral-300 max-w-xl mx-auto mb-10">Tell us your MT4/MT5 server build and what you need. We respond in one business day.</p>
          <a href="/contact" className="btn-primary">Start a Conversation</a>
        </div>
      </section>
    </>
  );
}

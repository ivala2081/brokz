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

const MODULES = [
  {
    title: 'Account Operations',
    body: 'Trader onboarding, sub-accounts, balance adjustments, credit lines, and KYC review — all in one console.',
  },
  {
    title: 'Trade Monitor',
    body: 'Live position book, exposure, P&L per trader. Pre-trade checks, kill-switch, and forced close-out.',
  },
  {
    title: 'Financial Operations',
    body: 'Deposit / withdrawal approvals, PSP routing, internal transfers, and reconciliation against your treasury.',
  },
  {
    title: 'Risk & Monitoring',
    body: 'Margin alerts, exposure heatmaps, A-book / B-book routing rules, and real-time risk score per trader.',
  },
  {
    title: 'Analytics & Reporting',
    body: 'Volume, spread cost, retention, deposit conversion. Chart Studio for custom dashboards. Export to BI.',
  },
  {
    title: 'IB & Campaigns',
    body: 'Multi-tier IB hierarchy with commission rules, marketing campaigns, bonus engine, and audit log.',
  },
];

const ROLES = [
  {
    role: 'Operations',
    points: ['Approve deposits & withdrawals', 'Adjust balances and credit', 'Resolve KYC and support tickets'],
  },
  {
    role: 'Risk Desk',
    points: ['Live exposure monitoring', 'A/B-book routing controls', 'Margin alerts & forced close-out'],
  },
  {
    role: 'Compliance',
    points: ['Audit log of every action', 'Role-based access control', 'KYC review and reporting'],
  },
  {
    role: 'Management',
    points: ['Real-time KPIs and AUM', 'Treasury and P&L view', 'Campaign and IB performance'],
  },
];

const SPECS = [
  { label: 'Frontend', value: 'React + TypeScript admin SPA, role-aware UI' },
  { label: 'Backend', value: 'REST + WebSocket API, event-sourced audit trail' },
  { label: 'Auth', value: 'SSO (SAML / OIDC), 2FA, granular role-based access' },
  { label: 'Audit', value: 'Immutable action log per user, exportable to SIEM' },
  { label: 'Deployment', value: 'Cloud or on-prem, containerised, your infrastructure' },
  { label: 'Integrations', value: 'WebTrader, liquidity bridges, PSPs, CRM, BI / data warehouse' },
];

const FAQS = [
  {
    q: 'What is the WebTrader White Label Manager?',
    a: 'It is the internal back-office and risk console paired with the WebTrader. Your operations, risk, finance, and compliance teams use it to run the brokerage day-to-day — onboarding traders, approving deposits, monitoring exposure, configuring IB tiers, and pulling reports.',
  },
  {
    q: 'Is it sold separately from the WebTrader?',
    a: 'No. The Manager is delivered together with the WebTrader as one platform. They share the same data layer, audit trail, and authentication. Buying the WebTrader gives you the Manager.',
  },
  {
    q: 'Can roles and permissions be customised?',
    a: 'Yes. The Manager ships with role-based access control out of the box — Operations, Risk, Compliance, Management, and custom roles. Each module and action can be gated per role, and every action is recorded in an immutable audit log.',
  },
  {
    q: 'Does it integrate with our existing CRM and PSPs?',
    a: 'No — we do not plug into third-party CRMs. Instead, we build a custom CRM tailored to your workflows as part of the engagement. PSP, KYC, BI, and data-warehouse integrations are delivered via REST and webhook APIs.',
  },
  {
    q: 'Can we white-label the Manager?',
    a: 'Yes. Logo, colour system, typography, and domain are all branded to your firm. The Manager runs on your infrastructure with no Brokz attribution visible to staff.',
  },
  {
    q: 'How do you handle audit and compliance?',
    a: 'Every action — balance adjustment, approval, role change, configuration edit — is recorded with actor, timestamp, before/after state. Logs are immutable and exportable to your SIEM or compliance archive.',
  },
  {
    q: 'Can I use my own price provider?',
    a: 'Yes. You can plug in your own price provider — share the API details with us and we handle the integration.',
  },
  {
    q: 'If I don\'t have a price provider, do you supply one?',
    a: 'Yes. We supply price feeds as standard with no extra cost. We do not route order execution though — that side is up to you.',
  },
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
        <span className="heading-4 text-ink group-hover:text-brand transition-colors duration-base">
          {q}
        </span>
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

export default function WhiteLabelManagerPage() {
  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
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
              <p className="section-label-light">WebTrader White Label Manager</p>
              <h1 className="heading-hero-sm text-white mt-4 mb-6 max-w-[22ch]">
                The Back-Office Console Behind Your WebTrader
              </h1>
              <p className="body-lg text-neutral-300 max-w-xl mb-10">
                One console for operations, risk, finance, and compliance. Real-time exposure,
                approval workflows, audit-grade logs — fully white-labelled and deployed on
                your infrastructure.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/contact" className="btn-primary">
                  Request Pricing
                </a>
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

            <div className="lg:col-span-6">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-[24px] blur-2xl opacity-40"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.10) 60%, transparent 100%)',
                  }}
                />
                <div className="relative rounded-[14px] overflow-hidden border border-black/10 bg-white shadow-2xl ring-1 ring-black/5">
                  <div className="flex items-center gap-2 px-4 py-3 bg-neutral-100 border-b border-black/10">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                    <div className="ml-3 flex-1 h-6 rounded-md bg-white border border-black/10 flex items-center px-3">
                      <span className="text-[11px] text-neutral-500 truncate">
                        manager.yourbrokerage.com / dashboard
                      </span>
                    </div>
                  </div>
                  <img
                    src="/3.png"
                    alt="Brokz WebTrader White Label Manager — operations, risk, and compliance dashboard"
                    width={1600}
                    height={900}
                    loading="eager"
                    className="block w-full h-auto"
                  />
                </div>
                <div className="hidden md:flex absolute -bottom-4 -left-4 items-center gap-2 px-3 py-2 rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold">Live · Audit-grade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. What it is ───────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">What Is It</p>
              <h2 className="heading-2 text-ink mb-6">
                The Operating System of Your Brokerage
              </h2>
              <p className="body mb-4">
                The White Label Manager is the internal counterpart to your WebTrader. It is
                where your operations team approves a deposit, where your risk desk closes a
                runaway position, where your compliance officer pulls an audit trail.
              </p>
              <p className="body">
                It ships as one platform with the WebTrader — same data layer, same brand,
                same identity system. No spreadsheets, no Telegram approvals, no third-party
                CRMs in the critical path.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: '1 Console', label: 'Ops, risk, finance, compliance' },
                { stat: 'Real-time', label: 'Exposure & P&L per trader' },
                { stat: 'RBAC', label: 'Granular role-based access' },
                { stat: 'Audit-grade', label: 'Immutable action log' },
              ].map(({ stat, label }) => (
                <div
                  key={label}
                  className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-2"
                >
                  <span className="text-2xl font-bold tracking-tight text-ink">{stat}</span>
                  <span className="text-sm text-ink-muted leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Modules ──────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Modules</p>
          <h2 className="heading-2 text-ink mb-4">
            Everything Your Back-Office Needs, in One Place
          </h2>
          <p className="body mb-10 max-w-2xl">
            Six core modules cover the full operational surface of a regulated brokerage —
            from trader onboarding to risk routing to financial reconciliation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map(({ title, body }) => (
              <div
                key={title}
                className="p-7 rounded-card border border-line bg-surface flex flex-col gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-brand" />
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Built for every desk ─────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Built for Every Desk</p>
          <h2 className="heading-2 text-ink mb-10">
            One Console, Four Teams, Zero Spreadsheets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map(({ role, points }) => (
              <div
                key={role}
                className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-4"
              >
                <h3 className="heading-4 text-ink">{role}</h3>
                <ul className="flex flex-col gap-2.5">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2 body-sm">
                      {CheckIcon}
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. White-Label ──────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Brand Ownership</p>
              <h2 className="heading-2 text-ink mb-6">
                Your Brand. Your Domain. Your Infrastructure.
              </h2>
              <p className="body">
                The Manager runs on a domain you control, with your colour system and logo
                applied throughout. Staff log in to your brand — not Brokz. The codebase is
                yours, the data is yours, and you can take it with you.
              </p>
            </div>
            <ul className="flex flex-col gap-4 pt-2 lg:pt-14">
              {[
                'Custom domain (manager.yourbrokerage.com)',
                'Full colour and typography system applied',
                'Your logo and favicon throughout',
                'No Brokz attribution to staff or auditors',
                'Codebase delivered to your repository',
                'Deployed on your cloud or on-prem',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  {CheckIcon}
                  <span className="body">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 6. Architecture ─────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Architecture</p>
              <h2 className="heading-2 text-ink mb-6">Technical Architecture</h2>
              <p className="body">
                The Manager shares the same data layer and identity system as the WebTrader.
                One source of truth, one audit log, one set of credentials. Built for
                regulated environments from the first commit.
              </p>
            </div>
            <ol className="flex flex-col gap-5">
              {SPECS.map(({ label, value }, i) => (
                <li key={label} className="flex gap-5 items-start">
                  <span className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
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

      {/* ── 7. Pricing ──────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Pricing</p>
          <h2 className="heading-2 text-ink mb-4">
            Bundled with the WebTrader
          </h2>
          <p className="body mb-10 max-w-2xl">
            The Manager is delivered as part of the WebTrader engagement. Pricing depends on
            scope — number of roles, integrations, and bespoke modules.
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

      {/* ── 8. FAQ ──────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">FAQ</p>
          <h2 className="heading-2 text-ink mb-10">Frequently Asked Questions</h2>
          <div className="max-w-3xl">
            {FAQS.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CTA ──────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-inverse">
        <div className="section-container text-center">
          <p className="section-label-light mb-4">Get Started</p>
          <h2 className="heading-2 text-white mb-5">
            Ready to run your brokerage from one console?
          </h2>
          <p className="body-lg text-neutral-300 max-w-xl mx-auto mb-10">
            Tell us about your operations setup. We respond within one business day with a
            scoped proposal.
          </p>
          <a href="/contact" className="btn-primary">
            Start a Conversation
          </a>
        </div>
      </section>
    </>
  );
}

import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────

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

const CrossIcon = (
  <svg
    aria-hidden="true"
    className="w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4L12 12M12 4L4 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { label: 'Brand ownership',       custom: true,  mt: false, saas: false  },
  { label: 'Deployment model',      custom: 'Your infra', mt: 'MetaQuotes servers', saas: 'Vendor cloud' },
  { label: 'Asset flexibility',     custom: 'Full',  mt: 'Limited', saas: 'Limited' },
  { label: 'Feature extensibility', custom: true,  mt: false, saas: false  },
  { label: 'Licensing cost model',  custom: 'One-time or retainer', mt: 'Ongoing MetaQuotes fees', saas: 'Monthly per-user' },
  { label: 'Client experience',     custom: 'Web-native, no install', mt: 'Desktop client required', saas: 'Generic UI' },
];

const VALUE_CARDS = [
  {
    title: 'Full Codebase Ownership',
    body: 'Delivered as your intellectual property. No ongoing vendor fees. No dependency on Brokz staying in business.',
  },
  {
    title: 'Real-Time Execution Engine',
    body: 'WebSocket-based feed with sub-100ms order acknowledgement. Built for institutional tick velocity.',
  },
  {
    title: 'Institutional UX Standards',
    body: 'Designed for professional traders operating at volume. Not a repurposed retail interface.',
  },
  {
    title: 'Multi-Broker Architecture',
    body: 'Connect to multiple liquidity providers simultaneously. Route orders by asset class, spread, or rule.',
  },
  {
    title: 'Regulatory-Ready',
    body: 'Audit logging, role-based access, and compliance reporting built into the core. Not retrofitted.',
  },
  {
    title: 'Post-Launch Support',
    body: 'Every engagement includes a post-launch support window. Optional retainer for ongoing platform evolution.',
  },
];

const FEATURES = [
  {
    title: 'Real-Time Order Execution',
    body: 'WebSocket-based feed, sub-100ms acknowledgement, one-click and algorithmic entry modes.',
  },
  {
    title: 'Multi-Asset Support',
    body: 'FX, equities, derivatives, commodities, crypto, and CFDs in a single terminal. Asset classes are configurable per deployment.',
  },
  {
    title: 'Configurable UI',
    body: 'Drag-and-drop widgets, charting tools, custom watchlists and layouts. Adapted to your brand and workflow.',
  },
  {
    title: 'Multi-Account Management',
    body: 'Sub-accounts, team hierarchies, and role-based access per user. Built for managed-account structures.',
  },
  {
    title: 'Risk & Compliance Layer',
    body: 'Real-time exposure monitoring, pre-trade checks, and audit-grade logs. Compliance reporting out of the box.',
  },
  {
    title: 'White-Label Deployment',
    body: 'Full brand applied throughout. Custom domain. Your codebase. Your infrastructure. No Brokz attribution.',
  },
];

const TECH_SPECS = [
  { label: 'Frontend', value: 'React + TypeScript, WebSocket-native real-time layer' },
  { label: 'Backend', value: 'REST + WebSocket API, horizontally scalable microservices' },
  { label: 'Database', value: 'Time-series optimised for tick data, relational for account/order state' },
  { label: 'Infrastructure', value: 'Cloud-native, containerised, deployable on AWS / GCP / Azure / on-prem' },
  { label: 'Security', value: 'TLS throughout, role-based auth, session management, penetration-tested' },
  { label: 'Integrations', value: 'FIX protocol, REST bridges, MT4/MT5 bridge compatibility' },
];

const FAQS = [
  {
    q: 'What is a custom web trader?',
    a: 'A custom web trader is a browser-based trading terminal built specifically for your brokerage. Unlike off-the-shelf platforms like MT4/MT5, a custom web trader is fully branded, architecturally owned by you, and can be extended with any feature your business requires.',
  },
  {
    q: 'How do I buy a web trader platform?',
    a: 'Contact Brokz with your requirements — asset classes, expected user volume, integrations needed, and branding requirements. We scope the project, agree on a fixed-price or milestone contract, and deliver a production-ready platform typically within 10–16 weeks.',
  },
  {
    q: 'How much does a custom web trader cost?',
    a: 'Web trader pricing depends on scope: asset classes supported, number of concurrent users, integrations (liquidity, risk, back-office), and white-label requirements. Contact us for a detailed quote. We offer both one-time license purchase and ongoing SaaS-style engagement models.',
  },
  {
    q: 'Is a web trader better than MT4 or MT5?',
    a: 'For brokers who want full brand control, a web-first experience, and the ability to add proprietary features, a custom web trader outperforms MT4/MT5. MT4/MT5 have rigid UI constraints, licensing costs, and no white-label options. A custom web trader runs in any browser with no client install required.',
  },
  {
    q: 'Can the web trader be white-labelled?',
    a: 'Yes. Brokz delivers the platform under full white-label terms — you own the codebase, brand all UI elements, and deploy on your own infrastructure or cloud. There are no Brokz watermarks or third-party attributions visible to your clients.',
  },
  {
    q: 'How long does web trader development take?',
    a: 'A standard institutional web trader deployment takes 10–16 weeks from signed agreement to production launch. Complex multi-asset, multi-broker setups may take 20–24 weeks. We provide weekly demos against a production-like environment from week one.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <td className="py-4 px-5 text-center">
        <span className="inline-flex justify-center">{CheckIcon}</span>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className="py-4 px-5 text-center">
        <span className="inline-flex justify-center">{CrossIcon}</span>
      </td>
    );
  }
  return (
    <td className="py-4 px-5 text-sm text-ink-secondary text-center">{value}</td>
  );
}

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
      {open && (
        <p className="body pb-5 max-w-3xl">{a}</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WebTraderPage() {
  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-surface-inverse text-ink-inverse section-padding">
        <div className="section-container">
          <p className="section-label-light">Custom Web Trader Platform</p>
          <h1 className="heading-hero-sm text-white mt-4 mb-6 max-w-[22ch]">
            Custom Web Trader Platform for Institutional Brokers
          </h1>
          <p className="body-lg text-neutral-300 max-w-2xl mb-10">
            Browser-native, real-time, and fully white-labelled. A trading terminal engineered
            around your infrastructure — not around a vendor's constraints.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/contact" className="btn-primary">
              Request Pricing
            </a>
            <a
              href="/products"
              className="btn btn-lg border border-line-inverse text-white hover:border-brand-accent hover:text-brand-accent transition-colors duration-base"
            >
              View All Products
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. What Is a Custom Web Trader? ─────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">What Is It</p>
              <h2 className="heading-2 text-ink mb-6">What Is a Custom Web Trader?</h2>
              <p className="body mb-4">
                A custom web trader is a browser-based institutional trading terminal built for a
                specific broker's infrastructure, brand, and client base. It runs entirely in the
                browser — no desktop client, no MetaTrader dependency, no third-party vendor in
                the chain.
              </p>
              <p className="body">
                Unlike MT4 or MT5, a custom web trader is architecturally owned by you. The
                codebase is yours. The brand is yours. The feature roadmap is yours. You are not
                renting access to someone else's platform — you are building a proprietary trading
                terminal that your brokerage owns in perpetuity.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: '10–16 wks', label: 'Typical delivery' },
                { stat: '100%', label: 'White-label' },
                { stat: 'Multi-Asset', label: 'FX, equities, crypto, CFDs' },
                { stat: 'No Lock-in', label: 'Full codebase ownership' },
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

      {/* ── 3. Comparison ───────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Platform Comparison</p>
          <h2 className="heading-2 text-ink mb-4">
            Why Buy a Custom Web Trader Instead of Using MT4/MT5?
          </h2>
          <p className="body mb-10 max-w-2xl">
            MT4 and MT5 were designed for retail brokers operating on MetaQuotes infrastructure.
            For institutional brokers that need brand control, architectural freedom, and a
            web-first client experience, they are the wrong tool.
          </p>
          <div className="overflow-x-auto rounded-card border border-line">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="py-4 px-5 text-left font-semibold text-ink-secondary w-[34%]">
                    Criterion
                  </th>
                  <th className="py-4 px-5 text-center font-semibold text-brand">
                    Custom Web Trader
                  </th>
                  <th className="py-4 px-5 text-center font-semibold text-ink-secondary">
                    MT4 / MT5
                  </th>
                  <th className="py-4 px-5 text-center font-semibold text-ink-secondary">
                    SaaS Platforms
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-line last:border-0 ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-muted'}`}
                  >
                    <td className="py-4 px-5 font-medium text-ink">{row.label}</td>
                    <ComparisonCell value={row.custom} />
                    <ComparisonCell value={row.mt} />
                    <ComparisonCell value={row.saas} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 4. How to Get a Web Trader ───────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Process</p>
          <h2 className="heading-2 text-ink mb-4">
            How to Get a Web Trader for Your Brokerage
          </h2>
          <p className="body mb-12 max-w-2xl">
            Three steps from first conversation to production launch.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Discovery Call',
                body: 'Share your requirements: asset classes, expected user volume, integrations (liquidity, risk, back-office), and brand guidelines. We map the scope.',
              },
              {
                step: '02',
                title: 'Fixed-Price Proposal',
                body: 'Within 5 business days you receive a scoped, milestone-based contract with a fixed price. No opaque hourly billing. No scope creep surprises.',
              },
              {
                step: '03',
                title: 'Build & Launch',
                body: 'Weekly demos against a production-like environment from week one. Delivery in 10–16 weeks. You go live on your infrastructure with your brand.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-4">
                <span className="text-5xl font-extrabold tracking-tighter text-line-strong select-none">
                  {step}
                </span>
                <h3 className="heading-3 text-ink">{title}</h3>
                <p className="body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Why Brokz ────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Why Brokz</p>
          <h2 className="heading-2 text-ink mb-4">
            Why Brokz Is the Best Web Trader Provider for Institutional Brokers
          </h2>
          <p className="body mb-10 max-w-2xl">
            We build only for institutional brokers. Every decision — architecture, UX, delivery
            model — is made with that constraint in mind.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUE_CARDS.map(({ title, body }) => (
              <div
                key={title}
                className="p-7 rounded-card border border-line bg-surface flex flex-col gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-brand" />
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. White-Label ──────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Brand Ownership</p>
              <h2 className="heading-2 text-ink mb-6">
                White-Label Web Trader — Full Brand Ownership
              </h2>
              <p className="body">
                Every pixel, your brand. We deliver the platform with your logo, colour system,
                domain, and design language applied throughout. No Brokz attribution. No
                third-party watermarks. The platform is deployed on your infrastructure and owned
                by you from day one.
              </p>
            </div>
            <ul className="flex flex-col gap-4 pt-2 lg:pt-14">
              {[
                'Custom domain deployment',
                'Full colour/typography system applied',
                'Your logo throughout',
                'No third-party branding',
                'Codebase delivered to your repository',
                'Optional white-label support contract',
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

      {/* ── 7. Pricing ──────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <p className="section-label">Pricing</p>
          <h2 className="heading-2 text-ink mb-4">
            Web Trader Pricing &amp; Licensing
          </h2>
          <p className="body mb-10 max-w-2xl">
            Two engagement models. Both deliver a production-grade platform. Pricing depends on
            scope — contact us for a detailed quote.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Card A */}
            <div className="p-8 rounded-card border-2 border-brand bg-surface flex flex-col gap-5">
              <div>
                <span className="badge-brand mb-3">One-Time License</span>
                <h3 className="heading-3 text-ink mt-2">Fixed-price delivery</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  'Full codebase ownership, no recurring fees',
                  'Milestone-based contract, fixed total price',
                  'Delivered to your repository on completion',
                  'Optional post-launch support retainer',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    {CheckIcon}
                    <span className="body-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Card B */}
            <div className="p-8 rounded-card border border-line bg-surface flex flex-col gap-5">
              <div>
                <span className="badge-brand mb-3">Ongoing Retainer</span>
                <h3 className="heading-3 text-ink mt-2">Continuous development</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  'Monthly feature sprints, priority support',
                  'Infrastructure monitoring included',
                  'Evolve the platform alongside your business',
                  'Dedicated engineering capacity',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    {CheckIcon}
                    <span className="body-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="body text-ink-secondary">
            Prices are not listed — scope varies significantly by asset classes, user volume, and
            integrations required.{' '}
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-semibold transition-colors duration-base"
            >
              Request a detailed quote {ArrowIcon}
            </a>
          </p>
        </div>
      </section>

      {/* ── 8. Key Features ─────────────────────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <p className="section-label">Features</p>
          <h2 className="heading-2 text-ink mb-10">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ title, body }) => (
              <div
                key={title}
                className="p-6 rounded-card border border-line bg-surface-muted flex flex-col gap-3"
              >
                <h3 className="heading-4 text-ink">{title}</h3>
                <p className="body-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Technical Architecture ───────────────────────────────────── */}
      <section className="section-padding bg-surface-muted">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="section-label">Architecture</p>
              <h2 className="heading-2 text-ink mb-6">Technical Architecture</h2>
              <p className="body">
                Every component is chosen for institutional-grade reliability, horizontal
                scalability, and regulatory auditability. The stack is cloud-agnostic and
                deployable on your infrastructure of choice.
              </p>
            </div>
            <ol className="flex flex-col gap-5">
              {TECH_SPECS.map(({ label, value }, i) => (
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

      {/* ── 10. FAQ ─────────────────────────────────────────────────────── */}
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

      {/* ── 11. CTA ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-inverse">
        <div className="section-container text-center">
          <p className="section-label-light mb-4">Get Started</p>
          <h2 className="heading-2 text-white mb-5">
            Ready to build your custom web trader?
          </h2>
          <p className="body-lg text-neutral-300 max-w-xl mx-auto mb-10">
            Contact us with your requirements. We respond within one business day with a scoped
            proposal.
          </p>
          <a href="/contact" className="btn-primary">
            Start a Conversation
          </a>
        </div>
      </section>
    </>
  );
}

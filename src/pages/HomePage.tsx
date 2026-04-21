import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import AnimateIn, { Stagger, StaggerItem } from '../components/AnimateIn';
import Spotlight from '../components/fx/Spotlight';
import InteractiveGrid from '../components/fx/InteractiveGrid';
import NumberTicker from '../components/fx/NumberTicker';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

// ─── icons (SVG only — no emoji) ─────────────────────────────────────────

const Icons = {
  arrow: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  layers: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  cpu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="2" x2="9" y2="4" /><line x1="15" y1="2" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="22" /><line x1="15" y1="20" x2="15" y2="22" />
      <line x1="20" y1="9" x2="22" y2="9" /><line x1="20" y1="15" x2="22" y2="15" />
      <line x1="2" y1="9" x2="4" y2="9" /><line x1="2" y1="15" x2="4" y2="15" />
    </svg>
  ),
  activity: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  network: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
};

// ─── content ─────────────────────────────────────────────────────────────

const capabilities = [
  {
    icon: Icons.layers,
    title: 'Trading Platforms',
    desc: 'Custom web traders, management dashboards, and broker back-office systems engineered for real-time execution.',
  },
  {
    icon: Icons.cpu,
    title: 'Algorithmic Systems',
    desc: 'Execution engines, backtesting frameworks, and quantitative strategy infrastructure for systematic traders.',
  },
  {
    icon: Icons.network,
    title: 'MT4 / MT5 Extensions',
    desc: 'Manager tools, risk plugins, bridge systems, and execution optimization for MetaTrader environments.',
  },
  {
    icon: Icons.activity,
    title: 'Data Infrastructure',
    desc: 'Quantitative modeling pipelines, tick-level market data, and trading analytics at institutional scale.',
  },
];

const metrics = [
  { value: '5', label: 'Product Lines' },
  { value: '4', label: 'Industry Verticals' },
  { value: 'B2B', label: 'Exclusive Focus' },
];

// ─── page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title="Brokz | Fintech Infrastructure & Trading Technology"
        description="Institutional-grade fintech infrastructure for brokerages, prop firms, and liquidity providers. Custom web traders, MT4/MT5 plugins, algorithmic trading systems."
        keywords="fintech infrastructure, trading platform development, brokerage technology, MT4 MT5 plugins, algorithmic trading software, web trader development"
        canonical="/"
      />

      <NavBar />

      {/* ═══ HERO — Exaggerated Minimalism ═══ */}
      <section className="relative bg-surface-inverse text-white overflow-hidden">
        <InteractiveGrid cellSize={64} />
        <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
        <Spotlight size={700} />

        <div className="relative section-container pt-28 md:pt-40 pb-24 md:pb-36">
          <motion.p
            className="section-label-light"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          >
            B2B Fintech Engineering
          </motion.p>

          <motion.h1
            className="heading-hero text-white max-w-[18ch] mt-6 mb-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            Infrastructure{' '}
            <span className="text-brand-accent">for modern</span>{' '}
            trading.
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          >
            We engineer institutional-grade systems for brokerages, proprietary trading firms,
            and liquidity providers. Built for reliability, latency, and scale.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease: EASE }}
          >
            <Link to="/contact" className="btn-primary">
              Start a Project
              {Icons.arrow}
            </Link>
            <Link to="/solutions" className="btn-ghost">
              Explore Solutions
            </Link>
          </motion.div>

          {/* Metric strip — minimal, mono, tabular */}
          <motion.div
            className="mt-24 md:mt-32 grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16 pt-10 border-t border-line-inverse"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          >
            {metrics.map(m => (
              <div key={m.label}>
                <div className="font-mono tabular text-4xl md:text-5xl font-semibold text-white mb-2">
                  <NumberTicker value={m.value} />
                </div>
                <div className="eyebrow text-ink-subtle">{m.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CAPABILITIES — Features ═══ */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <div className="max-w-3xl mb-20 md:mb-28">
            <AnimateIn>
              <p className="section-label">What We Build</p>
              <h2 className="heading-hero-sm text-ink mb-8">
                Engineered for the systems that <span className="text-brand">move markets</span>.
              </h2>
              <p className="body-lg max-w-2xl">
                Four capability areas. Each one built from first principles — order routing,
                risk management, and regulatory constraints handled by engineers who understand
                trading infrastructure.
              </p>
            </AnimateIn>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line rounded-card overflow-hidden border border-line">
            {capabilities.map(cap => (
              <StaggerItem key={cap.title}>
                <motion.div
                  className="bg-surface p-10 md:p-12 h-full group cursor-default"
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-brand mb-8 transition-transform duration-base group-hover:scale-110 origin-left w-fit">
                    {cap.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-ink mb-4 tracking-tight leading-tight">
                    {cap.title}
                  </h3>
                  <p className="body text-ink-secondary max-w-md">{cap.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>

          <AnimateIn>
            <div className="mt-12 flex items-center justify-between gap-6 flex-wrap">
              <p className="body text-ink-muted max-w-md">
                Need a custom solution outside these categories? We build bespoke trading infrastructure.
              </p>
              <Link to="/products" className="btn-link">
                View all products
                {Icons.arrow}
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ═══ TRUST BAND — Who we work with ═══ */}
      <section className="section-padding bg-surface-muted border-y border-line">
        <div className="section-container">
          <AnimateIn>
            <p className="section-label">Who We Work With</p>
            <h2 className="heading-2 text-ink max-w-3xl mb-14">
              Brokerages, prop firms, fintech startups, and liquidity providers.
            </h2>
          </AnimateIn>

          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {[
              { label: 'Brokerages', desc: 'Multi-asset execution and back-office.' },
              { label: 'Prop Firms', desc: 'Risk monitoring and strategy deployment.' },
              { label: 'Fintech Startups', desc: 'Institutional components, faster TTM.' },
              { label: 'Liquidity Providers', desc: 'Bridges, aggregation, execution.' },
            ].map(item => (
              <StaggerItem key={item.label}>
                <div className="border-t-2 border-brand pt-5">
                  <p className="text-lg font-semibold text-ink mb-2 tracking-tight">{item.label}</p>
                  <p className="text-sm text-ink-secondary leading-relaxed">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ CTA — above-fold repeat at bottom ═══ */}
      <section className="section-padding bg-surface-inverse text-white relative overflow-hidden">
        <InteractiveGrid cellSize={64} />
        <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
        <Spotlight size={600} />

        <div className="relative section-container">
          <AnimateIn>
            <div className="max-w-4xl">
              <p className="section-label-light">Start Here</p>
              <h2 className="heading-hero-sm text-white mb-10">
                Ready to build institutional-grade infrastructure?
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-12">
                Tell us about your technical requirements. We'll assess scope and propose a delivery architecture within one business day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary">
                  Start a Project
                  {Icons.arrow}
                </Link>
                <Link to="/products" className="btn-ghost">
                  View Products
                </Link>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

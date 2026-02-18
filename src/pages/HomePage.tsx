import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import AnimateIn, { Stagger, StaggerItem } from '../components/AnimateIn';
import StatBlock from '../components/StatBlock';
import SectionDivider from '../components/SectionDivider';

const products = [
  {
    name: 'Custom Web Trader',
    desc: 'Browser-based institutional trading platform with real-time execution, custom UI, and horizontally scalable architecture.',
  },
  {
    name: 'Management Dashboard',
    desc: 'Broker back-office system with live risk monitoring, regulatory reporting infrastructure, and full operational control.',
  },
  {
    name: 'Algorithmic Trading & Backtesting',
    desc: 'Execution engines, backtesting frameworks, and quantitative strategy optimization tooling for systematic traders.',
  },
  {
    name: 'MT4 / MT5 Plugins & Extensions',
    desc: 'Manager tools, risk plugins, bridge systems, and execution optimization modules for MetaTrader environments.',
  },
  {
    name: 'Custom Data Analysis',
    desc: 'Quantitative modeling pipelines, performance metrics engineering, and trading data infrastructure at scale.',
  },
];

const industries = [
  { name: 'Brokerages', desc: 'Full-stack infrastructure for multi-asset execution — from trading terminals to back-office reporting.' },
  { name: 'Proprietary Trading Firms', desc: 'Risk monitoring, real-time performance tracking, and strategy deployment infrastructure.' },
  { name: 'Fintech Startups', desc: 'Institutional-grade components that accelerate time-to-market without sacrificing reliability.' },
  { name: 'Liquidity Providers', desc: 'Custom bridge systems, aggregation layers, and execution management for multi-venue environments.' },
];

const pillars = [
  { label: 'Architecture First', desc: 'Every system is designed for reliability, low latency, and horizontal scalability before a single line of code is written.' },
  { label: 'Domain Expertise', desc: 'Our engineers understand trading infrastructure — order routing, risk management, and regulatory constraints — not just software.' },
  { label: 'Clean Delivery', desc: 'Documented, maintainable codebases handed over with full knowledge transfer and no vendor lock-in.' },
];

const heroStats = [
  { value: '5+', label: 'Product Lines' },
  { value: '4', label: 'Industry Verticals' },
  { value: '<1ms', label: 'Execution Latency' },
  { value: '24/7', label: 'Infrastructure Uptime' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Brokz | Fintech Infrastructure & Trading Technology"
        description="Institutional-grade fintech infrastructure and trading technology for brokerages, prop firms, and liquidity providers. Custom web traders, MT4/MT5 plugins, algo trading systems."
        keywords="fintech infrastructure, trading platform development, brokerage technology, MT4 MT5 plugins, algorithmic trading software, web trader development, risk management systems"
        ogTitle="Brokz — Fintech Infrastructure & Trading Technology"
        ogDescription="Institutional-grade systems engineered for brokerages and trading firms."
      />

      <NavBar />

      {/* Hero */}
      <section className="relative bg-brand-dark text-white overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Radial fade over grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(8,115,49,0.15),transparent)] pointer-events-none" />

        <div className="relative section-container py-28 md:py-40">
          <motion.p
            className="section-label-light mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            B2B Fintech Engineering
          </motion.p>
          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            Advanced Fintech Infrastructure{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              for Modern Trading
            </span>
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            Institutional-grade systems engineered for brokerages, proprietary trading firms,
            fintech startups, and liquidity providers.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.44, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <Link to="/solutions" className="btn-primary">
              Explore Our Solutions
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <Link to="/contact" className="btn-ghost">
              Talk to an Engineer
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <StatBlock stats={heroStats} />

      {/* What We Build */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <AnimateIn>
            <p className="section-label">What We Build</p>
            <div className="accent-bar mt-2 mb-5" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 max-w-xl leading-tight">
              Core Products
            </h2>
            <p className="text-gray-500 max-w-2xl mb-14 text-base leading-relaxed">
              Purpose-built systems for every layer of trading infrastructure — from execution
              terminals to quantitative analytics pipelines.
            </p>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className="card-feature cursor-default group h-full !p-8"
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)', borderColor: 'rgba(8,115,49,0.3)' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center mb-5">
                    <div className="w-4 h-4 rounded-sm bg-brand" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}

            <StaggerItem>
              <motion.div
                className="bg-brand-dark rounded-card p-8 flex flex-col justify-between h-full"
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <p className="text-sm text-gray-300 leading-relaxed mb-8">
                  Need a custom solution outside these categories? We build bespoke trading infrastructure.
                </p>
                <Link
                  to="/products"
                  className="text-sm font-semibold text-brand-accent inline-flex items-center gap-2 hover:gap-3 transition-all"
                >
                  View all products
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </motion.div>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* Technology & Architecture */}
      <section className="section-padding bg-gray-50 border-y border-gray-100">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimateIn direction="left">
              <p className="section-label">Technology</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Built for Reliability, Latency, and Scale
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Our systems are engineered to handle the demands of live trading environments —
                microsecond-sensitive execution paths, real-time data pipelines, and multi-broker
                connectivity with zero tolerance for downtime.
              </p>
              <Link
                to="/solutions"
                className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:gap-3 transition-all"
              >
                See our solutions
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </AnimateIn>

            <Stagger className="grid grid-cols-1 gap-5">
              {[
                { label: 'Low-Latency Execution', value: 'Sub-millisecond order routing architectures for high-frequency and institutional environments.' },
                { label: 'Real-Time Data Infrastructure', value: 'Streaming market data pipelines with tick-level granularity and custom aggregation layers.' },
                { label: 'Multi-Broker Connectivity', value: 'Bridge systems and API adapters supporting FIX, REST, and proprietary protocol integrations.' },
                { label: 'Fault-Tolerant Architecture', value: 'Redundant systems with automatic failover, distributed state management, and audit logging.' },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    className="flex gap-4 bg-white border border-gray-100 rounded-card-sm p-6"
                    whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-2" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{item.label}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.value}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <AnimateIn>
            <p className="section-label">Industries</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Who We Work With
            </h2>
            <p className="text-gray-500 max-w-xl mb-14 leading-relaxed">
              We partner with institutional-grade organizations across the financial technology spectrum.
            </p>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {industries.map((ind, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className="border-l-2 border-brand border border-l-brand border-gray-100 rounded-card p-8 bg-white h-full"
                  whileHover={{ y: -4, boxShadow: '0 10px 28px rgba(0,0,0,0.07)', borderColor: 'rgba(8,115,49,0.35)' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <h3 className="text-base font-bold text-gray-900 mb-3">{ind.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{ind.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <SectionDivider variant="dots" />

      {/* Engineering Approach */}
      <section className="section-padding bg-brand-dark text-white">
        <div className="section-container">
          <AnimateIn>
            <p className="section-label-light">Our Approach</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight max-w-xl">
              Engineering Philosophy
            </h2>
            <p className="text-gray-400 max-w-xl mb-14 leading-relaxed">
              We approach every engagement as a systems engineering problem — not a development sprint.
            </p>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className="border border-gray-800 rounded-card p-10 h-full"
                  whileHover={{ y: -4, borderColor: 'rgba(8,115,49,0.5)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center mb-5 text-brand-accent font-bold text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-base font-bold text-white mb-3">{p.label}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white">
        <div className="section-container text-center">
          <AnimateIn>
            <p className="section-label">Partner with Brokz</p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight max-w-2xl mx-auto">
              Ready to Build Institutional-Grade Infrastructure?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Tell us about your technical requirements. We'll assess scope and propose a delivery architecture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary">
                Start a Project
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link to="/products" className="btn-secondary">
                View Products
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

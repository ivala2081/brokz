import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import StatBlock from '../components/StatBlock';
import AnimateIn, { Stagger, StaggerItem } from '../components/AnimateIn';

const expertise = [
  { label: 'Trading System Architecture', desc: 'Design of low-latency, fault-tolerant order management and execution systems.' },
  { label: 'Quantitative Engineering', desc: 'Backtesting infrastructure, strategy optimization, and live execution frameworks.' },
  { label: 'Brokerage Operations', desc: 'Back-office systems, risk engines, and regulatory compliance tooling.' },
  { label: 'MT4 / MT5 Ecosystem', desc: 'Plugin development, bridge systems, and MetaTrader environment extensions.' },
  { label: 'Data Infrastructure', desc: 'Real-time market data pipelines, historical data warehousing, and analytics tooling.' },
  { label: 'Platform Development', desc: 'Custom trading terminals, client portals, and internal operational tools.' },
];

const aboutStats = [
  { value: 'Est. 2025', label: 'Founded' },
  { value: '6', label: 'Core Disciplines' },
  { value: '3', label: 'Deployment Models' },
  { value: 'B2B', label: 'Focused Exclusively' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About | Brokz — B2B Fintech Engineering"
        description="Brokz is a B2B fintech engineering firm founded in 2025. We build institutional-grade trading infrastructure, brokerage systems, and quantitative technology for financial organizations."
        keywords="fintech engineering firm, trading technology company, brokerage technology provider, institutional fintech, B2B fintech"
        ogTitle="About Brokz — B2B Fintech Engineering Firm"
        ogDescription="Institutional-grade fintech infrastructure engineered for the modern financial markets."
      />

      <NavBar />

      <PageHero
        label="About"
        title="A Fintech Engineering Firm Built for Institutional Markets"
        description="Founded in 2025, Brokz provides technology infrastructure and engineering services to brokerages, proprietary trading firms, fintech startups, and liquidity providers."
      />

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <AnimateIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <p className="section-label">Mission</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 leading-tight">
                Democratizing Institutional-Grade Infrastructure
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Our mission is to make institutional-quality trading technology accessible to
                organizations of every size — without the multi-year development cycles or
                nine-figure budgets historically required. We deliver production-ready
                infrastructure that meets the reliability, latency, and compliance standards
                of major financial institutions.
              </p>
            </div>
            <div className="bg-gray-50 rounded-card p-8 border border-gray-100">
              <p className="section-label">Vision</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 leading-tight">
                The Engineering Partner for Modern Financial Markets
              </h2>
              <p className="text-gray-500 leading-relaxed">
                We envision a financial technology ecosystem where infrastructure decisions
                are driven by engineering merit, not vendor limitations. Brokz exists to give
                trading organizations complete control over their technology — owning their
                systems, their data, and their competitive advantage.
              </p>
            </div>
          </div>
          </AnimateIn>
        </div>
      </section>

      {/* Stats */}
      <StatBlock stats={aboutStats} />

      {/* Technical Philosophy */}
      <section className="section-padding bg-gray-50 border-y border-gray-100">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <p className="section-label">Philosophy</p>
              <div className="accent-bar mt-2 mb-5" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Technical Philosophy
              </h2>
            </div>
            <div className="lg:col-span-8">
              <div className="flex flex-col gap-10">
                {[
                  {
                    title: 'Systems Thinking Over Feature Shipping',
                    body: 'We design cohesive systems before we write code. Every architecture decision considers downstream operational impact, failure modes, and long-term maintainability.',
                  },
                  {
                    title: 'Ownership Without Lock-In',
                    body: 'Every deliverable is production-ready, fully documented, and accompanied by knowledge transfer. Our clients own their codebase, their infrastructure, and their independence.',
                  },
                  {
                    title: 'Domain-Specific Precision',
                    body: 'Fintech infrastructure is not general software. Our engineers understand the regulatory context, execution semantics, and operational constraints of financial markets.',
                  },
                  {
                    title: 'Reliability as a Hard Requirement',
                    body: 'In trading environments, uptime is not a preference — it is a contractual and financial obligation. We engineer for fault tolerance and observable failure from day one.',
                  },
                ].map((item, i) => (
                  <div key={i} className="border-l-2 border-brand/30 pl-8">
                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Expertise */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <p className="section-label">Expertise</p>
          <div className="accent-bar mt-2 mb-5" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Engineering Capability
          </h2>
          <p className="text-gray-500 max-w-xl mb-14 leading-relaxed">
            Deep domain expertise across the core disciplines of institutional trading technology.
          </p>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {expertise.map((item, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className="border border-gray-100 rounded-card p-8 h-full"
                  whileHover={{ y: -4, boxShadow: '0 10px 28px rgba(0,0,0,0.07)', borderColor: 'rgba(8,115,49,0.35)' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center mb-5">
                    <span className="text-brand font-bold text-xs">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">{item.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Infrastructure Capability */}
      <section className="section-padding bg-brand-dark text-white">
        <div className="section-container">
          <p className="section-label-light">Infrastructure</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight max-w-xl">
            Deployment & Infrastructure
          </h2>
          <p className="text-gray-400 max-w-xl mb-14 leading-relaxed">
            We design for cloud-native, on-premise, and hybrid deployment environments, with
            colocation support for latency-sensitive applications.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Cloud-native deployment (AWS, GCP, Azure)',
              'On-premise and bare-metal configurations',
              'Colocation and proximity hosting for HFT',
              'Kubernetes orchestration and container infrastructure',
              'CI/CD pipelines and automated deployment',
              'Infrastructure-as-code (Terraform, Ansible)',
              'Monitoring, observability, and alerting stacks',
              'Disaster recovery and multi-region failover',
              'Security hardening and penetration test readiness',
            ].map((cap, i) => (
              <div key={i} className="flex items-start gap-3 border border-gray-800 rounded-card-sm p-6">
                <svg className="mt-0.5 w-4 h-4 text-brand-accent flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-sm text-gray-300 leading-relaxed">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

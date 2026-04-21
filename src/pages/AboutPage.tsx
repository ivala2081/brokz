import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn, { Stagger, StaggerItem } from '../components/AnimateIn';
import Spotlight from '../components/fx/Spotlight';
import InteractiveGrid from '../components/fx/InteractiveGrid';

const philosophy = [
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
];

const expertise = [
  { label: 'Trading System Architecture', desc: 'Low-latency, fault-tolerant order management and execution systems.' },
  { label: 'Quantitative Engineering', desc: 'Backtesting infrastructure, strategy optimization, and live execution frameworks.' },
  { label: 'Brokerage Operations', desc: 'Back-office systems, risk engines, and regulatory compliance tooling.' },
  { label: 'MT4 / MT5 Ecosystem', desc: 'Plugin development, bridge systems, and MetaTrader environment extensions.' },
  { label: 'Data Infrastructure', desc: 'Real-time market data pipelines, historical warehousing, and analytics tooling.' },
  { label: 'Platform Development', desc: 'Custom trading terminals, client portals, and internal operational tools.' },
];

const infrastructure = [
  'Cloud-native deployment (AWS, GCP, Azure)',
  'On-premise and bare-metal configurations',
  'Colocation and proximity hosting for HFT',
  'Kubernetes orchestration and container infrastructure',
  'CI/CD pipelines and automated deployment',
  'Infrastructure-as-code (Terraform, Ansible)',
  'Monitoring, observability, and alerting stacks',
  'Disaster recovery and multi-region failover',
  'Security hardening and penetration test readiness',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title="About | Brokz — B2B Fintech Engineering"
        description="Brokz is a B2B fintech engineering firm founded in 2025. We build institutional-grade trading infrastructure, brokerage systems, and quantitative technology for financial organizations."
        keywords="fintech engineering firm, trading technology company, brokerage technology provider, institutional fintech, B2B fintech"
        canonical="/about"
      />

      <NavBar />

      <PageHero
        label="About"
        title="A fintech firm for institutional markets."
        highlight="institutional"
        description="Founded in 2025, Brokz provides engineering services and infrastructure to brokerages, proprietary trading firms, fintech startups, and liquidity providers."
      />

      {/* Mission */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <AnimateIn>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="section-label">Mission</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="heading-hero-sm text-ink mb-10 max-w-[18ch]">
                  <span className="text-brand">Democratizing</span> institutional-grade infrastructure.
                </h2>
                <p className="body-lg max-w-2xl">
                  Our mission is to make institutional-quality trading technology accessible to
                  organizations of every size — without the multi-year development cycles or
                  nine-figure budgets historically required. We deliver production-ready
                  infrastructure that meets the reliability, latency, and compliance standards
                  of major financial institutions.
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-surface-muted border-y border-line">
        <div className="section-container">
          <AnimateIn>
            <div className="max-w-3xl mb-16">
              <p className="section-label">Philosophy</p>
              <h2 className="heading-hero-sm text-ink max-w-[14ch]">
                Four engineering principles.
              </h2>
            </div>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line rounded-card overflow-hidden border border-line">
            {philosophy.map((item, i) => (
              <StaggerItem key={item.title}>
                <motion.div
                  className="bg-surface p-10 md:p-12 h-full"
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-baseline gap-4 mb-5">
                    <span className="font-mono tabular text-sm font-semibold text-brand">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-ink mb-4 tracking-tight">{item.title}</h3>
                  <p className="body text-ink-secondary">{item.body}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Expertise */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <AnimateIn>
            <div className="max-w-3xl mb-16">
              <p className="section-label">Expertise</p>
              <h2 className="heading-hero-sm text-ink mb-8 max-w-[16ch]">
                Six disciplines. One stack.
              </h2>
              <p className="body-lg max-w-2xl">
                Deep domain expertise across the core disciplines of institutional trading technology.
              </p>
            </div>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertise.map((item, i) => (
              <StaggerItem key={item.label}>
                <motion.div
                  className="card-interactive h-full"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-mono tabular text-xs font-semibold text-brand bg-brand-subtle px-2 py-1 rounded-md">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2 tracking-tight">{item.label}</h3>
                  <p className="body-sm">{item.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="section-padding bg-surface-inverse text-white relative overflow-hidden">
        <InteractiveGrid cellSize={64} />
        <Spotlight size={600} />

        <div className="relative section-container">
          <AnimateIn>
            <div className="max-w-3xl mb-16">
              <p className="section-label-light">Infrastructure</p>
              <h2 className="heading-hero-sm text-white mb-8 max-w-[16ch]">
                Deploy anywhere. Latency matters.
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                We design for cloud-native, on-premise, and hybrid deployment environments — with
                colocation support for latency-sensitive applications.
              </p>
            </div>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {infrastructure.map(cap => (
              <StaggerItem key={cap}>
                <div className="flex items-start gap-3 border border-line-inverse rounded-card-sm p-5 h-full">
                  <svg className="mt-0.5 w-4 h-4 text-brand-accent flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-sm text-gray-300 leading-relaxed">{cap}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Footer />
    </div>
  );
}

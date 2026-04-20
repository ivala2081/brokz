import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import { Stagger, StaggerItem } from '../components/AnimateIn';

const solutions = [
  {
    number: '01',
    title: 'Brokerage Infrastructure Setup',
    description:
      'End-to-end design and deployment of brokerage technology stacks. We architect the full operational layer: trading platform, liquidity connectivity, back-office systems, risk engine, and client portal. Built from the ground up for regulatory compliance and operational resilience.',
    capabilities: [
      'Trading platform selection and custom configuration',
      'Liquidity bridge architecture and deployment',
      'Client portal and account management systems',
      'KYC/AML technology integration',
      'Regulatory reporting and audit trail infrastructure',
    ],
  },
  {
    number: '02',
    title: 'Trading System Automation',
    description:
      'Full automation of order management, execution workflows, and operational processes. We eliminate manual intervention across the trade lifecycle — from signal generation to settlement reconciliation — reducing latency and operational risk.',
    capabilities: [
      'Automated order management system (OMS) development',
      'Execution workflow automation and routing logic',
      'Position and exposure reconciliation pipelines',
      'Automated reporting and alerting systems',
      'Integration with prime brokers and clearing infrastructure',
    ],
  },
  {
    number: '03',
    title: 'Risk & Execution Optimization',
    description:
      'Real-time risk monitoring and execution quality improvement systems. We build engines that evaluate pre-trade risk, monitor live exposure, and enforce position limits — with execution analytics layered on top to identify slippage and routing inefficiencies.',
    capabilities: [
      'Pre-trade and post-trade risk engines',
      'Real-time P&L and exposure monitoring',
      'Position limit enforcement and margin call automation',
      'Execution quality analysis (slippage, fill rates, latency)',
      'Risk parameter management dashboards',
    ],
  },
  {
    number: '04',
    title: 'Data-Driven Strategy Engineering',
    description:
      'Quantitative research infrastructure for trading strategy development, backtesting, and deployment. We build the data pipelines, modeling environments, and execution frameworks that systematic traders require to operate at scale.',
    capabilities: [
      'Historical market data ingestion and normalization',
      'Backtesting engines with realistic market simulation',
      'Walk-forward and Monte Carlo analysis tooling',
      'Strategy parameter optimization frameworks',
      'Live execution and monitoring for deployed strategies',
    ],
  },
  {
    number: '05',
    title: 'Custom Platform Development',
    description:
      'Bespoke financial technology development for organizations with requirements that off-the-shelf platforms cannot meet. We design and build custom trading terminals, analytics tools, and internal systems from specification to production deployment.',
    capabilities: [
      'Custom web-based trading terminal development',
      'Proprietary analytics and charting platforms',
      'Internal tooling for risk and operations teams',
      'API development for third-party integrations',
      'White-label platform customization and extension',
    ],
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title="Solutions | Brokz — Fintech Infrastructure"
        description="Brokerage infrastructure setup, trading system automation, risk and execution optimization, data-driven strategy engineering, and custom platform development."
        keywords="brokerage infrastructure, trading system automation, risk management systems, execution optimization, fintech platform development, broker back-office software"
        canonical="/solutions"
      />

      <NavBar />

      <PageHero
        label="Solutions"
        title="Infrastructure solutions, engineered."
        highlight="engineered"
        description="Five core solution areas covering the full spectrum of institutional trading technology — from infrastructure setup to quantitative strategy systems."
      />

      {/* Solutions — massive typography, alternating layout */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          <Stagger className="flex flex-col divide-y divide-line">
            {solutions.map(sol => (
              <StaggerItem key={sol.number}>
                <motion.div
                  className="py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 group"
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.4)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="lg:col-span-5">
                    <div className="flex items-baseline gap-5 mb-5">
                      <span className="font-mono tabular text-lg md:text-xl font-semibold text-brand">
                        {sol.number}
                      </span>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink tracking-tight leading-[1.1]">
                      {sol.title}
                    </h2>
                  </div>
                  <div className="lg:col-span-7">
                    <p className="body mb-8 max-w-2xl">{sol.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {sol.capabilities.map((cap, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-ink-secondary leading-relaxed">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Footer />
    </div>
  );
}

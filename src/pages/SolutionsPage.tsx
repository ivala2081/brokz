import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import CTABanner from '../components/CTABanner';
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
    <div className="min-h-screen bg-white">
      <SEO
        title="Solutions | Brokz — Fintech Infrastructure"
        description="Brokerage infrastructure setup, trading system automation, risk and execution optimization, data-driven strategy engineering, and custom platform development."
        keywords="brokerage infrastructure, trading system automation, risk management systems, execution optimization, fintech platform development, broker back-office software"
        ogTitle="Solutions — Brokz Fintech Infrastructure"
        ogDescription="Five core solution areas covering the full spectrum of institutional trading technology."
      />

      <NavBar />

      <PageHero
        label="Solutions"
        title="Fintech Infrastructure Solutions"
        description="Five core solution areas covering the full spectrum of institutional trading technology — from infrastructure setup to quantitative strategy systems."
      />

      {/* Solutions List */}
      <section className="section-padding">
        <div className="section-container">
          <Stagger className="flex flex-col gap-0" staggerDelay={0.1}>
            {solutions.map((sol, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className={`py-16 border-b border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-12 ${i === 0 ? 'pt-0' : ''}`}
                  whileHover={{ backgroundColor: 'rgba(248,250,252,0.6)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`lg:col-span-4 ${i % 2 === 1 ? 'lg:order-last' : ''}`}>
                    <span className="text-xs font-bold text-gray-300 tracking-widest block mb-3">{sol.number}</span>
                    <div className="accent-bar mb-4" />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{sol.title}</h2>
                  </div>
                  <div className="lg:col-span-8">
                    <p className="text-gray-500 leading-relaxed mb-8">{sol.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sol.capabilities.map((cap, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-gray-600">
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

      <CTABanner
        title="Discuss Your Infrastructure Requirements"
        description="We evaluate project scope, define architecture, and propose a structured delivery plan."
        buttonText="Get in Touch"
        buttonLink="/contact"
      />

      <Footer />
    </div>
  );
}

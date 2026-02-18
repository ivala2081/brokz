import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import CTABanner from '../components/CTABanner';
import AnimateIn, { Stagger, StaggerItem } from '../components/AnimateIn';

const products = [
  {
    name: 'Custom Web Trader',
    tag: 'Trading Platform',
    description:
      'A browser-based institutional trading terminal engineered for performance and customizability. Built with a real-time execution layer, configurable UI components, and a scalable backend architecture suited for multi-asset, multi-broker environments.',
    features: [
      'Real-time order book and execution feed via WebSocket',
      'Multi-asset support: FX, equities, derivatives, crypto',
      'Configurable charting and analytics widgets',
      'One-click and algorithmic order entry modes',
      'Multi-account and sub-account management',
      'White-label and fully branded deployment options',
    ],
  },
  {
    name: 'In-House Management Dashboard',
    tag: 'Back-Office System',
    description:
      'A comprehensive broker back-office platform providing operational visibility across all client accounts, positions, and risk exposure. Designed for compliance teams, risk managers, and operations staff who need real-time data and audit-grade record-keeping.',
    features: [
      'Live client account and position monitoring',
      'Risk exposure dashboards with configurable alerts',
      'P&L tracking and attribution reporting',
      'Trade reconciliation and settlement workflows',
      'Regulatory report generation and audit logs',
      'Role-based access control for internal teams',
    ],
  },
  {
    name: 'Algorithmic Trading & Strategy Testing',
    tag: 'Quantitative Infrastructure',
    description:
      'A complete infrastructure stack for systematic trading — from historical data ingestion to live strategy deployment. Includes a high-fidelity backtesting engine, walk-forward analysis tools, and a live execution framework with real-time monitoring.',
    features: [
      'Historical tick and OHLCV data normalization pipeline',
      'Event-driven backtesting engine with realistic fills',
      'Walk-forward, Monte Carlo, and sensitivity analysis',
      'Strategy parameter optimization (grid, genetic, Bayesian)',
      'Live strategy execution with position tracking',
      'Performance dashboards: Sharpe, drawdown, Calmar ratio',
    ],
  },
  {
    name: 'MT4 / MT5 Plugins & Extensions',
    tag: 'MetaTrader Integration',
    description:
      'Custom plugin development for MetaTrader 4 and MetaTrader 5 environments. We extend native MT4/MT5 capabilities with risk management overlays, execution optimization modules, bridge systems, and manager tool enhancements.',
    features: [
      'Custom MT4/MT5 Expert Advisors (EAs) and indicators',
      'Risk management plugins with real-time enforcement',
      'Execution optimization and latency reduction modules',
      'Bridge systems for external liquidity connectivity',
      'Manager API integrations for back-office workflows',
      'Symbol configuration and swap calculation extensions',
    ],
  },
  {
    name: 'Custom Data Analysis & Optimization',
    tag: 'Analytics Engineering',
    description:
      'Quantitative analytics and data engineering for trading organizations that need to extract operational intelligence from their data. We design pipelines, build visualization layers, and construct models for performance attribution and strategy optimization.',
    features: [
      'Trade data ingestion, cleansing, and warehousing',
      'Execution quality analysis: slippage, fill rates, timing',
      'Client and portfolio performance attribution models',
      'Risk factor decomposition and scenario analysis',
      'Custom reporting dashboards for management and compliance',
      'Machine learning applications for pattern detection',
    ],
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Products | Brokz — Trading Technology"
        description="Custom web trader, broker management dashboard, algorithmic trading infrastructure, MT4/MT5 plugins, and custom data analytics. Institutional-grade fintech products."
        keywords="custom web trader, broker back-office software, algorithmic trading software, MT4 MT5 plugins, trading data analytics, fintech products"
        ogTitle="Products — Brokz Trading Technology"
        ogDescription="Institutional-grade fintech products engineered for brokerages and trading firms."
      />

      <NavBar />

      <PageHero
        label="Products"
        title="Institutional Trading Technology Products"
        description="Five purpose-built product lines covering every layer of the trading technology stack — from front-end terminals to quantitative analytics infrastructure."
      />

      {/* Products */}
      <section className="section-padding">
        <div className="section-container">
          <div className="flex flex-col gap-20">
            {products.map((product, i) => (
              <AnimateIn key={i} delay={0.05}>
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 ${i < products.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className={`lg:col-span-4 ${i % 2 === 1 ? 'lg:order-last' : ''}`}>
                    <span className="inline-block text-xs font-bold text-brand bg-brand-light px-3 py-1.5 rounded-full tracking-wide mb-4">
                      {product.tag}
                    </span>
                    <div className="accent-bar mt-3 mb-4" />
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {product.name}
                    </h2>
                  </div>
                  <div className="lg:col-span-8">
                    <p className="text-gray-500 leading-relaxed mb-8 text-base">{product.description}</p>
                    <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4" staggerDelay={0.05}>
                      {product.features.map((feat, j) => (
                        <StaggerItem key={j}>
                          <motion.div
                            className="card-feature flex items-start gap-3"
                            whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderColor: 'rgba(8,115,49,0.2)' }}
                            transition={{ duration: 0.15 }}
                          >
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                            <span className="text-sm text-gray-600 leading-relaxed">{feat}</span>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        title="Request a Technical Overview"
        description="We provide detailed architecture documentation and technical specifications on request."
        buttonText="Contact Us"
        buttonLink="/contact"
      />

      <Footer />
    </div>
  );
}

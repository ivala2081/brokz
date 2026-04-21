import { Link } from 'react-router-dom';
import { BrokzLogoCompact } from './BrokzLogo';

const companyLinks = [
  { label: 'Solutions', path: '/solutions' },
  { label: 'Products', path: '/products' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

const legalLinks = [
  { label: 'Terms of Service', path: '/legal/terms' },
  { label: 'Privacy Policy', path: '/legal/privacy' },
  { label: 'Risk Disclosure', path: '/legal/risk-disclosure' },
  { label: 'Disclaimer', path: '/legal/disclaimer' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-inverse text-ink-subtle relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 pointer-events-none bg-grid-dark bg-[length:64px_64px]" />
      {/* Brand radial ambient light */}
      <div className="absolute inset-0 bg-brand-radial pointer-events-none" />

      {/* ─── Wordmark supergraphic — full-bleed background layer ─── */}
      {/* Per-pair optical kerning: K-Z opened (diagonal collision), B-R slight. */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none select-none flex items-end justify-center"
        aria-hidden="true"
      >
        <div className="brand-wordmark brand-wordmark-bg">
          <span>B</span>
          <span style={{ marginLeft: '0.005em' }}>R</span>
          <span>O</span>
          <span>K</span>
          <span style={{ marginLeft: '0.025em' }}>Z</span>
        </div>
      </div>

      {/* ─── Content layer ─── */}
      <div className="relative max-w-layout mx-auto px-6">

        {/* ═══ STATEMENT — Footer close, smaller than page CTA ═══ */}
        <section className="pt-24 md:pt-32 pb-16 md:pb-20">
          <p className="section-label-light mb-5">Brokz · B2B Fintech Engineering</p>
          <h2 className="heading-2 text-white mb-8 max-w-[20ch]">
            One engineering partner. The full stack.
          </h2>
          <p className="body-lg text-gray-300 max-w-2xl mb-10">
            Brokerages, proprietary trading firms, and liquidity providers.
            Response within one business day.
          </p>
          <Link to="/contact" className="btn-primary btn-shimmer">
            Start a Project
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </section>

        {/* ═══ INFO GRID ═══ */}
        <section className="pt-14 pb-14 border-t border-line-inverse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">

            {/* Brand */}
            <div className="lg:col-span-5">
              <BrokzLogoCompact size={32} withWordmark variant="light" />
              <p className="body-sm text-ink-subtle mt-6 max-w-sm">
                Institutional-grade fintech infrastructure and trading technology.
                Engineered for brokerages, prop firms, and liquidity providers.
              </p>

              {/* Operational status — B2B trust signal */}
              <div className="flex items-center gap-2.5 mt-8">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                </span>
                <span className="text-xs font-mono tabular text-ink-subtle">
                  All systems operational
                </span>
              </div>
            </div>

            {/* Company column */}
            <div className="lg:col-span-3 lg:col-start-7">
              <p className="eyebrow text-ink-muted mb-6">Company</p>
              <ul className="flex flex-col gap-3.5 text-sm">
                {companyLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-ink-subtle hover:text-white transition-colors duration-base focus-visible:outline-none focus-visible:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal column */}
            <div className="lg:col-span-3">
              <p className="eyebrow text-ink-muted mb-6">Legal</p>
              <ul className="flex flex-col gap-3.5 text-sm">
                {legalLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-ink-subtle hover:text-white transition-colors duration-base focus-visible:outline-none focus-visible:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* ═══ REGULATORY NOTICE ═══ */}
        <section className="pt-12 pb-12 border-t border-line-inverse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3">
              <p className="eyebrow text-ink-muted">Regulatory Notice</p>
            </div>
            <div className="lg:col-span-9">
              <p className="text-sm text-ink-subtle leading-relaxed max-w-3xl">
                <strong className="text-gray-300 font-semibold">Brokz is a technology and systems provider.</strong>{' '}
                We do not provide investment advice, manage client funds, or operate as a broker, dealer,
                or financial advisor. All products are informational and technical in nature. Trading
                involves substantial risk of loss. Ensure compliance with applicable local regulations
                before deploying any financial technology.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ BOTTOM BAR ═══ */}
        <section className="pt-8 pb-10 border-t border-line-inverse mb-24 md:mb-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs font-mono tabular text-ink-muted">
              © {year} Brokz · Founded 2025 · All rights reserved
            </p>
            <div className="flex items-center gap-5">
              <Link
                to="/legal"
                className="text-xs font-mono tabular text-ink-subtle hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white"
              >
                Legal
              </Link>
              <span className="text-ink-muted" aria-hidden="true">·</span>
              <a
                href="mailto:contact@brokz.io"
                className="text-xs font-mono tabular text-ink-subtle hover:text-brand-accent transition-colors focus-visible:outline-none focus-visible:text-brand-accent"
              >
                contact@brokz.io
              </a>
            </div>
          </div>
        </section>

      </div>
    </footer>
  );
}

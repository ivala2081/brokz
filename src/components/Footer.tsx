import { useTranslation } from 'react-i18next';
import { BrokzLogoCompact } from './BrokzLogo';
import LocalizedLink from '../i18n/LocalizedLink';
import type { RouteKey } from '../i18n/routes';
import watermarkSrc from '../assets/logo/brokz-logo-on-dark.svg';

const COMPANY_LINKS: { key: RouteKey; i18n: string }[] = [
  { key: 'solutions', i18n: 'nav.solutions' },
  { key: 'products',  i18n: 'nav.products' },
  { key: 'about',     i18n: 'nav.about' },
  { key: 'blog',      i18n: 'nav.blog' },
  { key: 'contact',   i18n: 'nav.contact' },
];

const LEGAL_LINKS: { key: RouteKey; i18n: string }[] = [
  { key: 'legalTerms',      i18n: 'footer.legalLinks.terms' },
  { key: 'legalPrivacy',    i18n: 'footer.legalLinks.privacy' },
  { key: 'legalRisk',       i18n: 'footer.legalLinks.risk' },
  { key: 'legalDisclaimer', i18n: 'footer.legalLinks.disclaimer' },
];

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-inverse text-ink-subtle relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 pointer-events-none bg-grid-dark bg-[length:64px_64px]" />
      {/* Brand radial ambient light */}
      <div className="absolute inset-0 bg-brand-radial pointer-events-none" />

      {/* ─── Brand lockup supergraphic — full-bleed background layer ─── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none select-none flex items-end justify-center overflow-hidden"
        aria-hidden="true"
      >
        <img
          src={watermarkSrc}
          alt=""
          draggable={false}
          className="brand-watermark-svg"
        />
      </div>

      {/* ─── Content layer ─── */}
      <div className="relative max-w-layout mx-auto px-6">

        {/* ═══ STATEMENT ═══ */}
        <section className="pt-16 md:pt-20 pb-8 md:pb-10">
          <p className="section-label-light mb-4">{t('footer.eyebrow')}</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-white mb-5 max-w-[20ch]">
                {t('footer.heading')}
              </h2>
              <p className="body text-gray-300">
                {t('footer.body')}
              </p>
            </div>
            <LocalizedLink to="contact" className="btn-primary btn-shimmer shrink-0 self-start lg:self-end">
              {t('cta.startProject')}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </LocalizedLink>
          </div>
        </section>

        {/* ═══ INFO GRID ═══ */}
        <section className="pt-10 pb-10 border-t border-line-inverse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">

            {/* Brand */}
            <div className="lg:col-span-5">
              <BrokzLogoCompact size={80} withWordmark variant="light" />
              <p className="body-sm text-ink-subtle mt-6 max-w-sm">
                {t('footer.brandDescription')}
              </p>

              {/* Operational status — B2B trust signal */}
              <div className="flex items-center gap-2.5 mt-8">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                </span>
                <span className="text-xs font-mono tabular text-ink-subtle">
                  {t('status.operational')}
                </span>
              </div>
            </div>

            {/* Company column */}
            <div className="lg:col-span-3 lg:col-start-7">
              <p className="eyebrow text-ink-muted mb-6">{t('footer.columns.company')}</p>
              <ul className="flex flex-col gap-3.5 text-sm">
                {COMPANY_LINKS.map(link => (
                  <li key={link.key}>
                    <LocalizedLink
                      to={link.key}
                      className="text-ink-subtle hover:text-white transition-colors duration-base focus-visible:outline-none focus-visible:text-white"
                    >
                      {t(link.i18n)}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal column */}
            <div className="lg:col-span-3">
              <p className="eyebrow text-ink-muted mb-6">{t('footer.columns.legal')}</p>
              <ul className="flex flex-col gap-3.5 text-sm">
                {LEGAL_LINKS.map(link => (
                  <li key={link.key}>
                    <LocalizedLink
                      to={link.key}
                      className="text-ink-subtle hover:text-white transition-colors duration-base focus-visible:outline-none focus-visible:text-white"
                    >
                      {t(link.i18n)}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* ═══ REGULATORY + BOTTOM BAR — merged compact tail ═══ */}
        <section className="pt-8 pb-8 border-t border-line-inverse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            <div className="lg:col-span-3">
              <p className="eyebrow text-ink-muted">{t('footer.regulatory.label')}</p>
            </div>
            <div className="lg:col-span-9">
              <p className="text-xs text-ink-subtle leading-relaxed max-w-3xl">
                <strong className="text-gray-300 font-semibold">{t('footer.regulatory.leadStrong')}</strong>{' '}
                {t('footer.regulatory.body')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6 pt-6 border-t border-line-inverse">
            <p className="text-xs font-mono tabular text-ink-muted">
              {t('footer.copyright', { year })}
            </p>
            <div className="flex items-center gap-5">
              <LocalizedLink
                to="legal"
                className="text-xs font-mono tabular text-ink-subtle hover:text-white transition-colors focus-visible:outline-none focus-visible:text-white"
              >
                {t('footer.legalShort')}
              </LocalizedLink>
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

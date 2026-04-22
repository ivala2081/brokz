import { useTranslation } from 'react-i18next';
import PageHero from './PageHero';
import AnimateIn, { Stagger, StaggerItem } from './AnimateIn';
import LocalizedLink from '../i18n/LocalizedLink';
import type { RouteKey } from '../lib/routes';
import '../i18n';

const LEGAL_CARDS: { docKey: 'terms' | 'privacy' | 'risk' | 'disclaimer'; route: RouteKey }[] = [
  { docKey: 'terms',      route: 'legalTerms' },
  { docKey: 'privacy',    route: 'legalPrivacy' },
  { docKey: 'risk',       route: 'legalRisk' },
  { docKey: 'disclaimer', route: 'legalDisclaimer' },
];

export default function LegalLandingContent() {
  const { t } = useTranslation('legal');
  const noticeItems = t('landing.noticeItems', { returnObjects: true }) as string[];

  return (
    <>
      <PageHero
        label={t('landing.hero.label')}
        title={t('landing.hero.title')}
        description={t('landing.hero.description')}
      />

      <section className="section-padding">
        <div className="section-container">
          {/* ─── Pre-Incorporation Notice ─── */}
          <AnimateIn>
            <aside
              role="note"
              className="mb-10 card-muted border-l-4 border-l-status-info"
            >
              <p className="eyebrow text-ink-muted mb-2">{t('preIncorporation.title')}</p>
              <p className="body-sm text-ink-secondary mb-3">
                {t('preIncorporation.body')}
              </p>
              <p className="text-xs font-mono tabular text-ink-muted">
                {t('preIncorporation.contactLabel')}{' '}
                <a href="mailto:legal@brokztech.com" className="text-brand hover:underline">
                  legal@brokztech.com
                </a>
              </p>
            </aside>
          </AnimateIn>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LEGAL_CARDS.map(card => (
              <StaggerItem key={card.docKey}>
                <LocalizedLink
                  to={card.route}
                  className="card-interactive block group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center mb-5">
                    <div className="w-4 h-4 rounded-sm bg-brand" />
                  </div>
                  <h3 className="heading-3 text-ink mb-3 group-hover:text-brand transition-colors">
                    {t(`docs.${card.docKey}.title`)}
                  </h3>
                  <p className="body-sm mb-5">{t(`landing.docSummaries.${card.docKey}`)}</p>
                  <span className="btn-link">
                    {t('landing.cardCta')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </LocalizedLink>
              </StaggerItem>
            ))}
          </Stagger>

          <AnimateIn>
            <div className="mt-14 card-muted border-l-4 border-l-status-warning">
              <h3 className="heading-4 text-ink mb-3">{t('landing.noticeHeading')}</h3>
              <p className="body-sm text-ink-secondary mb-4">
                <strong className="text-ink">{t('landing.noticeLead')}</strong> {t('landing.noticeBody')}
              </p>
              <ul className="space-y-2 text-sm text-ink-secondary">
                {noticeItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-warning flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimateIn>
        </div>
      </section>

    </>
  );
}

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn from '../components/AnimateIn';
import LocalizedLink from '../i18n/LocalizedLink';
import NotFoundPage from './NotFoundPage';
import { ROUTES, type RouteKey, localeFromPath } from '../i18n/routes';
import { breadcrumbList } from '../lib/jsonld';

type DocKey = 'terms' | 'privacy' | 'risk' | 'disclaimer';

/** Which legal route key corresponds to which translation doc key. */
const ROUTE_TO_DOC_KEY = {
  legalTerms:      'terms',
  legalPrivacy:    'privacy',
  legalRisk:       'risk',
  legalDisclaimer: 'disclaimer',
} as const satisfies Partial<Record<RouteKey, DocKey>>;

type LegalRouteKey = keyof typeof ROUTE_TO_DOC_KEY;

/** Reverse-lookup the current pathname against ROUTES to find its doc key.
 *  Works for both EN and TR URLs since ROUTES holds both variants. */
function docKeyForPath(pathname: string): DocKey | undefined {
  for (const key of Object.keys(ROUTE_TO_DOC_KEY) as LegalRouteKey[]) {
    const route = ROUTES[key];
    if (route.en === pathname || route.tr === pathname) {
      return ROUTE_TO_DOC_KEY[key];
    }
  }
  return undefined;
}

type Section = { heading: string; body: string };

export default function LegalPage() {
  const { pathname } = useLocation();
  const { t } = useTranslation('legal');

  const docKey = docKeyForPath(pathname);
  if (!docKey) return <NotFoundPage />;

  const sections = t(`docs.${docKey}.sections`, { returnObjects: true }) as Section[];
  const title    = t(`docs.${docKey}.title`);
  const noticeText = docKey === 'risk' || docKey === 'disclaimer'
    ? t(`docs.${docKey}.notice`)
    : '';

  const noticeTone = docKey === 'disclaimer' ? 'danger' : 'warning';
  const noticeStyles = {
    warning: 'bg-amber-50 border-l-status-warning text-amber-900',
    danger:  'bg-red-50 border-l-status-danger text-red-900',
  } as const;

  const locale = localeFromPath(pathname);
  const legalIndexPath = locale === 'tr' ? '/tr/yasal' : '/legal';
  const breadcrumbSchema = breadcrumbList([
    { name: locale === 'tr' ? 'Ana Sayfa' : 'Home', path: locale === 'tr' ? '/tr' : '/' },
    { name: t('landing.hero.label'),                 path: legalIndexPath },
    { name: title,                                   path: pathname },
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title={`${title} | Brokz`}
        description={t('seo.description')}
        jsonLd={breadcrumbSchema}
      />
      <NavBar />

      <PageHero
        label={t('landing.hero.label')}
        title={title}
        description={`${t('metadata.lastUpdatedLabel')}: ${t('metadata.lastUpdated')} · ${t('metadata.version')}`}
      />

      <section className="section-padding">
        <div className="section-container-narrow">
          <AnimateIn>
            <article className="card md:p-12">
              {/* ─── Pre-Incorporation Notice (shown on every legal doc page) ─── */}
              <aside
                role="note"
                className="border-l-4 border-l-status-info bg-surface-muted p-5 rounded-md mb-8"
              >
                <p className="eyebrow text-ink-muted mb-2">{t('preIncorporation.title')}</p>
                <p className="text-sm text-ink-secondary mb-2 leading-relaxed">
                  {t('preIncorporation.body')}
                </p>
                <p className="text-xs font-mono tabular text-ink-muted">
                  {t('preIncorporation.contactLabel')}{' '}
                  <a href="mailto:legal@brokztech.com" className="text-brand hover:underline">
                    legal@brokztech.com
                  </a>
                </p>
              </aside>

              {noticeText && (
                <div className={`border-l-4 p-5 rounded-md mb-8 ${noticeStyles[noticeTone]}`}>
                  <p className="text-sm font-semibold">{noticeText}</p>
                </div>
              )}

              <div className="flex flex-col gap-8">
                {sections.map((section, i) => (
                  <div key={i}>
                    <h3 className="heading-3 text-ink mb-3">{section.heading}</h3>
                    <p className="body">{section.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-line">
                <LocalizedLink to="legal" className="btn-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  {t('metadata.backToDocs')}
                </LocalizedLink>
              </div>
            </article>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn from '../components/AnimateIn';
import LocalizedLink from '../i18n/LocalizedLink';
import NotFoundPage from './NotFoundPage';

type DocKey = 'terms' | 'privacy' | 'risk' | 'disclaimer';

/**
 * Both EN and TR localized URL slugs map to the same doc key here — so the
 * component can fetch the correct translated content regardless of which
 * language the URL is in.
 */
const SLUG_TO_DOC_KEY: Record<string, DocKey> = {
  // EN slugs
  'terms':              'terms',
  'privacy':            'privacy',
  'risk-disclosure':    'risk',
  'disclaimer':         'disclaimer',
  // TR slugs
  'kullanim-kosullari':  'terms',
  'gizlilik-politikasi': 'privacy',
  'risk-aciklamasi':     'risk',
  'feragat-beyani':      'disclaimer',
};

type Section = { heading: string; body: string };

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('legal');

  const docKey = slug ? SLUG_TO_DOC_KEY[slug] : undefined;
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

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title={`${title} | Brokz`}
        description={t('seo.description')}
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
                  <a href="mailto:legal@brokz.io" className="text-brand hover:underline">
                    legal@brokz.io
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

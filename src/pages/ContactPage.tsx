import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn from '../components/AnimateIn';
import LocalizedLink from '../i18n/LocalizedLink';
import { breadcrumbList, contactPage } from '../lib/jsonld';
import { useLocation } from 'react-router-dom';
import { localeFromPath } from '../i18n/routes';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Select option values — stay in English regardless of UI language so the
 * backend receives a consistent set of categories. The label is localized
 * via the option key that matches `contact.form.type.options.<key>`.
 */
const INQUIRY_OPTIONS: { key: string; value: string }[] = [
  { key: 'brokerage',   value: 'Brokerage Infrastructure' },
  { key: 'platform',    value: 'Trading Platform Development' },
  { key: 'mt',          value: 'MT4/MT5 Plugins' },
  { key: 'algo',        value: 'Algorithmic Trading Systems' },
  { key: 'risk',        value: 'Risk & Execution Optimization' },
  { key: 'data',        value: 'Data Analytics' },
  { key: 'partnership', value: 'Partnership' },
  { key: 'other',       value: 'Other' },
];

export default function ContactPage() {
  const { t } = useTranslation('contact');
  const { pathname } = useLocation();
  const locale = localeFromPath(pathname);

  const contactSchema = contactPage(t('seo.title'), t('seo.description'), pathname);
  const breadcrumbSchema = breadcrumbList([
    { name: locale === 'tr' ? 'Ana Sayfa' : 'Home', path: locale === 'tr' ? '/tr' : '/' },
    { name: t('hero.label'),                         path: pathname },
  ]);

  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    type: '',
    message: '',
    consent: false,
    // Honeypot — real users never touch this; bots fill everything
    website: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target as HTMLInputElement;
    const nextValue: string | boolean =
      target.type === 'checkbox' ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: nextValue });
    if (fieldErrors[target.name]) {
      setFieldErrors(prev => {
        const { [target.name]: _, ...rest } = prev;
        return rest;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;

    if (!formData.consent) {
      setErrorMsg(t('form.consentError'));
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');
    setFieldErrors({});

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.fields) setFieldErrors(data.fields);
        setErrorMsg(data.error || t('form.errors.generic'));
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg(t('form.errors.network'));
      setStatus('error');
    }
  }

  const submitted = status === 'success';
  const submitting = status === 'submitting';
  const helpItems = t('info.helpItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        keywords={t('seo.keywords')}
        jsonLd={[contactSchema, breadcrumbSchema]}
      />

      <NavBar />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        highlight={t('hero.highlight')}
        description={t('hero.description')}
      />

      {/* Contact Section */}
      <section className="section-padding">
        <div className="section-container">
          <AnimateIn>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Left: Info */}
            <div className="lg:col-span-4">
              <h2 className="heading-3 text-ink mb-6">{t('info.heading')}</h2>
              <p className="body-sm mb-8">
                {t('info.body')}
              </p>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-muted mb-1">{t('info.emailLabel')}</p>
                    <a href="mailto:contact@brokz.io" className="text-sm font-medium text-ink hover:text-brand transition-colors">
                      contact@brokz.io
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-muted mb-1">{t('info.responseLabel')}</p>
                    <p className="text-sm text-ink">{t('info.responseValue')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-muted mb-1">{t('info.engagementsLabel')}</p>
                    <p className="text-sm text-ink">{t('info.engagementsValue')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-surface-muted border border-line rounded-card">
                <p className="eyebrow text-ink-muted mb-3">{t('info.helpLabel')}</p>
                <ul className="space-y-3 text-sm text-ink-secondary">
                  {helpItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-subtle flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 className="heading-3 text-ink mb-3">{t('form.success.title')}</h2>
                  <p className="body text-ink-secondary max-w-sm">
                    {t('form.success.body')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
                  {/* Honeypot */}
                  <div aria-hidden="true" className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden">
                    <label>
                      Website (leave empty)
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  {errorMsg && (
                    <div
                      role="alert"
                      className="p-4 rounded-card-sm bg-red-50 border border-red-100 text-sm text-red-800"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="input-label" htmlFor="company">
                        {t('form.company.label')} <span className="text-brand" aria-label={t('form.required')}>*</span>
                      </label>
                      <input
                        id="company"
                        type="text"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        placeholder={t('form.company.placeholder')}
                        className="input"
                        aria-invalid={!!fieldErrors.company}
                        aria-describedby={fieldErrors.company ? 'err-company' : undefined}
                      />
                      {fieldErrors.company && (
                        <p id="err-company" className="mt-2 text-xs text-red-600">{fieldErrors.company}</p>
                      )}
                    </div>
                    <div>
                      <label className="input-label" htmlFor="name">
                        {t('form.name.label')} <span className="text-brand" aria-label={t('form.required')}>*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('form.name.placeholder')}
                        className="input"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? 'err-name' : undefined}
                      />
                      {fieldErrors.name && (
                        <p id="err-name" className="mt-2 text-xs text-red-600">{fieldErrors.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="input-label" htmlFor="email">
                        {t('form.email.label')} <span className="text-brand" aria-label={t('form.required')}>*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('form.email.placeholder')}
                        className="input"
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                      />
                      {fieldErrors.email && (
                        <p id="err-email" className="mt-2 text-xs text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="input-label" htmlFor="type">
                        {t('form.type.label')}
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="">{t('form.type.placeholder')}</option>
                        {INQUIRY_OPTIONS.map(opt => (
                          <option key={opt.key} value={opt.value}>
                            {t(`form.type.options.${opt.key}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="input-label" htmlFor="message">
                      {t('form.message.label')} <span className="text-brand" aria-label={t('form.required')}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('form.message.placeholder')}
                      className="input resize-none"
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? 'err-message' : undefined}
                    />
                    {fieldErrors.message && (
                      <p id="err-message" className="mt-2 text-xs text-red-600">{fieldErrors.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <label className="flex items-start gap-2.5 text-xs text-ink-muted max-w-md cursor-pointer leading-relaxed">
                      <input
                        type="checkbox"
                        name="consent"
                        required
                        checked={formData.consent}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 rounded border-line accent-brand shrink-0"
                        aria-describedby="consent-help"
                      />
                      <span id="consent-help">
                        {t('form.consent.lead')}{' '}
                        <LocalizedLink to="legalPrivacy" className="text-brand hover:underline">
                          {t('form.consent.link')}
                        </LocalizedLink>
                        {t('form.consent.tail')}
                      </span>
                    </label>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                      aria-busy={submitting}
                    >
                      {submitting ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="animate-spin">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          {t('form.submitting')}
                        </>
                      ) : (
                        <>
                          {t('form.submit')}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

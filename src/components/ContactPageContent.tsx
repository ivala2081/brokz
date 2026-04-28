import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PageHero from './PageHero';
import AnimateIn from './AnimateIn';
import AudienceGate from './contact/AudienceGate';
import CustomerTicketInquiryForm from './contact/CustomerTicketInquiryForm';
import LeadMenu from './contact/LeadMenu';
import WebTraderManagerLeadForm from './contact/WebTraderManagerLeadForm';
import OrderRequestLeadForm from './contact/OrderRequestLeadForm';
import InfoPricingLeadForm from './contact/InfoPricingLeadForm';
import '../i18n';

type Step =
  | 'gate'
  | 'customer'
  | 'lead-menu'
  | 'lead-webtrader'
  | 'lead-order'
  | 'lead-info';

const HASH_FOR: Record<Step, string> = {
  'gate': '',
  'customer': '#customer',
  'lead-menu': '#lead',
  'lead-webtrader': '#lead/webtrader',
  'lead-order': '#lead/order',
  'lead-info': '#lead/info',
};

function stepFromHash(hash: string): Step {
  const h = hash.replace(/^#/, '');
  switch (h) {
    case 'customer': return 'customer';
    case 'lead': return 'lead-menu';
    case 'lead/webtrader': return 'lead-webtrader';
    case 'lead/order': return 'lead-order';
    case 'lead/info': return 'lead-info';
    default: return 'lead-menu';
  }
}

export default function ContactPageContent() {
  const { t } = useTranslation('contact');
  const [step, setStep] = useState<Step>('lead-menu');

  // Hash sync — read on mount + listen for hashchange
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setStep(stepFromHash(window.location.hash));
    function onHashChange() {
      setStep(stepFromHash(window.location.hash));
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goTo = useCallback((next: Step) => {
    setStep(next);
    if (typeof window !== 'undefined') {
      const hash = HASH_FOR[next];
      const url = `${window.location.pathname}${window.location.search}${hash}`;
      window.history.pushState({}, '', url);
    }
  }, []);

  const goBack = useCallback(() => {
    if (step === 'lead-webtrader' || step === 'lead-order' || step === 'lead-info') {
      goTo('lead-menu');
    } else if (step === 'lead-menu' || step === 'customer') {
      goTo('gate');
    } else {
      goTo('gate');
    }
  }, [step, goTo]);

  const helpItems = t('info.helpItems', { returnObjects: true }) as string[];
  const showInfoRail = step === 'gate';

  return (
    <>
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        highlight={t('hero.highlight')}
        description={t('hero.description')}
      />

      <section className="section-padding">
        <div className="section-container">
          <AnimateIn>
            <div
              className={
                showInfoRail
                  ? 'grid grid-cols-1 lg:grid-cols-12 gap-16'
                  : 'grid grid-cols-1 lg:grid-cols-12 gap-16'
              }
            >
              {/* Left: Info rail (gate step only) */}
              {showInfoRail && (
                <div className="lg:col-span-4">
                  <h2 className="heading-3 text-ink mb-6">{t('info.heading')}</h2>
                  <p className="body-sm mb-8">{t('info.body')}</p>

                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                      </div>
                      <div>
                        <p className="eyebrow text-ink-muted mb-1">{t('info.emailLabel')}</p>
                        <a href="mailto:contact@brokztech.com" className="text-sm font-medium text-ink hover:text-brand transition-colors">
                          contact@brokztech.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div>
                        <p className="eyebrow text-ink-muted mb-1">{t('info.responseLabel')}</p>
                        <p className="text-sm text-ink">{t('info.responseValue')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
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
              )}

              {/* Right: Step content */}
              <div className={showInfoRail ? 'lg:col-span-8' : 'lg:col-span-12 max-w-3xl mx-auto w-full'}>
                {step === 'gate' && (
                  <AudienceGate onSelect={goTo} />
                )}
                {step === 'customer' && (
                  <CustomerTicketInquiryForm onBack={goBack} />
                )}
                {step === 'lead-menu' && (
                  <LeadMenu onSelect={goTo} onBack={goBack} />
                )}
                {step === 'lead-webtrader' && (
                  <WebTraderManagerLeadForm onBack={goBack} />
                )}
                {step === 'lead-order' && (
                  <OrderRequestLeadForm onBack={goBack} />
                )}
                {step === 'lead-info' && (
                  <InfoPricingLeadForm onBack={goBack} />
                )}
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}

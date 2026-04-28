import { useTranslation } from 'react-i18next';
import '../../i18n';

interface AudienceGateProps {
    onSelect: (path: 'customer' | 'lead-menu') => void;
}

export default function AudienceGate({ onSelect }: AudienceGateProps) {
    const { t } = useTranslation('contact');

    return (
        <div className="flex flex-col gap-4">
            <div className="mb-2">
                <h2 className="heading-3 text-ink mb-2">{t('gate.title')}</h2>
                <p className="body text-ink-secondary">{t('gate.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                {/* Customer card */}
                <button
                    type="button"
                    onClick={() => onSelect('customer')}
                    className="card text-left p-7 hover:border-brand hover:shadow-md transition-all duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                    <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center mb-5 group-hover:bg-brand/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-ink text-base mb-2">{t('gate.customerCard.title')}</h3>
                    <p className="text-sm text-ink-secondary leading-relaxed mb-5">{t('gate.customerCard.desc')}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-brand">
                        {t('gate.customerCard.cta')}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </span>
                </button>

                {/* Lead card */}
                <button
                    type="button"
                    onClick={() => onSelect('lead-menu')}
                    className="card text-left p-7 hover:border-brand hover:shadow-md transition-all duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                    <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center mb-5 group-hover:bg-brand/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-ink text-base mb-2">{t('gate.leadCard.title')}</h3>
                    <p className="text-sm text-ink-secondary leading-relaxed mb-5">{t('gate.leadCard.desc')}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-brand">
                        {t('gate.leadCard.cta')}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
}

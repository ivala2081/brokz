import { useTranslation } from 'react-i18next';
import '../../i18n';

interface LeadMenuProps {
    onSelect: (path: 'lead-webtrader' | 'lead-order' | 'lead-info') => void;
    onBack: () => void;
}

export default function LeadMenu({ onSelect, onBack }: LeadMenuProps) {
    const { t } = useTranslation('contact');

    const cards: {
        key: 'lead-webtrader' | 'lead-order' | 'lead-info';
        titleKey: string;
        descKey: string;
        ctaKey: string;
        icon: React.ReactNode;
    }[] = [
        {
            key: 'lead-webtrader',
            titleKey: 'leadMenu.webtrader.title',
            descKey: 'leadMenu.webtrader.desc',
            ctaKey: 'leadMenu.webtrader.cta',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
            ),
        },
        {
            key: 'lead-order',
            titleKey: 'leadMenu.order.title',
            descKey: 'leadMenu.order.desc',
            ctaKey: 'leadMenu.order.cta',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            ),
        },
        {
            key: 'lead-info',
            titleKey: 'leadMenu.info.title',
            descKey: 'leadMenu.info.desc',
            ctaKey: 'leadMenu.info.cta',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors self-start"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                {t('leadMenu.back')}
            </button>

            <div className="mb-2">
                <h2 className="heading-3 text-ink mb-2">{t('leadMenu.title')}</h2>
                <p className="body text-ink-secondary">{t('leadMenu.subtitle')}</p>
            </div>

            <div className="flex flex-col gap-4 mt-2">
                {cards.map(card => (
                    <button
                        key={card.key}
                        type="button"
                        onClick={() => onSelect(card.key)}
                        className="card text-left p-6 hover:border-brand hover:shadow-md transition-all duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand flex items-start gap-5"
                    >
                        <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors mt-0.5">
                            {card.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-ink text-base mb-1">{t(card.titleKey)}</h3>
                            <p className="text-sm text-ink-secondary leading-relaxed mb-3">{t(card.descKey)}</p>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-brand">
                                {t(card.ctaKey)}
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

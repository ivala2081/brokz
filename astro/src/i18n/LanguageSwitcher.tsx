import { useTranslation } from 'react-i18next';

import { LOCALES, type Locale } from '../lib/routes';
import { useAlternatePath, useCurrentLocale } from './useLocale';

type Props = {
    /** Color context — picks contrasting text colors for the segmented control. */
    tone?: 'on-light' | 'on-dark';
    className?: string;
};

/**
 * EN / TR segmented toggle. Full-page navigation (Astro is static — no
 * client router). Falls back to locale home when no alternate exists.
 */
export default function LanguageSwitcher({ tone = 'on-light', className = '' }: Props) {
    const { t } = useTranslation();
    const current = useCurrentLocale();
    const alternate = useAlternatePath();

    const handleClick = (target: Locale) => {
        if (target === current) return;
        const dest = alternate ?? (target === 'tr' ? '/tr' : '/');
        window.location.assign(dest);
    };

    const baseCell =
        'px-2.5 py-1 text-xs font-mono tabular uppercase tracking-wider rounded-sm transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';

    const idle =
        tone === 'on-light'
            ? 'text-ink-muted hover:text-ink'
            : 'text-gray-400 hover:text-white';

    const active =
        tone === 'on-light'
            ? 'text-ink bg-surface-muted'
            : 'text-white bg-white/10';

    return (
        <div
            role="group"
            aria-label={t('a11y.switchLanguage')}
            className={`inline-flex items-center gap-0.5 ${className}`}
        >
            {LOCALES.map(loc => {
                const isActive = loc === current;
                return (
                    <button
                        key={loc}
                        type="button"
                        onClick={() => handleClick(loc)}
                        aria-pressed={isActive}
                        aria-current={isActive ? 'true' : undefined}
                        lang={loc}
                        className={`${baseCell} ${isActive ? active : idle}`}
                    >
                        {loc}
                    </button>
                );
            })}
        </div>
    );
}

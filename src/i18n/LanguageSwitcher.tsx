import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LOCALES, type Locale } from './routes';
import { useAlternatePath, useCurrentLocale } from './useLocale';

type Props = {
  /** Color context — picks contrasting text colors for the segmented control. */
  tone?: 'on-light' | 'on-dark';
  className?: string;
};

/**
 * EN / TR segmented toggle. Navigates to the same page's counterpart in the
 * other locale; falls back to home if no alternate path is available
 * (e.g. an untranslated blog post).
 */
export default function LanguageSwitcher({ tone = 'on-light', className = '' }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const current = useCurrentLocale();
  const alternate = useAlternatePath();

  const handleClick = (target: Locale) => {
    if (target === current) return;
    if (alternate) {
      navigate(alternate);
    } else {
      // No alternate for current URL (e.g. untranslated blog post) →
      // fall back to the target language's home.
      navigate(target === 'tr' ? '/tr' : '/');
    }
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

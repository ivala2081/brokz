/**
 * ResetPasswordForm — triggers Supabase's resetPasswordForEmail.
 *
 * Always shows the generic "if this email exists…" success message to
 * prevent account enumeration — the UX cost is near-zero, the security
 * upside is not.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserSupabase } from '../../lib/supabase/browser';
import '../../i18n';

type Locale = 'en' | 'tr';

interface Props {
    locale: Locale;
}

export default function ResetPasswordForm({ locale }: Props) {
    const { t, i18n } = useTranslation('auth');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (i18n.language !== locale) void i18n.changeLanguage(locale);
    }, [locale, i18n]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const supabase = createBrowserSupabase();
            await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });
            // Always report the generic success message (no enumeration).
            setSent(true);
        } catch {
            setError(t('resetPassword.errors.generic'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                    {t('resetPassword.heading')}
                </h1>
                <p className="mt-2 text-sm text-ink/60">{t('resetPassword.subheading')}</p>
            </div>

            <label className="block">
                <span className="block text-sm font-medium text-ink">
                    {t('resetPassword.emailLabel')}
                </span>
                <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('resetPassword.emailPlaceholder')}
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
            </label>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
            {sent && (
                <p role="status" className="text-sm text-brand">
                    {t('resetPassword.success')}
                </p>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? t('resetPassword.submitting') : t('resetPassword.submit')}
            </button>

            <p className="pt-2 text-center text-sm text-ink/60">
                <a href="/auth/login" className="hover:text-brand">
                    {t('resetPassword.backToLogin')}
                </a>
            </p>
        </form>
    );
}

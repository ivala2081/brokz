/**
 * AcceptInviteForm — finalizes an admin-issued invite.
 *
 * When Supabase sends `auth.admin.inviteUserByEmail`, the link lands at
 * `/auth/accept-invite#access_token=…&refresh_token=…&type=invite`.
 * `@supabase/ssr`'s browser client parses that fragment on init; we
 * then just `updateUser({ password })` to complete activation.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserSupabase } from '../../lib/supabase/browser';
import '../../i18n';

type Locale = 'en' | 'tr';

interface Props {
    locale: Locale;
}

export default function AcceptInviteForm({ locale }: Props) {
    const { t, i18n } = useTranslation('auth');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        if (i18n.language !== locale) void i18n.changeLanguage(locale);
    }, [locale, i18n]);

    useEffect(() => {
        const supabase = createBrowserSupabase();
        // Let the SDK consume any access_token in the URL hash first.
        void supabase.auth.getSession().then(({ data }) => {
            setHasSession(!!data.session);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setHasSession(!!session);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError(t('acceptInvite.errors.tooShort'));
            return;
        }
        if (password !== confirm) {
            setError(t('acceptInvite.errors.mismatch'));
            return;
        }

        setSubmitting(true);
        try {
            const supabase = createBrowserSupabase();
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) {
                setError(t('acceptInvite.errors.generic'));
                setSubmitting(false);
                return;
            }
            setSuccess(true);
            const { data: u } = await supabase.auth.getUser();
            let target = '/dashboard';
            if (u.user) {
                const { data: p } = await supabase.from('profiles').select('role').eq('id', u.user.id).maybeSingle();
                if (p?.role === 'admin') target = '/admin';
            }
            setTimeout(() => window.location.assign(target), 900);
        } catch {
            setError(t('acceptInvite.errors.generic'));
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                    {t('acceptInvite.heading')}
                </h1>
                <p className="mt-2 text-sm text-ink/60">{t('acceptInvite.subheading')}</p>
            </div>

            {hasSession === false && (
                <p role="alert" className="text-sm text-red-600">
                    {t('acceptInvite.errors.tokenInvalid')}
                </p>
            )}

            <label className="block">
                <span className="block text-sm font-medium text-ink">
                    {t('acceptInvite.passwordLabel')}
                </span>
                <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('acceptInvite.passwordPlaceholder')}
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
            </label>

            <label className="block">
                <span className="block text-sm font-medium text-ink">
                    {t('acceptInvite.confirmLabel')}
                </span>
                <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
            </label>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
            {success && (
                <p role="status" className="text-sm text-brand">
                    {t('acceptInvite.success')}
                </p>
            )}

            <button
                type="submit"
                disabled={submitting || hasSession === false}
                className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? t('acceptInvite.submitting') : t('acceptInvite.submit')}
            </button>
        </form>
    );
}

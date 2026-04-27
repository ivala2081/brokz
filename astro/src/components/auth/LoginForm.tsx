/**
 * LoginForm — email+password primary, magic link fallback.
 *
 * Respects `?redirect=` query so route-guard redirects round-trip the
 * user back to where they tried to go. Uses the browser Supabase
 * singleton — cookies land via Supabase's own fetch interceptor and
 * the Astro middleware picks them up on the next request.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserSupabase } from '../../lib/supabase/browser';
import '../../i18n';

type Locale = 'en' | 'tr';
type Audience = 'customer' | 'admin';

interface Props {
    locale: Locale;
}

async function fetchUserRole(
    supabase: ReturnType<typeof createBrowserSupabase>,
    userId: string,
): Promise<'admin' | 'customer' | null> {
    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
    if (data?.role === 'admin') return 'admin';
    if (data?.role) return 'customer';
    return null;
}

function homeForRole(role: 'admin' | 'customer' | null): string {
    return role === 'admin' ? '/admin' : '/dashboard';
}

export default function LoginForm({ locale }: Props) {
    const { t, i18n } = useTranslation('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [magicSubmitting, setMagicSubmitting] = useState(false);
    const [magicSent, setMagicSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [explicitRedirect, setExplicitRedirect] = useState<string | null>(null);
    const [audience, setAudience] = useState<Audience>('customer');

    useEffect(() => {
        if (i18n.language !== locale) void i18n.changeLanguage(locale);
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('redirect');
        if (raw && raw.startsWith('/')) setExplicitRedirect(raw);
        if (raw?.startsWith('/admin')) setAudience('admin');
        const audParam = params.get('as');
        if (audParam === 'admin' || audParam === 'customer') setAudience(audParam);

        // If a session already exists (user hit /auth/login while logged in),
        // bounce to the target. The previous SSR-guard version of this page
        // did this server-side; on a static build we have to do it client-side.
        const supabase = createBrowserSupabase();
        void supabase.auth.getSession().then(async ({ data }) => {
            if (!data.session) return;
            const role = await fetchUserRole(supabase, data.session.user.id);
            const target = raw && raw.startsWith('/') ? raw : homeForRole(role);
            window.location.assign(target);
        });
    }, [locale, i18n]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const supabase = createBrowserSupabase();
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError || !signInData.user) {
                setError(t('login.errors.invalidCredentials'));
                setSubmitting(false);
                return;
            }
            const role = await fetchUserRole(supabase, signInData.user.id);
            if (audience === 'admin' && role !== 'admin') {
                await supabase.auth.signOut();
                setError(t('login.roleMismatchAdmin'));
                setSubmitting(false);
                return;
            }
            if (audience === 'customer' && role === 'admin') {
                setError(t('login.roleMismatchCustomer'));
                setSubmitting(false);
                return;
            }
            const target = explicitRedirect ?? homeForRole(role);
            window.location.assign(target);
        } catch {
            setError(t('login.errors.generic'));
            setSubmitting(false);
        }
    }

    async function handleMagicLink() {
        if (!email) return;
        setError(null);
        setMagicSubmitting(true);
        try {
            const supabase = createBrowserSupabase();
            const { error: magicError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}${explicitRedirect ?? '/auth/login'}`,
                    shouldCreateUser: false, // invite-only: never create via magic link
                },
            });
            if (magicError) {
                setError(t('login.errors.genericMagic'));
                return;
            }
            setMagicSent(true);
        } catch {
            setError(t('login.errors.genericMagic'));
        } finally {
            setMagicSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                    {t('login.heading')}
                </h1>
                <p className="mt-2 text-sm text-ink/60">{t('login.subheading')}</p>
            </div>

            <div role="tablist" aria-label={t('login.audienceLabel')} className="grid grid-cols-2 gap-1 rounded-lg bg-ink/5 p-1">
                {(['customer', 'admin'] as const).map((value) => {
                    const selected = audience === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => {
                                setAudience(value);
                                setError(null);
                            }}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                selected
                                    ? 'bg-white text-ink shadow-sm'
                                    : 'text-ink/60 hover:text-ink'
                            }`}
                        >
                            {value === 'customer' ? t('login.audienceCustomer') : t('login.audienceAdmin')}
                        </button>
                    );
                })}
            </div>
            <p className="-mt-2 text-xs text-ink/50">
                {audience === 'customer' ? t('login.audienceCustomerHint') : t('login.audienceAdminHint')}
            </p>

            <div className="space-y-4">
                <label className="block">
                    <span className="block text-sm font-medium text-ink">
                        {t('login.emailLabel')}
                    </span>
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('login.emailPlaceholder')}
                        className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                </label>

                <label className="block">
                    <span className="flex items-center justify-between text-sm font-medium text-ink">
                        <span>{t('login.passwordLabel')}</span>
                        <a
                            href="/auth/reset-password"
                            className="text-xs font-normal text-ink/60 hover:text-brand"
                        >
                            {t('login.forgotPassword')}
                        </a>
                    </span>
                    <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('login.passwordPlaceholder')}
                        className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                </label>
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
            {magicSent && (
                <p role="status" className="text-sm text-brand">
                    {t('login.magicLinkSent')}
                </p>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? t('login.submitting') : t('login.submit')}
            </button>

            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-ink/10" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs uppercase tracking-wider text-ink/40">
                        {t('common.orDivider')}
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleMagicLink}
                disabled={magicSubmitting || !email}
                className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
                {magicSubmitting ? t('login.magicLinkSending') : t('login.magicLinkCta')}
            </button>

            <p className="pt-2 text-center text-xs text-ink/50">{t('login.noAccount')}</p>
        </form>
    );
}

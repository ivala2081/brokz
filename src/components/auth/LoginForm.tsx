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
    audience?: Audience;
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

export default function LoginForm({ locale, audience: audienceProp = 'customer' }: Props) {
    const { t, i18n } = useTranslation('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [magicSubmitting, setMagicSubmitting] = useState(false);
    const [magicSent, setMagicSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [explicitRedirect, setExplicitRedirect] = useState<string | null>(null);
    const audience: Audience = audienceProp;

    useEffect(() => {
        if (i18n.language !== locale) void i18n.changeLanguage(locale);
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('redirect');
        if (raw && raw.startsWith('/')) setExplicitRedirect(raw);

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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="text-center">
                {audience === 'admin' && (
                    <span className="mb-3 inline-block text-[11px] font-medium uppercase tracking-[0.2em] text-ink/45">
                        {t('login.audienceAdmin')}
                    </span>
                )}
                <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">
                    {t('login.heading')}
                </h1>
                <p className="mt-2 text-sm text-ink/60">{t('login.subheading')}</p>
            </div>

            <div className="space-y-4">
                <label className="block">
                    <span className="block text-[13px] font-medium text-ink/80">
                        {t('login.emailLabel')}
                    </span>
                    <div className="relative mt-1.5">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink/40">
                            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="12" height="10" rx="2" />
                                <path d="m3 5 5 4 5-4" />
                            </svg>
                        </span>
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('login.emailPlaceholder')}
                            className="w-full rounded-lg border border-ink/15 bg-white pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink/40 transition-shadow focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="flex items-center justify-between text-[13px] font-medium text-ink/80">
                        <span>{t('login.passwordLabel')}</span>
                        <a
                            href="/auth/reset-password"
                            className="text-xs font-normal text-ink/55 transition-colors hover:text-brand"
                        >
                            {t('login.forgotPassword')}
                        </a>
                    </span>
                    <div className="relative mt-1.5">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink/40">
                            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="7" width="10" height="6" rx="1.5" />
                                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                            </svg>
                        </span>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('login.passwordPlaceholder')}
                            className="w-full rounded-lg border border-ink/15 bg-white pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink/40 transition-shadow focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                    </div>
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
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ink/20 transition-all hover:bg-ink/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span>{submitting ? t('login.submitting') : t('login.submit')}</span>
                {!submitting && (
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 translate-x-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8h10" />
                        <path d="m9 4 4 4-4 4" />
                    </svg>
                )}
            </button>

            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-ink/10" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[10px] uppercase tracking-[0.18em] text-ink/40">
                        {t('common.orDivider')}
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleMagicLink}
                disabled={magicSubmitting || !email}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30 hover:bg-ink/[0.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6.5 8 10l6-3.5" />
                    <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
                </svg>
                {magicSubmitting ? t('login.magicLinkSending') : t('login.magicLinkCta')}
            </button>

            <div className="border-t border-ink/10 pt-5 text-center">
                <p className="text-xs leading-relaxed text-ink/55">{t('login.noAccount')}</p>
                <a
                    href={locale === 'tr' ? '/tr/iletisim' : '/contact'}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-all hover:bg-brand-hover hover:shadow-md"
                >
                    {t('login.contactCta')}
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8h10" />
                        <path d="m9 4 4 4-4 4" />
                    </svg>
                </a>
            </div>
        </form>
    );
}

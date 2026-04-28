/**
 * CustomerTicketInquiryForm
 *
 * Shown when the visitor selects "I'm already a customer" on the contact page.
 * - Not logged in → styled CTA to /auth/login with returnTo parameter.
 * - Logged in as admin → small notice (this form is for customers).
 * - Logged in as customer → ticket + first message insert via Supabase.
 *
 * Submit logic mirrors NewTicketDialog.tsx but explicitly sets opened_by.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserSupabase } from '../../lib/supabase/browser';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../../env';
import '../../i18n';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface CustomerTicketInquiryFormProps {
    onBack: () => void;
}

export default function CustomerTicketInquiryForm({ onBack }: CustomerTicketInquiryFormProps) {
    const { t } = useTranslation('contact');

    const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'not-customer' | 'ready'>('loading');
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    const [subject, setSubject] = useState('');
    const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');
    const [message, setMessage] = useState('');
    const [formStatus, setFormStatus] = useState<FormStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Inline helper — avoids importing from routes
    function localePath(en: string, tr: string): string {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/tr')) {
            return tr;
        }
        return en;
    }

    const loginUrl = `/auth/login?returnTo=${encodeURIComponent(localePath('/contact#customer', '/tr/iletisim#customer'))}`;
    const dashboardTicketsUrl = localePath('/dashboard/tickets', '/tr/dashboard/tickets');

    useEffect(() => {
        const supabase = createBrowserSupabase();

        async function probe() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setAuthState('unauthenticated');
                return;
            }

            const { data: profileRow } = await supabase
                .from('profiles')
                .select('id, role, organization_id, email, full_name')
                .eq('id', session.user.id)
                .single();

            setUser(session.user);

            if (!profileRow) {
                setAuthState('unauthenticated');
                return;
            }

            setProfile(profileRow as Profile);

            if (profileRow.role !== 'customer') {
                setAuthState('not-customer');
                return;
            }

            setAuthState('ready');
        }

        void probe();
    }, []);

    function clearFieldError(field: string) {
        setFieldErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    }

    function validate(): boolean {
        const errs: Record<string, string> = {};
        if (!subject.trim()) errs.subject = t('form.required');
        else if (subject.length > 140) errs.subject = t('customerTicket.errors.subjectMax');
        if (!message.trim() || message.length < 10) errs.message = t('customerTicket.errors.messageMin');
        else if (message.length > 5000) errs.message = t('customerTicket.errors.messageMax');
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (formStatus === 'submitting') return;
        if (!validate()) return;
        if (!user || !profile) return;

        setFormStatus('submitting');
        setErrorMsg('');

        const supabase = createBrowserSupabase();

        // Insert ticket — mirrors NewTicketDialog.tsx but with opened_by set
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .insert({
                subject: subject.trim(),
                priority,
                status: 'open',
                organization_id: profile.organization_id,
                opened_by: user.id,
            })
            .select('id')
            .single();

        if (ticketError || !ticket) {
            setErrorMsg(t('customerTicket.errors.generic'));
            setFormStatus('error');
            return;
        }

        // Insert first message
        const { error: msgError } = await supabase.from('ticket_messages').insert({
            ticket_id: (ticket as { id: string }).id,
            author: user.id,
            body: message.trim(),
        });

        if (msgError) {
            setErrorMsg(t('customerTicket.errors.generic'));
            setFormStatus('error');
            return;
        }

        setFormStatus('success');
    }

    // ── Loading state ────────────────────────────────────────────────────────
    if (authState === 'loading') {
        return (
            <div className="py-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-brand">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
            </div>
        );
    }

    // ── Not authenticated ────────────────────────────────────────────────────
    if (authState === 'unauthenticated') {
        return (
            <div className="flex flex-col gap-4">
                <BackLink onBack={onBack} label={t('customerTicket.fields.subject.label') ? t('leadForms.back') : 'Back'} />
                <div className="card p-8 text-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center mx-auto mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <p className="body text-ink mb-6">{t('customerTicket.loginPrompt')}</p>
                    <a href={loginUrl} className="btn-primary inline-flex items-center gap-2">
                        {t('customerTicket.loginCta')}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>
            </div>
        );
    }

    // ── Admin/wrong role ─────────────────────────────────────────────────────
    if (authState === 'not-customer') {
        return (
            <div className="flex flex-col gap-4">
                <BackLink onBack={onBack} label={t('leadForms.back')} />
                <div className="p-4 rounded-card-sm bg-surface-muted border border-line text-sm text-ink-secondary">
                    {t('customerTicket.notCustomer')}
                </div>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────
    if (formStatus === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-subtle flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h2 className="heading-3 text-ink mb-3">{t('customerTicket.success.title')}</h2>
                <p className="body text-ink-secondary max-w-sm mb-8">{t('customerTicket.success.body')}</p>
                <a href={dashboardTicketsUrl} className="btn-primary inline-flex items-center gap-2">
                    {t('customerTicket.success.cta')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </a>
            </div>
        );
    }

    // ── Form (authenticated customer) ────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">
            <BackLink onBack={onBack} label={t('leadForms.back')} />

            {errorMsg && (
                <div role="alert" className="p-4 rounded-card-sm bg-red-50 border border-red-100 text-sm text-red-800">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                {/* Subject */}
                <div>
                    <label className="input-label" htmlFor="ct-subject">
                        {t('customerTicket.fields.subject.label')}
                        <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                    </label>
                    <input
                        id="ct-subject"
                        type="text"
                        name="subject"
                        value={subject}
                        maxLength={140}
                        onChange={e => { setSubject(e.target.value); clearFieldError('subject'); }}
                        placeholder={t('customerTicket.fields.subject.placeholder')}
                        className="input"
                        aria-invalid={!!fieldErrors.subject}
                    />
                    {fieldErrors.subject && (
                        <p className="mt-2 text-xs text-red-600">{fieldErrors.subject}</p>
                    )}
                </div>

                {/* Priority */}
                <div>
                    <label className="input-label" htmlFor="ct-priority">
                        {t('customerTicket.fields.priority.label')}
                    </label>
                    <select
                        id="ct-priority"
                        name="priority"
                        value={priority}
                        onChange={e => setPriority(e.target.value as 'low' | 'med' | 'high')}
                        className="input"
                    >
                        <option value="low">{t('customerTicket.fields.priority.options.low')}</option>
                        <option value="med">{t('customerTicket.fields.priority.options.med')}</option>
                        <option value="high">{t('customerTicket.fields.priority.options.high')}</option>
                    </select>
                </div>

                {/* Message */}
                <div>
                    <label className="input-label" htmlFor="ct-message">
                        {t('customerTicket.fields.message.label')}
                        <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                    </label>
                    <textarea
                        id="ct-message"
                        name="message"
                        rows={6}
                        value={message}
                        maxLength={5000}
                        onChange={e => { setMessage(e.target.value); clearFieldError('message'); }}
                        placeholder={t('customerTicket.fields.message.placeholder')}
                        className="input resize-none"
                        aria-invalid={!!fieldErrors.message}
                    />
                    {fieldErrors.message && (
                        <p className="mt-2 text-xs text-red-600">{fieldErrors.message}</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="btn-primary"
                        aria-busy={formStatus === 'submitting'}
                    >
                        {formStatus === 'submitting' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="animate-spin">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                {t('customerTicket.submitting')}
                            </>
                        ) : (
                            <>
                                {t('customerTicket.submit')}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function BackLink({ onBack, label }: { onBack: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors self-start"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
            </svg>
            {label}
        </button>
    );
}

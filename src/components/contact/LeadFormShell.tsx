/**
 * LeadFormShell — shared layout for all three lead inquiry forms.
 *
 * Handles: back link, title/subtitle, honeypot field, consent checkbox,
 * submit button (with spinner), success state, error state.
 *
 * The parent passes `extraFields` children (rendered between email and
 * consent) and an `onSubmit` callback that returns extra payload fields
 * to merge before POST.
 */

import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import LocalizedLink from '../../i18n/LocalizedLink';
import PhoneInput from './PhoneInput';
import '../../i18n';

export type LeadFormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface LeadFormPayload {
    inquiry_type: 'webtrader_manager' | 'order_request' | 'info_pricing';
    company: string;
    name: string;
    email: string;
    phone: string;
    contact_preference: 'email' | 'phone' | 'any';
    message: string;
    consent: boolean;
    source: 'contact_page';
    website: string;
    product_id?: string;
    quantity?: number;
}

interface LeadFormShellProps {
    title: string;
    subtitle: string;
    inquiryType: LeadFormPayload['inquiry_type'];
    /** Extra form fields rendered between the email field and the message textarea. */
    extraFields?: ReactNode;
    /**
     * Called before POST — return any extra payload to merge (e.g. product_id,
     * quantity). Return null to abort (i.e. extra-field validation failed).
     */
    onExtraValidate?: () => Record<string, unknown> | null;
    /** Override the message field label (defaults to form.message.label). */
    messageLabel?: string;
    /** Override the message field placeholder (defaults to form.message.placeholder). */
    messagePlaceholder?: string;
    /** When true, the message field is not required (used for optional notes). */
    messageOptional?: boolean;
    onBack: () => void;
}

export default function LeadFormShell({
    title,
    subtitle,
    inquiryType,
    extraFields,
    onExtraValidate,
    messageLabel,
    messagePlaceholder,
    messageOptional = false,
    onBack,
}: LeadFormShellProps) {
    const { t } = useTranslation('contact');

    const [company, setCompany] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneValid, setPhoneValid] = useState(false);
    const [contactPreference, setContactPreference] = useState<'email' | 'phone' | 'any' | ''>('');
    const [message, setMessage] = useState('');
    const [consent, setConsent] = useState(false);
    const [website, setWebsite] = useState(''); // honeypot
    const [status, setStatus] = useState<LeadFormStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    function clearFieldError(field: string) {
        setFieldErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (status === 'submitting') return;

        if (!consent) {
            setErrorMsg(t('form.consentError'));
            setStatus('error');
            return;
        }

        // Phone required + format
        if (!phone || !phoneValid) {
            setFieldErrors(prev => ({ ...prev, phone: t('form.phone.error') }));
            return;
        }

        // Contact preference required
        if (!contactPreference) {
            setFieldErrors(prev => ({ ...prev, contactPreference: t('form.contactPreference.error') }));
            return;
        }

        // Run extra-field validation if provided
        let extra: Record<string, unknown> = {};
        if (onExtraValidate) {
            const result = onExtraValidate();
            if (result === null) return; // Extra validator signalled failure
            extra = result;
        }

        setStatus('submitting');
        setErrorMsg('');
        setFieldErrors({});

        const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
        const supabaseAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

        if (!supabaseUrl || !supabaseAnon) {
            setErrorMsg(t('form.errors.generic'));
            setStatus('error');
            return;
        }

        const payload: Record<string, unknown> = {
            inquiry_type: inquiryType,
            company,
            name,
            email,
            phone,
            contact_preference: contactPreference,
            message,
            consent,
            source: 'contact_page',
            website,
            ...extra,
        };

        try {
            const res = await fetch(`${supabaseUrl}/functions/v1/contact-lead-capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnon,
                    'Authorization': `Bearer ${supabaseAnon}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data.ok === false) {
                if (data.fields) setFieldErrors(data.fields as Record<string, string>);
                setErrorMsg((data.error as string | undefined) || t('form.errors.generic'));
                setStatus('error');
                return;
            }

            setStatus('success');
        } catch {
            setErrorMsg(t('form.errors.network'));
            setStatus('error');
        }
    }

    // ── Success state ────────────────────────────────────────────────────────
    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-subtle flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h2 className="heading-3 text-ink mb-3">{t('form.success.title')}</h2>
                <p className="body text-ink-secondary max-w-sm">
                    {t('form.success.body')}
                </p>
            </div>
        );
    }

    const submitting = status === 'submitting';

    return (
        <div className="flex flex-col gap-6">
            {/* Back link */}
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors self-start"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                {t('leadForms.back')}
            </button>

            <div>
                <h2 className="heading-3 text-ink mb-2">{title}</h2>
                <p className="body text-ink-secondary">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                {/* Honeypot — hidden from real users */}
                <div aria-hidden="true" className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden">
                    <label>
                        {t('leadForms.honeypotLabel')}
                        <input
                            type="text"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                        />
                    </label>
                </div>

                {errorMsg && (
                    <div role="alert" className="p-4 rounded-card-sm bg-red-50 border border-red-100 text-sm text-red-800">
                        {errorMsg}
                    </div>
                )}

                {/* Company + Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label" htmlFor="lf-company">
                            {t('form.company.label')}
                        </label>
                        <input
                            id="lf-company"
                            type="text"
                            name="company"
                            value={company}
                            onChange={e => { setCompany(e.target.value); clearFieldError('company'); }}
                            placeholder={t('form.company.placeholder')}
                            className="input"
                            aria-invalid={!!fieldErrors.company}
                        />
                        {fieldErrors.company && (
                            <p className="mt-2 text-xs text-red-600">{fieldErrors.company}</p>
                        )}
                    </div>
                    <div>
                        <label className="input-label" htmlFor="lf-name">
                            {t('form.name.label')}
                            <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                        </label>
                        <input
                            id="lf-name"
                            type="text"
                            name="name"
                            required
                            value={name}
                            onChange={e => { setName(e.target.value); clearFieldError('name'); }}
                            placeholder={t('form.name.placeholder')}
                            className="input"
                            aria-invalid={!!fieldErrors.name}
                        />
                        {fieldErrors.name && (
                            <p className="mt-2 text-xs text-red-600">{fieldErrors.name}</p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="input-label" htmlFor="lf-email">
                        {t('form.email.label')}
                        <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                    </label>
                    <input
                        id="lf-email"
                        type="email"
                        name="email"
                        required
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                        placeholder={t('form.email.placeholder')}
                        className="input"
                        aria-invalid={!!fieldErrors.email}
                    />
                    {fieldErrors.email && (
                        <p className="mt-2 text-xs text-red-600">{fieldErrors.email}</p>
                    )}
                </div>

                {/* Phone (required) + Contact preference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="input-label" htmlFor="lf-phone">
                            {t('form.phone.label')}
                            <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                        </label>
                        <PhoneInput
                            id="lf-phone"
                            hasError={!!fieldErrors.phone}
                            searchPlaceholder={t('form.phone.searchPlaceholder')}
                            noResultsText={t('form.phone.noResults')}
                            onChange={(e164, valid) => {
                                setPhone(e164);
                                setPhoneValid(valid);
                                if (fieldErrors.phone) {
                                    setFieldErrors(prev => { const { phone: _, ...rest } = prev; return rest; });
                                }
                            }}
                        />
                        {fieldErrors.phone && (
                            <p className="mt-2 text-xs text-red-600">{fieldErrors.phone}</p>
                        )}
                    </div>

                    <div>
                        <p className="input-label mb-3">
                            {t('form.contactPreference.label')}
                            <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                        </p>
                        <div className="flex gap-2">
                            {(['email', 'phone', 'any'] as const).map(opt => (
                                <label
                                    key={opt}
                                    className={[
                                        'flex-1 flex items-center justify-center gap-1.5 px-2 rounded-card-sm border cursor-pointer text-sm font-medium transition-colors select-none whitespace-nowrap h-[42px]',
                                        contactPreference === opt
                                            ? 'border-brand bg-brand-subtle text-brand'
                                            : 'border-line bg-surface hover:bg-surface-raised text-ink-secondary',
                                        fieldErrors.contactPreference ? 'border-red-400' : '',
                                    ].join(' ')}
                                >
                                    <input
                                        type="radio"
                                        name="contact_preference"
                                        value={opt}
                                        checked={contactPreference === opt}
                                        onChange={() => {
                                            setContactPreference(opt);
                                            if (fieldErrors.contactPreference) {
                                                setFieldErrors(prev => { const { contactPreference: _, ...rest } = prev; return rest; });
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    {opt === 'email' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                    )}
                                    {opt === 'phone' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 5.38 5.38l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    )}
                                    {opt === 'any' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                                    )}
                                    {t(`form.contactPreference.${opt}`)}
                                </label>
                            ))}
                        </div>
                        {fieldErrors.contactPreference && (
                            <p className="mt-2 text-xs text-red-600">{fieldErrors.contactPreference}</p>
                        )}
                    </div>
                </div>

                {/* Extra fields injected by parent (e.g. product picker, quantity) */}
                {extraFields}

                {/* Message */}
                <div>
                    <label className="input-label" htmlFor="lf-message">
                        {t('form.message.label')}
                        <span className="text-brand ml-1" aria-label={t('form.required')}>*</span>
                    </label>
                    <textarea
                        id="lf-message"
                        name="message"
                        required
                        rows={5}
                        value={message}
                        onChange={e => { setMessage(e.target.value); clearFieldError('message'); }}
                        placeholder={t('form.message.placeholder')}
                        className="input resize-none"
                        aria-invalid={!!fieldErrors.message}
                    />
                    {fieldErrors.message && (
                        <p className="mt-2 text-xs text-red-600">{fieldErrors.message}</p>
                    )}
                </div>

                {/* Consent + Submit */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <label className="flex items-start gap-2.5 text-xs text-ink-muted max-w-md cursor-pointer leading-relaxed">
                        <input
                            type="checkbox"
                            name="consent"
                            required
                            checked={consent}
                            onChange={e => { setConsent(e.target.checked); if (errorMsg) setErrorMsg(''); }}
                            className="mt-0.5 w-4 h-4 rounded border-line accent-brand shrink-0"
                        />
                        <span>
                            {t('form.consent.lead')}{' '}
                            <LocalizedLink to="legalPrivacy" className="text-brand hover:underline">
                                {t('form.consent.link')}
                            </LocalizedLink>
                            {t('form.consent.tail')}
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary"
                        aria-busy={submitting}
                    >
                        {submitting ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="animate-spin">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                {t('form.submitting')}
                            </>
                        ) : (
                            <>
                                {t('form.submit')}
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

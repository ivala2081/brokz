import { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn from '../components/AnimateIn';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    type: '',
    message: '',
    // Honeypot — real users never touch this; bots fill everything
    website: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field-level error as user edits
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const { [e.target.name]: _, ...rest } = prev;
        return rest;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMsg('');
    setFieldErrors({});

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.fields) setFieldErrors(data.fields);
        setErrorMsg(
          data.error || 'Something went wrong. Please try again or email contact@brokz.io directly.'
        );
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  const submitted = status === 'success';
  const submitting = status === 'submitting';

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title="Contact | Brokz — Fintech Infrastructure"
        description="Contact Brokz for brokerage infrastructure, trading platform development, MT4/MT5 plugins, algorithmic trading systems, and fintech engineering partnerships."
        keywords="contact fintech company, brokerage technology contact, trading platform inquiry, B2B fintech partnership"
        canonical="/contact"
      />

      <NavBar />

      <PageHero
        label="Contact"
        title="Start a conversation."
        highlight="conversation"
        description="We work with organizations that have specific, technical infrastructure requirements. Tell us about your project and we'll respond within one business day."
      />

      {/* Contact Section */}
      <section className="section-padding">
        <div className="section-container">
          <AnimateIn>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Left: Info */}
            <div className="lg:col-span-4">
              <h2 className="heading-3 text-ink mb-6">Partnership & Project Inquiries</h2>
              <p className="body-sm mb-8">
                We evaluate each engagement based on technical fit and project scope. We partner
                with brokerages, proprietary trading firms, fintech startups, and liquidity
                providers at any stage of infrastructure maturity.
              </p>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-muted mb-1">Email</p>
                    <a href="mailto:contact@brokz.io" className="text-sm font-medium text-ink hover:text-brand transition-colors">
                      contact@brokz.io
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-muted mb-1">Response Time</p>
                    <p className="text-sm text-ink">Within 1 business day</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-subtle flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-muted mb-1">Engagements</p>
                    <p className="text-sm text-ink">B2B only — no retail services</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-surface-muted border border-line rounded-card">
                <p className="eyebrow text-ink-muted mb-3">We can help with</p>
                <ul className="space-y-3 text-sm text-ink-secondary">
                  {[
                    'Brokerage infrastructure setup',
                    'Custom trading platform development',
                    'MT4/MT5 plugins and extensions',
                    'Algorithmic trading systems',
                    'Risk and execution optimization',
                    'Data analytics infrastructure',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-subtle flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 className="heading-3 text-ink mb-3">Message Sent</h2>
                  <p className="body text-ink-secondary max-w-sm">
                    Your inquiry has been submitted. We'll review your requirements and respond within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
                  {/* Honeypot — hidden from humans, bots fill it and get silently rejected */}
                  <div aria-hidden="true" className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden">
                    <label>
                      Website (leave empty)
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  {errorMsg && (
                    <div
                      role="alert"
                      className="p-4 rounded-card-sm bg-red-50 border border-red-100 text-sm text-red-800"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="input-label" htmlFor="company">
                        Company Name <span className="text-brand">*</span>
                      </label>
                      <input
                        id="company"
                        type="text"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Acme Brokerage Ltd."
                        className="input"
                        aria-invalid={!!fieldErrors.company}
                        aria-describedby={fieldErrors.company ? 'err-company' : undefined}
                      />
                      {fieldErrors.company && (
                        <p id="err-company" className="mt-2 text-xs text-red-600">{fieldErrors.company}</p>
                      )}
                    </div>
                    <div>
                      <label className="input-label" htmlFor="name">
                        Your Name <span className="text-brand">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className="input"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? 'err-name' : undefined}
                      />
                      {fieldErrors.name && (
                        <p id="err-name" className="mt-2 text-xs text-red-600">{fieldErrors.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="input-label" htmlFor="email">
                        Business Email <span className="text-brand">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="j.smith@company.com"
                        className="input"
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                      />
                      {fieldErrors.email && (
                        <p id="err-email" className="mt-2 text-xs text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="input-label" htmlFor="type">
                        Inquiry Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="">Select a category</option>
                        <option value="Brokerage Infrastructure">Brokerage Infrastructure</option>
                        <option value="Trading Platform Development">Trading Platform Development</option>
                        <option value="MT4/MT5 Plugins">MT4/MT5 Plugins</option>
                        <option value="Algorithmic Trading Systems">Algorithmic Trading Systems</option>
                        <option value="Risk & Execution Optimization">Risk & Execution Optimization</option>
                        <option value="Data Analytics">Data Analytics</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="input-label" htmlFor="message">
                      Project Description <span className="text-brand">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your infrastructure requirements, current tech stack, and what you're looking to build or improve..."
                      className="input resize-none"
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? 'err-message' : undefined}
                    />
                    {fieldErrors.message && (
                      <p id="err-message" className="mt-2 text-xs text-red-600">{fieldErrors.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-xs text-ink-muted">
                      By submitting, you agree to our{' '}
                      <a href="/legal/privacy" className="text-brand hover:underline">Privacy Policy</a>.
                    </p>
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
                          Sending…
                        </>
                      ) : (
                        <>
                          Send Inquiry
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

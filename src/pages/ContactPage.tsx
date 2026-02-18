import { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn from '../components/AnimateIn';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    type: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Brokz Inquiry — ${formData.type || 'General'} | ${formData.company}`);
    const body = encodeURIComponent(
      `Company: ${formData.company}\nName: ${formData.name}\nEmail: ${formData.email}\nInquiry Type: ${formData.type}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:contact@brokz.io?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Contact | Brokz — Fintech Infrastructure"
        description="Contact Brokz for brokerage infrastructure, trading platform development, MT4/MT5 plugins, algorithmic trading systems, and fintech engineering partnerships."
        keywords="contact fintech company, brokerage technology contact, trading platform inquiry, B2B fintech partnership"
        ogTitle="Contact Brokz — Fintech Engineering"
        ogDescription="Reach out to discuss your trading infrastructure requirements."
      />

      <NavBar />

      <PageHero
        label="Contact"
        title="Start a Conversation"
        description="We work with organizations that have specific, technical infrastructure requirements. Tell us about your project and we'll respond within one business day."
      />

      {/* Contact Section */}
      <section className="section-padding">
        <div className="section-container">
          <AnimateIn>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Left: Info */}
            <div className="lg:col-span-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Partnership & Project Inquiries</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                We evaluate each engagement based on technical fit and project scope. We partner
                with brokerages, proprietary trading firms, fintech startups, and liquidity
                providers at any stage of infrastructure maturity.
              </p>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#087331" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                    <a href="mailto:contact@brokz.io" className="text-sm font-medium text-gray-900 hover:text-brand transition-colors">
                      contact@brokz.io
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#087331" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Response Time</p>
                    <p className="text-sm text-gray-700">Within 1 business day</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#087331" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Engagements</p>
                    <p className="text-sm text-gray-700">B2B only — no retail services</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-gray-50 border border-gray-100 rounded-card">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">We can help with</p>
                <ul className="space-y-3 text-sm text-gray-600">
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
                  <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#087331" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Sent</h2>
                  <p className="text-gray-500 max-w-sm">
                    Your inquiry has been submitted. We'll review your requirements and respond within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Company Name <span className="text-brand">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Acme Brokerage Ltd."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Your Name <span className="text-brand">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Business Email <span className="text-brand">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="j.smith@company.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Inquiry Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:border-brand transition-colors"
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Project Description <span className="text-brand">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your infrastructure requirements, current tech stack, and what you're looking to build or improve..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      By submitting, you agree to our{' '}
                      <a href="/legal/privacy" className="text-brand hover:underline">Privacy Policy</a>.
                    </p>
                    <button type="submit" className="btn-primary">
                      Send Inquiry
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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

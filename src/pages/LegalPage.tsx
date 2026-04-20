import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn from '../components/AnimateIn';
import NotFoundPage from './NotFoundPage';

type Severity = 'info' | 'warning' | 'danger';

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDoc {
  title: string;
  lastUpdated: string;
  seoTitle: string;
  seoDescription: string;
  notice?: { severity: Severity; text: string };
  sections: LegalSection[];
}

const LEGAL_DOCS: Record<string, LegalDoc> = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'January 2025',
    seoTitle: 'Terms of Service | Brokz',
    seoDescription: 'Brokz Terms of Service — conditions for using our fintech infrastructure, automation tools, and trading technology platforms.',
    sections: [
      { heading: '1. Acceptance of Terms', body: 'By accessing and using Brokz services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.' },
      { heading: '2. Description of Services', body: 'Brokz provides fintech software, automation tools, and technology infrastructure. We are a technology provider, not a broker, investment advisor, or fund manager.' },
      { heading: '3. User Responsibilities', body: 'Users are responsible for their own decisions and actions when using our tools. All trading and investment decisions are made at your own discretion and risk.' },
      { heading: '4. Intellectual Property', body: 'All content, software, and materials provided by Brokz are protected by intellectual property laws and remain the property of Brokz.' },
      { heading: '5. Limitation of Liability', body: 'Brokz shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'January 2025',
    seoTitle: 'Privacy Policy | Data Protection & Security | Brokz',
    seoDescription: 'Brokz Privacy Policy: how we collect, use, and protect your information. Data security, GDPR compliance, and user privacy rights explained.',
    sections: [
      { heading: '1. Information We Collect', body: 'We collect information that you provide directly to us, including contact information, account details, and usage data necessary to provide our services.' },
      { heading: '2. How We Use Your Information', body: 'We use collected information to provide, maintain, and improve our services, process transactions, and communicate with you about your account.' },
      { heading: '3. Data Security', body: 'We implement industry-standard security measures to protect your information, including encryption, secure servers, and access controls.' },
      { heading: '4. Data Sharing', body: 'We do not sell your personal information. We may share data only with trusted service providers necessary to deliver our services, subject to strict confidentiality agreements.' },
      { heading: '5. Your Rights', body: 'You have the right to access, update, or delete your personal information. Contact us to exercise these rights.' },
    ],
  },
  'risk-disclosure': {
    title: 'Risk Disclosure',
    lastUpdated: 'January 2025',
    seoTitle: 'Risk Disclosure | Trading Risks & Warnings | Brokz',
    seoDescription: 'Important risk disclosure: trading and investing involve substantial risk of loss. Understand market, technology, and strategy risks before using our tools.',
    notice: {
      severity: 'warning',
      text: 'Trading and investing involve substantial risk of loss. Past performance does not guarantee future results.',
    },
    sections: [
      { heading: '1. General Risk Warning', body: 'All trading and investment activities carry inherent risks. You may lose some or all of your invested capital. Only trade with funds you can afford to lose.' },
      { heading: '2. Market Risk', body: 'Financial markets are volatile and unpredictable. Market conditions can change rapidly, leading to potential losses.' },
      { heading: '3. Technology Risk', body: 'While we strive for reliability, technical issues, system failures, or connectivity problems may affect service availability or execution.' },
      { heading: '4. No Investment Advice', body: 'Brokz provides technical tools and platforms. We do not provide investment advice, recommendations, or guarantees. All decisions are your own.' },
      { heading: '5. Regulatory Considerations', body: 'Trading regulations vary by jurisdiction. Ensure you understand and comply with all applicable laws in your region.' },
    ],
  },
  disclaimer: {
    title: 'Disclaimer',
    lastUpdated: 'January 2025',
    seoTitle: 'Disclaimer | Technology Provider Notice | Brokz',
    seoDescription: 'Brokz disclaimer: We are a technology provider, not a broker or advisor. We do not provide investment advice, manage funds, or guarantee returns.',
    notice: {
      severity: 'danger',
      text: 'Brokz does not provide investment advice, manage funds, or act as a broker. We are a technology and systems provider.',
    },
    sections: [
      { heading: '1. Technology Provider', body: 'Brokz is a fintech software and automation company. We develop and provide technology tools, platforms, and infrastructure. We are not a broker, investment advisor, fund manager, or financial institution.' },
      { heading: '2. No Investment Advice', body: 'All information, tools, and analytics provided by Brokz are for informational and technical purposes only. They do not constitute investment advice, recommendations, or solicitations to buy or sell any financial instruments.' },
      { heading: '3. User Responsibility', body: 'Users are solely responsible for their trading and investment decisions. All actions taken using our tools are at your own risk and discretion.' },
      { heading: '4. No Guarantees', body: 'We make no guarantees, warranties, or representations regarding the accuracy, completeness, or suitability of our tools for any particular purpose. Past performance does not guarantee future results.' },
      { heading: '5. Third-Party Services', body: 'Our tools may integrate with third-party services. We are not responsible for the availability, accuracy, or terms of third-party services.' },
    ],
  },
};

const NOTICE_STYLES: Record<Severity, string> = {
  info:    'bg-blue-50 border-l-status-info text-blue-900',
  warning: 'bg-amber-50 border-l-status-warning text-amber-900',
  danger:  'bg-red-50 border-l-status-danger text-red-900',
};

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const doc = slug ? LEGAL_DOCS[slug] : undefined;

  if (!doc) return <NotFoundPage />;

  return (
    <div className="min-h-screen bg-surface">
      <SEO title={doc.seoTitle} description={doc.seoDescription} />
      <NavBar />

      <PageHero
        label="Legal"
        title={doc.title}
        description={`Last updated: ${doc.lastUpdated}`}
      />

      <section className="section-padding">
        <div className="section-container-narrow">
          <AnimateIn>
            <article className="card md:p-12">
              {doc.notice && (
                <div className={`border-l-4 p-5 rounded-md mb-8 ${NOTICE_STYLES[doc.notice.severity]}`}>
                  <p className="text-sm font-semibold">{doc.notice.text}</p>
                </div>
              )}

              <div className="flex flex-col gap-8">
                {doc.sections.map((section, i) => (
                  <div key={i}>
                    <h3 className="heading-3 text-ink mb-3">{section.heading}</h3>
                    <p className="body">{section.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-line">
                <Link to="/legal" className="btn-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  Back to Legal Documents
                </Link>
              </div>
            </article>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

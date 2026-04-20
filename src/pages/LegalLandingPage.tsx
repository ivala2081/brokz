import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import AnimateIn, { Stagger, StaggerItem } from '../components/AnimateIn';

const legalDocuments = [
  {
    slug: 'terms',
    title: 'Terms of Service',
    description: 'Our terms and conditions for using Brokz services and platforms.',
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
  },
  {
    slug: 'risk-disclosure',
    title: 'Risk Disclosure',
    description: 'Important information about trading and investment risks.',
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    description: 'Legal disclaimers regarding our services and technology.',
  },
];

export default function LegalLandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title="Legal | Brokz — Terms, Privacy & Disclosures"
        description="Review Brokz's legal documents — terms of service, privacy policy, risk disclosure, and disclaimers for our fintech infrastructure and trading technology services."
        keywords="brokz legal, terms of service, privacy policy, risk disclosure, fintech disclaimer"
      />

      <NavBar />

      <PageHero
        label="Legal"
        title="Legal Information"
        description="Please review our legal documents to understand your rights and responsibilities when using Brokz services."
      />

      <section className="section-padding">
        <div className="section-container">
          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalDocuments.map(doc => (
              <StaggerItem key={doc.slug}>
                <Link
                  to={`/legal/${doc.slug}`}
                  className="card-interactive block group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center mb-5">
                    <div className="w-4 h-4 rounded-sm bg-brand" />
                  </div>
                  <h3 className="heading-3 text-ink mb-3 group-hover:text-brand transition-colors">
                    {doc.title}
                  </h3>
                  <p className="body-sm mb-5">{doc.description}</p>
                  <span className="btn-link">
                    Read Document
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <AnimateIn>
            <div className="mt-14 card-muted border-l-4 border-l-status-warning">
              <h3 className="heading-4 text-ink mb-3">Important Notice</h3>
              <p className="body-sm text-ink-secondary mb-4">
                <strong className="text-ink">Brokz is a technology and systems provider.</strong> We develop and provide fintech software, automation tools, and infrastructure solutions.
              </p>
              <ul className="space-y-2 text-sm text-ink-secondary">
                {[
                  'We do not provide investment advice or recommendations',
                  'We do not manage funds or act as a broker',
                  'All tools are for informational and technical purposes only',
                  'Users are solely responsible for their trading and investment decisions',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-warning flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

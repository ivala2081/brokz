import '../framer/styles.css'
import { Link } from 'react-router-dom'

import NavBarFramerComponent from '../framer/header/nav-bar'
import FooterWithDisclaimer from '../components/FooterWithDisclaimer'
import SectionLabelFramerComponent from '../framer/section-label'

export default function LegalLandingPage() {
    const legalDocuments = [
        {
            slug: 'terms',
            title: 'Terms of Service',
            description: 'Our terms and conditions for using Brokz services and platforms.',
            icon: '📄'
        },
        {
            slug: 'privacy',
            title: 'Privacy Policy',
            description: 'How we collect, use, and protect your personal information.',
            icon: '🔒'
        },
        {
            slug: 'risk-disclosure',
            title: 'Risk Disclosure',
            description: 'Important information about trading and investment risks.',
            icon: '⚠️'
        },
        {
            slug: 'disclaimer',
            title: 'Disclaimer',
            description: 'Legal disclaimers regarding our services and technology.',
            icon: '⚖️'
        }
    ];

    return (
        <div className='flex flex-col items-center gap-12 md:gap-16 lg:gap-20 bg-[rgb(255,_255,_255)] pt-8 md:pt-12'>
            <NavBarFramerComponent.Responsive />

            <div className="w-full max-w-[1200px] px-4">
                <SectionLabelFramerComponent.Responsive
                    CKwcsPGm9={"rgb(255, 255, 255)"}
                    MdGap9160={"Legal Information"}
                    xSKnoaFrm={"rgb(7, 115, 49)"}
                />

                <p className="text-center text-gray-600 mt-6 mb-12 max-w-3xl mx-auto">
                    Please review our legal documents to understand your rights and responsibilities when using Brokz services.
                </p>

                {/* Legal Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {legalDocuments.map((doc) => (
                        <Link
                            key={doc.slug}
                            to={`/legal/${doc.slug}`}
                            className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[rgb(7,115,49)] hover:shadow-lg transition-all"
                        >
                            <div className="text-4xl mb-4">{doc.icon}</div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">{doc.title}</h3>
                            <p className="text-gray-600">{doc.description}</p>
                            <div className="mt-4 text-[rgb(7,115,49)] font-semibold flex items-center gap-2">
                                Read Document
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Important Notice */}
                <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Important Notice</h3>
                    <p className="text-red-800 mb-4">
                        <strong>Brokz is a technology and systems provider.</strong> We develop and provide fintech software, automation tools, and infrastructure solutions.
                    </p>
                    <ul className="list-disc list-inside text-red-800 space-y-2">
                        <li>We do not provide investment advice or recommendations</li>
                        <li>We do not manage funds or act as a broker</li>
                        <li>All tools are for informational and technical purposes only</li>
                        <li>Users are solely responsible for their trading and investment decisions</li>
                    </ul>
                </div>
            </div>

            <FooterWithDisclaimer />
        </div>
    );
}

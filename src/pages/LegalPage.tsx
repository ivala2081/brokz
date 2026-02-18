import '../framer/styles.css'
import { useParams } from 'react-router-dom'

import NavBarFramerComponent from '../framer/header/nav-bar'
import FooterWithDisclaimer from '../components/FooterWithDisclaimer'
import SectionLabelFramerComponent from '../framer/section-label'
import SEO from '../components/SEO'

export default function LegalPage() {
    const { slug } = useParams<{ slug: string }>();

    const getLegalContent = () => {
        switch (slug) {
            case 'terms':
                return {
                    title: 'Terms of Service',
                    content: (
                        <div className="prose max-w-none">
                            <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
                            <p className="text-gray-600 mb-4">Last updated: January 2025</p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h3>
                            <p className="text-gray-700 mb-4">
                                By accessing and using Brokz services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">2. Description of Services</h3>
                            <p className="text-gray-700 mb-4">
                                Brokz provides fintech software, automation tools, and technology infrastructure. We are a technology provider, not a broker, investment advisor, or fund manager.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">3. User Responsibilities</h3>
                            <p className="text-gray-700 mb-4">
                                Users are responsible for their own decisions and actions when using our tools. All trading and investment decisions are made at your own discretion and risk.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">4. Intellectual Property</h3>
                            <p className="text-gray-700 mb-4">
                                All content, software, and materials provided by Brokz are protected by intellectual property laws and remain the property of Brokz.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">5. Limitation of Liability</h3>
                            <p className="text-gray-700 mb-4">
                                Brokz shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.
                            </p>
                        </div>
                    )
                };
            case 'privacy':
                return {
                    title: 'Privacy Policy',
                    seoTitle: 'Privacy Policy | Data Protection & Security | Brokz',
                    seoDescription: 'Brokz Privacy Policy: how we collect, use, and protect your information. Data security, GDPR compliance, and user privacy rights explained.',
                    content: (
                        <div className="prose max-w-none">
                            <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
                            <p className="text-gray-600 mb-4">Last updated: January 2025</p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h3>
                            <p className="text-gray-700 mb-4">
                                We collect information that you provide directly to us, including contact information, account details, and usage data necessary to provide our services.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h3>
                            <p className="text-gray-700 mb-4">
                                We use collected information to provide, maintain, and improve our services, process transactions, and communicate with you about your account.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">3. Data Security</h3>
                            <p className="text-gray-700 mb-4">
                                We implement industry-standard security measures to protect your information, including encryption, secure servers, and access controls.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">4. Data Sharing</h3>
                            <p className="text-gray-700 mb-4">
                                We do not sell your personal information. We may share data only with trusted service providers necessary to deliver our services, subject to strict confidentiality agreements.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">5. Your Rights</h3>
                            <p className="text-gray-700 mb-4">
                                You have the right to access, update, or delete your personal information. Contact us to exercise these rights.
                            </p>
                        </div>
                    )
                };
            case 'risk-disclosure':
                return {
                    title: 'Risk Disclosure',
                    seoTitle: 'Risk Disclosure | Trading Risks & Warnings | Brokz',
                    seoDescription: 'Important risk disclosure: trading and investing involve substantial risk of loss. Understand market, technology, and strategy risks before using our tools.',
                    content: (
                        <div className="prose max-w-none">
                            <h2 className="text-2xl font-bold mb-4">Risk Disclosure</h2>
                            <p className="text-gray-600 mb-4">Last updated: January 2025</p>

                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mb-6">
                                <p className="text-amber-800 font-semibold">
                                    Important: Trading and investing involve substantial risk of loss. Past performance does not guarantee future results.
                                </p>
                            </div>

                            <h3 className="text-xl font-semibold mt-6 mb-3">1. General Risk Warning</h3>
                            <p className="text-gray-700 mb-4">
                                All trading and investment activities carry inherent risks. You may lose some or all of your invested capital. Only trade with funds you can afford to lose.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">2. Market Risk</h3>
                            <p className="text-gray-700 mb-4">
                                Financial markets are volatile and unpredictable. Market conditions can change rapidly, leading to potential losses.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">3. Technology Risk</h3>
                            <p className="text-gray-700 mb-4">
                                While we strive for reliability, technical issues, system failures, or connectivity problems may affect service availability or execution.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">4. No Investment Advice</h3>
                            <p className="text-gray-700 mb-4">
                                Brokz provides technical tools and platforms. We do not provide investment advice, recommendations, or guarantees. All decisions are your own.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">5. Regulatory Considerations</h3>
                            <p className="text-gray-700 mb-4">
                                Trading regulations vary by jurisdiction. Ensure you understand and comply with all applicable laws in your region.
                            </p>
                        </div>
                    )
                };
            case 'disclaimer':
                return {
                    title: 'Disclaimer',
                    seoTitle: 'Disclaimer | Technology Provider Notice | Brokz',
                    seoDescription: 'Brokz disclaimer: We are a technology provider, not a broker or advisor. We do not provide investment advice, manage funds, or guarantee returns.',
                    content: (
                        <div className="prose max-w-none">
                            <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
                            <p className="text-gray-600 mb-4">Last updated: January 2025</p>

                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
                                <p className="text-red-800 font-semibold">
                                    Brokz does not provide investment advice, manage funds, or act as a broker. We are a technology and systems provider.
                                </p>
                            </div>

                            <h3 className="text-xl font-semibold mt-6 mb-3">1. Technology Provider</h3>
                            <p className="text-gray-700 mb-4">
                                Brokz is a fintech software and automation company. We develop and provide technology tools, platforms, and infrastructure. We are not a broker, investment advisor, fund manager, or financial institution.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">2. No Investment Advice</h3>
                            <p className="text-gray-700 mb-4">
                                All information, tools, and analytics provided by Brokz are for informational and technical purposes only. They do not constitute investment advice, recommendations, or solicitations to buy or sell any financial instruments.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">3. User Responsibility</h3>
                            <p className="text-gray-700 mb-4">
                                Users are solely responsible for their trading and investment decisions. All actions taken using our tools are at your own risk and discretion.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">4. No Guarantees</h3>
                            <p className="text-gray-700 mb-4">
                                We make no guarantees, warranties, or representations regarding the accuracy, completeness, or suitability of our tools for any particular purpose. Past performance does not guarantee future results.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3">5. Third-Party Services</h3>
                            <p className="text-gray-700 mb-4">
                                Our tools may integrate with third-party services. We are not responsible for the availability, accuracy, or terms of third-party services.
                            </p>
                        </div>
                    )
                };
            default:
                return {
                    title: 'Legal Information',
                    seoTitle: 'Legal | Brokz',
                    seoDescription: 'Legal documentation for Brokz technology services.',
                    content: (
                        <div>
                            <p className="text-gray-600">Legal document not found. Please select a valid legal document.</p>
                        </div>
                    )
                };
        }
    };

    const legalData = getLegalContent();

    return (
        <div className='flex flex-col items-center gap-12 md:gap-16 lg:gap-20 bg-[rgb(255,_255,_255)] pt-8 md:pt-12'>
            <SEO
                title={legalData.seoTitle || legalData.title}
                description={legalData.seoDescription || ""}
            />
            <NavBarFramerComponent.Responsive />

            <div className="w-full max-w-[900px] px-4">
                <SectionLabelFramerComponent.Responsive
                    CKwcsPGm9={"rgb(255, 255, 255)"}
                    MdGap9160={legalData.title}
                    xSKnoaFrm={"rgb(7, 115, 49)"}
                />

                <div className="bg-white rounded-2xl p-8 md:p-12 mt-8 shadow-sm">
                    {legalData.content}
                </div>
            </div>

            <FooterWithDisclaimer />
        </div>
    );
}

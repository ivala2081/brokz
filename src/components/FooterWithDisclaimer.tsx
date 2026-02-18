import { Link } from 'react-router-dom'
import FooterDeckFramerComponent from '../framer/footer/deck'

export default function FooterWithDisclaimer() {
    return (
        <>
            {/* Global Disclaimer Section */}
            <div className="w-full bg-gray-50 border-t border-gray-200 py-8">
                <div className="max-w-[1200px] mx-auto px-4">
                    <div className="bg-white border-2 border-amber-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Important Disclaimer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <p className="mb-2">
                                    <strong>Brokz is a technology and systems provider.</strong> We develop and provide fintech software, automation tools, and infrastructure solutions.
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>We do not provide investment advice</li>
                                    <li>We do not manage funds</li>
                                    <li>We are not a broker or financial advisor</li>
                                </ul>
                            </div>
                            <div>
                                <p className="mb-2">
                                    <strong>User Responsibility:</strong>
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>All tools are informational and technical</li>
                                    <li>Users control their own decisions</li>
                                    <li>Trading involves substantial risk</li>
                                    <li>Past performance does not guarantee future results</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                For full legal information, please review our{' '}
                                <Link to="/legal/terms" className="text-brand hover:underline">Terms of Service</Link>,{' '}
                                <Link to="/legal/privacy" className="text-brand hover:underline">Privacy Policy</Link>,{' '}
                                <Link to="/legal/risk-disclosure" className="text-brand hover:underline">Risk Disclosure</Link>, and{' '}
                                <Link to="/legal/disclaimer" className="text-brand hover:underline">Disclaimer</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Original Footer */}
            <FooterDeckFramerComponent.Responsive />
        </>
    );
}

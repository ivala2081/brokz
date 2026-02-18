import { Link } from 'react-router-dom';
import { BrokzLogoCompact } from './BrokzLogo';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-950 text-gray-400">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="brightness-0 invert opacity-90">
              <BrokzLogoCompact size={32} />
            </div>
            <p className="mt-4 text-sm text-gray-400 max-w-sm leading-relaxed">
              Institutional-grade fintech infrastructure and trading technology
              engineered for brokerages, proprietary trading firms, and liquidity providers.
            </p>
            <p className="mt-4 text-xs text-gray-600">
              Founded 2025 &middot; Brokz Ltd.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 tracking-wide">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/solutions" className="hover:text-white transition-colors">Solutions</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-5 tracking-wide">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/risk-disclosure" className="hover:text-white transition-colors">Risk Disclosure</Link></li>
              <li><Link to="/legal/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-5 mb-8">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-400">Regulatory Disclaimer:</strong>{' '}
              Brokz is a technology and systems provider. We develop and license fintech software,
              automation tools, and infrastructure solutions. We do not provide investment advice,
              manage client funds, or operate as a broker, dealer, or financial advisor. All
              products are informational and technical in nature. Users retain full control over
              their own trading decisions. Trading involves substantial risk of loss. Past
              performance does not guarantee future results. Ensure compliance with applicable
              local regulations before deploying any financial technology.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} Brokz. All rights reserved.
            </p>
            <p className="text-xs text-gray-700">
              contact@brokz.io
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

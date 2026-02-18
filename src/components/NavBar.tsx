import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrokzLogoCompact } from './BrokzLogo';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Solutions', path: '/solutions' },
  { label: 'Products', path: '/products' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blog' },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.08)] border-b border-gray-100/80'
          : 'bg-white/95 backdrop-blur border-b border-gray-100'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <BrokzLogoCompact size={52} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors relative group ${
                location.pathname === link.path
                  ? 'text-brand'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
              {location.pathname === link.path && (
                <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-brand rounded-full" />
              )}
            </Link>
          ))}
        </div>

        <Link
          to="/contact"
          className="hidden md:inline-flex text-sm font-semibold bg-brand text-white px-5 py-2.5 rounded-full hover:bg-brand-hover transition-colors"
        >
          Get in Touch
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 flex flex-col gap-4">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium py-1 ${
                location.pathname === link.path ? 'text-brand' : 'text-gray-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="mt-2 text-sm font-semibold bg-brand text-white px-5 py-2.5 rounded-full text-center hover:bg-brand-hover transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      )}
    </nav>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Spotlight from '../components/fx/Spotlight';
import InteractiveGrid from '../components/fx/InteractiveGrid';

const suggestions = [
  { label: 'Home', path: '/', description: 'Overview of Brokz infrastructure & services.' },
  { label: 'Solutions', path: '/solutions', description: 'Engineering approach and capabilities.' },
  { label: 'Products', path: '/products', description: 'Core product lines and platforms.' },
  { label: 'Blog', path: '/blog', description: 'Technical insights and industry analysis.' },
  { label: 'Contact', path: '/contact', description: 'Start a conversation with our team.' },
];

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <SEO
        title="Page Not Found | Brokz"
        description="The page you're looking for doesn't exist or has been moved."
        noindex
      />

      <NavBar />

      {/* Hero */}
      <section className="relative bg-surface-inverse text-white overflow-hidden flex-1 flex items-center">
        <InteractiveGrid cellSize={48} />
        <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
        <Spotlight size={600} />

        <div className="relative section-container py-24 md:py-32 w-full">
          <div className="max-w-3xl">
            <motion.p
              className="section-label-light"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              Error 404
            </motion.p>

            <motion.h1
              className="heading-display text-white mb-6 font-mono tabular"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              404
            </motion.h1>

            <motion.h2
              className="heading-2 text-white mb-5 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              This route was not found in our system.
            </motion.h2>

            <motion.p
              className="text-gray-300 text-lg leading-relaxed max-w-xl mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              The page you requested doesn't exist, was moved, or the link may be incomplete.
            </motion.p>

            {location.pathname && (
              <motion.p
                className="text-sm text-ink-subtle font-mono mb-10 truncate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Requested: <span className="text-brand-accent">{location.pathname}</span>
              </motion.p>
            )}

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <Link to="/" className="btn-primary">
                Return Home
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/contact" className="btn-ghost">
                Report a Broken Link
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Suggested destinations */}
      <section className="section-padding-sm bg-surface">
        <div className="section-container">
          <p className="section-label">Suggested Pages</p>
          <h2 className="heading-3 text-ink mb-8">You might be looking for</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
              >
                <Link to={item.path} className="card-interactive block group">
                  <h3 className="heading-4 text-ink mb-2 group-hover:text-brand transition-colors">
                    {item.label}
                  </h3>
                  <p className="body-sm">{item.description}</p>
                  <span className="btn-link mt-4">
                    Visit {item.label}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

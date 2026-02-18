import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import AnimateIn, { Stagger, StaggerItem } from '../components/AnimateIn';
import { getAllPosts, categoryLabels, type BlogCategory } from '../lib/blog';

const categoryColors: Record<BlogCategory, string> = {
  industry: 'bg-blue-50 text-blue-700 border-blue-100',
  product: 'bg-purple-50 text-purple-700 border-purple-100',
  technical: 'bg-amber-50 text-amber-700 border-amber-100',
  company: 'bg-green-50 text-[#087331] border-green-100',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const allPosts = getAllPosts();

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all');

  const filtered =
    activeCategory === 'all'
      ? allPosts
      : allPosts.filter(p => p.category === activeCategory);

  const categories: Array<{ value: BlogCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Posts' },
    ...( Object.entries(categoryLabels) as [BlogCategory, string][]).map(([k, v]) => ({
      value: k,
      label: v,
    })),
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Blog | Brokz — Fintech Engineering Insights"
        description="Technical deep-dives, industry analysis, product updates, and company news from the Brokz engineering team."
        keywords="brokerage technology blog, fintech engineering, MT5 development, trading infrastructure, algo trading"
        ogTitle="Brokz Blog — Fintech Engineering Insights"
        ogDescription="Technical deep-dives, industry analysis, and product updates from the Brokz engineering team."
      />

      <NavBar />

      {/* Hero */}
      <section className="relative bg-[#050a06] text-white overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(8,115,49,0.12),transparent)] pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-6 py-24 md:py-32">
          <motion.p
            className="text-[#4ade80] text-xs font-bold tracking-widest uppercase mb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            Blog
          </motion.p>
          <motion.h1
            className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl mb-5 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            Engineering Insights &amp; Industry Perspectives
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            Technical deep-dives, industry analysis, product updates, and company news
            from the Brokz engineering team.
          </motion.p>
        </div>
      </section>

      {/* Filter + Posts */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Category filters */}
          <AnimateIn>
            <div className="flex flex-wrap gap-2 mb-12">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    activeCategory === cat.value
                      ? 'bg-[#087331] text-white border-[#087331]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </AnimateIn>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">No posts in this category yet.</p>
          ) : (
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(post => (
                <StaggerItem key={post.slug}>
                  <motion.article
                    className="group flex flex-col border border-gray-100 rounded-2xl overflow-hidden h-full"
                    whileHover={{
                      y: -4,
                      boxShadow: '0 10px 28px rgba(0,0,0,0.07)',
                      borderColor: 'rgba(8,115,49,0.35)',
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="p-7 flex flex-col flex-1">
                      {/* Category + date */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            categoryColors[post.category]
                          }`}
                        >
                          {categoryLabels[post.category]}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(post.date)}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-bold text-gray-900 leading-snug mb-3 group-hover:text-[#087331] transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">
                        {post.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <span className="text-xs text-gray-400">{post.readTime} min read</span>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-xs font-semibold text-[#087331] hover:text-[#065a26] transition-colors flex items-center gap-1"
                        >
                          Read more
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

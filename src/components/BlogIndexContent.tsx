import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHero from './PageHero';
import AnimateIn, { Stagger, StaggerItem } from './AnimateIn';
import { getAllPosts, categoryLabels, type BlogCategory } from '../lib/blog';

const categoryColors: Record<BlogCategory, string> = {
  industry: 'bg-blue-50 text-blue-700 border-blue-100',
  product: 'bg-purple-50 text-purple-700 border-purple-100',
  technical: 'bg-amber-50 text-amber-700 border-amber-100',
  company: 'bg-brand-subtle text-brand border-green-100',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const allPosts = getAllPosts();

export default function BlogIndexContent() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>('all');

  const filtered =
    activeCategory === 'all'
      ? allPosts
      : allPosts.filter(p => p.category === activeCategory);

  const categories: Array<{ value: BlogCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Posts' },
    ...(Object.entries(categoryLabels) as [BlogCategory, string][]).map(([k, v]) => ({
      value: k,
      label: v,
    })),
  ];

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      <PageHero
        label="Blog"
        title="Engineering insights. Industry signal."
        highlight="Industry signal"
        description="Technical deep-dives, industry analysis, product updates, and company news from the Brokz engineering team."
      />

      {/* Filter */}
      <section className="bg-surface-muted border-b border-line sticky top-16 z-raised backdrop-blur-md">
        <div className="section-container py-5">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-pill text-sm font-medium border transition-colors duration-base cursor-pointer ${
                  activeCategory === cat.value
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface text-ink-secondary border-line hover:border-ink-muted hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="section-padding bg-surface">
        <div className="section-container">
          {filtered.length === 0 ? (
            <p className="text-ink-muted text-sm">No posts in this category yet.</p>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <AnimateIn>
                  <a
                    href={`/blog/${featured.slug}`}
                    className="group block mb-16 md:mb-24 pb-16 md:pb-24 border-b border-line"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
                      <div className="lg:col-span-8">
                        <div className="flex items-center gap-3 mb-6">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill border ${categoryColors[featured.category]}`}>
                            {categoryLabels[featured.category]}
                          </span>
                          <span className="text-xs text-ink-muted">{formatDate(featured.date)}</span>
                          <span className="text-xs text-ink-muted">·</span>
                          <span className="text-xs text-ink-muted">{featured.readTime} min read</span>
                        </div>
                        <h2 className="heading-hero-sm text-ink mb-6 tracking-tight leading-[1.05] group-hover:text-brand transition-colors">
                          {featured.title}
                        </h2>
                        <p className="body-lg max-w-2xl">{featured.excerpt}</p>
                      </div>
                      <div className="lg:col-span-4 flex lg:justify-end">
                        <span className="btn-link text-base">
                          Read article
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </a>
                </AnimateIn>
              )}

              {/* Rest of posts */}
              {rest.length > 0 && (
                <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {rest.map(post => (
                    <StaggerItem key={post.slug}>
                      <motion.article
                        className="group flex flex-col h-full"
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <a href={`/blog/${post.slug}`} className="flex flex-col h-full">
                          <div className="flex items-center gap-3 mb-5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill border ${categoryColors[post.category]}`}>
                              {categoryLabels[post.category]}
                            </span>
                            <span className="text-xs text-ink-muted">{formatDate(post.date)}</span>
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold text-ink leading-tight tracking-tight mb-4 group-hover:text-brand transition-colors">
                            {post.title}
                          </h2>
                          <p className="body-sm flex-1 mb-6">{post.excerpt}</p>
                          <div className="flex items-center justify-between pt-5 border-t border-line">
                            <span className="text-xs text-ink-muted font-mono tabular">{post.readTime} min read</span>
                            <span className="text-xs font-semibold text-brand group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                              Read
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </span>
                          </div>
                        </a>
                      </motion.article>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </>
          )}
        </div>
      </section>

    </>
  );
}

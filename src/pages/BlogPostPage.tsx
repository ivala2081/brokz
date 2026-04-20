import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import NotFoundPage from './NotFoundPage';
import { getPostBySlug, categoryLabels, type BlogCategory } from '../lib/blog';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <NotFoundPage />;

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title={`${post.title} | Brokz Blog`}
        description={post.excerpt}
        keywords={`${post.title}, brokerage technology, fintech engineering, Brokz`}
        ogTitle={post.title}
        ogDescription={post.excerpt}
        canonical={`/blog/${post.slug}`}
      />

      <NavBar />

      {/* Hero */}
      <section className="relative bg-surface-inverse text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-grid-dark bg-[length:64px_64px]" />
        <div className="absolute inset-0 bg-brand-radial pointer-events-none" />

        <div className="relative max-w-[820px] mx-auto px-6 pt-24 md:pt-32 pb-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
            className="flex items-center gap-3 mb-8 flex-wrap"
          >
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill border ${categoryColors[post.category]}`}>
              {categoryLabels[post.category]}
            </span>
            <span className="text-gray-400 text-xs font-mono tabular">{formatDate(post.date)}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-400 text-xs font-mono tabular">{post.readTime} min read</span>
          </motion.div>

          <motion.h1
            className="heading-hero-sm text-white leading-[1.05] mb-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            {post.title}
          </motion.h1>

          <motion.p
            className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          >
            {post.excerpt}
          </motion.p>

          <motion.p
            className="text-ink-subtle text-sm pt-6 border-t border-line-inverse inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            By <span className="text-white font-medium">{post.author}</span>
          </motion.p>
        </div>
      </section>

      {/* Article content */}
      <section className="section-padding bg-surface">
        <div className="max-w-[760px] mx-auto px-6">
          <article
            className="prose prose-gray prose-base md:prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-ink prose-headings:tracking-tight
              prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-5
              prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:text-ink-secondary prose-p:leading-relaxed prose-p:mb-6
              prose-li:text-ink-secondary prose-li:leading-relaxed
              prose-strong:text-ink prose-strong:font-semibold
              prose-a:text-brand prose-a:no-underline hover:prose-a:underline
              prose-code:bg-surface-muted prose-code:text-ink prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-surface-inverse prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:font-mono
              prose-blockquote:border-l-brand prose-blockquote:text-ink-muted prose-blockquote:font-normal prose-blockquote:not-italic
              prose-hr:border-line"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-20 pt-10 border-t border-line">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-brand transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

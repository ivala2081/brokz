import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getPostBySlug, categoryLabels, type BlogCategory } from '../lib/blog';

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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${post.title} | Brokz Blog`}
        description={post.excerpt}
        keywords={`${post.title}, brokerage technology, fintech engineering, Brokz`}
        ogTitle={post.title}
        ogDescription={post.excerpt}
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
        <div className="relative max-w-[800px] mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex items-center gap-3 mb-6"
          >
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                categoryColors[post.category]
              }`}
            >
              {categoryLabels[post.category]}
            </span>
            <span className="text-gray-400 text-xs">{formatDate(post.date)}</span>
            <span className="text-gray-600 text-xs">&middot;</span>
            <span className="text-gray-400 text-xs">{post.readTime} min read</span>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {post.title}
          </motion.h1>

          <motion.p
            className="text-gray-300 text-base leading-relaxed mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {post.excerpt}
          </motion.p>

          <motion.p
            className="text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            By {post.author}
          </motion.p>
        </div>
      </section>

      {/* Article content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <article
            className="prose prose-gray prose-sm md:prose-base max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5
              prose-li:text-gray-600 prose-li:leading-relaxed
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-a:text-[#087331] prose-a:no-underline hover:prose-a:underline
              prose-code:bg-gray-50 prose-code:text-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto
              prose-blockquote:border-l-[#087331] prose-blockquote:text-gray-500
              prose-hr:border-gray-100"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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

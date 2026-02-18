import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { categoryLabels, type BlogCategory } from '../lib/blog';

// ─── helpers ────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function readTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function buildMarkdown(f: Fields): string {
  return `---
title: "${f.title}"
date: "${f.date}"
category: "${f.category}"
excerpt: "${f.excerpt}"
author: "${f.author}"
---

${f.content}`;
}

// ─── types ──────────────────────────────────────────────────────────────────

interface Fields {
  title: string;
  date: string;
  category: BlogCategory;
  excerpt: string;
  author: string;
  content: string;
}

const categoryColors: Record<BlogCategory, string> = {
  industry: 'bg-blue-50 text-blue-700 border-blue-100',
  product: 'bg-purple-50 text-purple-700 border-purple-100',
  technical: 'bg-amber-50 text-amber-700 border-amber-100',
  company: 'bg-green-50 text-[#087331] border-green-100',
};

const today = new Date().toISOString().split('T')[0];

// ─── field components ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-[#0e1810] border border-[#1e3a24] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#087331] transition-colors ${className}`}
    />
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const [fields, setFields] = useState<Fields>({
    title: '',
    date: today,
    category: 'technical',
    excerpt: '',
    author: 'Brokz Engineering',
    content: '## Introduction\n\nStart writing your post here...\n',
  });
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [copied, setCopied] = useState(false);

  const set = (key: keyof Fields) => (value: string) =>
    setFields(prev => ({ ...prev, [key]: value }));

  const slug = toSlug(fields.title);
  const filename = slug ? `${slug}.md` : 'untitled.md';
  const canDownload = fields.title.trim().length > 0;

  const renderedContent = useMemo(
    () => marked(fields.content || '') as string,
    [fields.content],
  );

  function handleDownload() {
    const blob = new Blob([buildMarkdown(fields)], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildMarkdown(fields));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="h-screen flex flex-col bg-[#080f09] text-gray-200 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="flex-none flex items-center justify-between px-5 h-12 bg-[#060d07] border-b border-[#1a2e1d]">
        {/* Left: back + title */}
        <div className="flex items-center gap-4">
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Blog
          </Link>
          <span className="text-[#1a2e1d]">|</span>
          <span className="text-xs font-semibold text-gray-300">New Post</span>
        </div>

        {/* Center: filename pill */}
        <div className="hidden md:flex items-center gap-2 bg-[#0e1810] border border-[#1e3a24] rounded-full px-4 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <span className="text-[11px] text-gray-400 font-mono">
            content/blog/<span className="text-[#4ade80]">{filename}</span>
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 border border-[#1e3a24] rounded-lg px-3 py-1.5 transition-colors"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-[#4ade80]">Copied</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={!canDownload}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors ${
              canDownload
                ? 'bg-[#087331] text-white hover:bg-[#065a26]'
                : 'bg-[#0e1810] text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download .md
          </button>
        </div>
      </header>

      {/* ── Mobile tab bar ──────────────────────────────────────────────────── */}
      <div className="md:hidden flex border-b border-[#1a2e1d]">
        {(['editor', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-[#4ade80] border-b-2 border-[#4ade80]'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">

        {/* ── LEFT: Editor ────────────────────────────────────────────────── */}
        <div className={`flex flex-col w-full md:w-[420px] flex-none border-r border-[#1a2e1d] overflow-y-auto ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>

          {/* Meta fields */}
          <div className="flex-none p-5 border-b border-[#1a2e1d] flex flex-col gap-4">

            {/* Title */}
            <div>
              <Label>Title</Label>
              <input
                type="text"
                value={fields.title}
                onChange={e => set('title')(e.target.value)}
                placeholder="Post title..."
                className="w-full bg-transparent border-0 border-b border-[#1e3a24] pb-2 text-lg font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#087331] transition-colors"
              />
              {slug && (
                <p className="mt-1.5 text-[11px] text-gray-600 font-mono">
                  /blog/<span className="text-gray-400">{slug}</span>
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(categoryLabels) as [BlogCategory, string][]).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => set('category')(k)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      fields.category === k
                        ? 'bg-[#087331] text-white border-[#087331]'
                        : 'bg-[#0e1810] text-gray-400 border-[#1e3a24] hover:border-[#087331]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Author row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <input
                  type="date"
                  value={fields.date}
                  onChange={e => set('date')(e.target.value)}
                  className="w-full bg-[#0e1810] border border-[#1e3a24] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#087331] transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <Label>Author</Label>
                <Input value={fields.author} onChange={set('author')} placeholder="Brokz Engineering" />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <Label>Excerpt</Label>
              <textarea
                value={fields.excerpt}
                onChange={e => set('excerpt')(e.target.value)}
                placeholder="One sentence summary shown on the listing card..."
                rows={2}
                className="w-full bg-[#0e1810] border border-[#1e3a24] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#087331] transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Markdown editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#1a2e1d]">
              <Label>Content (Markdown)</Label>
              <span className="text-[11px] text-gray-600">
                {readTime(fields.content)} min read &middot; {fields.content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={fields.content}
              onChange={e => set('content')(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-[#060d07] px-5 py-4 text-sm text-gray-300 font-mono leading-relaxed focus:outline-none resize-none placeholder-gray-700"
              placeholder="Start writing in Markdown..."
              style={{ minHeight: '320px' }}
            />
          </div>
        </div>

        {/* ── RIGHT: Preview ──────────────────────────────────────────────── */}
        <div className={`flex-1 overflow-y-auto bg-white min-h-0 ${activeTab === 'editor' ? 'hidden md:block' : 'block'}`}>

          {fields.title ? (
            <>
              {/* Hero mock */}
              <div
                className="relative bg-[#050a06] text-white overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(8,115,49,0.12),transparent)] pointer-events-none" />
                <div className="relative max-w-[800px] mx-auto px-8 py-14">
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[fields.category]}`}>
                      {categoryLabels[fields.category]}
                    </span>
                    {fields.date && (
                      <span className="text-gray-400 text-xs">{formatDate(fields.date)}</span>
                    )}
                    <span className="text-gray-600 text-xs">&middot;</span>
                    <span className="text-gray-400 text-xs">{readTime(fields.content)} min read</span>
                  </div>
                  <h1 className="text-3xl font-bold leading-tight mb-4 tracking-tight">
                    {fields.title || <span className="text-gray-600 italic">Untitled</span>}
                  </h1>
                  {fields.excerpt && (
                    <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-2xl">
                      {fields.excerpt}
                    </p>
                  )}
                  {fields.author && (
                    <p className="text-gray-500 text-sm">By {fields.author}</p>
                  )}
                </div>
              </div>

              {/* Article content */}
              <div className="max-w-[800px] mx-auto px-8 py-12">
                <article
                  className="prose prose-gray max-w-none
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
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-8 py-20">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400 mb-1">Preview will appear here</p>
              <p className="text-xs text-gray-300">Enter a title to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom status bar ────────────────────────────────────────────────── */}
      <footer className="flex-none flex items-center justify-between px-5 h-7 bg-[#060d07] border-t border-[#1a2e1d] text-[10px] text-gray-600">
        <span>
          {canDownload
            ? <>Save file to <span className="text-gray-400 font-mono">content/blog/{filename}</span> then push to deploy</>
            : 'Enter a title to generate the filename'}
        </span>
        <span className="hidden md:block">
          Markdown supported &middot; Push to GitHub to publish
        </span>
      </footer>
    </div>
  );
}

import { marked } from 'marked';

export type BlogCategory = 'industry' | 'product' | 'technical' | 'company';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: BlogCategory;
  excerpt: string;
  author: string;
  content: string;
  readTime: number;
}

export const categoryLabels: Record<BlogCategory, string> = {
  industry: 'Industry Insights',
  product: 'Product Updates',
  technical: 'Technical Deep-Dives',
  company: 'Company News',
};

// Load all markdown files from /content/blog/
const modules = import.meta.glob('../../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlStr = match[1];
  const content = match[2];

  const data: Record<string, string> = {};
  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = value;
  }

  return { data, content };
}

let _cache: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (_cache) return _cache;

  _cache = Object.entries(modules)
    .map(([filepath, raw]) => {
      const slug = filepath
        .replace(/^.*content\/blog\//, '')
        .replace(/\.md$/, '');
      const { data, content } = parseFrontmatter(raw);
      const wordCount = content.split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        category: (data.category as BlogCategory) || 'industry',
        excerpt: data.excerpt || '',
        author: data.author || 'Brokz Team',
        content: marked(content) as string,
        readTime,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return _cache;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find(p => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return getAllPosts().map(p => p.slug);
}

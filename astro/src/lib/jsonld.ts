/**
 * Typed builders for schema.org JSON-LD snippets.
 *
 * Site-wide entities (Organization, WebSite) live in index.html so bots see
 * them pre-JS. Per-page types (BreadcrumbList, Article, Service, FAQPage)
 * flow through the <SEO jsonLd={...} /> prop and render via react-helmet-async.
 */

const BASE_URL = 'https://brokztech.com';
const ORG_ID = `${BASE_URL}/#organization`;

/** Anything that can be serialized as JSON. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLd = Record<string, any>;

function abs(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

export interface BreadcrumbCrumb {
  name: string;
  path: string;
}

/** schema.org BreadcrumbList — helps Google show breadcrumb trail in SERP. */
export function breadcrumbList(crumbs: BreadcrumbCrumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
  keywords?: string[];
  inLanguage?: 'en' | 'tr';
}

/** schema.org Article — for blog posts. Pairs with <SEO>'s OG tags. */
export function article(input: ArticleSchemaInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(input.path) },
    headline: input.headline,
    description: input.description,
    image: input.image ? abs(input.image) : `${BASE_URL}/og-image.png`,
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    author: {
      '@type': 'Organization',
      name: input.authorName || 'Brokz',
      '@id': ORG_ID,
    },
    publisher: { '@id': ORG_ID },
    keywords: input.keywords?.join(', '),
    inLanguage: input.inLanguage || 'en',
  };
}

export interface ServiceSchemaInput {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
  areaServed?: string[];
}

/** schema.org Service — for Solutions/Products offering pages. */
export function service(input: ServiceSchemaInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: abs(input.path),
    serviceType: input.serviceType,
    areaServed: input.areaServed || ['Worldwide'],
    provider: { '@id': ORG_ID },
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** schema.org FAQPage — generates rich SERP with collapsible Q/A. */
export function faqPage(items: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: i.answer,
      },
    })),
  };
}

/** schema.org CollectionPage — for list-style pages (Blog index). */
export function collectionPage(name: string, description: string, path: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: abs(path),
    isPartOf: { '@id': `${BASE_URL}/#website` },
  };
}

/** schema.org ContactPage. */
export function contactPage(name: string, description: string, path: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name,
    description,
    url: abs(path),
    isPartOf: { '@id': `${BASE_URL}/#website` },
  };
}

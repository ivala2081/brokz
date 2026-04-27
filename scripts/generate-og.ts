/**
 * generate-og.ts
 *
 * Build-time OG image generator. Produces one 1200×630 PNG per blog post
 * into public/og/blog-<slug>.png, using satori (JSX → SVG) + @resvg/resvg-js
 * (SVG → PNG). Fonts come from the locally installed @fontsource/geist
 * woff files — no external fetches at build or runtime.
 *
 * Rendered template: Brokz wordmark + category eyebrow + title + URL slug.
 * Non-blog pages continue to use the static /og-image.png default.
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const blogDir = resolve(root, 'content/blog');
const outDir = resolve(root, 'public/og');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ─── Font loading (local woff, no CDN) ─────────────────────────────────

const fontsDir = resolve(root, 'node_modules/@fontsource/geist/files');
const regularFont = readFileSync(resolve(fontsDir, 'geist-latin-400-normal.woff'));
const boldFont    = readFileSync(resolve(fontsDir, 'geist-latin-700-normal.woff'));

// ─── Frontmatter reader (same as sitemap generator) ────────────────────

function readFrontmatter(filePath: string): Record<string, string> {
    const src = readFileSync(filePath, 'utf8');
    const match = src.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const out: Record<string, string> = {};
    for (const line of match[1].split('\n')) {
        const m = line.match(/^([a-zA-Z][\w]*)\s*:\s*(.+?)\s*$/);
        if (!m) continue;
        const [, key, rawValue] = m;
        out[key] = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    }
    return out;
}

const CATEGORY_LABEL: Record<string, string> = {
    industry: 'Industry Insights',
    product: 'Product Updates',
    technical: 'Technical Deep-Dive',
    company: 'Company News',
};

// ─── Template ──────────────────────────────────────────────────────────

interface TemplateInput {
    eyebrow: string;
    title: string;
    url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ogTemplate(input: TemplateInput): any {
    return {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                flexDirection: 'column',
                width: '1200px',
                height: '630px',
                backgroundColor: '#050A06',
                padding: '72px 80px',
                justifyContent: 'space-between',
                color: '#F9FAFB',
                fontFamily: 'Geist',
                backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 192, 51, 0.22), transparent)',
            },
            children: [
                // Top row: wordmark + eyebrow
                {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        },
                        children: [
                            {
                                type: 'div',
                                props: {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '32px',
                                        fontWeight: 700,
                                        letterSpacing: '-0.02em',
                                        color: '#F9FAFB',
                                    },
                                    children: 'Brokz',
                                },
                            },
                            {
                                type: 'div',
                                props: {
                                    style: {
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: '#5FDD82',
                                    },
                                    children: input.eyebrow,
                                },
                            },
                        ],
                    },
                },
                // Title — large, tight
                {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            fontSize: '68px',
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: '-0.035em',
                            color: '#F9FAFB',
                            maxWidth: '1040px',
                        },
                        children: input.title,
                    },
                },
                // Bottom row: URL slug + accent bar
                {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            fontSize: '20px',
                            fontWeight: 400,
                            color: '#94a3b8',
                        },
                        children: [
                            {
                                type: 'div',
                                props: {
                                    style: { width: '48px', height: '4px', backgroundColor: '#00C033', borderRadius: '2px', display: 'flex' },
                                    children: '',
                                },
                            },
                            {
                                type: 'div',
                                props: {
                                    style: { display: 'flex' },
                                    children: input.url,
                                },
                            },
                        ],
                    },
                },
            ],
        },
    };
}

// ─── Render one post ───────────────────────────────────────────────────

async function renderOne(slug: string, eyebrow: string, title: string, url: string, outPath: string) {
    const svg = await satori(ogTemplate({ eyebrow, title, url }), {
        width: 1200,
        height: 630,
        fonts: [
            { name: 'Geist', data: regularFont, weight: 400, style: 'normal' },
            { name: 'Geist', data: boldFont, weight: 700, style: 'normal' },
        ],
    });
    const png = new Resvg(svg).render().asPng();
    writeFileSync(outPath, png);
    console.log(`  ✓ ${outPath.split(/[/\\]public[/\\]/).pop()}`);
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
    console.log('Generating OG images…\n');

    // Blog posts
    const files = readdirSync(blogDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
        const slug = file.replace(/\.md$/, '');
        const fm = readFrontmatter(resolve(blogDir, file));
        const eyebrow = CATEGORY_LABEL[fm.category] ?? 'Brokz Blog';
        const title = fm.title || slug;
        const url = `brokztech.com/blog/${slug}`;
        const outPath = resolve(outDir, `blog-${slug}.png`);
        await renderOne(slug, eyebrow, title, url, outPath);
    }

    // Default (homepage + non-blog pages) — branded, title-free wordmark card
    await renderOne(
        'default',
        'B2B Fintech Engineering',
        'Trading infrastructure, automation & analytics built for brokerages.',
        'brokztech.com',
        resolve(outDir, 'default.png'),
    );

    console.log('\n✓ Done.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,js,ts,jsx,tsx,mdx,md,html}',
    ],
    safelist: [
        // DesignSystemPage renders the primitive scales dynamically
        { pattern: /^bg-(green|neutral)-(0|50|100|200|300|400|500|600|700|800|900|950|1000)$/ },
    ],
    theme: {
        extend: {
            // ─── Layer 1: Primitives (never use directly in components) ──────
            colors: {
                // Brand scale (green) — derived from Brokz brand package
                // 500 = #00C033 (primary brand green from logo)
                green: {
                    50:  '#E6FBEC',
                    100: '#C6F5D6',
                    200: '#8FECB0',
                    300: '#58E389',
                    400: '#2FD663',
                    500: '#00C033', // brand anchor
                    600: '#009A29',
                    700: '#00761F',
                    800: '#005315',
                    900: '#002F0B',
                },
                // Neutral scale (cool-tinted, institutional)
                neutral: {
                    0:    '#ffffff',
                    50:   '#f9fafb',
                    100:  '#f1f5f9',
                    200:  '#e2e8f0',
                    300:  '#cbd5e1',
                    400:  '#94a3b8',
                    500:  '#64748b',
                    600:  '#475569',
                    700:  '#334155',
                    800:  '#1e293b',
                    900:  '#0f172a',
                    950:  '#050a06', // deep ink (brand.dark)
                    1000: '#000000',
                },
                // Semantic status
                status: {
                    success: '#00C033',
                    warning: '#d97706',
                    danger:  '#dc2626',
                    info:    '#0369a1',
                },

                // ─── Layer 2: Semantic tokens (use these in components) ─────
                brand:       { DEFAULT: '#00C033', hover: '#009A29', subtle: '#E6FBEC', ring: 'rgba(0,192,51,0.35)', accent: '#5FDD82' },
                surface:     { DEFAULT: '#ffffff', muted: '#f9fafb', subtle: '#f1f5f9', inverse: '#050a06', elevated: '#ffffff' },
                ink:         { DEFAULT: '#0f172a', secondary: '#475569', muted: '#64748b', subtle: '#94a3b8', inverse: '#ffffff' },
                line:        { DEFAULT: '#e2e8f0', subtle: '#f1f5f9', strong: '#cbd5e1', inverse: '#1e293b' },
            },

            fontFamily: {
                sans: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
            },

            fontSize: {
                '2xs':   ['0.6875rem', { lineHeight: '1rem',      letterSpacing: '0.04em' }],
                'xs':    ['0.75rem',   { lineHeight: '1.125rem',  letterSpacing: '0.01em' }],
                'sm':    ['0.875rem',  { lineHeight: '1.375rem' }],
                'base':  ['1rem',      { lineHeight: '1.625rem' }],
                'lg':    ['1.125rem',  { lineHeight: '1.75rem' }],
                'xl':    ['1.25rem',   { lineHeight: '1.875rem' }],
                '2xl':   ['1.5rem',    { lineHeight: '2rem',      letterSpacing: '-0.01em' }],
                '3xl':   ['1.875rem',  { lineHeight: '2.375rem',  letterSpacing: '-0.015em' }],
                '4xl':   ['2.25rem',   { lineHeight: '2.625rem',  letterSpacing: '-0.02em' }],
                '5xl':   ['3rem',      { lineHeight: '3.25rem',   letterSpacing: '-0.025em' }],
                '6xl':   ['3.75rem',   { lineHeight: '4rem',      letterSpacing: '-0.03em' }],
                '7xl':   ['4.5rem',    { lineHeight: '4.75rem',   letterSpacing: '-0.035em' }],
            },

            borderRadius: {
                'none':    '0',
                'xs':      '0.25rem',
                'sm':      '0.375rem',
                'md':      '0.5rem',
                'lg':      '0.75rem',
                'xl':      '1rem',
                '2xl':     '1.25rem',
                '3xl':     '1.5rem',
                'card':    '1rem',
                'card-sm': '0.75rem',
                'pill':    '9999px',
            },

            spacing: {
                'section':    '7rem',
                'section-sm': '5rem',
                'section-xs': '3rem',
            },

            maxWidth: {
                'prose-narrow': '42rem',
                'prose':        '65ch',
                'content':      '1100px',
                'layout':       '1200px',
                'wide':         '1400px',
            },

            boxShadow: {
                'xs':       '0 1px 2px rgba(15, 23, 42, 0.04)',
                'sm':       '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
                'md':       '0 4px 12px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.04)',
                'lg':       '0 12px 28px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)',
                'xl':       '0 24px 48px rgba(15, 23, 42, 0.10), 0 8px 16px rgba(15, 23, 42, 0.05)',
                '2xl':      '0 32px 64px rgba(15, 23, 42, 0.14)',
                'ring':     '0 0 0 4px rgba(0, 192, 51, 0.15)',
                'ring-sm':  '0 0 0 2px rgba(8, 115, 49, 0.25)',
                'inner-sm': 'inset 0 1px 2px rgba(15, 23, 42, 0.05)',
            },

            transitionDuration: {
                'fast':   '120ms',
                'base':   '200ms',
                'slow':   '320ms',
                'slower': '500ms',
            },

            transitionTimingFunction: {
                'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'enter':    'cubic-bezier(0, 0, 0.2, 1)',
                'exit':     'cubic-bezier(0.4, 0, 1, 1)',
                'emphasis': 'cubic-bezier(0.21, 0.47, 0.32, 0.98)',
            },

            zIndex: {
                'base':     '0',
                'raised':   '10',
                'dropdown': '30',
                'sticky':   '40',
                'overlay':  '50',
                'modal':    '60',
                'toast':    '70',
                'tooltip':  '80',
            },

            screens: {
                'xs':  '480px',
            },

            backgroundImage: {
                'grid-light': 'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
                'grid-dark':  'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                'brand-radial': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(8,115,49,0.15), transparent)',
            },
        },
    },
    plugins: [typography],
};

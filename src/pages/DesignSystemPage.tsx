import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

// ─── data ─────────────────────────────────────────────────────────────────

const brandTokens = [
  { token: 'brand', hex: '#00C033', className: 'bg-brand' },
  { token: 'brand-hover', hex: '#009A29', className: 'bg-brand-hover' },
  { token: 'brand-subtle', hex: '#e8f5ed', className: 'bg-brand-subtle' },
  { token: 'brand-accent', hex: '#5FDD82', className: 'bg-brand-accent' },
];

const surfaceTokens = [
  { token: 'surface', hex: '#ffffff', className: 'bg-surface border border-line' },
  { token: 'surface-muted', hex: '#f9fafb', className: 'bg-surface-muted' },
  { token: 'surface-subtle', hex: '#f1f5f9', className: 'bg-surface-subtle' },
  { token: 'surface-inverse', hex: '#050a06', className: 'bg-surface-inverse' },
];

const coreBrandColors = [
  { token: 'brand', hex: '#00C033', className: 'bg-brand', note: 'Primary — CTAs, links, accent' },
  { token: 'brand-hover', hex: '#009A29', className: 'bg-brand-hover', note: 'Hover state, deeper tone' },
  { token: 'surface-inverse', hex: '#050A06', className: 'bg-surface-inverse', note: 'Dark sections, footer, inverse surfaces' },
  { token: 'surface-muted', hex: '#F9FAFB', className: 'bg-surface-muted border border-line', note: 'Soft section background' },
];

const inkTokens = [
  { token: 'ink', hex: '#0f172a', className: 'bg-ink' },
  { token: 'ink-secondary', hex: '#475569', className: 'bg-ink-secondary' },
  { token: 'ink-muted', hex: '#64748b', className: 'bg-ink-muted' },
  { token: 'ink-subtle', hex: '#94a3b8', className: 'bg-ink-subtle' },
];

const lineTokens = [
  { token: 'line', hex: '#e2e8f0', className: 'bg-line' },
  { token: 'line-subtle', hex: '#f1f5f9', className: 'bg-line-subtle' },
  { token: 'line-strong', hex: '#cbd5e1', className: 'bg-line-strong' },
  { token: 'line-inverse', hex: '#1e293b', className: 'bg-line-inverse' },
];

const statusTokens = [
  { token: 'status-success', hex: '#00C033', className: 'bg-status-success' },
  { token: 'status-warning', hex: '#d97706', className: 'bg-status-warning' },
  { token: 'status-danger', hex: '#dc2626', className: 'bg-status-danger' },
  { token: 'status-info', hex: '#0369a1', className: 'bg-status-info' },
];

const greenScale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const neutralScale = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];

const typeScale = [
  { label: 'Display', className: 'heading-display', sample: 'Fintech Engineering' },
  { label: 'Heading 1', className: 'heading-1', sample: 'Institutional Trading Infrastructure' },
  { label: 'Heading 2', className: 'heading-2', sample: 'Built for Reliability & Scale' },
  { label: 'Heading 3', className: 'heading-3', sample: 'Core Products' },
  { label: 'Heading 4', className: 'heading-4', sample: 'Section heading' },
  { label: 'Body Large', className: 'body-lg', sample: 'Lead paragraph text used for hero and section intros. Comfortable reading.' },
  { label: 'Body', className: 'body', sample: 'Default body text for prose and descriptions throughout the site.' },
  { label: 'Body Small', className: 'body-sm', sample: 'Smaller supporting text used inside cards and tight layouts.' },
  { label: 'Caption', className: 'caption', sample: 'Used for timestamps, metadata, and fine print.' },
  { label: 'Eyebrow', className: 'eyebrow text-brand', sample: 'Section Label' },
];

const shadowScale = ['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'];
const radiusScale = ['rounded-xs', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-pill'];

// ─── subcomponents ────────────────────────────────────────────────────────

function Swatch({ token, hex, className, text = 'text-white' }: { token: string; hex: string; className: string; text?: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-line">
      <div className={`${className} h-24 flex items-end p-3 ${text}`}>
        <span className="text-xs font-mono tabular">{hex}</span>
      </div>
      <div className="bg-surface px-3 py-2 flex items-center justify-between">
        <code className="text-xs font-mono text-ink">{token}</code>
      </div>
    </div>
  );
}

function Section({ label, title, description, children }: { label: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="section-padding-sm border-t border-line">
      <div className="section-container">
        <div className="mb-10 max-w-2xl">
          <p className="section-label">{label}</p>
          <h2 className="heading-2 mb-3">{title}</h2>
          {description && <p className="body">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SEO
        title="Design System | Brokz"
        description="The Brokz design system — tokens, components, and patterns for our corporate fintech website."
      />

      <NavBar />

      {/* Hero */}
      <section className="relative bg-surface-inverse text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-grid-dark bg-[length:48px_48px]" />
        <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
        <div className="relative section-container py-24 md:py-32">
          <p className="section-label-light">Internal — Design System</p>
          <h1 className="heading-1 text-white mb-5">Brokz Design System</h1>
          <p className="text-gray-300 body-lg max-w-2xl">
            The single source of truth for tokens, components, and patterns. Built on a 3-layer token architecture: primitives → semantic → component.
          </p>
        </div>
      </section>

      {/* ─── Core Brand Colors (mandated) ─── */}
      <Section
        label="Core Palette"
        title="Core Brand Colors"
        description="The four mandated brand colors. Every page must use these as the primary visual foundation. Additional tokens below extend this core."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreBrandColors.map(s => (
            <div key={s.token} className="rounded-lg overflow-hidden border border-line">
              <div className={`${s.className} h-32 flex items-end p-4 ${s.hex.toLowerCase() === '#f9fafb' ? 'text-ink' : 'text-white'}`}>
                <span className="text-sm font-mono tabular font-semibold">{s.hex.toUpperCase()}</span>
              </div>
              <div className="bg-surface px-4 py-3">
                <code className="text-xs font-mono text-ink font-semibold block mb-1">{s.token}</code>
                <p className="text-xs text-ink-muted">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Brand Tokens ─── */}
      <Section label="Colors" title="Brand Tokens" description="Semantic tokens — use these in components. Never reference primitives directly.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brandTokens.map(s => <Swatch key={s.token} {...s} />)}
        </div>
      </Section>

      <Section label="Colors" title="Surface Tokens" description="Background surfaces for pages and containers.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {surfaceTokens.map(s => (
            <Swatch key={s.token} {...s} text={s.token === 'surface' || s.token === 'surface-muted' || s.token === 'surface-subtle' ? 'text-ink' : 'text-white'} />
          ))}
        </div>
      </Section>

      <Section label="Colors" title="Ink (Text) Tokens" description="Text color hierarchy, from highest to lowest emphasis.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {inkTokens.map(s => <Swatch key={s.token} {...s} />)}
        </div>
      </Section>

      <Section label="Colors" title="Line (Border) Tokens" description="Dividers, borders, and separators.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {lineTokens.map(s => (
            <Swatch key={s.token} {...s} text={s.token === 'line' || s.token === 'line-subtle' || s.token === 'line-strong' ? 'text-ink' : 'text-white'} />
          ))}
        </div>
      </Section>

      <Section label="Colors" title="Status Tokens" description="Semantic status colors for notices, alerts, and feedback.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusTokens.map(s => <Swatch key={s.token} {...s} />)}
        </div>
      </Section>

      <Section label="Primitives" title="Green Scale (Layer 1)" description="Primitives — do not use directly in components.">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {greenScale.map(n => (
            <div key={n} className="rounded-md overflow-hidden border border-line">
              <div className={`h-16 bg-green-${n}`} />
              <div className="px-2 py-1.5 bg-surface">
                <code className="text-2xs font-mono text-ink-muted">{n}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Primitives" title="Neutral Scale (Layer 1)">
        <div className="grid grid-cols-5 md:grid-cols-[repeat(13,minmax(0,1fr))] gap-2">
          {neutralScale.map(n => (
            <div key={n} className="rounded-md overflow-hidden border border-line">
              <div className={`h-16 bg-neutral-${n}`} />
              <div className="px-2 py-1.5 bg-surface">
                <code className="text-2xs font-mono text-ink-muted">{n}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Typography ─── */}
      <Section label="Typography" title="Type Scale" description="Geist (sans) for UI & prose, Geist Mono for data & numerics.">
        <div className="flex flex-col divide-y divide-line">
          {typeScale.map(t => (
            <div key={t.label} className="py-5 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 items-baseline">
              <code className="text-xs font-mono text-ink-muted">{t.label}</code>
              <div className={t.className}>{t.sample}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 card-muted">
          <p className="eyebrow text-ink-muted mb-3">Tabular / Mono example</p>
          <p className="font-mono tabular text-2xl text-ink">99.99% &nbsp;·&nbsp; &lt;1ms &nbsp;·&nbsp; $12,450.00</p>
        </div>
      </Section>

      {/* ─── Buttons ─── */}
      <Section label="Components" title="Buttons" description="Four variants. Primary for main CTAs, secondary for alternate paths, ghost for dark surfaces, link for inline navigation.">
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <button className="btn-primary">Primary Action</button>
          <button className="btn-secondary">Secondary</button>
          <a href="#" className="btn-link">Link action →</a>
        </div>
        <div className="bg-surface-inverse rounded-card p-8 flex flex-wrap gap-4 items-center">
          <button className="btn-primary">Primary on Dark</button>
          <button className="btn-ghost">Ghost</button>
          <a href="#" className="btn-link-light">Link light →</a>
        </div>
      </Section>

      {/* ─── Cards ─── */}
      <Section label="Components" title="Cards">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <p className="eyebrow text-brand mb-2">.card</p>
            <h3 className="heading-4 mb-2">Default Card</h3>
            <p className="body-sm">White surface with subtle border.</p>
          </div>
          <div className="card-muted">
            <p className="eyebrow text-brand mb-2">.card-muted</p>
            <h3 className="heading-4 mb-2">Muted Card</h3>
            <p className="body-sm">Soft background variant.</p>
          </div>
          <div className="card-feature">
            <p className="eyebrow text-brand mb-2">.card-feature</p>
            <h3 className="heading-4 mb-2">Feature</h3>
            <p className="body-sm">Compact card for grids.</p>
          </div>
          <div className="card-dark">
            <p className="eyebrow text-brand-accent mb-2">.card-dark</p>
            <h3 className="heading-4 text-white mb-2">Dark Card</h3>
            <p className="body-sm text-gray-400">For inverse surfaces.</p>
          </div>
        </div>
      </Section>

      {/* ─── Badges ─── */}
      <Section label="Components" title="Badges & Tags">
        <div className="flex flex-wrap gap-3">
          <span className="badge-brand">Brand</span>
          <span className="badge-neutral">Neutral</span>
          <span className="badge-success">Operational</span>
          <span className="badge-warning">Degraded</span>
          <span className="badge-info">Informational</span>
        </div>
      </Section>

      {/* ─── Inputs ─── */}
      <Section label="Components" title="Form Inputs">
        <div className="max-w-md grid gap-5">
          <div>
            <label className="input-label">Company</label>
            <input className="input" placeholder="Acme Brokerage" />
          </div>
          <div>
            <label className="input-label">Business Email</label>
            <input className="input" placeholder="you@company.com" type="email" />
          </div>
          <div>
            <label className="input-label">Project Scope</label>
            <textarea className="input" rows={4} placeholder="Tell us about the project…" />
          </div>
        </div>
      </Section>

      {/* ─── Radius ─── */}
      <Section label="Foundations" title="Radius Scale">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {radiusScale.map(r => (
            <div key={r} className="text-center">
              <div className={`${r} bg-brand-subtle border border-brand/20 h-20 mb-2`} />
              <code className="text-xs font-mono text-ink-muted">{r}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Shadows ─── */}
      <Section label="Foundations" title="Elevation">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 bg-surface-muted p-8 rounded-card">
          {shadowScale.map(s => (
            <div key={s} className="text-center">
              <div className={`${s} bg-surface rounded-lg h-24 mb-3 flex items-center justify-center`}>
                <code className="text-xs font-mono text-ink-muted">{s.replace('shadow-', '')}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Spacing ─── */}
      <Section label="Foundations" title="Spacing Tokens">
        <div className="space-y-3">
          {[
            { token: 'section-xs', value: '3rem / 48px' },
            { token: 'section-sm', value: '5rem / 80px' },
            { token: 'section', value: '7rem / 112px' },
          ].map(s => (
            <div key={s.token} className="flex items-center gap-4">
              <code className="w-40 text-xs font-mono text-ink-muted">{s.token}</code>
              <div className="h-6 bg-brand rounded-sm" style={{ width: s.value.split('/')[0].trim() }} />
              <span className="text-xs text-ink-muted font-mono tabular">{s.value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Principles ─── */}
      <Section label="Principles" title="How to Use This System">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: '01', title: 'Semantic over primitive', body: 'Use bg-brand, text-ink, border-line — not bg-green-500 or text-neutral-900. Tokens describe intent, not value.' },
            { n: '02', title: 'Recipes over utility soup', body: 'Prefer .btn-primary, .card, .input over re-building combinations. Consistency is the point.' },
            { n: '03', title: 'Composition over configuration', body: 'Build new patterns by composing recipes. Add to the system only when a pattern repeats 3+ times.' },
          ].map(p => (
            <div key={p.n} className="card">
              <div className="w-8 h-8 rounded-md bg-brand-subtle flex items-center justify-center mb-4 text-brand font-mono text-xs font-bold">{p.n}</div>
              <h3 className="heading-4 mb-2">{p.title}</h3>
              <p className="body-sm">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
}

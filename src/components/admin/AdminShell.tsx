/**
 * AdminShell — sidebar + top bar chrome for every admin page.
 *
 * Wraps children in `<AuthGuard requireRole="admin">` so pages don't need
 * to repeat that themselves. Provides a `<Toaster />` once.
 *
 * Layout:
 *   [ sidebar (fixed, 15rem) | topbar + main ]
 *   Below lg, sidebar collapses to icon-only (4rem).
 *   Below md, sidebar becomes off-canvas drawer opened from the top bar.
 *
 * Typography hierarchy:
 *   sidebar nav items: 0.875rem, medium weight
 *   brand wordmark:    1.125rem, semibold, tracking-tight
 *   topbar title:      1.5rem, semibold, tracking-tight
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AuthGuard from '../auth/AuthGuard';
import { useAuth } from '../auth/AuthContext';
import { Toaster } from '../ui/Toast';
import { cn } from '../../lib/cn';
import { resolveAdminLocale, setAdminLocale, type AdminLocale } from '../../lib/admin/locale';
import { hasPaymentSubmissions } from '../../lib/admin/schemaProbe';
import AdminUserMenu from './AdminUserMenu';
import '../../i18n';

type Locale = 'en' | 'tr';

export interface AdminShellProps {
    locale?: Locale;
    /** Which nav item to mark active. Pass null or omit to highlight nothing. */
    activeKey?: AdminNavKey | null;
    /** Page title shown in the topbar. */
    title: string;
    /** Optional subtitle under title. */
    subtitle?: string;
    /** Optional primary action rendered top-right of the topbar. */
    action?: ReactNode;
    /** Breadcrumb fragments (current page excluded). */
    breadcrumbs?: Array<{ label: string; href?: string }>;
    children: ReactNode;
}

export type AdminNavKey =
    | 'overview'
    | 'customers'
    | 'products'
    | 'orders'
    | 'licenses'
    | 'billing'
    | 'tickets'
    | 'leads'
    | 'blog'
    | 'audit';

type NavItem = { key: AdminNavKey; href: string };
type NavSection = { titleKey: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
    {
        titleKey: 'general',
        items: [{ key: 'overview', href: '/admin' }],
    },
    {
        titleKey: 'operations',
        items: [
            { key: 'customers', href: '/admin/customers' },
            { key: 'orders', href: '/admin/orders' },
            { key: 'licenses', href: '/admin/licenses' },
        ],
    },
    {
        titleKey: 'billing',
        items: [{ key: 'billing', href: '/admin/billing' }],
    },
    {
        titleKey: 'support',
        items: [
            { key: 'tickets', href: '/admin/tickets' },
            { key: 'leads', href: '/admin/leads' },
        ],
    },
    {
        titleKey: 'content',
        items: [
            { key: 'products', href: '/admin/products' },
            { key: 'blog', href: '/admin/blog' },
        ],
    },
    {
        titleKey: 'system',
        items: [{ key: 'audit', href: '/admin/audit' }],
    },
];

export default function AdminShell(props: AdminShellProps) {
    return (
        <AuthGuard requireRole="admin">
            <AdminShellInner {...props} />
            <Toaster />
        </AuthGuard>
    );
}

function AdminShellInner({
    locale = 'tr',
    activeKey = null,
    title,
    subtitle,
    action,
    breadcrumbs,
    children,
}: AdminShellProps) {
    const { t, i18n } = useTranslation('admin');
    const { user, profile, signOut, supabase } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [effectiveLocale, setEffectiveLocale] = useState<AdminLocale>(locale);
    const [pendingPayments, setPendingPayments] = useState<number>(0);
    const [openTickets, setOpenTickets] = useState<number>(0);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            // Probe for payment_submissions table once — if the migration
            // hasn't landed, skip the query entirely (no 404 noise).
            const tableExists = await hasPaymentSubmissions(supabase);
            const [payCount, tktRes] = await Promise.all([
                tableExists
                    ? supabase
                          .from('payment_submissions')
                          .select('*', { count: 'exact', head: true })
                          .eq('status', 'pending_review')
                          .then((r) => r.count ?? 0)
                    : Promise.resolve(0),
                supabase
                    .from('tickets')
                    .select('*', { count: 'exact', head: true })
                    .neq('status', 'closed')
                    .is('deleted_at', null),
            ]);
            if (cancelled) return;
            setPendingPayments(payCount);
            setOpenTickets(tktRes.count ?? 0);
        }
        void load();
        const handle = window.setInterval(() => { void load(); }, 30_000);
        return () => { cancelled = true; window.clearInterval(handle); };
    }, [supabase]);

    const badgeFor = (key: AdminNavKey): number => {
        if (key === 'billing') return pendingPayments;
        if (key === 'tickets') return openTickets;
        return 0;
    };

    useEffect(() => {
        const resolved = resolveAdminLocale(locale);
        setEffectiveLocale(resolved);
        if (i18n.language !== resolved) void i18n.changeLanguage(resolved);
        document.documentElement.setAttribute('lang', resolved);
    }, [locale, i18n]);

    return (
        <div className="min-h-screen bg-surface-muted text-ink">
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 z-overlay bg-neutral-950/40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                aria-label={t('shell.primarySidebar')}
                className={cn(
                    'fixed inset-y-0 left-0 z-dropdown bg-white border-r border-line flex flex-col',
                    'transition-transform md:transition-none',
                    'w-60 md:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                )}
            >
                <div className="h-16 flex items-center px-5 border-b border-line">
                    <a href="/admin" className="flex items-center gap-2 group">
                        <span className="inline-block h-2 w-2 rounded-sm bg-brand" aria-hidden="true" />
                        <span className="text-base font-semibold tracking-tight text-ink group-hover:text-brand transition-colors">
                            {t('common.brokz')}
                        </span>
                        <span className="text-2xs font-medium uppercase tracking-wider text-ink-muted">
                            {t('common.admin')}
                        </span>
                    </a>
                </div>
                <nav className="flex-1 overflow-y-auto py-2">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.titleKey}>
                            <p className="text-2xs uppercase tracking-wider text-ink-muted px-3 pt-3 pb-1 select-none">
                                {t(`navSection.${section.titleKey}`)}
                            </p>
                            <ul className="space-y-0.5 px-2">
                                {section.items.map((item) => {
                                    const badge = badgeFor(item.key);
                                    return (
                                        <li key={item.key}>
                                            <a
                                                href={item.href}
                                                aria-current={activeKey === item.key ? 'page' : undefined}
                                                className={cn(
                                                    'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                                    activeKey === item.key
                                                        ? 'bg-brand-subtle text-green-700'
                                                        : 'text-ink-secondary hover:bg-surface-muted hover:text-ink',
                                                )}
                                            >
                                                <span>{t(`nav.${item.key}`)}</span>
                                                {badge > 0 && (
                                                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-brand text-white text-2xs font-bold tabular-nums">
                                                        {badge}
                                                    </span>
                                                )}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main column */}
            <div className="md:pl-60 min-h-screen flex flex-col">
                {/* Compact topbar — breadcrumbs + locale toggle. Page title lives in hero. */}
                <header className="h-14 bg-white border-b border-line flex items-center gap-4 px-4 md:px-8">
                    <button
                        type="button"
                        className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md border border-line hover:border-ink/30"
                        onClick={() => setMobileOpen(true)}
                        aria-label={t('shell.openSidebar')}
                    >
                        <span aria-hidden="true">≡</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <nav className="text-xs text-ink-muted truncate" aria-label="Breadcrumb">
                                {breadcrumbs.map((b, i) => (
                                    <span key={i}>
                                        {b.href ? (
                                            <a href={b.href} className="hover:text-ink">{b.label}</a>
                                        ) : (
                                            <span>{b.label}</span>
                                        )}
                                        <span className="mx-1.5 text-ink-subtle">/</span>
                                    </span>
                                ))}
                                <span className="text-ink-secondary">{title}</span>
                            </nav>
                        )}
                    </div>
                    <div
                        role="group"
                        aria-label="Language"
                        className="inline-flex items-center rounded-md border border-line overflow-hidden"
                    >
                        {(['tr', 'en'] as const).map((loc) => {
                            const active = effectiveLocale === loc;
                            return (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => loc !== effectiveLocale && setAdminLocale(loc)}
                                    aria-pressed={active}
                                    className={cn(
                                        'px-2.5 py-1 text-2xs font-mono uppercase tracking-wider transition-colors',
                                        active
                                            ? 'bg-ink text-white'
                                            : 'bg-white text-ink-muted hover:text-ink',
                                    )}
                                >
                                    {loc}
                                </button>
                            );
                        })}
                    </div>
                    <AdminUserMenu user={user} profile={profile} signOut={signOut} />
                </header>

                <main className="flex-1 px-4 md:px-8 py-8 md:py-12 max-w-wide w-full mx-auto">
                    {/* Page hero — exaggerated-minimalism: one giant title, muted subtitle. */}
                    {(title || subtitle || action) && (
                        <header className="mb-8 md:mb-10 flex flex-wrap items-end justify-between gap-4">
                            <div className="min-w-0">
                                {title && (
                                    <h1 className="text-[2.25rem] md:text-[2.5rem] leading-[1.05] font-bold tracking-[-0.03em] text-ink truncate">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="mt-2 text-sm text-ink-muted max-w-2xl">{subtitle}</p>
                                )}
                            </div>
                            {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
                        </header>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}

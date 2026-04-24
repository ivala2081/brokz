/**
 * DashboardShell — sidebar + top bar chrome for every /dashboard/* page.
 *
 * Wraps children in `<AuthGuard requireRole="customer">`. Provides a
 * `<Toaster />` once.
 *
 * Reuses the SAME locale util (`resolveAdminLocale` / `setAdminLocale`) as
 * AdminShell so switching language in admin and customer stays in sync via
 * a single localStorage key.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AuthGuard from '../auth/AuthGuard';
import { useAuth } from '../auth/AuthContext';
import { Toaster } from '../ui/Toast';
import { cn } from '../../lib/cn';
import { resolveAdminLocale, setAdminLocale, type AdminLocale } from '../../lib/admin/locale';
import '../../i18n';

type Locale = 'en' | 'tr';

export interface DashboardShellProps {
    locale?: Locale;
    /** Which nav item to mark active. */
    activeKey: DashboardNavKey;
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

export type DashboardNavKey =
    | 'overview'
    | 'orders'
    | 'invoices'
    | 'licenses'
    | 'tickets'
    | 'account';

const NAV: Array<{ key: DashboardNavKey; href: string }> = [
    { key: 'overview', href: '/dashboard' },
    { key: 'orders', href: '/dashboard/orders' },
    { key: 'invoices', href: '/dashboard/invoices' },
    { key: 'licenses', href: '/dashboard/licenses' },
    { key: 'tickets', href: '/dashboard/tickets' },
    { key: 'account', href: '/dashboard/account' },
];

export default function DashboardShell(props: DashboardShellProps) {
    return (
        <AuthGuard requireRole="customer">
            <DashboardShellInner {...props} />
            <Toaster />
        </AuthGuard>
    );
}

function DashboardShellInner({
    locale = 'tr',
    activeKey,
    title,
    subtitle,
    action,
    breadcrumbs,
    children,
}: DashboardShellProps) {
    const { t, i18n } = useTranslation('dashboard');
    const { user, profile, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [effectiveLocale, setEffectiveLocale] = useState<AdminLocale>(locale);

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
                    <a href="/dashboard" className="flex items-center gap-2 group">
                        <span className="inline-block h-2 w-2 rounded-sm bg-brand" aria-hidden="true" />
                        <span className="text-base font-semibold tracking-tight text-ink group-hover:text-brand transition-colors">
                            {t('common.brokz')}
                        </span>
                        <span className="text-2xs font-medium uppercase tracking-wider text-ink-muted">
                            {t('common.portal')}
                        </span>
                    </a>
                </div>
                <nav className="flex-1 overflow-y-auto py-3">
                    <ul className="space-y-0.5 px-2">
                        {NAV.map((item) => (
                            <li key={item.key}>
                                <a
                                    href={item.href}
                                    aria-current={activeKey === item.key ? 'page' : undefined}
                                    className={cn(
                                        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        activeKey === item.key
                                            ? 'bg-brand-subtle text-green-700'
                                            : 'text-ink-secondary hover:bg-surface-muted hover:text-ink',
                                    )}
                                >
                                    {t(`nav.${item.key}`)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="border-t border-line p-3">
                    <div className="rounded-md px-3 py-2 flex flex-col gap-1">
                        <span className="text-xs font-medium text-ink truncate" title={profile.email ?? user.email ?? ''}>
                            {profile.email ?? user.email}
                        </span>
                        <span className="text-2xs uppercase tracking-wider text-ink-muted">
                            {t('shell.roleCustomer')}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => void signOut()}
                        className="mt-2 w-full text-left rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-surface-muted hover:text-ink transition-colors"
                    >
                        {t('common.logout')}
                    </button>
                </div>
            </aside>

            {/* Main column */}
            <div className="md:pl-60 min-h-screen flex flex-col">
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
                </header>

                <main className="flex-1 px-4 md:px-8 py-8 md:py-12 max-w-wide w-full mx-auto">
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

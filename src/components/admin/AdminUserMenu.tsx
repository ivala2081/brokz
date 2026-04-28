/**
 * AdminUserMenu — header right-hand user avatar + dropdown.
 *
 * Shows the first letter of the admin's email as an avatar trigger.
 * Dropdown exposes: "Hesabım" → /admin/account, "Çıkış" → signOut().
 *
 * Closes on click-outside and Escape.
 * Keyboard: Tab moves focus into the menu; Escape closes.
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn';

interface AdminUserMenuProps {
    user: { email?: string | null } | null;
    profile: { email?: string | null; full_name?: string | null } | null;
    signOut: () => void | Promise<void>;
}

export default function AdminUserMenu({ user, profile, signOut }: AdminUserMenuProps) {
    const { t } = useTranslation('admin');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const email = profile?.email ?? user?.email ?? '';
    const initial = email.charAt(0).toUpperCase() || 'A';

    // Close on click-outside
    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t('shell.accountMenu')}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors',
                    'border border-line hover:border-ink/30',
                    open ? 'bg-surface-muted' : 'bg-white',
                )}
            >
                {/* Avatar circle */}
                <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand text-white text-2xs font-bold select-none"
                >
                    {initial}
                </span>
                {/* Chevron */}
                <svg
                    aria-hidden="true"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className={cn('text-ink-muted transition-transform', open && 'rotate-180')}
                >
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div
                    role="menu"
                    aria-label={t('shell.accountMenu')}
                    className={cn(
                        'absolute right-0 top-full mt-1.5 z-dropdown',
                        'w-44 rounded-md border border-line bg-white shadow-sm',
                        'py-1',
                    )}
                >
                    {/* Email label — read-only, not a menu item */}
                    <p className="px-3 py-1.5 text-2xs text-ink-muted truncate border-b border-line mb-1" title={email}>
                        {email}
                    </p>

                    <a
                        href="/admin/account"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="flex items-center px-3 py-2 text-sm text-ink-secondary hover:bg-surface-muted hover:text-ink transition-colors"
                    >
                        {t('userMenu.account')}
                    </a>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setOpen(false); void signOut(); }}
                        className="w-full text-left flex items-center px-3 py-2 text-sm text-ink-secondary hover:bg-surface-muted hover:text-ink transition-colors"
                    >
                        {t('userMenu.signOut')}
                    </button>
                </div>
            )}
        </div>
    );
}

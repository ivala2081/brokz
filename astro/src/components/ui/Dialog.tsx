/**
 * Dialog — accessible modal with backdrop, ESC-close, and focus trap.
 *
 * Not a portal — renders in place. Visibility controlled by `open`.
 * Parent owns open state.
 *
 * Focus trap implementation is minimal: focuses first focusable on open,
 * wraps tab/shift-tab around focusable elements inside the panel.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    /** Max width token: sm | md | lg | xl */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** If true, backdrop click does NOT close. Use for destructive confirm. */
    locked?: boolean;
}

const SIZE = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
};

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Dialog({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    locked = false,
}: DialogProps) {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);

    // Lock scroll + capture previously-focused element.
    useEffect(() => {
        if (!open) return;
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const t = requestAnimationFrame(() => {
            const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
            (first ?? panelRef.current)?.focus();
        });
        return () => {
            cancelAnimationFrame(t);
            document.body.style.overflow = prevOverflow;
            previouslyFocusedRef.current?.focus?.();
        };
    }, [open]);

    // ESC + focus trap.
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && !locked) {
                e.stopPropagation();
                onClose();
                return;
            }
            if (e.key !== 'Tab') return;
            const panel = panelRef.current;
            if (!panel) return;
            const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, locked, onClose]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="brokz-dialog-title"
            className="fixed inset-0 z-modal flex items-end justify-center sm:items-center"
        >
            <div
                aria-hidden="true"
                onClick={() => !locked && onClose()}
                className="absolute inset-0 bg-neutral-950/40"
            />
            <div
                ref={panelRef}
                tabIndex={-1}
                className={cn(
                    'relative z-10 w-full sm:rounded-lg bg-white shadow-xl border-t border-line sm:border sm:mx-4',
                    'focus:outline-none',
                    SIZE[size],
                )}
            >
                <header className="px-6 pt-5 pb-3 border-b border-line">
                    <h2
                        id="brokz-dialog-title"
                        className="text-base font-semibold text-ink tracking-tight"
                    >
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 text-xs text-ink-muted">{description}</p>
                    )}
                </header>
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
                {footer && (
                    <footer className="px-6 py-4 border-t border-line bg-surface-muted/50 flex justify-end gap-2 sm:rounded-b-lg">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
}

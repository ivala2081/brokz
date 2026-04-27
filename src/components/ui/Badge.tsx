/**
 * Badge — small status pill.
 *
 * Variants map to the finite statuses we display in admin tables.
 * Anything that's a "real" status should use the `StatusBadge` wrapper
 * (admin/StatusBadge.tsx) which maps our enum values to these variants.
 */

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeVariant =
    | 'brand'
    | 'neutral'
    | 'amber'
    | 'danger'
    | 'info'
    | 'outline';

export interface BadgeProps {
    variant?: BadgeVariant;
    children: ReactNode;
    className?: string;
}

const VARIANT: Record<BadgeVariant, string> = {
    brand: 'bg-brand-subtle text-green-700 border-green-200',
    neutral: 'bg-surface-muted text-ink-secondary border-line',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-status-danger border-red-200',
    info: 'bg-sky-50 text-status-info border-sky-200',
    outline: 'bg-white text-ink-secondary border-line',
};

export default function Badge({ variant = 'neutral', children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-2xs font-medium uppercase tracking-wider',
                VARIANT[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}

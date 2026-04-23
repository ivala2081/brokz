/**
 * StatCard — KPI tile used on the Overview page.
 *
 * Strict typographic hierarchy: tiny uppercase label, large value, no icon.
 */

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface StatCardProps {
    label: ReactNode;
    value: ReactNode;
    hint?: ReactNode;
    loading?: boolean;
    className?: string;
}

export default function StatCard({ label, value, hint, loading, className }: StatCardProps) {
    return (
        <div
            className={cn(
                'rounded-lg border border-line bg-white p-5 flex flex-col gap-2',
                className,
            )}
        >
            <span className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">
                {label}
            </span>
            <span className="text-3xl font-semibold tracking-tight text-ink">
                {loading ? (
                    <span className="inline-block h-7 w-24 rounded-sm bg-surface-subtle animate-pulse" />
                ) : (
                    value
                )}
            </span>
            {hint && <span className="text-xs text-ink-muted">{hint}</span>}
        </div>
    );
}

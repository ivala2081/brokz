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
                'rounded-lg border border-line bg-white p-6 flex flex-col gap-3',
                className,
            )}
        >
            <span className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {label}
            </span>
            <span className="text-[2rem] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
                {loading ? (
                    <span className="inline-block h-8 w-28 rounded-sm bg-surface-subtle animate-pulse" />
                ) : (
                    value
                )}
            </span>
            {hint && <span className="text-xs text-ink-muted">{hint}</span>}
        </div>
    );
}

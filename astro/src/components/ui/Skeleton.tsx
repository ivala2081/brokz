/**
 * Skeleton — neutral shimmer block for loading state.
 *
 * Keeps the admin UI calm while data loads. Uses brand-muted background
 * tones from the Tailwind config (no hardcoded hex).
 */

import { cn } from '../../lib/cn';

export interface SkeletonProps {
    className?: string;
    /** Variant: line (text row), block (rectangle), circle */
    as?: 'line' | 'block' | 'circle';
}

export default function Skeleton({ className, as = 'block' }: SkeletonProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-block bg-surface-subtle animate-pulse',
                as === 'line' && 'h-4 w-full rounded-sm',
                as === 'block' && 'h-24 w-full rounded-md',
                as === 'circle' && 'h-10 w-10 rounded-full',
                className,
            )}
        />
    );
}

export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="w-full">
            <div className="grid border-b border-line pb-3 mb-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton as="line" key={i} className="h-3 w-20" />
                ))}
            </div>
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
                        {Array.from({ length: cols }).map((_, c) => (
                            <Skeleton as="line" key={c} className="h-4" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * EmptyState — designed empty surface with headline + supportive copy + CTA.
 * Exaggerated-minimalism: lots of whitespace, no illustration.
 */

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'w-full rounded-lg border border-dashed border-line bg-white px-6 py-16 text-center',
                className,
            )}
        >
            <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
            {description && (
                <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{description}</p>
            )}
            {action && <div className="mt-6 inline-flex">{action}</div>}
        </div>
    );
}

/**
 * Label — consistent field label + required marker + optional hint + error.
 */

import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    children: ReactNode;
    required?: boolean;
    hint?: string;
    error?: string;
}

export default function Label({
    children,
    required,
    hint,
    error,
    className,
    ...rest
}: LabelProps) {
    return (
        <label className={cn('block space-y-1.5', className)} {...rest}>
            <span className="flex items-center justify-between text-xs font-medium text-ink">
                <span>
                    {children}
                    {required && <span className="ml-0.5 text-status-danger">*</span>}
                </span>
                {hint && <span className="font-normal text-ink-muted">{hint}</span>}
            </span>
            {/*
              The slot for the actual control is rendered by the parent.
              This Label is a wrapper when used with children; see inputs
              that expect to be nested directly.
            */}
            {error && (
                <span className="block text-xs text-status-danger" role="alert">
                    {error}
                </span>
            )}
        </label>
    );
}

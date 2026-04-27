/**
 * Field — consistent wrapper for label + control + error.
 *
 * Prefer this over ad-hoc <Label>+<Input> pairs in forms.
 */

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface FieldProps {
    label: ReactNode;
    htmlFor?: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: ReactNode;
    className?: string;
}

export default function Field({
    label,
    htmlFor,
    required,
    hint,
    error,
    children,
    className,
}: FieldProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <div className="flex items-center justify-between">
                <label htmlFor={htmlFor} className="text-xs font-medium text-ink">
                    {label}
                    {required && <span className="ml-0.5 text-status-danger">*</span>}
                </label>
                {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
            </div>
            {children}
            {error && (
                <p className="text-xs text-status-danger" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

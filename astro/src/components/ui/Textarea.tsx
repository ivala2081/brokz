/**
 * Textarea — multi-line input with Brokz focus ring.
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    invalid?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { invalid, className, rows = 4, ...rest },
    ref,
) {
    return (
        <textarea
            ref={ref}
            rows={rows}
            aria-invalid={invalid || undefined}
            className={cn(
                'w-full rounded-md border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted',
                'transition-colors focus:outline-none focus:ring-2 resize-y',
                invalid
                    ? 'border-status-danger/50 focus:border-status-danger focus:ring-status-danger/20'
                    : 'border-line focus:border-brand focus:ring-brand/20',
                'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted',
                className,
            )}
            {...rest}
        />
    );
});

export default Textarea;

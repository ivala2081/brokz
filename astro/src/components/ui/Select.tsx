/**
 * Select — native <select> styled to match Input + Textarea.
 *
 * Keep native for accessibility/mobile keyboard; custom listbox can come
 * later if needed for things like multi-select.
 */

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    invalid?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { invalid, className, children, ...rest },
    ref,
) {
    return (
        <select
            ref={ref}
            aria-invalid={invalid || undefined}
            className={cn(
                'w-full rounded-md border bg-white px-3 py-2 text-sm text-ink',
                'transition-colors focus:outline-none focus:ring-2',
                invalid
                    ? 'border-status-danger/50 focus:border-status-danger focus:ring-status-danger/20'
                    : 'border-line focus:border-brand focus:ring-brand/20',
                'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted',
                className,
            )}
            {...rest}
        >
            {children}
        </select>
    );
});

export default Select;

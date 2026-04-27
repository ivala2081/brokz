/**
 * Input — text input with Brokz focus ring. Wraps a native <input>.
 * Error state flips border + ring to danger.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    invalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { invalid, className, ...rest },
    ref,
) {
    return (
        <input
            ref={ref}
            aria-invalid={invalid || undefined}
            className={cn(
                'w-full rounded-md border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted',
                'transition-colors focus:outline-none focus:ring-2',
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

export default Input;

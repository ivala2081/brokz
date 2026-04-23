/**
 * Button — Brokz primary action primitive.
 *
 * Variants:
 *   primary   — brand green, white text, used for one CTA per context
 *   secondary — neutral surface, subtle border
 *   ghost     — transparent, hover background only
 *   danger    — destructive intent (revoke, delete)
 *
 * Sizes: sm / md / lg. Loading state replaces the label while keeping width.
 *
 * No hardcoded hex values — every color routes through Tailwind tokens
 * defined in astro/tailwind.config.mjs (brand, brand-hover, ink, line).
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}

const VARIANT: Record<ButtonVariant, string> = {
    primary:
        'bg-brand text-white border border-brand hover:bg-brand-hover hover:border-brand-hover focus-visible:ring-brand/30',
    secondary:
        'bg-white text-ink border border-line hover:border-ink/30 focus-visible:ring-brand/30',
    ghost:
        'bg-transparent text-ink border border-transparent hover:bg-surface-muted focus-visible:ring-brand/30',
    danger:
        'bg-white text-status-danger border border-status-danger/30 hover:bg-status-danger hover:text-white focus-visible:ring-status-danger/30',
};

const SIZE: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-5 text-sm gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        variant = 'primary',
        size = 'md',
        loading = false,
        disabled,
        leftIcon,
        rightIcon,
        fullWidth,
        className,
        children,
        type = 'button',
        ...rest
    },
    ref,
) {
    const isDisabled = disabled || loading;
    return (
        <button
            ref={ref}
            type={type}
            disabled={isDisabled}
            aria-busy={loading || undefined}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium tracking-tight transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                'disabled:cursor-not-allowed disabled:opacity-50',
                fullWidth && 'w-full',
                VARIANT[variant],
                SIZE[size],
                className,
            )}
            {...rest}
        >
            {loading ? (
                <Spinner />
            ) : (
                <>
                    {leftIcon ? <span className="inline-flex" aria-hidden="true">{leftIcon}</span> : null}
                    <span>{children}</span>
                    {rightIcon ? <span className="inline-flex" aria-hidden="true">{rightIcon}</span> : null}
                </>
            )}
        </button>
    );
});

function Spinner() {
    return (
        <span
            aria-hidden="true"
            className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
    );
}

export default Button;

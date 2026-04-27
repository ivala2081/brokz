/**
 * Toast — thin wrapper around `sonner` with Brokz styling defaults.
 *
 * Mount the <Toaster /> exactly once in the admin shell. Call
 * `toast.success()`, `toast.error()`, `toast()` from any island.
 */

import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
    return (
        <SonnerToaster
            position="bottom-right"
            expand={false}
            richColors={false}
            closeButton
            toastOptions={{
                classNames: {
                    toast:
                        'rounded-md border border-line bg-white text-ink shadow-md text-sm',
                    title: 'font-medium',
                    description: 'text-ink-muted text-xs',
                    success: 'border-brand/30',
                    error: 'border-status-danger/30',
                },
            }}
        />
    );
}

export { toast };

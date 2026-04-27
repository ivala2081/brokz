/**
 * LogoutHandler — client-side sign-out.
 *
 * Signs the user out via the browser Supabase client (which clears the
 * session from localStorage / cookies) and redirects to `/`. No UI
 * beyond a neutral message while the request is in flight.
 *
 * This replaces the previous server-side `logout.astro` which relied on
 * `Astro.locals.supabase` — impossible on a static build with no Node
 * runtime.
 */

import { useEffect } from 'react';
import { createBrowserSupabase } from '../../lib/supabase/browser';

export default function LogoutHandler() {
    useEffect(() => {
        const supabase = createBrowserSupabase();
        void supabase.auth
            .signOut()
            .catch(() => {
                /* Swallow — we redirect regardless so the user isn't stuck. */
            })
            .finally(() => {
                window.location.assign('/');
            });
    }, []);

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily:
                    'Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '0.875rem',
                color: 'rgba(5, 10, 6, 0.6)',
            }}
        >
            Signing you out…
        </div>
    );
}

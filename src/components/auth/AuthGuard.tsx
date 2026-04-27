/**
 * AuthGuard — client-side route protection for the Brokz app surface.
 *
 * WHY CLIENT-SIDE:
 * Brokz ships as a static Astro build to shared hosting — there is no
 * Node runtime in production, so server-side route guards (Astro
 * middleware) cannot run. Real security is enforced by Postgres RLS on
 * Supabase; this component is a UX layer that keeps unauthenticated
 * users out of dashboard screens and prevents customers from briefly
 * seeing admin chrome on their way to a redirect.
 *
 * BEHAVIOUR:
 *   1. Mount → fetch session from the browser Supabase client.
 *   2. If no session → `window.location.assign('/auth/login?redirect=…')`.
 *   3. If session → fetch the `profiles` row (role, organization_id).
 *   4. If `requireRole` doesn't match → bounce to the correct surface.
 *   5. On success → render `children` inside an `<AuthProvider>` so the
 *      `useAuth()` hook is available to descendants.
 *   6. Subscribes to `onAuthStateChange`; on SIGNED_OUT → redirect to `/`.
 *
 * SKELETON:
 * While resolving, renders a neutral full-screen placeholder in the
 * Brokz palette (#F9FAFB surface, #00C033 accent, SF Pro Display). We deliberately
 * avoid a spinner — exaggerated-minimalism says "calm, not busy."
 */

import { useEffect, useState, type ReactNode } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createBrowserSupabase } from '../../lib/supabase/browser';
import type { Profile } from '../../env';
import { AuthProvider, type AuthContextValue } from './AuthContext';

export type RoleRequirement = 'admin' | 'customer' | 'any';

export interface AuthGuardProps {
    /** Role the user must have. `'any'` accepts any authenticated user. */
    requireRole?: RoleRequirement;
    /**
     * Path to send unauthenticated users to. The current path is appended
     * as `?redirect=` so the user lands where they wanted after login.
     */
    redirectTo?: string;
    children: ReactNode;
}

type GuardState =
    | { status: 'loading' }
    | { status: 'ready'; value: AuthContextValue }
    | { status: 'redirecting' };

/**
 * Resolves the `profiles` row for an authenticated user. Returns `null`
 * if the row is missing — treated as "not provisioned yet", which is a
 * redirect-to-login condition (the trigger should normally create it on
 * first signup, so a missing row means something is wrong).
 */
async function loadProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, role, organization_id, email')
        .eq('id', userId)
        .maybeSingle();
    if (error) return null;
    return (data as Profile | null) ?? null;
}

function currentPathWithQuery(): string {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname + window.location.search;
}

export default function AuthGuard({
    requireRole = 'any',
    redirectTo = '/auth/login',
    children,
}: AuthGuardProps) {
    const [state, setState] = useState<GuardState>({ status: 'loading' });

    useEffect(() => {
        let cancelled = false;
        const supabase = createBrowserSupabase();

        async function signOut() {
            await supabase.auth.signOut();
            window.location.assign('/');
        }

        async function resolve() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                if (cancelled) return;
                setState({ status: 'redirecting' });
                const target = `${redirectTo}?redirect=${encodeURIComponent(currentPathWithQuery())}`;
                window.location.assign(target);
                return;
            }

            const profile = await loadProfile(supabase, session.user.id);

            if (cancelled) return;

            if (!profile) {
                // Session exists but no profile row — treat as broken state.
                // Sign out and bounce to login so the user can re-enter.
                setState({ status: 'redirecting' });
                await supabase.auth.signOut();
                window.location.assign(redirectTo);
                return;
            }

            // Role enforcement.
            if (requireRole === 'admin' && profile.role !== 'admin') {
                setState({ status: 'redirecting' });
                window.location.assign('/dashboard');
                return;
            }
            if (requireRole === 'customer' && profile.role !== 'customer') {
                setState({ status: 'redirecting' });
                window.location.assign('/admin');
                return;
            }

            const value: AuthContextValue = {
                user: session.user satisfies User,
                profile,
                supabase,
                signOut,
            };
            setState({ status: 'ready', value });
        }

        void resolve();

        // React to sign-out (e.g. another tab logging out, token revocation).
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
            if (cancelled) return;
            if (event === 'SIGNED_OUT' || !session) {
                setState({ status: 'redirecting' });
                window.location.assign('/');
            }
        });

        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
    }, [requireRole, redirectTo]);

    if (state.status === 'ready') {
        return <AuthProvider value={state.value}>{children}</AuthProvider>;
    }

    // Loading or redirecting — both render the neutral skeleton. We
    // intentionally don't leak which state we're in; the user just sees
    // a calm Brokz surface until the redirect fires.
    return <AuthSkeleton />;
}

/**
 * Neutral loading surface. Brokz palette, SF Pro Display-aware (inherited
 * from the global stylesheet), no spinner. Covers the whole viewport so it
 * hides whatever the hydrated page would otherwise flash on mount.
 */
function AuthSkeleton() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                backgroundColor: '#F9FAFB',
                color: '#050A06',
                fontFamily:
                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    display: 'inline-block',
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '9999px',
                    border: '2px solid rgba(5, 10, 6, 0.08)',
                    borderTopColor: '#00C033',
                    animation: 'brokz-auth-spin 900ms linear infinite',
                }}
            />
            <span style={{ fontSize: '0.875rem', color: 'rgba(5, 10, 6, 0.55)' }}>
                Brokz
            </span>
            <style>{`@keyframes brokz-auth-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

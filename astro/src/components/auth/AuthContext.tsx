/**
 * AuthContext — shares the authenticated session with descendants of
 * `<AuthGuard>`.
 *
 * Brokz is deployed as a static site (no Node runtime), so there is no
 * server-side middleware to populate `Astro.locals`. The authoritative
 * security boundary is Postgres RLS; this context exists for UX only
 * (showing the right nav, gating client-side routes, firing off
 * authenticated queries without re-fetching the profile every time).
 *
 * Consumers MUST be wrapped in `<AuthGuard>` — calling `useAuth()`
 * outside a guard is a programmer error and throws loudly.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Profile } from '../../env';

export interface AuthContextValue {
    /** Authenticated Supabase user. Never null inside an `<AuthGuard>`. */
    user: User;
    /** Profile row (role + organization_id). Never null inside a guard. */
    profile: Profile;
    /** Shared browser Supabase client (singleton). */
    supabase: SupabaseClient;
    /** Sign the user out and redirect to `/`. */
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
    value: AuthContextValue;
    children: ReactNode;
}

export function AuthProvider({ value, children }: AuthProviderProps) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access the authenticated user + profile + Supabase client from any
 * descendant of `<AuthGuard>`. Throws if used outside a guard — this is
 * a loud, dev-time error rather than a silent null-deref.
 */
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error(
            '[useAuth] Must be used inside an <AuthGuard>. Wrap your page component with <AuthGuard requireRole="..."> before calling useAuth().',
        );
    }
    return ctx;
}

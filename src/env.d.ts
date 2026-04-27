/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/**
 * Shape of `public.profiles`. Mirrors the DB migration owned by
 * brokz-db-architect — keep in sync when the schema changes.
 *
 * Exported for use by the client-side `<AuthGuard>` / `useAuth()` hook.
 * It is NOT attached to `App.Locals` anymore: Brokz deploys as a static
 * site to shared hosting (no Node runtime), so there is no request-time
 * middleware to populate server locals. Route protection lives entirely
 * in the browser via `AuthGuard`, backed by Postgres RLS for real security.
 */
export interface Profile {
    id: string;
    role: 'admin' | 'customer';
    organization_id: string | null;
    email: string | null;
    full_name: string | null;
}

declare global {
    namespace App {
        // Intentionally empty. Do NOT reintroduce request-scoped Supabase
        // state here — Astro is configured `output: 'static'` and there is
        // no server runtime in production. Any field added here would only
        // exist during `astro dev` and silently be `undefined` in prod.
        interface Locals {}
    }
}

export {};

/**
 * Supabase browser client (React islands).
 *
 * Use inside `client:*` hydrated React components only. The anon key is
 * public by design — row-level security in Postgres is what actually
 * protects data. Never import `admin.ts` into a component that can end
 * up in the browser bundle.
 *
 * A module-level singleton avoids spawning multiple realtime sockets
 * across island remounts within the same page.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function createBrowserSupabase(): SupabaseClient {
    if (cached) return cached;

    const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

    if (!url || !anonKey) {
        throw new Error(
            '[supabase/browser] PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY missing at build time.',
        );
    }

    cached = createBrowserClient(url, anonKey);
    return cached;
}

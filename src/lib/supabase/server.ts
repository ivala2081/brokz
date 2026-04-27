/**
 * Supabase server client — DEV-ONLY helper.
 *
 * !!! PRODUCTION NOTE !!!
 * Brokz ships as a static Astro build (`output: 'static'`) to shared
 * hosting. There is NO Node runtime in production, so this file is
 * never executed in a deployed environment. It's kept purely for local
 * `astro dev` use — e.g. if you add an `.astro` frontmatter snippet that
 * reads the session during development. For all real runtime needs use:
 *   - `lib/supabase/browser.ts` in React islands (primary)
 *   - Supabase Edge Functions with `supabase/functions/_shared/supabase-admin.ts`
 *     for privileged server work.
 *
 * Cookies (when this runs under `astro dev`) are issued with:
 *   - httpOnly      — JS cannot read the session cookie
 *   - secure        — only sent over HTTPS (a no-op on localhost)
 *   - sameSite=lax  — standard for OAuth/email-link round-trips
 */

import type { AstroGlobal } from 'astro';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

function readEnv(name: 'PUBLIC_SUPABASE_URL' | 'PUBLIC_SUPABASE_ANON_KEY'): string {
    const value = import.meta.env[name] as string | undefined;
    if (!value) {
        throw new Error(
            `[supabase/server] Missing env ${name}. Copy astro/.env.example to astro/.env and fill it in.`,
        );
    }
    return value;
}

/**
 * Minimal Astro context shape — accepts either the `AstroGlobal` from a
 * `.astro` frontmatter or the `APIContext` passed to endpoints/middleware,
 * both of which expose `cookies` with the same API surface.
 */
export type AstroCookieCtx = Pick<AstroGlobal, 'cookies'> | { cookies: AstroGlobal['cookies'] };

export function createServerSupabase(ctx: AstroCookieCtx): SupabaseClient {
    const url = readEnv('PUBLIC_SUPABASE_URL');
    const anonKey = readEnv('PUBLIC_SUPABASE_ANON_KEY');

    return createServerClient(url, anonKey, {
        cookies: {
            get(name: string) {
                return ctx.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                ctx.cookies.set(name, value, {
                    ...options,
                    httpOnly: true,
                    secure: import.meta.env.PROD,
                    sameSite: 'lax',
                    path: options.path ?? '/',
                });
            },
            remove(name: string, options: CookieOptions) {
                ctx.cookies.delete(name, {
                    ...options,
                    path: options.path ?? '/',
                });
            },
        },
    });
}

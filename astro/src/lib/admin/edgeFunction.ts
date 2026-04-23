/**
 * edgeFunction.ts — typed fetch helper for calling Supabase Edge Functions
 * that enforce admin authorization on the server.
 *
 * The Edge Function URL shape is:
 *   ${PUBLIC_SUPABASE_URL}/functions/v1/<name>
 *
 * For admin-only functions we MUST send the logged-in user's access token
 * (Bearer), not the anon key — the function reads `auth.getUser()` off the
 * request and checks the profile role before performing privileged work.
 * The `apikey` header still carries the anon key because the API gateway
 * requires it to route the request.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface EdgeFunctionError {
    /** HTTP status */
    status: number;
    /** Upstream-provided error code, e.g. "invalid_input". */
    code?: string;
    /** Human-readable error. Never surfaced directly to UI — map to i18n first. */
    message: string;
}

export interface EdgeFunctionResult<T> {
    data: T | null;
    error: EdgeFunctionError | null;
}

export async function callEdgeFunction<T = unknown>(
    supabase: SupabaseClient,
    name: string,
    body: Record<string, unknown>,
): Promise<EdgeFunctionResult<T>> {
    const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

    if (!url || !anonKey) {
        return {
            data: null,
            error: {
                status: 0,
                code: 'config_missing',
                message: 'Supabase env vars not configured.',
            },
        };
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        return {
            data: null,
            error: {
                status: 401,
                code: 'not_authenticated',
                message: 'No active session.',
            },
        };
    }

    try {
        const res = await fetch(`${url}/functions/v1/${name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: anonKey,
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            let code: string | undefined;
            let message = `Request failed (${res.status}).`;
            try {
                const payload = (await res.json()) as { error?: string; message?: string; code?: string };
                code = payload.code;
                message = payload.error ?? payload.message ?? message;
            } catch {
                /* empty body */
            }
            return { data: null, error: { status: res.status, code, message } };
        }

        // Allow empty 204 responses.
        if (res.status === 204) return { data: null, error: null };
        const payload = (await res.json()) as T;
        return { data: payload, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                status: 0,
                code: 'network_error',
                message: err instanceof Error ? err.message : 'Network error',
            },
        };
    }
}

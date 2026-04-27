/**
 * Supabase admin client — service_role key, Edge Function (Deno) runtime.
 *
 * Bypasses RLS. Only use inside Supabase Edge Functions running on Deno
 * where `Deno.env.get()` has access to the service role key securely.
 *
 * A hard runtime guard throws if this module ever ends up evaluated in
 * a browser context — belt-and-braces against an accidental import.
 *
 * Edge Functions own the service-role path; the Astro static build
 * never imports this file. Keep the two concerns separate: any
 * server-side env reading on the Astro side stays in `src/lib/supabase/`,
 * while this Edge runtime always uses `Deno.env.get`.
 */

// deno-lint-ignore-file
// @ts-ignore — Deno import (resolved by the Supabase edge runtime)
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// @ts-ignore — `Deno` global exists at runtime on Supabase edge
declare const Deno: { env: { get(key: string): string | undefined } };

if (typeof (globalThis as any).window !== 'undefined') {
  throw new Error(
    '[supabase/admin] This module uses the service_role key and must never be imported into browser code.',
  );
}

let cached: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (cached) return cached;

  const url = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('PUBLIC_SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRole) {
    throw new Error(
      '[supabase/admin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.',
    );
  }

  cached = createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { 'x-brokz-origin': 'edge-function' },
    },
  });
  return cached;
}

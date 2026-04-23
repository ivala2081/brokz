/**
 * CORS helper — allowed origins come from the `ALLOWED_ORIGINS` env var
 * (comma-separated). Default in dev is http://localhost:4321 (Astro's
 * default port).
 *
 * Usage:
 *   import { corsHeaders, handlePreflight } from '../_shared/cors.ts';
 *   const pre = handlePreflight(req);
 *   if (pre) return pre;
 *   return new Response(body, { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } });
 */

// @ts-ignore — `Deno` global exists at runtime on Supabase edge
declare const Deno: { env: { get(key: string): string | undefined } };

const DEFAULT_DEV_ORIGIN = 'http://localhost:4321';

function parseAllowed(): string[] {
  const raw = Deno.env.get('ALLOWED_ORIGINS') ?? DEFAULT_DEV_ORIGIN;
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = parseAllowed();
  if (allowed.includes('*')) return true;
  return allowed.includes(origin);
}

export function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin');
  const ok = isAllowedOrigin(origin);
  return {
    'Access-Control-Allow-Origin': ok && origin ? origin : parseAllowed()[0] ?? DEFAULT_DEV_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

/** Returns a 204 preflight Response when the request is an OPTIONS request. */
export function handlePreflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null;
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

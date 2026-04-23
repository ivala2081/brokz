/**
 * Caller authentication + authorization helpers for Brokz Edge Functions.
 *
 * Deno runtime. Reads the `Authorization: Bearer <access_token>` header,
 * verifies the JWT via Supabase Auth, then loads the caller's `profiles`
 * row. Every admin Edge Function MUST call `requireAdmin(req)` before
 * doing privileged work — the UI-side role flag is advisory only.
 *
 * Errors surface as typed classes so handlers can map them to HTTP codes
 * via `errorToResponse` (or use the `jsonResponse` helper below).
 */

// deno-lint-ignore-file no-explicit-any
// @ts-ignore — Deno import (resolved at edge runtime)
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

import { createAdminClient } from './supabase-admin.ts';
import { corsHeaders } from './cors.ts';

// ─── Types ──────────────────────────────────────────────────────────

export type AuthedUser = {
  id: string;
  email: string | null;
};

export type AuthedProfile = {
  id: string;
  organization_id: string | null;
  role: 'admin' | 'customer';
  full_name: string | null;
  email: string | null;
};

export type AuthContext = {
  user: AuthedUser;
  profile: AuthedProfile;
  supabase: SupabaseClient;
};

// ─── Errors ─────────────────────────────────────────────────────────

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = 'Missing or invalid access token') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = 'Caller is not allowed to perform this action') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function extractBearer(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!auth) return null;
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return match?.[1] ?? null;
}

async function loadProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<AuthedProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, organization_id, role, full_name, email')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Profile row missing => user was authenticated but never provisioned.
    throw new ForbiddenError('Profile not found for authenticated user');
  }

  return data as AuthedProfile;
}

/**
 * Require a valid Supabase access token. Loads the profile row. Does NOT
 * check role — use this for endpoints where any authenticated user is
 * allowed (e.g. customer-facing mutations).
 */
export async function requireAuthed(req: Request): Promise<AuthContext> {
  const token = extractBearer(req);
  if (!token) {
    throw new UnauthorizedError('Authorization header missing or malformed');
  }

  const supabase = createAdminClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);

  if (userErr || !userData?.user) {
    throw new UnauthorizedError('Access token is invalid or expired');
  }

  const user: AuthedUser = {
    id: userData.user.id,
    email: userData.user.email ?? null,
  };

  const profile = await loadProfile(supabase, user.id);

  return { user, profile, supabase };
}

/**
 * Require a valid admin caller. Throws ForbiddenError if the caller is
 * authenticated but not an admin. Always returns the admin client so the
 * handler can reuse a single instance.
 */
export async function requireAdmin(req: Request): Promise<AuthContext> {
  const ctx = await requireAuthed(req);
  if (ctx.profile.role !== 'admin') {
    throw new ForbiddenError('Admin role required');
  }
  return ctx;
}

// ─── Response helper ────────────────────────────────────────────────

/**
 * Compose a JSON Response with CORS headers pulled from the request.
 * Centralised so every admin handler emits a consistent envelope.
 */
export function jsonResponse(
  req: Request,
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

/**
 * Map a thrown error to an HTTP JSON response. Unknown errors become 500
 * with a generic message — the detail is kept in structured logs, never
 * leaked to the client.
 */
export function errorToResponse(req: Request, err: unknown): Response {
  if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
    return jsonResponse(req, err.status, { ok: false, error: err.message });
  }
  return jsonResponse(req, 500, { ok: false, error: 'Internal server error' });
}

-- ============================================================================
-- Brokz — rate_limits table + increment RPC
-- ----------------------------------------------------------------------------
-- Backs the IP-based rate limiter used by the `contact-lead-capture` Edge
-- Function (and future public endpoints). Keeps one row per
-- (ip, bucket, window_start) tuple; the Edge Function counts rows whose
-- window_start is within the configured sliding window.
--
-- RLS is enabled with NO policies — only the service_role client (which
-- bypasses RLS) may read/write. This prevents any public client from
-- inspecting or manipulating rate-limit state.
-- ============================================================================

create table public.rate_limits (
  ip            text not null,
  bucket        text not null,
  count         int  not null default 1,
  window_start  timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (ip, bucket, window_start)
);

create index rate_limits_window_start_idx
  on public.rate_limits (window_start);

create index rate_limits_ip_bucket_idx
  on public.rate_limits (ip, bucket);

create trigger rate_limits_set_updated_at
before update on public.rate_limits
for each row execute function public.set_updated_at();

-- ---------- increment RPC ---------------------------------------------------
-- Atomic upsert: insert a fresh (ip, bucket, window_start) row, or increment
-- `count` if it already exists. Returns the post-increment count so the
-- caller can optionally short-circuit its own follow-up query.
create or replace function public.increment_rate_limit(
  p_ip text,
  p_bucket text,
  p_window_start timestamptz
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limits (ip, bucket, window_start, count)
  values (p_ip, p_bucket, p_window_start, 1)
  on conflict (ip, bucket, window_start)
  do update set count = public.rate_limits.count + 1,
                updated_at = now()
  returning count into v_count;

  return v_count;
end;
$$;

-- Only service_role should be able to call this RPC. Revoke from everyone
-- else explicitly so an exposed anon JWT cannot run it.
revoke all on function public.increment_rate_limit(text, text, timestamptz) from public;
revoke all on function public.increment_rate_limit(text, text, timestamptz) from anon, authenticated;
grant execute on function public.increment_rate_limit(text, text, timestamptz) to service_role;

-- ---------- Row Level Security ----------------------------------------------
alter table public.rate_limits enable row level security;

-- No policies => only service_role (bypass RLS) can read/write.

-- ============================================================================
-- rollback:
-- ----------------------------------------------------------------------------
-- drop function if exists public.increment_rate_limit(text, text, timestamptz);
-- drop table if exists public.rate_limits;
-- ============================================================================

-- ============================================================================
-- Brokz — per-year atomic invoice-number allocator
-- ----------------------------------------------------------------------------
-- Atomic next-number generator for invoice numbers in the format
-- `BRKZ-YYYY-NNNNNN`. Used by the `admin-issue-invoice` Edge Function.
--
-- Approach:
--   * A small `invoice_counters(year, last_number)` table stores the current
--     counter per calendar year.
--   * `next_invoice_number(p_year)` runs in a single statement:
--       insert on conflict do update set last_number = last_number + 1
--     and returns the formatted string. Postgres row locks during the
--     upsert guarantee atomicity — no `SELECT ... FOR UPDATE` gymnastics.
--
-- We intentionally separate counter storage from the `invoices` table so
-- a cancelled / rolled-back invoice does NOT decrement the sequence
-- (gap-free is not a regulatory requirement yet; monotonic is).
-- ============================================================================

create table public.invoice_counters (
  year         int primary key,
  last_number  int not null default 0,
  updated_at   timestamptz not null default now()
);

create trigger invoice_counters_set_updated_at
before update on public.invoice_counters
for each row execute function public.set_updated_at();

-- RLS: no policies. Only service_role (Edge Functions) ever touches it.
alter table public.invoice_counters enable row level security;

-- ---------- next_invoice_number --------------------------------------------
-- Returns the next formatted invoice number for the given year, e.g.
-- `BRKZ-2026-000001`. Zero-padded to 6 digits. Atomic via upsert.
create or replace function public.next_invoice_number(p_year int)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next int;
begin
  insert into public.invoice_counters (year, last_number)
  values (p_year, 1)
  on conflict (year)
  do update set last_number = public.invoice_counters.last_number + 1,
                updated_at  = now()
  returning last_number into v_next;

  return format('BRKZ-%s-%s', p_year::text, lpad(v_next::text, 6, '0'));
end;
$$;

revoke all on function public.next_invoice_number(int) from public;
revoke all on function public.next_invoice_number(int) from anon, authenticated;
grant execute on function public.next_invoice_number(int) to service_role;

-- ============================================================================
-- rollback:
-- ----------------------------------------------------------------------------
-- drop function if exists public.next_invoice_number(int);
-- drop table if exists public.invoice_counters;
-- ============================================================================

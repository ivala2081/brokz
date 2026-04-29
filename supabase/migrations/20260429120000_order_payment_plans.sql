-- ============================================================================
-- Brokz — per-order subscription payment plans + invoice schedule materializer
-- ----------------------------------------------------------------------------
-- Adds:
--   1. orders:  payment_wallet_id, plan_kind, term_months, monthly_amount
--               (period_start already exists from 20260423130000)
--   2. RPC:     public.materialize_order_schedule(p_order_id uuid)
--   3. RPC:     public.issue_open_ended_next_invoice(p_order_id uuid)
--   4. pg_cron: recurring-invoice-issuer-daily (02:00 UTC)
--
-- RLS: no new policies — new columns inherit existing org-scoped policies on
-- orders and invoices.  Both RPCs are security definer + admin-only guard.
-- ============================================================================

-- ============================================================================
-- 1. ORDERS — new columns
-- ============================================================================

-- Pinned wallet: nullable, back-compat with existing rows.
alter table public.orders
  add column if not exists payment_wallet_id uuid
    references public.payment_wallets(id) on delete restrict;

-- Plan kind: two variants; default keeps existing rows as fixed_term.
alter table public.orders
  add column if not exists plan_kind text
    not null default 'fixed_term'
    check (plan_kind in ('fixed_term', 'open_ended'));

-- Contract length in months; only meaningful for fixed_term.
-- Constraint: if plan_kind = 'fixed_term', term_months must be 1–60.
-- Partial enforcement via CHECK; the RPC validates at runtime as well.
alter table public.orders
  add column if not exists term_months integer
    check (
      (plan_kind <> 'fixed_term')
      or (term_months between 1 and 60)
    );

-- Explicit per-month invoice amount; nullable for back-compat.
alter table public.orders
  add column if not exists monthly_amount numeric(12,2);

-- period_start date already added by 20260423130000_billing_subscription_types.sql
-- (add column if not exists is idempotent but we deliberately skip to avoid
--  a no-op ALTER that could confuse migration tools on strict mode)

-- Indexes on new FK + filter columns
create index if not exists orders_payment_wallet_id_idx
  on public.orders (payment_wallet_id)
  where payment_wallet_id is not null;

create index if not exists orders_plan_kind_idx
  on public.orders (plan_kind);

-- ============================================================================
-- 2. RPC: public.materialize_order_schedule
-- ============================================================================
-- Materialises the full monthly invoice schedule for a fixed_term order.
-- Idempotent: raises if any subscription invoice already exists for the order.
-- Runs as service_role (security definer); checks caller is admin.
-- next_invoice_number() is grant-restricted to service_role — safe here.

create or replace function public.materialize_order_schedule(
  p_order_id uuid
)
returns setof public.invoices
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_role   text;
  v_order         record;
  v_existing      int;
  v_i             int;
  v_period_start  date;
  v_period_end    date;
  v_due_at        date;
  v_inv_number    text;
  v_new_inv_id    uuid;
begin
  -- ---- permission check -----------------------------------------------------
  v_caller_role := public.user_role();
  if v_caller_role is distinct from 'admin' then
    raise exception 'permission denied: admin only'
      using errcode = '42501';
  end if;

  -- ---- lock the order row ---------------------------------------------------
  select
    o.id,
    o.organization_id,
    o.plan_kind,
    o.term_months,
    o.monthly_amount,
    o.period_start,
    o.currency
  into v_order
  from public.orders o
  where o.id = p_order_id
    and o.deleted_at is null
  for update;

  if not found then
    raise exception 'order not found: %', p_order_id
      using errcode = 'P0002';
  end if;

  -- ---- pre-condition checks -------------------------------------------------
  if v_order.plan_kind <> 'fixed_term' then
    raise exception 'order % plan_kind is %, expected fixed_term',
      p_order_id, v_order.plan_kind
      using errcode = '22023';
  end if;

  if v_order.monthly_amount is null then
    raise exception 'order % has no monthly_amount; set it before scheduling',
      p_order_id
      using errcode = '22023';
  end if;

  if v_order.period_start is null then
    raise exception 'order % has no period_start; set it before scheduling',
      p_order_id
      using errcode = '22023';
  end if;

  -- ---- idempotency guard ---------------------------------------------------
  select count(*)
  into v_existing
  from public.invoices
  where order_id = p_order_id
    and invoice_type = 'subscription'
    and deleted_at is null;

  if v_existing > 0 then
    raise exception 'schedule already materialised for order % (% subscription invoice(s) found)',
      p_order_id, v_existing
      using errcode = '23505';
  end if;

  -- ---- loop: one invoice per month -----------------------------------------
  for v_i in 0 .. (v_order.term_months - 1) loop

    v_period_start := (v_order.period_start + (v_i || ' months')::interval)::date;
    v_period_end   := (v_period_start + interval '1 month' - interval '1 day')::date;
    v_due_at       := (v_period_start + interval '7 days')::date;

    v_inv_number := public.next_invoice_number(
      extract(year from v_period_start)::int
    );

    insert into public.invoices (
      order_id,
      organization_id,
      invoice_number,
      amount,
      currency,
      status,
      issued_at,
      due_at,
      invoice_type,
      period_start,
      period_end
    ) values (
      v_order.id,
      v_order.organization_id,
      v_inv_number,
      v_order.monthly_amount,
      v_order.currency,
      'draft',
      now(),
      v_due_at,
      'subscription',
      v_period_start,
      v_period_end
    )
    returning id into v_new_inv_id;

    insert into public.audit_log (
      actor,
      action,
      entity_type,
      entity_id,
      diff
    ) values (
      auth.uid(),
      'invoice.auto_issued',
      'invoice',
      v_new_inv_id,
      jsonb_build_object(
        'order_id',  p_order_id,
        'index',     v_i,
        'period_start', v_period_start,
        'period_end',   v_period_end
      )
    );

  end loop;

  -- ---- return the full schedule --------------------------------------------
  return query
    select *
    from public.invoices
    where order_id = p_order_id
      and invoice_type = 'subscription'
      and deleted_at is null
    order by period_start;

end;
$$;

revoke all on function public.materialize_order_schedule(uuid) from public, anon;
grant execute on function public.materialize_order_schedule(uuid) to authenticated;

-- ============================================================================
-- 3. RPC: public.issue_open_ended_next_invoice
-- ============================================================================
-- Issues the next single subscription invoice for an open_ended order and
-- advances orders.next_invoice_at by one month.

create or replace function public.issue_open_ended_next_invoice(
  p_order_id uuid
)
returns public.invoices
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_caller_role   text;
  v_order         record;
  v_period_start  date;
  v_period_end    date;
  v_due_at        date;
  v_inv_number    text;
  v_new_inv_id    uuid;
  v_result        public.invoices;
begin
  -- ---- permission check -----------------------------------------------------
  v_caller_role := public.user_role();
  if v_caller_role is distinct from 'admin' then
    raise exception 'permission denied: admin only'
      using errcode = '42501';
  end if;

  -- ---- lock the order row ---------------------------------------------------
  select
    o.id,
    o.organization_id,
    o.plan_kind,
    o.status,
    o.monthly_amount,
    o.period_start,
    o.next_invoice_at,
    o.currency
  into v_order
  from public.orders o
  where o.id = p_order_id
    and o.deleted_at is null
  for update;

  if not found then
    raise exception 'order not found: %', p_order_id
      using errcode = 'P0002';
  end if;

  -- ---- pre-condition checks -------------------------------------------------
  if v_order.plan_kind <> 'open_ended' then
    raise exception 'order % plan_kind is %, expected open_ended',
      p_order_id, v_order.plan_kind
      using errcode = '22023';
  end if;

  if v_order.status <> 'active' then
    raise exception 'order % status is %, must be active to issue invoice',
      p_order_id, v_order.status
      using errcode = '22023';
  end if;

  if v_order.monthly_amount is null then
    raise exception 'order % has no monthly_amount; set it before issuing',
      p_order_id
      using errcode = '22023';
  end if;

  -- ---- compute period ------------------------------------------------------
  v_period_start := coalesce(
    v_order.next_invoice_at,
    v_order.period_start,
    current_date
  );
  v_period_end   := (v_period_start + interval '1 month' - interval '1 day')::date;
  v_due_at       := (v_period_start + interval '7 days')::date;

  v_inv_number := public.next_invoice_number(
    extract(year from v_period_start)::int
  );

  -- ---- insert the invoice --------------------------------------------------
  insert into public.invoices (
    order_id,
    organization_id,
    invoice_number,
    amount,
    currency,
    status,
    issued_at,
    due_at,
    invoice_type,
    period_start,
    period_end
  ) values (
    v_order.id,
    v_order.organization_id,
    v_inv_number,
    v_order.monthly_amount,
    v_order.currency,
    'draft',
    now(),
    v_due_at,
    'subscription',
    v_period_start,
    v_period_end
  )
  returning id into v_new_inv_id;

  -- ---- advance next_invoice_at on the order --------------------------------
  update public.orders
     set next_invoice_at = v_period_start + interval '1 month'
   where id = p_order_id;

  -- ---- audit ---------------------------------------------------------------
  insert into public.audit_log (
    actor,
    action,
    entity_type,
    entity_id,
    diff
  ) values (
    auth.uid(),
    'invoice.auto_issued',
    'invoice',
    v_new_inv_id,
    jsonb_build_object(
      'order_id',     p_order_id,
      'period_start', v_period_start,
      'period_end',   v_period_end,
      'plan_kind',    'open_ended'
    )
  );

  -- ---- return the new invoice row -----------------------------------------
  select * into v_result
  from public.invoices
  where id = v_new_inv_id;

  return v_result;

end;
$$;

revoke all on function public.issue_open_ended_next_invoice(uuid) from public, anon;
grant execute on function public.issue_open_ended_next_invoice(uuid) to authenticated;

-- ============================================================================
-- 4. Cron worker function + pg_cron schedule
-- ============================================================================
-- cron.schedule's command must be a single SQL statement, so we wrap the
-- per-order loop in a dedicated security-definer function and have the cron
-- job simply call it. This sidesteps the nested-dollar-quote parser issue.

create or replace function public.run_recurring_invoice_issuer()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_count    int := 0;
begin
  for v_order_id in
    select o.id
    from public.orders o
    where o.plan_kind   = 'open_ended'
      and o.status      = 'active'
      and o.deleted_at  is null
      and coalesce(o.next_invoice_at, o.period_start, current_date) <= current_date
  loop
    begin
      perform public.issue_open_ended_next_invoice(v_order_id);
      v_count := v_count + 1;
    exception when others then
      -- swallow per-order failures so one bad order doesn't abort the sweep
      raise warning 'issue_open_ended_next_invoice failed for order %: %',
        v_order_id, sqlerrm;
    end;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.run_recurring_invoice_issuer() from public, anon, authenticated;

do $$
begin
  if exists (
    select 1 from pg_extension where extname = 'pg_cron'
  ) then
    -- unschedule any existing job with this name (idempotent)
    perform cron.unschedule('recurring-invoice-issuer-daily');

    perform cron.schedule(
      'recurring-invoice-issuer-daily',
      '0 2 * * *',
      'select public.run_recurring_invoice_issuer();'
    );
  end if;
end;
$$;

-- ============================================================================
-- rollback:
-- ----------------------------------------------------------------------------
-- -- Remove cron job (only if pg_cron present)
-- do $$ begin if exists (select 1 from pg_extension where extname='pg_cron')
-- then perform cron.unschedule('recurring-invoice-issuer-daily'); end if; end $$;
--
-- drop function if exists public.issue_open_ended_next_invoice(uuid);
-- drop function if exists public.materialize_order_schedule(uuid);
--
-- alter table public.orders drop column if exists monthly_amount;
-- alter table public.orders drop column if exists term_months;
-- alter table public.orders drop column if exists plan_kind;
-- alter table public.orders drop column if exists payment_wallet_id;
--
-- drop index if exists public.orders_plan_kind_idx;
-- drop index if exists public.orders_payment_wallet_id_idx;
-- ============================================================================

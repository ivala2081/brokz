-- ============================================================================
-- Brokz — Subscription billing extensions
-- ----------------------------------------------------------------------------
-- Adds recurring billing support on top of the existing one-shot model.
--
-- products gain:
--   billing_type      — 'onetime' | 'monthly' | 'annual_upfront' | 'annual_installments'
--   setup_fee         — one-time fee charged once at order creation
--
-- orders become contracts:
--   billing_type      — snapshot of product.billing_type at order time
--   period_start      — current billing-cycle start
--   next_invoice_at   — next date the admin should issue an invoice
--   cancelled_at      — when subscription was cancelled (nullable)
--
-- invoices gain:
--   invoice_type      — 'setup' | 'subscription' | 'onetime' | 'addon'
--   period_start      — for 'subscription' type only
--   period_end        — for 'subscription' type only
--
-- No automation yet. All invoice issuance remains a manual admin action.
-- ============================================================================

-- ---------- Products -------------------------------------------------------
create type billing_type as enum (
  'onetime',
  'monthly',
  'annual_upfront',
  'annual_installments'
);

alter table public.products
  add column if not exists billing_type billing_type not null default 'onetime',
  add column if not exists setup_fee    numeric(12,2) not null default 0;

create index if not exists products_billing_type_idx
  on public.products (billing_type);

-- ---------- Orders ---------------------------------------------------------
alter table public.orders
  add column if not exists billing_type    billing_type,
  add column if not exists period_start    date,
  add column if not exists next_invoice_at date,
  add column if not exists cancelled_at    timestamptz;

-- Backfill: existing orders stay 'onetime'
update public.orders
   set billing_type = 'onetime'
 where billing_type is null;

alter table public.orders
  alter column billing_type set not null,
  alter column billing_type set default 'onetime';

create index if not exists orders_next_invoice_at_idx
  on public.orders (next_invoice_at)
  where next_invoice_at is not null and cancelled_at is null;

create index if not exists orders_cancelled_at_idx
  on public.orders (cancelled_at);

-- ---------- Invoices -------------------------------------------------------
create type invoice_type as enum ('setup', 'subscription', 'onetime', 'addon');

alter table public.invoices
  add column if not exists invoice_type invoice_type not null default 'onetime',
  add column if not exists period_start date,
  add column if not exists period_end   date;

create index if not exists invoices_invoice_type_idx
  on public.invoices (invoice_type);

-- ---------- Helpful view: customer's "active subscription" view ------------
-- Surfaces: next invoice date, last paid invoice, grace-period state.
-- Used by customer Overview and admin Orders list.
create or replace view public.order_billing_status as
select
  o.id as order_id,
  o.organization_id,
  o.product_id,
  o.billing_type,
  o.status as order_status,
  o.cancelled_at,
  o.period_start,
  o.next_invoice_at,
  (select max(i.paid_at) from public.invoices i
     where i.order_id = o.id and i.status = 'paid' and i.deleted_at is null) as last_paid_at,
  (select count(*) from public.invoices i
     where i.order_id = o.id and i.status in ('sent','overdue') and i.deleted_at is null) as open_invoice_count,
  exists (
    select 1 from public.invoices i
    where i.order_id = o.id
      and i.deleted_at is null
      and i.status in ('sent','overdue')
      and i.due_at is not null
      and i.due_at + interval '3 days' < now()
  ) as beyond_due_tolerance
from public.orders o
where o.deleted_at is null;

-- rollback:
-- alter table public.products drop column if exists billing_type;
-- alter table public.products drop column if exists setup_fee;
-- alter table public.orders drop column if exists billing_type;
-- alter table public.orders drop column if exists period_start;
-- alter table public.orders drop column if exists next_invoice_at;
-- alter table public.orders drop column if exists cancelled_at;
-- alter table public.invoices drop column if exists invoice_type;
-- alter table public.invoices drop column if exists period_start;
-- alter table public.invoices drop column if exists period_end;
-- drop type if exists billing_type;
-- drop type if exists invoice_type;
-- drop view if exists public.order_billing_status;

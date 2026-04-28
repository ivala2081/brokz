-- ============================================================
-- Migration: leads_inquiry_type
-- Purpose:   Add inquiry_type discriminator + product_id/quantity
--            for order-request leads coming from the new 2-step
--            contact page flow.
-- ============================================================

-- Categorize leads coming from the public contact page
do $$ begin
  create type public.lead_inquiry_type as enum (
    'general',
    'support',
    'webtrader_manager',
    'order_request',
    'info_pricing'
  );
exception when duplicate_object then null;
end $$;

alter table public.leads
  add column if not exists inquiry_type public.lead_inquiry_type not null default 'general';

-- For order_request leads, capture which product was requested
alter table public.leads
  add column if not exists product_id uuid references public.products(id) on delete set null;

alter table public.leads
  add column if not exists quantity int check (quantity is null or quantity > 0);

create index if not exists leads_inquiry_type_idx on public.leads (inquiry_type);

-- ============================================================
-- rollback:
--   drop index if exists public.leads_inquiry_type_idx;
--   alter table public.leads drop column if exists quantity;
--   alter table public.leads drop column if exists product_id;
--   alter table public.leads drop column if exists inquiry_type;
--   drop type if exists public.lead_inquiry_type;
-- ============================================================

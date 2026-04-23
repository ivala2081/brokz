-- ============================================================================
-- Brokz Foundation Migration
-- ----------------------------------------------------------------------------
-- Phase 0 greenfield schema: organizations, profiles, products, orders,
-- licenses, invoices, tickets, ticket_messages, leads, blog_posts, audit_log.
--
-- Conventions:
--   * snake_case names, uuid primary keys via gen_random_uuid().
--   * created_at / updated_at on every table with trigger to bump updated_at.
--   * Soft delete (deleted_at) on orders, licenses, invoices, tickets only.
--   * RLS enabled on every table with explicit policies.
--   * Enums used instead of text for status-like columns.
--   * Helper functions in `auth` schema: public.user_role(), public.user_org().
-- ============================================================================

-- ---------- Extensions ------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------- Enums -----------------------------------------------------------
create type user_role       as enum ('admin', 'customer');
create type org_status      as enum ('active', 'suspended');
create type order_status    as enum ('pending', 'active', 'cancelled', 'expired');
create type license_status  as enum ('active', 'expired', 'revoked');
create type invoice_status  as enum ('draft', 'sent', 'paid', 'overdue');
create type ticket_status   as enum ('open', 'pending', 'closed');
create type ticket_priority as enum ('low', 'med', 'high');
create type lead_status     as enum ('new', 'qualified', 'rejected');
create type post_status     as enum ('draft', 'published');

-- ---------- Generic updated_at trigger function -----------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Auth helpers (used by RLS policies) -----------------------------
-- Live in public schema (Supabase hosted projects disallow DDL in `auth`).
-- Security definer so they can read public.profiles bypassing RLS, but they
-- ONLY return data about the currently authenticated user — never arbitrary.
create or replace function public.user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

create or replace function public.user_org()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

grant execute on function public.user_role() to authenticated, anon;
grant execute on function public.user_org()  to authenticated, anon;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ---------- organizations ---------------------------------------------------
create table public.organizations (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  country        text,
  website        text,
  contact_email  text,
  status         org_status not null default 'active',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index organizations_status_idx on public.organizations (status);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

-- ---------- profiles (1:1 with auth.users) ----------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  role            user_role not null default 'customer',
  full_name       text,
  email           text,
  avatar_url      text,
  phone           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index profiles_organization_id_idx on public.profiles (organization_id);
create index profiles_role_idx             on public.profiles (role);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------- products --------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text,
  category     text,
  base_price   numeric(12,2) not null default 0,
  currency     text not null default 'USD',
  is_active    boolean not null default true,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_slug_idx      on public.products (slug);
create index products_is_active_idx on public.products (is_active);
create index products_category_idx  on public.products (category);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ---------- orders ----------------------------------------------------------
create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete restrict,
  product_id       uuid not null references public.products(id)      on delete restrict,
  status           order_status not null default 'pending',
  quantity         integer not null default 1 check (quantity > 0),
  unit_price       numeric(12,2) not null,
  total            numeric(12,2) not null,
  currency         text not null default 'USD',
  notes            text,
  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create index orders_organization_id_idx on public.orders (organization_id);
create index orders_product_id_idx      on public.orders (product_id);
create index orders_status_idx          on public.orders (status);
create index orders_created_by_idx      on public.orders (created_by);
create index orders_deleted_at_idx      on public.orders (deleted_at);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- ---------- licenses --------------------------------------------------------
create table public.licenses (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete restrict,
  license_key  text unique not null,
  issued_at    timestamptz not null default now(),
  expires_at   timestamptz,
  status       license_status not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index licenses_order_id_idx   on public.licenses (order_id);
create index licenses_status_idx     on public.licenses (status);
create index licenses_expires_at_idx on public.licenses (expires_at);
create index licenses_deleted_at_idx on public.licenses (deleted_at);

create trigger licenses_set_updated_at
before update on public.licenses
for each row execute function public.set_updated_at();

-- ---------- invoices --------------------------------------------------------
-- invoice_number format: BRZ-YYYY-NNNNNN (e.g. BRZ-2026-000042).
-- Sequence generation is handled in application / edge function, not DB.
-- TODO(phase-2): add Turkey e-fatura fields (uuid, vkn, vat_rate, integrator_ref).
create table public.invoices (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete restrict,
  organization_id  uuid not null references public.organizations(id) on delete restrict,
  invoice_number   text unique not null,
  amount           numeric(12,2) not null,
  currency         text not null default 'USD',
  status           invoice_status not null default 'draft',
  issued_at        timestamptz,
  due_at           timestamptz,
  paid_at          timestamptz,
  pdf_url          text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create index invoices_order_id_idx        on public.invoices (order_id);
create index invoices_organization_id_idx on public.invoices (organization_id);
create index invoices_status_idx          on public.invoices (status);
create index invoices_invoice_number_idx  on public.invoices (invoice_number);
create index invoices_due_at_idx          on public.invoices (due_at);
create index invoices_deleted_at_idx      on public.invoices (deleted_at);

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

-- ---------- tickets ---------------------------------------------------------
create table public.tickets (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete restrict,
  opened_by        uuid references public.profiles(id) on delete set null,
  assigned_to      uuid references public.profiles(id) on delete set null,
  subject          text not null,
  status           ticket_status not null default 'open',
  priority         ticket_priority not null default 'med',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create index tickets_organization_id_idx on public.tickets (organization_id);
create index tickets_opened_by_idx       on public.tickets (opened_by);
create index tickets_assigned_to_idx     on public.tickets (assigned_to);
create index tickets_status_idx          on public.tickets (status);
create index tickets_priority_idx        on public.tickets (priority);
create index tickets_deleted_at_idx      on public.tickets (deleted_at);

create trigger tickets_set_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

-- ---------- ticket_messages -------------------------------------------------
create table public.ticket_messages (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references public.tickets(id) on delete cascade,
  author       uuid references public.profiles(id) on delete set null,
  body         text not null,
  attachments  jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index ticket_messages_ticket_id_idx on public.ticket_messages (ticket_id);
create index ticket_messages_author_idx    on public.ticket_messages (author);

create trigger ticket_messages_set_updated_at
before update on public.ticket_messages
for each row execute function public.set_updated_at();

-- ---------- leads -----------------------------------------------------------
create table public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  company     text,
  message     text,
  source      text,
  status      lead_status not null default 'new',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index leads_status_idx on public.leads (status);
create index leads_email_idx  on public.leads (email);
create index leads_source_idx on public.leads (source);

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- ---------- blog_posts ------------------------------------------------------
create table public.blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  body_mdx      text,
  cover_image   text,
  author        uuid references public.profiles(id) on delete set null,
  status        post_status not null default 'draft',
  published_at  timestamptz,
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index blog_posts_slug_idx         on public.blog_posts (slug);
create index blog_posts_status_idx       on public.blog_posts (status);
create index blog_posts_published_at_idx on public.blog_posts (published_at);
create index blog_posts_author_idx       on public.blog_posts (author);
create index blog_posts_tags_idx         on public.blog_posts using gin (tags);

create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

-- ---------- audit_log -------------------------------------------------------
create table public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor        uuid references public.profiles(id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  diff         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index audit_log_actor_idx       on public.audit_log (actor);
create index audit_log_entity_idx      on public.audit_log (entity_type, entity_id);
create index audit_log_created_at_idx  on public.audit_log (created_at desc);

create trigger audit_log_set_updated_at
before update on public.audit_log
for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Patterns used below:
--   * Admin-only tables          -> leads, audit_log; products writes
--   * Org-scoped tables          -> orders, licenses, invoices, tickets,
--                                   ticket_messages; customers see own org only
--   * Public read                -> products (is_active), blog_posts (published)
--   * Profiles                   -> self-read + admin-read; admin-only writes
-- ============================================================================

alter table public.organizations   enable row level security;
alter table public.profiles        enable row level security;
alter table public.products        enable row level security;
alter table public.orders          enable row level security;
alter table public.licenses        enable row level security;
alter table public.invoices        enable row level security;
alter table public.tickets         enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.leads           enable row level security;
alter table public.blog_posts      enable row level security;
alter table public.audit_log       enable row level security;

-- ---------- organizations ---------------------------------------------------
create policy "organizations_admin_all"
  on public.organizations for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

create policy "organizations_customer_select_own"
  on public.organizations for select to authenticated
  using (id = public.user_org());

-- ---------- profiles --------------------------------------------------------
create policy "profiles_self_select"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_self_update"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_admin_all"
  on public.profiles for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- ---------- products --------------------------------------------------------
create policy "products_public_read_active"
  on public.products for select to anon, authenticated
  using (is_active = true);

create policy "products_admin_all"
  on public.products for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- ---------- orders (org-scoped) ---------------------------------------------
create policy "orders_admin_all"
  on public.orders for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

create policy "orders_customer_select_own_org"
  on public.orders for select to authenticated
  using (organization_id = public.user_org() and deleted_at is null);

-- ---------- licenses (org-scoped via orders) --------------------------------
create policy "licenses_admin_all"
  on public.licenses for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

create policy "licenses_customer_select_own_org"
  on public.licenses for select to authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.orders o
      where o.id = licenses.order_id
        and o.organization_id = public.user_org()
    )
  );

-- ---------- invoices (org-scoped) -------------------------------------------
create policy "invoices_admin_all"
  on public.invoices for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

create policy "invoices_customer_select_own_org"
  on public.invoices for select to authenticated
  using (organization_id = public.user_org() and deleted_at is null);

-- ---------- tickets ---------------------------------------------------------
-- Customers: read own-org tickets, insert tickets for their own org.
-- Admins: full control.
create policy "tickets_admin_all"
  on public.tickets for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

create policy "tickets_customer_select_own_org"
  on public.tickets for select to authenticated
  using (organization_id = public.user_org() and deleted_at is null);

create policy "tickets_customer_insert_own_org"
  on public.tickets for insert to authenticated
  with check (
    public.user_role() = 'customer'
    and organization_id = public.user_org()
    and opened_by = auth.uid()
  );

-- ---------- ticket_messages -------------------------------------------------
create policy "ticket_messages_admin_all"
  on public.ticket_messages for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

create policy "ticket_messages_customer_select_own_org"
  on public.ticket_messages for select to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_messages.ticket_id
        and t.organization_id = public.user_org()
        and t.deleted_at is null
    )
  );

create policy "ticket_messages_customer_insert_own_org"
  on public.ticket_messages for insert to authenticated
  with check (
    author = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_messages.ticket_id
        and t.organization_id = public.user_org()
        and t.deleted_at is null
    )
  );

-- ---------- leads (admin-only, but anon can INSERT from public form) --------
create policy "leads_public_insert"
  on public.leads for insert to anon, authenticated
  with check (true);

create policy "leads_admin_all"
  on public.leads for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- ---------- blog_posts ------------------------------------------------------
create policy "blog_posts_public_read_published"
  on public.blog_posts for select to anon, authenticated
  using (status = 'published');

create policy "blog_posts_admin_all"
  on public.blog_posts for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- ---------- audit_log (admin-only read; inserts come from triggers/Edge) ----
create policy "audit_log_admin_select"
  on public.audit_log for select to authenticated
  using (public.user_role() = 'admin');

-- No write policy: writes happen via service_role (Edge Functions) which
-- bypasses RLS. Customers and authenticated users cannot insert directly.

-- ============================================================================
-- rollback:
-- ----------------------------------------------------------------------------
-- drop policy if exists "audit_log_admin_select" on public.audit_log;
-- drop policy if exists "blog_posts_admin_all" on public.blog_posts;
-- drop policy if exists "blog_posts_public_read_published" on public.blog_posts;
-- drop policy if exists "leads_admin_all" on public.leads;
-- drop policy if exists "leads_public_insert" on public.leads;
-- drop policy if exists "ticket_messages_customer_insert_own_org" on public.ticket_messages;
-- drop policy if exists "ticket_messages_customer_select_own_org" on public.ticket_messages;
-- drop policy if exists "ticket_messages_admin_all" on public.ticket_messages;
-- drop policy if exists "tickets_customer_insert_own_org" on public.tickets;
-- drop policy if exists "tickets_customer_select_own_org" on public.tickets;
-- drop policy if exists "tickets_admin_all" on public.tickets;
-- drop policy if exists "invoices_customer_select_own_org" on public.invoices;
-- drop policy if exists "invoices_admin_all" on public.invoices;
-- drop policy if exists "licenses_customer_select_own_org" on public.licenses;
-- drop policy if exists "licenses_admin_all" on public.licenses;
-- drop policy if exists "orders_customer_select_own_org" on public.orders;
-- drop policy if exists "orders_admin_all" on public.orders;
-- drop policy if exists "products_admin_all" on public.products;
-- drop policy if exists "products_public_read_active" on public.products;
-- drop policy if exists "profiles_admin_all" on public.profiles;
-- drop policy if exists "profiles_self_update" on public.profiles;
-- drop policy if exists "profiles_self_select" on public.profiles;
-- drop policy if exists "organizations_customer_select_own" on public.organizations;
-- drop policy if exists "organizations_admin_all" on public.organizations;
--
-- drop table if exists public.audit_log cascade;
-- drop table if exists public.blog_posts cascade;
-- drop table if exists public.leads cascade;
-- drop table if exists public.ticket_messages cascade;
-- drop table if exists public.tickets cascade;
-- drop table if exists public.invoices cascade;
-- drop table if exists public.licenses cascade;
-- drop table if exists public.orders cascade;
-- drop table if exists public.products cascade;
-- drop table if exists public.profiles cascade;
-- drop table if exists public.organizations cascade;
--
-- drop function if exists public.user_org();
-- drop function if exists public.user_role();
-- drop function if exists public.set_updated_at();
--
-- drop type if exists post_status;
-- drop type if exists lead_status;
-- drop type if exists ticket_priority;
-- drop type if exists ticket_status;
-- drop type if exists invoice_status;
-- drop type if exists license_status;
-- drop type if exists order_status;
-- drop type if exists org_status;
-- drop type if exists user_role;
-- ============================================================================

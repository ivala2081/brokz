-- ============================================================================
-- Brokz — Crypto payment infrastructure
-- ----------------------------------------------------------------------------
-- Model:
--   * `payment_wallets`    — admin-curated destination addresses per network.
--   * `payment_submissions` — customer-submitted payment proofs tied to
--                             invoices. Admin reviews and approves/rejects.
--
-- Why not Edge Functions + on-chain verification:
--   Manual review is explicit by design — admin eyes on every payment.
--   Avoids custodial gateway fees / KYC exposure. Scales fine up to ~200
--   invoices/month.
--
-- Status workflow:
--   invoice.status stays 'sent' until admin marks paid on approval.
--   UI derives "awaiting review" state from payment_submissions.
-- ============================================================================

-- ---------- payment_wallets -------------------------------------------------
create table public.payment_wallets (
  id           uuid primary key default gen_random_uuid(),
  network      text not null,
    -- 'USDT-TRC20' | 'USDT-ERC20' | 'USDT-BEP20' | 'USDC-ERC20' | ...
  address      text not null,
  label        text,
    -- admin-facing note: "Binance hot wallet", "BitGo cold", etc.
  memo         text,
    -- some chains (XLM, XRP, BNB in certain flows) require a memo/tag
  is_active    boolean not null default true,
  display_order int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (network, address)
);

create index payment_wallets_network_active_idx
  on public.payment_wallets (network, is_active, display_order);

create trigger payment_wallets_set_updated_at
before update on public.payment_wallets
for each row execute function public.set_updated_at();

alter table public.payment_wallets enable row level security;

-- Any authenticated user (anon + authed) can READ active wallets —
-- even public form would show them if we ever want a /pricing "Pay now".
create policy "payment_wallets_read_active"
  on public.payment_wallets for select to anon, authenticated
  using (is_active = true);

create policy "payment_wallets_admin_all"
  on public.payment_wallets for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- Seed initial wallets (placeholder addresses — admin rotates from UI).
insert into public.payment_wallets (network, address, label, display_order) values
  ('USDT-TRC20',   'T_PLACEHOLDER_TRC20_ADDRESS_REPLACE_ME', 'Primary TRC-20 (TR market)', 10),
  ('USDT-ERC20',   '0x_PLACEHOLDER_ERC20_ADDRESS_REPLACE_ME', 'Primary ERC-20',            20),
  ('USDT-BEP20',   '0x_PLACEHOLDER_BEP20_ADDRESS_REPLACE_ME', 'Primary BEP-20 (BSC)',      30),
  ('USDC-ERC20',   '0x_PLACEHOLDER_USDC_ERC20_ADDRESS',      'Primary USDC (ERC-20)',     40);

-- ---------- payment_submissions ---------------------------------------------
create type payment_submission_status as enum ('pending_review', 'approved', 'rejected');

create table public.payment_submissions (
  id                 uuid primary key default gen_random_uuid(),
  invoice_id         uuid not null references public.invoices(id) on delete cascade,
  organization_id    uuid not null references public.organizations(id) on delete restrict,
    -- denormalized from invoice at insert; simplifies RLS (no join)
  submitted_by       uuid references public.profiles(id) on delete set null,
  network            text not null,
  tx_hash            text not null,
  amount_paid        numeric(18,6) not null,
  currency           text not null default 'USDT',
  proof_storage_path text,
    -- Supabase Storage object path: payment-proofs/<org_id>/<submission_id>.<ext>
  note               text,
  status             payment_submission_status not null default 'pending_review',
  submitted_at       timestamptz not null default now(),
  reviewed_by        uuid references public.profiles(id) on delete set null,
  reviewed_at        timestamptz,
  rejection_reason   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index payment_submissions_invoice_id_idx   on public.payment_submissions (invoice_id);
create index payment_submissions_org_id_idx       on public.payment_submissions (organization_id);
create index payment_submissions_status_idx       on public.payment_submissions (status, submitted_at desc);
create index payment_submissions_tx_hash_idx      on public.payment_submissions (tx_hash);

create trigger payment_submissions_set_updated_at
before update on public.payment_submissions
for each row execute function public.set_updated_at();

alter table public.payment_submissions enable row level security;

-- Customer: read own-org submissions, insert for own-org invoices.
create policy "payment_submissions_customer_select_own_org"
  on public.payment_submissions for select to authenticated
  using (organization_id = public.user_org());

create policy "payment_submissions_customer_insert_own_org"
  on public.payment_submissions for insert to authenticated
  with check (
    public.user_role() = 'customer'
    and organization_id = public.user_org()
    and submitted_by = auth.uid()
    and status = 'pending_review'
    and reviewed_by is null
    and reviewed_at is null
    and rejection_reason is null
    and exists (
      select 1 from public.invoices i
      where i.id = payment_submissions.invoice_id
        and i.organization_id = public.user_org()
        and i.deleted_at is null
    )
  );

-- Admin: full control.
create policy "payment_submissions_admin_all"
  on public.payment_submissions for all to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- ---------- Storage bucket for screenshots ---------------------------------
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- Admin: full storage access
drop policy if exists "payment_proofs_admin_all" on storage.objects;
create policy "payment_proofs_admin_all"
  on storage.objects
  for all to authenticated
  using (
    bucket_id = 'payment-proofs'
    and public.user_role() = 'admin'
  )
  with check (
    bucket_id = 'payment-proofs'
    and public.user_role() = 'admin'
  );

-- Customer: upload to own-org prefix, read own-org prefix
drop policy if exists "payment_proofs_customer_rw_own_org" on storage.objects;
create policy "payment_proofs_customer_rw_own_org"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and public.user_role() = 'customer'
    and (storage.foldername(name))[1]::uuid = public.user_org()
  );

drop policy if exists "payment_proofs_customer_insert_own_org" on storage.objects;
create policy "payment_proofs_customer_insert_own_org"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and public.user_role() = 'customer'
    and (storage.foldername(name))[1]::uuid = public.user_org()
  );

-- ---------- RPC: approve_payment_submission --------------------------------
-- Admin-only. Atomically:
--   1. Sets submission.status='approved', reviewed_by, reviewed_at.
--   2. Marks the invoice as paid.
--   3. Writes an audit_log entry.
-- On any failure the whole thing rolls back.
create or replace function public.approve_payment_submission(
  p_submission_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role text := public.user_role();
  v_caller_id   uuid := auth.uid();
  v_invoice_id  uuid;
begin
  if v_caller_role <> 'admin' then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  update public.payment_submissions
     set status = 'approved',
         reviewed_by = v_caller_id,
         reviewed_at = now()
   where id = p_submission_id
     and status = 'pending_review'
  returning invoice_id into v_invoice_id;

  if v_invoice_id is null then
    raise exception 'submission not found or already reviewed' using errcode = 'P0002';
  end if;

  update public.invoices
     set status = 'paid',
         paid_at = now()
   where id = v_invoice_id
     and deleted_at is null
     and status <> 'paid';

  insert into public.audit_log (actor, action, entity_type, entity_id, diff)
  values (v_caller_id, 'approve_payment', 'payment_submissions', p_submission_id,
          jsonb_build_object('invoice_id', v_invoice_id));
end;
$$;

revoke all on function public.approve_payment_submission(uuid) from public, anon;
grant execute on function public.approve_payment_submission(uuid) to authenticated;

-- ---------- RPC: reject_payment_submission ---------------------------------
create or replace function public.reject_payment_submission(
  p_submission_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role text := public.user_role();
  v_caller_id   uuid := auth.uid();
begin
  if v_caller_role <> 'admin' then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'rejection reason required' using errcode = '22023';
  end if;

  update public.payment_submissions
     set status = 'rejected',
         reviewed_by = v_caller_id,
         reviewed_at = now(),
         rejection_reason = p_reason
   where id = p_submission_id
     and status = 'pending_review';

  if not found then
    raise exception 'submission not found or already reviewed' using errcode = 'P0002';
  end if;

  insert into public.audit_log (actor, action, entity_type, entity_id, diff)
  values (v_caller_id, 'reject_payment', 'payment_submissions', p_submission_id,
          jsonb_build_object('reason', p_reason));
end;
$$;

revoke all on function public.reject_payment_submission(uuid, text) from public, anon;
grant execute on function public.reject_payment_submission(uuid, text) to authenticated;

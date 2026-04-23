-- ============================================================================
-- Brokz — Invoice PDF storage bucket + RLS
-- ----------------------------------------------------------------------------
-- Creates a private Supabase Storage bucket `invoices` for PDF files.
-- File naming convention: <organization_id>/<invoice_id>.pdf
--
-- RLS on storage.objects:
--   * Admin (profiles.role = 'admin')   -> full access
--   * Customer                           -> select only on their own org prefix
--   * service_role                       -> bypass (used by generate-invoice-pdf
--                                           Edge Function to upload)
-- ============================================================================

-- Ensure bucket exists (idempotent)
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- Helpful note: storage.objects already has RLS enabled by default.

-- ---------- Admin: all access ----------------------------------------------
drop policy if exists "invoices_admin_all" on storage.objects;
create policy "invoices_admin_all"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'invoices'
    and public.user_role() = 'admin'
  )
  with check (
    bucket_id = 'invoices'
    and public.user_role() = 'admin'
  );

-- ---------- Customer: read-only on their own org prefix ---------------------
-- File path format: `<organization_id>/<invoice_id>.pdf`.
-- `storage.foldername(name)` returns the path segments as an array; the first
-- segment is the org id. We cast it to uuid and compare to public.user_org().
drop policy if exists "invoices_customer_read_own_org" on storage.objects;
create policy "invoices_customer_read_own_org"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'invoices'
    and public.user_role() = 'customer'
    and (storage.foldername(name))[1]::uuid = public.user_org()
  );

-- Note: no customer write/delete policy. Uploads come from the Edge Function
-- using service_role which bypasses RLS.

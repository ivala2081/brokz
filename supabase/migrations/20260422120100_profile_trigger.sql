-- ============================================================================
-- Profile auto-provision trigger
-- ----------------------------------------------------------------------------
-- When a new auth.users row is created (via email signup, OAuth, admin invite,
-- etc.), we mirror it into public.profiles. Role and organization_id can be
-- supplied in raw_user_meta_data:
--
--   { "role": "customer", "organization_id": "…uuid…", "full_name": "Jane" }
--
-- Defaults:
--   * role            -> 'customer'
--   * organization_id -> NULL
--   * full_name       -> from metadata or empty
--   * email           -> from auth.users.email
--
-- The function runs as security definer so it can bypass profiles RLS.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta          jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  resolved_role user_role;
  resolved_org  uuid;
begin
  -- Resolve role (fall back to 'customer' on any invalid / missing value).
  begin
    resolved_role := coalesce(
      nullif(meta ->> 'role', '')::user_role,
      'customer'::user_role
    );
  exception when invalid_text_representation then
    resolved_role := 'customer'::user_role;
  end;

  -- Resolve organization_id (nullable, uuid-parse-safe).
  begin
    resolved_org := nullif(meta ->> 'organization_id', '')::uuid;
  exception when invalid_text_representation then
    resolved_org := null;
  end;

  insert into public.profiles (id, organization_id, role, full_name, email)
  values (
    new.id,
    resolved_org,
    resolved_role,
    nullif(meta ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================================
-- rollback:
-- ----------------------------------------------------------------------------
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- ============================================================================

-- Hardens `profiles_self_update` by replacing the recursive WITH CHECK
-- sub-select on public.profiles (which re-triggers RLS evaluation) with a
-- call to the security-definer `public.user_role()` helper. Same semantic
-- effect — customer cannot change their role — but avoids nested RLS.

drop policy if exists "profiles_self_update" on public.profiles;

create policy "profiles_self_update"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role::text = public.user_role()
  );

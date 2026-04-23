-- Security hardening: pin search_path on trigger functions
-- Addresses `function_search_path_mutable` linter warnings.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.bump_ticket_last_message_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.tickets
     set last_message_at = new.created_at
   where id = new.ticket_id;
  return new;
end;
$$;

-- Add contact_preference to leads (how the prospect wants to be reached)
do $$ begin
  create type public.contact_preference as enum ('email', 'phone', 'any');
exception when duplicate_object then null;
end $$;

alter table public.leads
  add column if not exists contact_preference public.contact_preference;

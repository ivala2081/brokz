-- Add phone column to leads for contact form phone capture
alter table public.leads
  add column if not exists phone text;

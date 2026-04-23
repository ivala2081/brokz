-- Schema additions after Phase 1 UI build
-- Adds: blog_posts.deleted_at (soft delete), tickets.last_message_at (list sorting)

begin;

alter table public.blog_posts
  add column if not exists deleted_at timestamptz;

create index if not exists blog_posts_deleted_at_idx
  on public.blog_posts (deleted_at)
  where deleted_at is null;

alter table public.tickets
  add column if not exists last_message_at timestamptz
  default now()
  not null;

create index if not exists tickets_last_message_at_idx
  on public.tickets (last_message_at desc);

create or replace function public.bump_ticket_last_message_at()
returns trigger
language plpgsql
as $$
begin
  update public.tickets
     set last_message_at = new.created_at
   where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists ticket_messages_bump_last_message on public.ticket_messages;
create trigger ticket_messages_bump_last_message
  after insert on public.ticket_messages
  for each row execute function public.bump_ticket_last_message_at();

commit;

-- rollback:
-- begin;
-- drop trigger if exists ticket_messages_bump_last_message on public.ticket_messages;
-- drop function if exists public.bump_ticket_last_message_at();
-- drop index if exists tickets_last_message_at_idx;
-- alter table public.tickets drop column if exists last_message_at;
-- drop index if exists blog_posts_deleted_at_idx;
-- alter table public.blog_posts drop column if exists deleted_at;
-- commit;

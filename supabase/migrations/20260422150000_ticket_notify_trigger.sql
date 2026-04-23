-- ============================================================================
-- Brokz — ticket notification enqueue trigger
-- ----------------------------------------------------------------------------
-- When a new row is inserted into `ticket_messages`, push a job onto the
-- `ticket_notification_queue` table. A future cron Edge Function (Phase 3)
-- drains the queue by calling the `ticket-notify` Edge Function.
--
-- Why a queue and not `pg_net` direct HTTP?
--   * `pg_net` is not universally enabled on hosted Supabase free-tier
--     projects without an explicit extension grant, and having the DB
--     fire a synchronous HTTP call in a trigger is a reliability risk
--     (network failures leak into transaction errors).
--   * A queue table gives us retry + observability for free, and lets the
--     admin UI call `ticket-notify` directly (immediate path) while the
--     queue drainer handles the customer → admin direction eventually.
--
-- The `ticket-notify` Edge Function itself can be called in two ways:
--   (a) synchronously by the admin UI right after an admin reply (fast
--       path for to-customer notifications),
--   (b) by the queue drainer (Phase 3) for customer→admin notifications
--       and any (a) that failed.
--
-- If and when `pg_net` is confirmed available project-side, this trigger
-- can be upgraded to fire the HTTP call directly in addition to enqueueing.
-- ============================================================================

create table public.ticket_notification_queue (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid not null references public.tickets(id) on delete cascade,
  message_id    uuid not null references public.ticket_messages(id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending','sent','failed')),
  attempts      int  not null default 0,
  last_error    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  sent_at       timestamptz
);

create index ticket_notification_queue_status_idx
  on public.ticket_notification_queue (status, created_at)
  where status = 'pending';

create index ticket_notification_queue_message_idx
  on public.ticket_notification_queue (message_id);

create trigger ticket_notification_queue_set_updated_at
before update on public.ticket_notification_queue
for each row execute function public.set_updated_at();

-- RLS: no policies — service_role only.
alter table public.ticket_notification_queue enable row level security;

-- ---------- trigger function -----------------------------------------------
create or replace function public.enqueue_ticket_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ticket_notification_queue (ticket_id, message_id)
  values (new.ticket_id, new.id);
  return new;
end;
$$;

create trigger ticket_messages_enqueue_notification
after insert on public.ticket_messages
for each row execute function public.enqueue_ticket_notification();

-- ============================================================================
-- rollback:
-- ----------------------------------------------------------------------------
-- drop trigger if exists ticket_messages_enqueue_notification on public.ticket_messages;
-- drop function if exists public.enqueue_ticket_notification();
-- drop table if exists public.ticket_notification_queue;
-- ============================================================================

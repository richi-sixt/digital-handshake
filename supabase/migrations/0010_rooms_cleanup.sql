-- Automatic cleanup of abandoned multiplayer rooms (all games).
-- Idempotent. Run manually in the Supabase SQL editor.
--
-- Rooms are never closed by the client (closing the tab changes nothing in the
-- database), so stale rooms are removed by inactivity. Child tables of the
-- cipher-cards game (keys, seats, messages) are removed via ON DELETE CASCADE.

-- 1. Track the last activity per room.
alter table public.rooms
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

create index if not exists rooms_updated_at_idx on public.rooms (updated_at);

-- 2. Cleanup function. Lobby and finished rooms go after 2 hours of
--    inactivity, running games after 6 hours.
create or replace function public.cleanup_stale_rooms()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from public.rooms
  where (status in ('waiting', 'finished') and updated_at < now() - interval '2 hours')
     or (status = 'playing' and updated_at < now() - interval '6 hours');
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.cleanup_stale_rooms() from public, anon, authenticated;

-- 3. Schedule it every 15 minutes with pg_cron (enable the extension under
--    Database > Extensions if the statement below fails).
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('cleanup-stale-rooms')
  where exists (select 1 from cron.job where jobname = 'cleanup-stale-rooms');
  perform cron.schedule('cleanup-stale-rooms', '*/15 * * * *', 'select public.cleanup_stale_rooms()');
end $$;

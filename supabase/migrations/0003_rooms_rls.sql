-- OPTIONAL, apply only after testing multiplayer (tic-tac-toe, memory, uno).
-- Multiplayer talks to Supabase with the anon key from the browser, so the
-- policies below keep that working (select/insert/update) but do not allow
-- deleting rooms. Run in the SQL editor and test a full game afterwards.
-- Rollback: alter table public.rooms disable row level security;

alter table public.rooms enable row level security;

drop policy if exists "rooms anon select" on public.rooms;
create policy "rooms anon select" on public.rooms for select using (true);

drop policy if exists "rooms anon insert" on public.rooms;
create policy "rooms anon insert" on public.rooms for insert with check (true);

drop policy if exists "rooms anon update" on public.rooms;
create policy "rooms anon update" on public.rooms for update using (true) with check (true);

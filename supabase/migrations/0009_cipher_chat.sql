-- Cipher Cards: private team chat.
--
-- Messages live in a table anon cannot read. Teams only get their own messages
-- through RPCs that check the seat token. A public counter per team in
-- rooms.game_state ("chat": {"red": n, "blue": m}) tells clients when to refetch.
-- Requires 0008_cipher_cards.sql. Run in the Supabase SQL editor. Idempotent.

create table if not exists public.cipher_messages (
  id         bigint generated always as identity primary key,
  room_id    uuid not null references public.rooms(id) on delete cascade,
  team       text not null check (team in ('red', 'blue')),
  player_id  text not null,
  body       text not null check (length(body) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists cipher_messages_room_team_idx
  on public.cipher_messages (room_id, team, id);

alter table public.cipher_messages enable row level security;

-- Chat is cleared whenever a game starts or goes back to the lobby (rematch)
create or replace function public.cc_clear_chat() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.cipher_messages where room_id = new.id;
  return new;
end $$;

drop trigger if exists cc_clear_chat on public.rooms;
create trigger cc_clear_chat after update of game_state on public.rooms
  for each row
  when (old.game_type = 'cipher-cards'
        and old.game_state->>'phase' is distinct from new.game_state->>'phase'
        and new.game_state->>'phase' in ('lobby', 'playing'))
  execute function public.cc_clear_chat();

-- Send a message to your own team.
-- Spymasters may only read (not write) while their team is guessing.
create or replace function public.cc_send_message(
  p_room uuid, p_player text, p_token text, p_text text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_room public.rooms;
  v_state jsonb;
  v_seat jsonb;
  v_team text;
  v_body text;
  v_chat jsonb;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  v_state := v_room.game_state;
  v_seat := v_state->'seats'->p_player;
  if v_seat is null then raise exception 'no_seat'; end if;
  v_team := v_seat->>'team';

  v_body := trim(coalesce(p_text, ''));
  if length(v_body) < 1 or length(v_body) > 300 then
    raise exception 'invalid_message';
  end if;

  if v_seat->>'role' = 'spymaster'
     and v_state->>'phase' = 'playing'
     and v_state->>'turn' = v_team
     and v_state->'clue' <> 'null'::jsonb then
    raise exception 'chat_locked';
  end if;

  insert into public.cipher_messages(room_id, team, player_id, body)
    values (p_room, v_team, p_player, v_body);

  -- keep only the latest 200 messages per room and team
  delete from public.cipher_messages
  where room_id = p_room and team = v_team
    and id < (select min(id) from (
      select id from public.cipher_messages
      where room_id = p_room and team = v_team
      order by id desc limit 200) latest);

  v_chat := jsonb_set(
    coalesce(v_state->'chat', '{}'::jsonb),
    array[v_team],
    to_jsonb(coalesce((v_state->'chat'->>v_team)::int, 0) + 1),
    true);
  v_state := v_state || jsonb_build_object('chat', v_chat);
  return public.cc_save(p_room, v_state, v_room.status);
end $$;

-- Read the chat of your own team (latest 200 messages, oldest first)
create or replace function public.cc_get_messages(
  p_room uuid, p_player text, p_token text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_room public.rooms; v_seat jsonb;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  v_seat := v_room.game_state->'seats'->p_player;
  if v_seat is null then raise exception 'no_seat'; end if;
  return coalesce((
    select jsonb_agg(
      jsonb_build_object('id', m.id, 'player_id', m.player_id,
                         'text', m.body, 'created_at', m.created_at)
      order by m.id)
    from (
      select * from public.cipher_messages
      where room_id = p_room and team = v_seat->>'team'
      order by id desc limit 200) m
  ), '[]'::jsonb);
end $$;

grant execute on function
  public.cc_send_message(uuid, text, text, text),
  public.cc_get_messages(uuid, text, text)
to anon, authenticated;

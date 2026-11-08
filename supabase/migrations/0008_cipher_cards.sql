-- Cipher Cards: team word-guessing game (multiplayer, uses public.rooms).
--
-- The secret key card (which word belongs to which team) is stored in a table
-- that anon cannot read. Game moves go through security-definer functions that
-- check a per-player seat token. A trigger on public.rooms blocks direct writes
-- to the game state of cipher-cards rooms.
-- Run in the Supabase SQL editor. Idempotent.

-- 1) Allow the new game type (drop whatever check constraint covers game_type)
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.rooms'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%game_type%'
  loop
    execute format('alter table public.rooms drop constraint %I', c.conname);
  end loop;
  alter table public.rooms add constraint rooms_game_type_check
    check (game_type in ('tic-tac-toe', 'memory-game', 'uno', 'cipher-cards'));
end $$;

-- 2) Private tables (RLS on, no policies = no anon/authenticated access)
create table if not exists public.cipher_keys (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  key     jsonb not null
);

create table if not exists public.cipher_seats (
  room_id    uuid not null references public.rooms(id) on delete cascade,
  player_id  text not null,
  token_hash text not null,
  primary key (room_id, player_id)
);

alter table public.cipher_keys enable row level security;
alter table public.cipher_seats enable row level security;

-- 3) Guard: game state of cipher-cards rooms may only change inside our RPCs
create or replace function public.cc_guard_rooms() returns trigger
language plpgsql as $$
begin
  if old.game_type = 'cipher-cards'
     and coalesce(current_setting('cipher.rpc', true), '') <> '1'
     and (   new.game_state   is distinct from old.game_state
          or new.status       is distinct from old.status
          or new.winner       is distinct from old.winner
          or new.current_turn is distinct from old.current_turn
          or new.game_type    is distinct from old.game_type
          or new.host_player  is distinct from old.host_player) then
    raise exception 'cipher-cards state can only be changed via RPC';
  end if;
  return new;
end $$;

drop trigger if exists cc_guard_rooms on public.rooms;
create trigger cc_guard_rooms before update on public.rooms
  for each row execute function public.cc_guard_rooms();

-- 4) Helper: lock the room, verify player + seat token. Returns the room row.
create or replace function public.cc_auth(p_room uuid, p_player text, p_token text)
returns public.rooms
language plpgsql security definer set search_path = public as $$
declare
  v_room public.rooms;
  v_hash text;
  v_stored text;
begin
  if p_token is null or length(p_token) < 16 then
    raise exception 'invalid_token';
  end if;
  select * into v_room from public.rooms where id = p_room for update;
  if not found or v_room.game_type <> 'cipher-cards' then
    raise exception 'room_not_found';
  end if;
  if not (v_room.players ? p_player) then
    raise exception 'not_in_room';
  end if;
  v_hash := encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
  insert into public.cipher_seats(room_id, player_id, token_hash)
    values (p_room, p_player, v_hash)
    on conflict do nothing;
  select token_hash into v_stored from public.cipher_seats
    where room_id = p_room and player_id = p_player;
  if v_stored <> v_hash then
    raise exception 'bad_token';
  end if;
  return v_room;
end $$;
revoke all on function public.cc_auth(uuid, text, text) from public, anon, authenticated;

-- 5) Helper: write the new state (sets the guard flag for this transaction)
create or replace function public.cc_save(
  p_room uuid, p_state jsonb, p_status text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_row public.rooms;
begin
  perform set_config('cipher.rpc', '1', true);
  update public.rooms
    set game_state = p_state,
        status = p_status,
        current_turn = null,
        winner = case when p_state->>'winner' is null then null else p_state->>'winner' end
    where id = p_room
    returning * into v_row;
  return to_jsonb(v_row);
end $$;
revoke all on function public.cc_save(uuid, jsonb, text) from public, anon, authenticated;

-- 6) Choose team + role (lobby only)
create or replace function public.cc_set_seat(
  p_room uuid, p_player text, p_token text, p_team text, p_role text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_room public.rooms;
  v_state jsonb;
  v_other text;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  v_state := v_room.game_state;
  if v_state->>'phase' <> 'lobby' then raise exception 'not_in_lobby'; end if;
  if p_team not in ('red', 'blue') or p_role not in ('spymaster', 'operative') then
    raise exception 'invalid_seat';
  end if;
  if p_role = 'spymaster' then
    select key into v_other
    from jsonb_each(coalesce(v_state->'seats', '{}'::jsonb)) as s(key, value)
    where s.value->>'team' = p_team and s.value->>'role' = 'spymaster' and s.key <> p_player
    limit 1;
    if v_other is not null then raise exception 'spymaster_taken'; end if;
  end if;
  v_state := jsonb_set(
    v_state, array['seats', p_player],
    jsonb_build_object('team', p_team, 'role', p_role), true);
  return public.cc_save(p_room, v_state, 'waiting');
end $$;

-- 7) Leave seat (lobby only)
create or replace function public.cc_clear_seat(
  p_room uuid, p_player text, p_token text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_room public.rooms; v_state jsonb;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  v_state := v_room.game_state;
  if v_state->>'phase' <> 'lobby' then raise exception 'not_in_lobby'; end if;
  v_state := jsonb_set(v_state, '{seats}', (v_state->'seats') - p_player, true);
  return public.cc_save(p_room, v_state, 'waiting');
end $$;

-- 8) Start game (host only). The client sends 25 distinct words.
create or replace function public.cc_start(
  p_room uuid, p_player text, p_token text, p_words jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_room public.rooms;
  v_state jsonb;
  v_team text;
  v_start text;
  v_other text;
  v_key text[] := array_fill('neutral'::text, array[25]);
  v_pos int[];
  v_i int;
  v_n int;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  if v_room.host_player <> p_player then raise exception 'host_only'; end if;
  v_state := v_room.game_state;
  if v_state->>'phase' <> 'lobby' then raise exception 'not_in_lobby'; end if;

  if jsonb_typeof(p_words) <> 'array' or jsonb_array_length(p_words) <> 25
     or (select count(distinct lower(w)) from jsonb_array_elements_text(p_words) w) <> 25
     or exists (select 1 from jsonb_array_elements_text(p_words) w
                where length(trim(w)) = 0 or length(w) > 30) then
    raise exception 'invalid_words';
  end if;

  foreach v_team in array array['red', 'blue'] loop
    if (select count(*) from jsonb_each(v_state->'seats') s
        where s.value->>'team' = v_team and s.value->>'role' = 'spymaster') <> 1
       or (select count(*) from jsonb_each(v_state->'seats') s
        where s.value->>'team' = v_team and s.value->>'role' = 'operative') < 1 then
      raise exception 'teams_incomplete';
    end if;
  end loop;

  v_start := case when random() < 0.5 then 'red' else 'blue' end;
  v_other := case when v_start = 'red' then 'blue' else 'red' end;

  select array_agg(i order by random()) into v_pos from generate_series(0, 24) i;
  v_n := 1;
  v_key[v_pos[v_n] + 1] := 'assassin'; v_n := v_n + 1;
  for v_i in 1..9 loop v_key[v_pos[v_n] + 1] := v_start; v_n := v_n + 1; end loop;
  for v_i in 1..8 loop v_key[v_pos[v_n] + 1] := v_other; v_n := v_n + 1; end loop;

  insert into public.cipher_keys(room_id, key) values (p_room, to_jsonb(v_key))
    on conflict (room_id) do update set key = excluded.key;

  v_state := jsonb_build_object(
    'phase', 'playing',
    'seats', v_state->'seats',
    'words', (select jsonb_agg(trim(w)) from jsonb_array_elements_text(p_words) w),
    'revealed', (select jsonb_agg(null::text) from generate_series(1, 25)),
    'turn', v_start,
    'startTeam', v_start,
    'clue', null,
    'guessesLeft', 0,
    'remaining', jsonb_build_object(v_start, 9, v_other, 8),
    'winner', null,
    'endedBy', null
  );
  return public.cc_save(p_room, v_state, 'playing');
end $$;

-- 9) Spymaster reads the key (everyone may read it once the game is finished)
create or replace function public.cc_get_key(
  p_room uuid, p_player text, p_token text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_room public.rooms; v_state jsonb; v_key jsonb;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  v_state := v_room.game_state;
  if v_state->>'phase' = 'finished'
     or v_state->'seats'->p_player->>'role' = 'spymaster' then
    select key into v_key from public.cipher_keys where room_id = p_room;
    return v_key;
  end if;
  raise exception 'not_allowed';
end $$;

-- 10) Spymaster gives a clue
create or replace function public.cc_give_clue(
  p_room uuid, p_player text, p_token text, p_word text, p_count int
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_room public.rooms; v_state jsonb; v_seat jsonb; v_word text;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  v_state := v_room.game_state;
  v_seat := v_state->'seats'->p_player;
  if v_state->>'phase' <> 'playing' then raise exception 'not_playing'; end if;
  if v_seat is null or v_seat->>'role' <> 'spymaster'
     or v_seat->>'team' <> v_state->>'turn' then
    raise exception 'not_your_turn';
  end if;
  if v_state->'clue' <> 'null'::jsonb then raise exception 'clue_already_given'; end if;

  v_word := trim(coalesce(p_word, ''));
  if length(v_word) < 1 or length(v_word) > 30 or v_word ~ '\s'
     or p_count is null or p_count < 0 or p_count > 9 then
    raise exception 'invalid_clue';
  end if;
  -- clue must not be a word that is still on the board
  if exists (
    select 1 from jsonb_array_elements_text(v_state->'words') with ordinality w(word, idx)
    where lower(w.word) = lower(v_word) and v_state->'revealed'->((w.idx - 1)::int) = 'null'::jsonb
  ) then
    raise exception 'clue_on_board';
  end if;

  v_state := v_state
    || jsonb_build_object(
         'clue', jsonb_build_object('word', v_word, 'count', p_count),
         'guessesLeft', case when p_count = 0 then 25 else p_count + 1 end);
  return public.cc_save(p_room, v_state, 'playing');
end $$;

-- 11) Operative reveals a card
create or replace function public.cc_reveal(
  p_room uuid, p_player text, p_token text, p_index int
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_room public.rooms; v_state jsonb; v_seat jsonb;
  v_key jsonb; v_color text; v_turn text; v_next text; v_left int; v_guesses int;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  v_state := v_room.game_state;
  v_seat := v_state->'seats'->p_player;
  v_turn := v_state->>'turn';
  if v_state->>'phase' <> 'playing' then raise exception 'not_playing'; end if;
  if v_seat is null or v_seat->>'role' <> 'operative' or v_seat->>'team' <> v_turn then
    raise exception 'not_your_turn';
  end if;
  if v_state->'clue' = 'null'::jsonb then raise exception 'no_clue'; end if;
  if p_index is null or p_index < 0 or p_index > 24 then raise exception 'invalid_index'; end if;
  if v_state->'revealed'->p_index <> 'null'::jsonb then raise exception 'already_revealed'; end if;

  select key into v_key from public.cipher_keys where room_id = p_room;
  v_color := v_key->>p_index;
  v_next := case when v_turn = 'red' then 'blue' else 'red' end;

  v_state := jsonb_set(v_state, array['revealed', p_index::text], to_jsonb(v_color), false);

  if v_color = 'assassin' then
    v_state := v_state || jsonb_build_object('phase', 'finished', 'winner', v_next, 'endedBy', 'assassin');
    return public.cc_save(p_room, v_state, 'finished');
  end if;

  if v_color in ('red', 'blue') then
    v_left := (v_state->'remaining'->>v_color)::int - 1;
    v_state := jsonb_set(v_state, array['remaining', v_color], to_jsonb(v_left), false);
    if v_left = 0 then
      v_state := v_state || jsonb_build_object('phase', 'finished', 'winner', v_color, 'endedBy', 'cards');
      return public.cc_save(p_room, v_state, 'finished');
    end if;
  end if;

  if v_color = v_turn then
    v_guesses := (v_state->>'guessesLeft')::int - 1;
    if v_guesses <= 0 then
      v_state := v_state || jsonb_build_object('turn', v_next, 'clue', null, 'guessesLeft', 0);
    else
      v_state := v_state || jsonb_build_object('guessesLeft', v_guesses);
    end if;
  else
    v_state := v_state || jsonb_build_object('turn', v_next, 'clue', null, 'guessesLeft', 0);
  end if;
  return public.cc_save(p_room, v_state, 'playing');
end $$;

-- 12) Operative ends the turn voluntarily
create or replace function public.cc_end_turn(
  p_room uuid, p_player text, p_token text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_room public.rooms; v_state jsonb; v_seat jsonb; v_turn text;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  v_state := v_room.game_state;
  v_seat := v_state->'seats'->p_player;
  v_turn := v_state->>'turn';
  if v_state->>'phase' <> 'playing' then raise exception 'not_playing'; end if;
  if v_seat is null or v_seat->>'role' <> 'operative' or v_seat->>'team' <> v_turn then
    raise exception 'not_your_turn';
  end if;
  if v_state->'clue' = 'null'::jsonb then raise exception 'no_clue'; end if;
  v_state := v_state || jsonb_build_object(
    'turn', case when v_turn = 'red' then 'blue' else 'red' end,
    'clue', null, 'guessesLeft', 0);
  return public.cc_save(p_room, v_state, 'playing');
end $$;

-- 13) Rematch (host only): back to the lobby, seats are kept, key is deleted
create or replace function public.cc_rematch(
  p_room uuid, p_player text, p_token text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_room public.rooms; v_state jsonb;
begin
  v_room := public.cc_auth(p_room, p_player, p_token);
  if v_room.host_player <> p_player then raise exception 'host_only'; end if;
  v_state := v_room.game_state;
  if v_state->>'phase' <> 'finished' then raise exception 'not_finished'; end if;
  delete from public.cipher_keys where room_id = p_room;
  v_state := jsonb_build_object('phase', 'lobby', 'seats', v_state->'seats');
  return public.cc_save(p_room, v_state, 'waiting');
end $$;

grant execute on function
  public.cc_set_seat(uuid, text, text, text, text),
  public.cc_clear_seat(uuid, text, text),
  public.cc_start(uuid, text, text, jsonb),
  public.cc_get_key(uuid, text, text),
  public.cc_give_clue(uuid, text, text, text, int),
  public.cc_reveal(uuid, text, text, int),
  public.cc_end_turn(uuid, text, text),
  public.cc_rematch(uuid, text, text)
to anon, authenticated;

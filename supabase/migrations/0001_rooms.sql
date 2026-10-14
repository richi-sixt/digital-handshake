-- Multiplayer rooms (used by src/lib/multiplayer.ts).
-- The table already exists in the hosted project; this statement is idempotent
-- and only documents the schema in the repo. Columns match the live table
-- (information_schema.columns). Constraints (unique code, game_type/status
-- checks) are inferred from the app code, not read from the database.

create table if not exists public.rooms (
  id            uuid primary key default gen_random_uuid(),
  code          character(6) not null unique,
  game_type     text not null check (game_type in ('tic-tac-toe', 'memory-game', 'uno')),
  status        text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  game_state    jsonb not null default '{}'::jsonb,
  current_turn  text,
  winner        text,
  created_at    timestamptz default now(),
  players       jsonb default '[]'::jsonb,
  host_player   text,
  max_players   integer default 2,
  player_names  jsonb default '{}'::jsonb
);

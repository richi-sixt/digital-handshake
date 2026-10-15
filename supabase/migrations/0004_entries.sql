-- Work and education entries (CV). Same access model as posts:
-- anyone reads published rows, only an admin (is_admin()) writes.
-- Run once in the Supabase SQL editor (after 0002_posts.sql).

create table if not exists public.entries (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null check (kind in ('work', 'education')),
  slug            text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  organization    text not null,                 -- company or institution
  location        text,
  field           text,                          -- education only
  title_en        text not null,                 -- role or degree
  title_de        text,
  description_en  text not null default '',
  description_de  text,
  body_en         text not null default '',
  body_de         text,
  start_year      smallint not null check (start_year between 1900 and 2100),
  end_year        smallint check (end_year between 1900 and 2100),  -- null = present
  tech            text[] not null default '{}',
  related_apps    text[] not null default '{}',  -- app slugs (work)
  logo_url        text,
  show_on_home    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (kind, slug),
  check (end_year is null or end_year >= start_year)
);

create index if not exists entries_kind_status_idx
  on public.entries (kind, status, start_year desc);

drop trigger if exists entries_set_updated_at on public.entries;
create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

alter table public.entries enable row level security;

drop policy if exists "entries public read published" on public.entries;
create policy "entries public read published"
  on public.entries for select
  using (status = 'published');

drop policy if exists "entries admin all" on public.entries;
create policy "entries admin all"
  on public.entries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Logos go into the existing public bucket `blog-images` under logos/ (the
-- admin write policy from 0002_posts.sql already covers it).

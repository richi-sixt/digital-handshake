-- Skills shown on the home page. Anyone reads, only an admin (is_admin()) writes.
-- Run once in the Supabase SQL editor (after 0002_posts.sql).

create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('methodical', 'technical')),
  name        text not null,
  url         text not null default '',
  icon_url    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists skills_category_order_idx
  on public.skills (category, sort_order);

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

alter table public.skills enable row level security;

drop policy if exists "skills public read" on public.skills;
create policy "skills public read"
  on public.skills for select
  using (true);

drop policy if exists "skills admin all" on public.skills;
create policy "skills admin all"
  on public.skills for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Icons go into the existing public bucket `blog-images` under skills/ (the
-- admin write policy from 0002_posts.sql already covers it).

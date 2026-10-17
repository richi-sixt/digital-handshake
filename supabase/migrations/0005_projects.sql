-- Projects (the apps shown under /projects and /apps/<slug>).
-- Same access model as posts and entries: anyone reads published rows,
-- only an admin (is_admin()) writes. Run once in the Supabase SQL editor
-- (after 0002_posts.sql).

create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  title_en        text not null,
  title_de        text,
  description_en  text not null default '',
  description_de  text,
  body_en         text not null default '',
  body_de         text,
  tech            text[] not null default '{}',
  url             text,        -- "Go to app": internal path (/apps/<slug>/play/) or external URL
  github          text,
  date            date not null default current_date,
  category        text not null default 'web' check (category in ('games', 'tools', 'web', 'misc')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists projects_status_date_idx
  on public.projects (status, date desc);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "projects public read published" on public.projects;
create policy "projects public read published"
  on public.projects for select
  using (status = 'published');

drop policy if exists "projects admin all" on public.projects;
create policy "projects admin all"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

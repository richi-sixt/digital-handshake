-- Blog posts, admin check and image storage.
-- Run once in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------- admin ---
-- Only emails listed here count as admin. The table is locked down by RLS
-- (no policies = nobody can read or write it through the API); add your
-- email via the SQL editor, see the INSERT below.
create table if not exists public.admin_emails (
  email text primary key
);
alter table public.admin_emails enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Add your own address once, manually (keep that query out of git, e.g. in
-- supabase/local/, which is gitignored):
-- insert into public.admin_emails (email) values ('you@example.com');

-- ----------------------------------------------------------------- posts ---
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  date            date not null default current_date,
  category        text not null default 'development',
  tags            text[] not null default '{}',
  related_apps    text[] not null default '{}',
  related_work    text[] not null default '{}',
  title_en        text not null,
  title_de        text,
  description_en  text not null default '',
  description_de  text,
  body_en         text not null default '',
  body_de         text,
  cover_image     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists posts_status_date_idx on public.posts (status, date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "posts public read published" on public.posts;
create policy "posts public read published"
  on public.posts for select
  using (status = 'published');

drop policy if exists "posts admin all" on public.posts;
create policy "posts admin all"
  on public.posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------- storage ---
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "blog-images public read" on storage.objects;
create policy "blog-images public read"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "blog-images admin write" on storage.objects;
create policy "blog-images admin write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'blog-images' and public.is_admin())
  with check (bucket_id = 'blog-images' and public.is_admin());

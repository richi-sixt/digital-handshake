-- Project categories become free text (e.g. mobile, work) instead of the fixed
-- list games/tools/web/misc. Still stored as lowercase slugs; the admin editor
-- normalizes input ("Mobile Apps" -> "mobile-apps"). Run once in the Supabase
-- SQL editor (after 0005_projects.sql).

alter table public.projects drop constraint if exists projects_category_check;

alter table public.projects
  add constraint projects_category_format
  check (category ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

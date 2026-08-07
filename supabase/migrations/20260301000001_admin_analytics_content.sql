-- Ally admin, content, scraper, and privacy-safe analytics schema.
-- Run after supabase/schema.sql. Safe to run repeatedly.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  created_at timestamptz not null default now()
);

create or replace function public.promote_ally_superadmin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) = 'kpearl099@gmail.com' then
    insert into public.admin_users (user_id, role)
    values (new.id, 'superadmin')
    on conflict (user_id) do update set role = 'superadmin';
  end if;
  return new;
end;
$$;

drop trigger if exists ally_superadmin_created on auth.users;
create trigger ally_superadmin_created
after insert or update of email on auth.users
for each row execute procedure public.promote_ally_superadmin();

insert into public.admin_users (user_id, role)
select id, 'superadmin' from auth.users where lower(email) = 'kpearl099@gmail.com'
on conflict (user_id) do update set role = 'superadmin';

create or replace function public.is_ally_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role in ('admin', 'superadmin')
  );
$$;

create table if not exists public.analytics_exclusions (
  ip_hash text primary key check (char_length(ip_hash) = 64),
  label text check (char_length(label) <= 120),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Additive only — never DROP. Re-running must not wipe production analytics.
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event_type text not null check (event_type in ('page_view', 'click', 'search', 'filter', 'scroll', 'job_view')),
  path text not null check (char_length(path) between 1 and 500),
  referrer text check (char_length(referrer) <= 500),
  session_id uuid not null,
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  target text check (char_length(target) <= 500),
  label text check (char_length(label) <= 200),
  query text check (char_length(query) <= 300),
  filter_key text check (char_length(filter_key) <= 100),
  filter_value text check (char_length(filter_value) <= 200),
  job_id uuid references public.jobs(id) on delete set null,
  scroll_depth smallint check (scroll_depth between 0 and 100),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object')
);

create or replace function public.analytics_ip_is_excluded(candidate_hash text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.analytics_exclusions where ip_hash = candidate_hash);
$$;

revoke all on function public.analytics_ip_is_excluded(text) from public;
grant execute on function public.analytics_ip_is_excluded(text) to anon, authenticated;

create table if not exists public.scraper_runs (
  id uuid default gen_random_uuid() primary key,
  source text not null check (source in ('all', 'olj', 'remoteok', 'wwr', 'upwork')),
  status text not null check (status in ('running', 'success', 'error')),
  job_count integer not null default 0 check (job_count >= 0),
  message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Additive only — never DROP. Re-running must not wipe saved templates.
create table if not exists public.admin_templates (
  id uuid default gen_random_uuid() primary key,
  kind text not null check (kind in ('cover_letter', 'resume', 'tag')),
  label text not null check (char_length(label) between 1 and 120),
  blurb text check (char_length(blurb) <= 400),
  body text check (char_length(body) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique check (char_length(name) between 1 and 100),
  slug text not null unique check (char_length(slug) between 1 and 100),
  description text check (char_length(description) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique check (char_length(name) between 1 and 100),
  slug text not null unique check (char_length(slug) between 1 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.job_category_assignments (
  job_id uuid not null references public.jobs(id) on delete cascade,
  category_id uuid not null references public.job_categories(id) on delete cascade,
  primary key (job_id, category_id)
);

create table if not exists public.job_tag_assignments (
  job_id uuid not null references public.jobs(id) on delete cascade,
  tag_id uuid not null references public.job_tags(id) on delete cascade,
  primary key (job_id, tag_id)
);

create or replace function public.admin_content_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists admin_templates_set_updated_at on public.admin_templates;
create trigger admin_templates_set_updated_at before update on public.admin_templates
for each row execute procedure public.admin_content_updated_at();
drop trigger if exists job_categories_set_updated_at on public.job_categories;
create trigger job_categories_set_updated_at before update on public.job_categories
for each row execute procedure public.admin_content_updated_at();

alter table public.admin_users enable row level security;
alter table public.analytics_exclusions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.scraper_runs enable row level security;
alter table public.admin_templates enable row level security;
alter table public.job_categories enable row level security;
alter table public.job_tags enable row level security;
alter table public.job_category_assignments enable row level security;
alter table public.job_tag_assignments enable row level security;

drop policy if exists "Admins view own role" on public.admin_users;
create policy "Admins view own role" on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Analytics append only" on public.analytics_events;
create policy "Analytics append only" on public.analytics_events for insert to anon, authenticated
with check (
  event_type in ('page_view', 'click', 'search', 'filter', 'scroll', 'job_view')
  and char_length(path) between 1 and 500
  and char_length(visitor_hash) = 64
  and jsonb_typeof(metadata) = 'object'
);
drop policy if exists "Admins read analytics" on public.analytics_events;
create policy "Admins read analytics" on public.analytics_events for select to authenticated
using ((select public.is_ally_admin()));

drop policy if exists "Admins manage exclusions" on public.analytics_exclusions;
create policy "Admins manage exclusions" on public.analytics_exclusions for all to authenticated
using ((select public.is_ally_admin())) with check ((select public.is_ally_admin()));

drop policy if exists "Admins manage scraper runs" on public.scraper_runs;
create policy "Admins manage scraper runs" on public.scraper_runs for all to authenticated
using ((select public.is_ally_admin())) with check ((select public.is_ally_admin()));

drop policy if exists "Admins manage templates" on public.admin_templates;
create policy "Admins manage templates" on public.admin_templates for all to authenticated
using ((select public.is_ally_admin())) with check ((select public.is_ally_admin()));

-- Public reads let the public builders consume published categories/templates.
-- Mutations remain admin-only.
drop policy if exists "Public read job categories" on public.job_categories;
create policy "Public read job categories" on public.job_categories for select using (true);
drop policy if exists "Admins manage job categories" on public.job_categories;
create policy "Admins manage job categories" on public.job_categories for all to authenticated
using ((select public.is_ally_admin())) with check ((select public.is_ally_admin()));
drop policy if exists "Public read job tags" on public.job_tags;
create policy "Public read job tags" on public.job_tags for select using (true);
drop policy if exists "Admins manage job tags" on public.job_tags;
create policy "Admins manage job tags" on public.job_tags for all to authenticated
using ((select public.is_ally_admin())) with check ((select public.is_ally_admin()));
drop policy if exists "Public read category assignments" on public.job_category_assignments;
create policy "Public read category assignments" on public.job_category_assignments for select using (true);
drop policy if exists "Admins manage category assignments" on public.job_category_assignments;
create policy "Admins manage category assignments" on public.job_category_assignments for all to authenticated
using ((select public.is_ally_admin())) with check ((select public.is_ally_admin()));
drop policy if exists "Public read tag assignments" on public.job_tag_assignments;
create policy "Public read tag assignments" on public.job_tag_assignments for select using (true);
drop policy if exists "Admins manage tag assignments" on public.job_tag_assignments;
create policy "Admins manage tag assignments" on public.job_tag_assignments for all to authenticated
using ((select public.is_ally_admin())) with check ((select public.is_ally_admin()));

-- Admins need aggregate reads without a service-role key. Existing own-row
-- policies remain in place, so these policies only add admin visibility.
drop policy if exists "Admins read users" on public.users;
create policy "Admins read users" on public.users for select to authenticated
using ((select public.is_ally_admin()));
drop policy if exists "Admins read applications" on public.applications;
create policy "Admins read applications" on public.applications for select to authenticated
using ((select public.is_ally_admin()));
drop policy if exists "Admins read resumes" on public.resumes;
create policy "Admins read resumes" on public.resumes for select to authenticated
using ((select public.is_ally_admin()));
drop policy if exists "Admins read cover letters" on public.cover_letters;
create policy "Admins read cover letters" on public.cover_letters for select to authenticated
using ((select public.is_ally_admin()));

create index if not exists idx_analytics_events_occurred on public.analytics_events (occurred_at desc);
create index if not exists idx_analytics_events_visitor on public.analytics_events (visitor_hash, occurred_at desc);
create index if not exists idx_analytics_events_session on public.analytics_events (session_id, occurred_at desc);
create index if not exists idx_analytics_events_type_path on public.analytics_events (event_type, path);
create index if not exists idx_analytics_events_job on public.analytics_events (job_id) where job_id is not null;
create index if not exists idx_scraper_runs_started on public.scraper_runs (started_at desc);
create unique index if not exists idx_one_running_scrape on public.scraper_runs ((status)) where status = 'running';
create index if not exists idx_admin_templates_kind on public.admin_templates (kind, label);

-- Ally database schema
-- Run this in the Supabase SQL editor. It is safe to run repeatedly.

create extension if not exists pgcrypto;

-- Public jobs data
create table if not exists public.jobs (
  id uuid default gen_random_uuid() primary key,
  source text not null,
  source_id text,
  title text not null,
  company text,
  description text,
  salary_min numeric,
  salary_max numeric,
  salary_currency text default 'PHP',
  salary_type text,
  skills text[],
  experience_level text,
  job_type text,
  location text,
  is_remote boolean default true,
  original_url text not null,
  posted_at timestamptz,
  scraped_at timestamptz default now(),
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(source, source_id)
);

create table if not exists public.salary_data (
  id uuid default gen_random_uuid() primary key,
  skill text not null,
  experience_level text not null,
  sample_count integer default 0,
  avg_hourly_usd numeric,
  min_hourly_usd numeric,
  max_hourly_usd numeric,
  avg_monthly_php numeric,
  min_monthly_php numeric,
  max_monthly_php numeric,
  last_updated timestamptz default now(),
  unique(skill, experience_level)
);

-- public.users mirrors the minimum app-specific data for auth.users.
-- Passwords and auth credentials remain exclusively in auth.users.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  follow_up_days integer not null default 5 check (follow_up_days between 1 and 90),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'user',
  bio text,
  skills text[],
  experience_years integer,
  socials jsonb,
  experience jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Keep older profiles tables compatible with the resume and cover-letter APIs.
alter table public.profiles add column if not exists experience jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists education jsonb not null default '[]'::jsonb;

create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_url text not null,
  job_title text,
  company text,
  status text not null default 'applied' check (
    status in ('saved', 'applied', 'follow_up', 'interviewing', 'offer', 'accepted', 'rejected', 'withdrawn')
  ),
  notes text,
  links jsonb not null default '[]'::jsonb,
  follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled resume',
  template_name text not null default 'classic' check (template_name in ('classic', 'modern', 'compact')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cover_letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_listing_content text not null,
  generated_letter text not null,
  job_title text,
  company text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Set the default follow-up from the user's preference when omitted.
create or replace function public.set_application_follow_up()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  days_to_wait integer;
begin
  if new.follow_up_date is null and new.status = 'applied' then
    select follow_up_days into days_to_wait
    from public.users
    where id = new.user_id;
    new.follow_up_date = (coalesce(new.created_at, now())::date + coalesce(days_to_wait, 5));
  end if;
  return new;
end;
$$;

-- Recreate triggers idempotently.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at before update on public.applications
  for each row execute procedure public.set_updated_at();

drop trigger if exists resumes_set_updated_at on public.resumes;
create trigger resumes_set_updated_at before update on public.resumes
  for each row execute procedure public.set_updated_at();

drop trigger if exists applications_set_follow_up on public.applications;
create trigger applications_set_follow_up before insert on public.applications
  for each row execute procedure public.set_application_follow_up();

-- Backfill app rows for existing auth users.
insert into public.users (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email;

insert into public.profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '') from auth.users
on conflict (id) do nothing;

alter table public.jobs enable row level security;
alter table public.salary_data enable row level security;
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.resumes enable row level security;
alter table public.cover_letters enable row level security;

-- Policy creation has no IF NOT EXISTS, so explicitly replace each one.
drop policy if exists "Jobs are viewable by everyone" on public.jobs;
create policy "Jobs are viewable by everyone" on public.jobs for select using (true);

drop policy if exists "Salary data is viewable by everyone" on public.salary_data;
create policy "Salary data is viewable by everyone" on public.salary_data for select using (true);

drop policy if exists "Users can view own app user" on public.users;
create policy "Users can view own app user" on public.users for select using ((select auth.uid()) = id);
drop policy if exists "Users can update own app user" on public.users;
create policy "Users can update own app user" on public.users for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check ((select auth.uid()) = id);

drop policy if exists "Users manage own applications" on public.applications;
create policy "Users manage own applications" on public.applications for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own resumes" on public.resumes;
create policy "Users manage own resumes" on public.resumes for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own cover letters" on public.cover_letters;
create policy "Users manage own cover letters" on public.cover_letters for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists idx_jobs_skills on public.jobs using gin (skills);
create index if not exists idx_jobs_source on public.jobs (source);
create index if not exists idx_jobs_posted on public.jobs (posted_at desc);
create index if not exists idx_salary_skill on public.salary_data (skill);
create index if not exists idx_applications_user_updated on public.applications (user_id, updated_at desc);
create index if not exists idx_applications_follow_up on public.applications (user_id, follow_up_date)
  where status in ('applied', 'follow_up');
create index if not exists idx_resumes_user_updated on public.resumes (user_id, updated_at desc);
create index if not exists idx_cover_letters_user_created on public.cover_letters (user_id, created_at desc);

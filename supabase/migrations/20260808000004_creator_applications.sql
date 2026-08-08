-- Creator applications from /creator. Inserts come from the API with the
-- caller's session (or anon). Admins read via the service path / dashboard later.

create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  specialty text not null,
  portfolio_url text,
  pitch text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_creator_applications_created
  on public.creator_applications (created_at desc);

create index if not exists idx_creator_applications_email
  on public.creator_applications (lower(email));

alter table public.creator_applications enable row level security;

-- Anyone (signed in or anon) may submit an application.
drop policy if exists creator_applications_insert on public.creator_applications;
create policy creator_applications_insert
  on public.creator_applications
  for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 120
    and char_length(email) between 3 and 254
    and char_length(specialty) between 1 and 120
    and char_length(pitch) between 20 and 4000
    and (portfolio_url is null or char_length(portfolio_url) <= 500)
    and (user_id is null or user_id = auth.uid())
  );

-- Applicants can see their own rows when signed in. Admins use the service role
-- or a later admin UI; no broad select for authenticated.
drop policy if exists creator_applications_select_own on public.creator_applications;
create policy creator_applications_select_own
  on public.creator_applications
  for select
  to authenticated
  using (user_id = auth.uid());

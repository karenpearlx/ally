-- Ensure applications.status accepts 'saved' (jobs bookmark → tracker).
--
-- create table if not exists never rewrites an existing CHECK constraint, so a
-- database created before 'saved' was in the list still rejects bookmarks with
-- 23514. Drop any status CHECK on applications, then recreate the full list.

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'applications'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  loop
    execute format('alter table public.applications drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.applications
  add constraint applications_status_check
  check (
    status in (
      'saved',
      'applied',
      'follow_up',
      'interviewing',
      'offer',
      'accepted',
      'rejected',
      'withdrawn'
    )
  );

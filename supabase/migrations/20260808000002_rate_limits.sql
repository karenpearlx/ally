-- Durable per-subject rate limits for AI and other costly API routes.
-- Counters live in Postgres so they survive serverless cold starts.

create table if not exists public.rate_limits (
  bucket text not null,
  subject text not null,
  window_start bigint not null,
  hit_count integer not null default 0 check (hit_count >= 0),
  primary key (bucket, subject, window_start)
);

create index if not exists idx_rate_limits_window
  on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;

-- No client policies: only the service role (API routes) may touch this table.

create or replace function public.consume_rate_limit(
  p_bucket text,
  p_subject text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window bigint;
  v_count integer;
begin
  if p_bucket is null or length(p_bucket) = 0 or length(p_bucket) > 64 then
    raise exception 'invalid bucket';
  end if;
  if p_subject is null or length(p_subject) = 0 or length(p_subject) > 200 then
    raise exception 'invalid subject';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 100000 then
    raise exception 'invalid limit';
  end if;
  if p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid window';
  end if;

  v_window := floor(extract(epoch from now()) / p_window_seconds)::bigint * p_window_seconds;

  insert into public.rate_limits (bucket, subject, window_start, hit_count)
  values (p_bucket, p_subject, v_window, 1)
  on conflict (bucket, subject, window_start)
  do update set hit_count = public.rate_limits.hit_count + 1
  returning hit_count into v_count;

  -- Best-effort cleanup of old windows for this subject (keep the query cheap).
  delete from public.rate_limits
  where bucket = p_bucket
    and subject = p_subject
    and window_start < v_window - (p_window_seconds * 3);

  return jsonb_build_object(
    'allowed', v_count <= p_limit,
    'count', v_count,
    'limit', p_limit,
    'remaining', greatest(p_limit - v_count, 0),
    'window_start', v_window
  );
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

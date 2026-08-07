import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const TYPES = new Set(['page_view', 'click', 'search', 'filter', 'scroll', 'job_view']);
const counters = new Map<string, { count: number; reset: number }>();

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || null;
}

function hash(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function limited(key: string) {
  const now = Date.now();
  const current = counters.get(key);
  if (!current || current.reset < now) {
    counters.set(key, { count: 1, reset: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 90;
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) || null : null;
}

function uuid(value: unknown) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function scrollDepth(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
}

function safeMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const output: Record<string, string | number | boolean | null> = {};
  const allow = new Set(['element', 'source']);
  for (const [key, raw] of Object.entries(value)) {
    if (!allow.has(key)) continue;
    if (typeof raw === 'string') output[key] = raw.slice(0, 100);
    else if (typeof raw === 'number' && Number.isFinite(raw)) output[key] = raw;
    else if (typeof raw === 'boolean' || raw === null) output[key] = raw;
  }
  return output;
}

export async function POST(request: Request) {
  if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') return new Response(null, { status: 204 });
  if (request.headers.get('cookie')?.includes('ally_analytics_excluded=1')) return new Response(null, { status: 204 });

  const secret = process.env.ANALYTICS_HASH_SECRET;
  const ip = clientIp(request);
  if (!secret || !ip) return new Response(null, { status: 204 }); // fail closed: no raw IP and no unstable identity
  const ipHash = hash(ip, secret);
  if (limited(ipHash)) return Response.json({ error: 'Too many events.' }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const eventType = text(body.event_type ?? body.eventType, 30);
  const path = text(body.path, 500);
  const sessionId = uuid(body.session_id ?? body.sessionId);
  const visitorId = uuid(body.visitor_id ?? body.visitorId);
  if (!eventType || !TYPES.has(eventType) || !path || !sessionId || !visitorId) {
    return Response.json({ error: 'Invalid analytics event.' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Response(null, { status: 503 });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: excluded } = await supabase.rpc('analytics_ip_is_excluded', { candidate_hash: ipHash });
  if (excluded) return new Response(null, { status: 204 });

  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    path,
    referrer: text(body.referrer, 500),
    session_id: sessionId,
    visitor_hash: hash(visitorId, secret),
    target: text(body.target, 500),
    label: text(body.label, 200),
    query: text(body.query, 300),
    filter_key: text(body.filter_key ?? body.filterKey, 100),
    filter_value: text(body.filter_value ?? body.filterValue, 200),
    job_id: uuid(body.job_id ?? body.jobId),
    scroll_depth: scrollDepth(body.scroll_depth ?? body.scrollDepth),
    metadata: safeMetadata(body.metadata),
  });

  if (error) return new Response(null, { status: error.code === 'PGRST205' ? 503 : 500 });
  return new Response(null, { status: 204 });
}

/**
 * Numbers for /analytics.
 *
 * The applications table stores a status and two timestamps, not a history of
 * every move, so nothing here can claim to know exactly when an employer
 * replied. What it can do is read the current status honestly and say so in
 * the copy: a row sitting on `interviewing` is proof a reply happened, and
 * `updated_at` is the closest timestamp we have for when it did.
 *
 * Everything below is pure apart from `readApplicationRows`, so the page can be
 * rendered against fixtures and the maths can be checked without a session.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/** Postgres codes for "no such table" and "no such column". */
const MISSING = new Set(['42P01', '42703']);

/** Only what the maths needs. Notes and links would be dead weight here. */
export type InsightRow = {
  job_url: string;
  job_title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const COLUMNS = 'job_url,job_title,status,created_at,updated_at';

export type InsightRead = { rows: InsightRow[]; ready: boolean };

/** Every row this account owns, oldest cared about last. Never throws. */
export async function readApplicationRows(
  supabase: SupabaseClient,
  userId: string,
): Promise<InsightRead> {
  const { data, error } = await supabase
    .from('applications')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    if (!MISSING.has(error.code)) console.error('readApplicationRows', error);
    return { rows: [], ready: !MISSING.has(error.code) };
  }

  return { rows: (data as InsightRow[] | null) ?? [], ready: true };
}

/* ------------------------------------------------------------------ */
/* status buckets                                                      */
/* ------------------------------------------------------------------ */

/** Saved rows were never sent, so they stay out of every rate below. */
const NOT_SENT = new Set(['saved']);
/** A human on the other end typed something back. Rejection counts. */
const RESPONDED = new Set(['interviewing', 'offer', 'accepted', 'rejected']);
const INTERVIEWED = new Set(['interviewing', 'offer', 'accepted']);
const OFFERED = new Set(['offer', 'accepted']);

export const STATUS_LABEL: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  follow_up: 'Followed up',
  interviewing: 'Interviewing',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Ghosted / withdrawn',
};

/** Borrowed from the tracker's palette so the same status is the same colour. */
export const STATUS_COLOR: Record<string, string> = {
  saved: '#b9b4ac',
  applied: '#6b78d6',
  follow_up: '#c98a3c',
  interviewing: '#0d9b8a',
  offer: '#2f7a45',
  accepted: '#1f6b3a',
  rejected: '#c26a80',
  withdrawn: '#8d8880',
};

const STATUS_ORDER = [
  'applied',
  'follow_up',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
  'saved',
];

/* ------------------------------------------------------------------ */
/* sources                                                             */
/* ------------------------------------------------------------------ */

export type SourceKey = 'olj' | 'remoteok' | 'upwork' | 'manual';

export const SOURCE_LABEL: Record<SourceKey, string> = {
  olj: 'OnlineJobs.ph',
  remoteok: 'RemoteOK',
  upwork: 'Upwork',
  manual: 'Added by hand',
};

export function sourceOf(url: string): SourceKey {
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'manual';
  }
  if (host.endsWith('onlinejobs.ph')) return 'olj';
  if (host.includes('remoteok')) return 'remoteok';
  if (host.endsWith('upwork.com')) return 'upwork';
  return 'manual';
}

/* ------------------------------------------------------------------ */
/* job types                                                           */
/* ------------------------------------------------------------------ */

/**
 * Title keywords, not the niche labels themselves — a board search for
 * "general" matches nothing and "ea" matches half the alphabet. Deliberately
 * a small, hand-written list: a wrong bucket is worse than an honest "Other".
 */
const TYPE_KEYWORDS: { label: string; words: string[] }[] = [
  { label: 'Executive assistant', words: ['executive assistant', 'chief of staff', 'personal assistant', 'ea '] },
  { label: 'Operations', words: ['operations', 'ops ', ' ops', 'process', 'workflow', 'revops'] },
  { label: 'Project management', words: ['project manager', 'project management', 'program manager', 'scrum', 'delivery manager'] },
  { label: 'Customer support', words: ['customer support', 'customer service', 'help desk', 'client success', 'customer success'] },
  { label: 'SEO', words: ['seo', 'search engine', 'link building', 'keyword'] },
  { label: 'Content & writing', words: ['content', 'writer', 'copywriter', 'blog', 'editor', 'ghostwrit'] },
  { label: 'Social media', words: ['social media', 'community manager', 'instagram', 'tiktok'] },
  { label: 'Marketing', words: ['marketing', 'growth', 'demand gen', 'brand manager'] },
  { label: 'Sales & lead gen', words: ['lead generation', 'sales', 'sdr', 'appointment setter', 'outbound'] },
  { label: 'Design', words: ['design', 'canva', 'figma', 'creative'] },
  { label: 'Video', words: ['video edit', 'capcut', 'premiere', 'short form'] },
  { label: 'Bookkeeping', words: ['bookkeep', 'accounting', 'quickbooks', 'xero', 'payroll'] },
  { label: 'Web & no-code', words: ['web develop', 'webflow', 'wordpress', 'shopify theme', 'no-code', 'front end'] },
  { label: 'Data & research', words: ['data entry', 'data clean', 'research', 'lead list'] },
  { label: 'Admin / general VA', words: ['virtual assistant', 'admin', 'administrative', 'back office'] },
];

export function typeOf(title: string | null): string {
  const t = ` ${(title ?? '').toLowerCase()} `;
  if (t.trim().length === 0) return 'Untitled';
  for (const { label, words } of TYPE_KEYWORDS) {
    if (words.some((w) => t.includes(w))) return label;
  }
  return 'Other';
}

/* ------------------------------------------------------------------ */
/* dates                                                               */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000;

/** Monday of the week a timestamp falls in, as YYYY-MM-DD (UTC). */
function weekStart(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const dow = (new Date(utc).getUTCDay() + 6) % 7; // Monday = 0
  return new Date(utc - dow * DAY).toISOString().slice(0, 10);
}

function monthStart(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

/** Empty buckets matter: a gap week is the whole point of a trend chart. */
function emptyWeeks(count: number): string[] {
  const now = new Date();
  const thisWeek = weekStart(now.toISOString()) ?? now.toISOString().slice(0, 10);
  const base = new Date(`${thisWeek}T00:00:00Z`).getTime();
  return Array.from({ length: count }, (_, i) =>
    new Date(base - (count - 1 - i) * 7 * DAY).toISOString().slice(0, 10),
  );
}

function emptyMonths(count: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* the shape the page renders                                          */
/* ------------------------------------------------------------------ */

export type Slice = { key: string; label: string; value: number; color: string };
export type Bucket = { key: string; label: string; total: number; sent: number; replies: number };
export type TrendPoint = { key: string; label: string; value: number };
export type TypeRow = {
  label: string;
  sent: number;
  replies: number;
  interviews: number;
  offers: number;
  responseRate: number | null;
};

export type Insights = {
  total: number;
  sent: number;
  responded: number;
  interviews: number;
  offers: number;
  rejections: number;
  live: number;
  responseRate: number | null;
  interviewRate: number | null;
  offerRate: number | null;
  /** Mean days between a row appearing and its status moving past "applied". */
  avgResponseDays: number | null;
  medianResponseDays: number | null;
  /** Rows the timing average is built from. Small n deserves a caveat. */
  responseSample: number;
  statuses: Slice[];
  sources: Bucket[];
  types: TypeRow[];
  weekly: TrendPoint[];
  monthly: TrendPoint[];
  firstAt: string | null;
  lastAt: string | null;
};

const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : null);

const weekLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

const monthLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });

export function buildInsights(rows: InsightRow[]): Insights {
  const sentRows = rows.filter((r) => !NOT_SENT.has(r.status));
  const respondedRows = sentRows.filter((r) => RESPONDED.has(r.status));
  const interviewRows = sentRows.filter((r) => INTERVIEWED.has(r.status));
  const offerRows = sentRows.filter((r) => OFFERED.has(r.status));

  /* --- timing ------------------------------------------------------ */
  const gaps: number[] = [];
  for (const r of respondedRows) {
    const a = new Date(r.created_at).getTime();
    const b = new Date(r.updated_at).getTime();
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    const days = (b - a) / DAY;
    // A same-second update is a row that was imported already answered; it
    // tells us nothing about how fast anyone replied, so it stays out.
    if (days >= 0.02) gaps.push(days);
  }
  gaps.sort((x, y) => x - y);
  const avgResponseDays = gaps.length ? gaps.reduce((s, n) => s + n, 0) / gaps.length : null;
  const medianResponseDays = gaps.length
    ? gaps.length % 2
      ? gaps[(gaps.length - 1) / 2]
      : (gaps[gaps.length / 2 - 1] + gaps[gaps.length / 2]) / 2
    : null;

  /* --- statuses ---------------------------------------------------- */
  const statusCount = new Map<string, number>();
  for (const r of rows) statusCount.set(r.status, (statusCount.get(r.status) ?? 0) + 1);
  const statuses: Slice[] = [...statusCount.entries()]
    .sort((a, b) => STATUS_ORDER.indexOf(a[0]) - STATUS_ORDER.indexOf(b[0]))
    .map(([key, value]) => ({
      key,
      label: STATUS_LABEL[key] ?? key,
      value,
      color: STATUS_COLOR[key] ?? 'var(--color-faint)',
    }));

  /* --- sources ----------------------------------------------------- */
  const sourceAgg = new Map<SourceKey, Bucket>();
  for (const r of rows) {
    const key = sourceOf(r.job_url);
    const b =
      sourceAgg.get(key) ?? { key, label: SOURCE_LABEL[key], total: 0, sent: 0, replies: 0 };
    b.total += 1;
    if (!NOT_SENT.has(r.status)) b.sent += 1;
    if (RESPONDED.has(r.status)) b.replies += 1;
    sourceAgg.set(key, b);
  }
  const sources = [...sourceAgg.values()].sort((a, b) => b.total - a.total);

  /* --- job types --------------------------------------------------- */
  const typeAgg = new Map<string, TypeRow>();
  for (const r of sentRows) {
    const label = typeOf(r.job_title);
    const row =
      typeAgg.get(label) ??
      { label, sent: 0, replies: 0, interviews: 0, offers: 0, responseRate: null };
    row.sent += 1;
    if (RESPONDED.has(r.status)) row.replies += 1;
    if (INTERVIEWED.has(r.status)) row.interviews += 1;
    if (OFFERED.has(r.status)) row.offers += 1;
    typeAgg.set(label, row);
  }
  const types = [...typeAgg.values()]
    .map((t) => ({ ...t, responseRate: pct(t.replies, t.sent) }))
    // Best hit rate first, but a 1-of-1 shouldn't outrank a 6-of-12, so ties
    // and near-ties fall back to volume.
    .sort((a, b) => (b.responseRate ?? -1) - (a.responseRate ?? -1) || b.sent - a.sent)
    .slice(0, 8);

  /* --- trend ------------------------------------------------------- */
  const weekAgg = new Map<string, number>();
  const monthAgg = new Map<string, number>();
  for (const r of rows) {
    const w = weekStart(r.created_at);
    if (w) weekAgg.set(w, (weekAgg.get(w) ?? 0) + 1);
    const m = monthStart(r.created_at);
    if (m) monthAgg.set(m, (monthAgg.get(m) ?? 0) + 1);
  }
  const weekly = emptyWeeks(12).map((key) => ({
    key,
    label: weekLabel(key),
    value: weekAgg.get(key) ?? 0,
  }));
  const monthly = emptyMonths(6).map((key) => ({
    key,
    label: monthLabel(key),
    value: monthAgg.get(key) ?? 0,
  }));

  /* --- span -------------------------------------------------------- */
  const times = rows
    .map((r) => new Date(r.created_at).getTime())
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  return {
    total: rows.length,
    sent: sentRows.length,
    responded: respondedRows.length,
    interviews: interviewRows.length,
    offers: offerRows.length,
    rejections: sentRows.filter((r) => r.status === 'rejected').length,
    live: sentRows.filter((r) => r.status === 'applied' || r.status === 'follow_up' || r.status === 'interviewing').length,
    responseRate: pct(respondedRows.length, sentRows.length),
    interviewRate: pct(interviewRows.length, sentRows.length),
    offerRate: pct(offerRows.length, sentRows.length),
    avgResponseDays,
    medianResponseDays,
    responseSample: gaps.length,
    statuses,
    sources,
    types,
    weekly,
    monthly,
    firstAt: times.length ? new Date(times[0]).toISOString() : null,
    lastAt: times.length ? new Date(times[times.length - 1]).toISOString() : null,
  };
}

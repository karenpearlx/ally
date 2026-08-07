import { createClient as createPublicClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

// Use Verse's single browser client so RLS can grant paid accounts the 24-hour
// early-access window without a second auth client racing the session refresh.
//
// Created lazily: this module is also imported by the server-rendered homepage
// (countActiveJobs), and the browser client touches document.cookie the moment
// it is constructed.
let browserClient: ReturnType<typeof createClient> | null = null;

function jobsClient() {
  browserClient ??= createClient();
  return browserClient;
}

export interface Job {
  id: string;
  title: string;
  company: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_type: string | null;
  skills: string[] | null;
  experience_level: string | null;
  source: string;
  original_url: string;
  location: string | null;
  is_remote: boolean | null;
  posted_at: string | null;
  scraped_at: string;
}

export const SOURCE_META: Record<string, { label: string; short: string; bg: string; fg: string }> = {
  olj: { label: 'OnlineJobs.ph', short: 'OLJ', bg: '#eef2ff', fg: '#4453b8' },
  remoteok: { label: 'RemoteOK', short: 'RemoteOK', bg: '#fdf0e8', fg: '#b5581f' },
  wwr: { label: 'We Work Remotely', short: 'WWR', bg: '#e9f6ec', fg: '#2f7a45' },
  // Upwork is no longer scraped (the API application was rejected) and is gone
  // from the board's filter. The meta stays so any row still in the table from
  // the old sync renders a real label instead of the raw slug.
  upwork: { label: 'Upwork', short: 'Upwork', bg: '#eef2ff', fg: '#4453b8' },
};

export function sourceMeta(source: string) {
  return (
    SOURCE_META[source] ?? {
      label: source,
      short: source,
      bg: 'var(--color-paper-2)',
      fg: 'var(--color-ink-2)',
    }
  );
}

/**
 * Fetch active jobs.
 *
 * NOTE: this used to be `.order('scraped_at', desc).limit(100)`, which silently
 * hid every OnlineJobs.ph listing — the 100 newest rows were all RemoteOK, so
 * the 26 `source: 'olj'` rows never reached the client and the OLJ filter
 * always rendered empty. We now page through everything and sort in memory.
 */
export async function fetchJobs(): Promise<Job[]> {
  const PAGE = 1000;
  const all: Job[] = [];

  for (let page = 0; page < 10; page++) {
    const { data, error } = await jobsClient()
      .from('jobs')
      .select(
        'id,title,company,salary_min,salary_max,salary_currency,salary_type,skills,experience_level,source,original_url,location,is_remote,posted_at,scraped_at'
      )
      .eq('is_active', true)
      .order('scraped_at', { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1);

    if (error) throw error;
    if (!data?.length) break;
    all.push(...(data as Job[]));
    if (data.length < PAGE) break;
  }

  // posted_at is null for every OLJ row, so fall back to scraped_at
  return all.sort((a, b) => jobDate(b) - jobDate(a));
}

/**
 * The full description for one listing.
 *
 * Deliberately not part of fetchJobs: descriptions are the largest column by a
 * wide margin and the board renders 700+ rows, so pulling them for every card
 * would multiply the payload for text nobody reads until they click. Fetched
 * on demand instead, when someone actually asks for a letter.
 */
export async function fetchJobDescription(id: string): Promise<string> {
  const { data, error } = await jobsClient()
    .from('jobs')
    .select('description')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  const description = (data as { description?: string | null } | null)?.description;
  return typeof description === 'string' ? description : '';
}

export function jobDate(job: Job) {
  return new Date(job.posted_at ?? job.scraped_at).getTime();
}

/** OLJ rows store a placeholder company name. */
export function displayCompany(job: Job) {
  const c = (job.company ?? '').trim();
  if (!c || /^company on olj$/i.test(c)) {
    return job.source === 'olj' ? 'Client on OnlineJobs.ph' : 'Independent client';
  }
  return c;
}

export function formatSalary(job: Job) {
  if (!job.salary_min && !job.salary_max) return null;
  const cur = job.salary_currency ?? 'USD';
  const symbol = cur === 'PHP' ? '₱' : cur === 'USD' ? '$' : `${cur} `;
  const type =
    job.salary_type === 'hourly' ? '/hr' : job.salary_type === 'yearly' ? '/yr' : '/mo';
  if (job.salary_min && job.salary_max && job.salary_min !== job.salary_max) {
    return `${symbol}${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()}${type}`;
  }
  const amount = job.salary_min || job.salary_max;
  return `${symbol}${amount?.toLocaleString()}${type}`;
}

export function formatPostedAt(job: Job) {
  const raw = job.posted_at ?? job.scraped_at;
  if (!raw) return 'Recently';
  const then = new Date(raw);
  if (Number.isNaN(then.getTime())) return 'Recently';
  const hours = Math.floor((Date.now() - then.getTime()) / 3_600_000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString();
}

/**
 * Round a raw total down to a friendly threshold so the homepage stat never
 * looks like a fake-precise vanity metric, and never *overstates* the board.
 * Always rounds DOWN, so the claim is true at the moment it renders.
 *
 *   704  -> "700+"      (nearest hundred below 1,000)
 *   1940 -> "1,000+"    (nearest thousand at/above 1,000)
 *   2000 -> "2,000+"
 *   62   -> "62"        (too small to dress up)
 */
export function formatJobCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  // Always round down to nearest 100
  const rounded = Math.floor(n / 100) * 100;
  return `${rounded.toLocaleString('en-US')}+`;
}

/**
 * Live count of active listings, for the homepage stat.
 * `head: true` means Postgres returns the count only — no rows over the wire.
 */
export async function countActiveJobs(): Promise<number | null> {
  try {
    const supabase = createPublicClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { count, error } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    if (error) return null;
    return count ?? null;
  } catch {
    // Never let a stat lookup take down the homepage build or render.
    return null;
  }
}

/**
 * Server-side reads for /dashboard.
 *
 * The dashboard is a summary of things that already have their own page, so
 * nothing here owns state — it borrows the tracker's row mapping, the job
 * board's anon client and the profile's niche vocabulary, and every read
 * degrades to "nothing to show" rather than a 500. A home screen that cannot
 * render because one table is missing is worse than a home screen with an
 * empty card on it.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { App } from '@/lib/followups';
import { rowToApp, type AppRow } from '@/lib/tracker-remote';
import type { Job } from '@/lib/jobs';
import type { Niche } from '@/lib/cover-letter-templates';
import { nicheLabel } from '@/lib/profile';

/** Postgres codes for "no such table" and "no such column". */
const MISSING = new Set(['42P01', '42703']);

export type ApplicationsRead = {
  apps: App[];
  /** False when the applications table is not there yet. */
  ready: boolean;
};

/** Everything this account has tracked, newest first. */
export async function readApplications(
  supabase: SupabaseClient,
  userId: string,
): Promise<ApplicationsRead> {
  const { data, error } = await supabase
    .from('applications')
    .select('id,job_url,job_title,company,status,notes,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    if (!MISSING.has(error.code)) console.error('readApplications', error);
    return { apps: [], ready: !MISSING.has(error.code) };
  }

  return { apps: ((data as AppRow[] | null) ?? []).map(rowToApp), ready: true };
}

/* ------------------------------------------------------------------ */
/* job suggestions                                                     */
/* ------------------------------------------------------------------ */

/**
 * Words that actually appear in listings for each niche.
 *
 * Deliberately hand-written rather than derived from the niche label: a board
 * search for "general" matches nothing useful, and "ea" matches every word
 * containing those two letters. Kept lowercase; matching is substring on a
 * lowercased haystack, so multi-word entries work as phrases.
 */
const NICHE_KEYWORDS: Record<Niche, string[]> = {
  general: ['virtual assistant', 'admin assistant', 'administrative', 'general va', 'back office'],
  ea: ['executive assistant', 'chief of staff', 'calendar', 'inbox', 'personal assistant'],
  support: ['customer support', 'customer service', 'help desk', 'zendesk', 'gorgias', 'intercom'],
  data: ['data entry', 'data cleaning', 'crm data', 'research assistant', 'lead list'],
  realestate: ['real estate', 'mls', 'follow up boss', 'kvcore', 'transaction coordinator', 'listing'],
  seo: ['seo', 'search engine', 'keyword', 'ahrefs', 'semrush', 'link building', 'on-page'],
  writer: ['content writer', 'copywriter', 'blog', 'writing', 'editor', 'ghostwriter'],
  social: ['social media', 'instagram', 'tiktok', 'community manager', 'content creator'],
  email: ['email marketing', 'klaviyo', 'mailchimp', 'newsletter', 'lifecycle', 'crm email'],
  sales: ['lead generation', 'sales development', 'sdr', 'appointment setter', 'outbound', 'apollo'],
  design: ['graphic design', 'designer', 'canva', 'figma', 'brand', 'creative'],
  video: ['video editor', 'video editing', 'capcut', 'premiere', 'youtube', 'short form'],
  ops: ['operations', 'ops', 'sop', 'process', 'chief of staff', 'workflow'],
  pm: ['project manager', 'project management', 'asana', 'clickup', 'program manager', 'scrum'],
  bookkeeping: ['bookkeep', 'accounting', 'quickbooks', 'xero', 'accounts payable', 'payroll'],
  web: ['web developer', 'webflow', 'wordpress', 'front end', 'shopify theme', 'no-code'],
  ecommerce: ['ecommerce', 'e-commerce', 'shopify', 'amazon', 'product listing', 'store manager'],
};

const JOB_COLUMNS =
  'id,title,company,salary_min,salary_max,salary_currency,salary_type,skills,experience_level,source,original_url,location,is_remote,posted_at,scraped_at';

export type SuggestedJob = {
  job: Job;
  /** Niche label that earned it a place, or null when it is simply new. */
  because: string | null;
};

/**
 * A handful of recent listings, ranked against the niches on the profile.
 *
 * Only the newest slice is scored. Ranking the full 700-row board on every
 * dashboard render would cost far more than the four cards are worth, and a
 * six-week-old listing is not a suggestion, it is an archive.
 */
export async function suggestJobs(supabase: SupabaseClient, niches: Niche[], limit = 4): Promise<SuggestedJob[]> {
  let rows: Job[] = [];
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(JOB_COLUMNS)
      .eq('is_active', true)
      .order('scraped_at', { ascending: false })
      .limit(240);
    if (error) throw error;
    rows = (data as Job[] | null) ?? [];
  } catch (error) {
    console.error('suggestJobs', error);
    return [];
  }

  if (!rows.length) return [];
  if (!niches.length) return rows.slice(0, limit).map((job) => ({ job, because: null }));

  const scored = rows.map((job) => {
    const title = job.title.toLowerCase();
    const skills = (job.skills ?? []).join(' ').toLowerCase();
    let score = 0;
    let best: Niche | null = null;

    for (const niche of niches) {
      let hit = 0;
      for (const word of NICHE_KEYWORDS[niche] ?? []) {
        if (title.includes(word)) hit += 3;
        else if (skills.includes(word)) hit += 1;
      }
      if (hit > 0) score += hit;
      // First niche to score wins the label — the picker's order is the
      // person's own priority order, so it is the honest one to name.
      if (hit > 0 && best === null) best = niche;
    }

    return { job, score, because: best ? nicheLabel(best) : null };
  });

  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Never show an empty shelf: top up with the newest listings.
  if (matched.length < limit) {
    const taken = new Set(matched.map((m) => m.job.id));
    for (const job of rows) {
      if (matched.length >= limit) break;
      if (taken.has(job.id)) continue;
      matched.push({ job, score: 0, because: null });
    }
  }

  return matched.map(({ job, because }) => ({ job, because }));
}

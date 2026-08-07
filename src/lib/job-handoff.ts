/**
 * Handing a listing from the job board to the cover letter builder.
 *
 * A job description is thousands of characters. Putting that in the URL means
 * a link that breaks at the server's header limit, shows up in referrer
 * headers and access logs, and is unshareable anyway because the next person
 * doesn't have the listing. So the payload goes into sessionStorage under a
 * random key and only the key travels in the URL.
 *
 * Title and company still ride along as short query parameters, so the builder
 * is useful even when sessionStorage is unavailable (Safari lockdown, a
 * hard-refreshed link, a new tab).
 *
 * sessionStorage, not localStorage: the handoff is meant to be read once, by
 * this tab, seconds later.
 */

const PREFIX = 'ally-job-handoff:';
const MAX_ENTRIES = 6;
const MAX_DESCRIPTION = 20_000;
const MAX_SHORT = 200;

export const JOB_PARAM = 'job';
export const ROLE_PARAM = 'role';
export const COMPANY_PARAM = 'company';

export type JobHandoff = {
  id: string;
  title: string;
  company: string;
  url: string;
  description: string;
  source: string;
  pay: string;
  skills: string[];
};

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

function short(value: unknown, max = MAX_SHORT) {
  return typeof value === 'string' ? value.replace(CONTROL, '').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function block(value: unknown, max: number) {
  return typeof value === 'string'
    ? value.replace(CONTROL, '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max)
    : '';
}

function safeUrl(value: unknown) {
  const raw = short(value, 2048);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

/** Bounded and stripped, whichever side of the handoff it comes from. */
export function sanitiseHandoff(value: unknown): JobHandoff | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const title = short(raw.title);
  if (!title) return null;
  return {
    id: short(raw.id, 64),
    title,
    company: short(raw.company),
    url: safeUrl(raw.url),
    description: block(raw.description, MAX_DESCRIPTION),
    source: short(raw.source, 32),
    pay: short(raw.pay, 64),
    skills: Array.isArray(raw.skills)
      ? raw.skills.map((s) => short(s, 40)).filter(Boolean).slice(0, 12)
      : [],
  };
}

function randomKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Keep a handful of recent handoffs at most; the rest is litter. */
function prune() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    while (keys.length >= MAX_ENTRIES) {
      const oldest = keys.shift();
      if (oldest) sessionStorage.removeItem(oldest);
    }
  } catch {
    /* storage blocked; the query fallback still works */
  }
}

/** Store the listing, return the key to put in the URL (or null if blocked). */
export function stashJob(job: unknown): string | null {
  const clean = sanitiseHandoff(job);
  if (!clean) return null;
  const key = randomKey();
  try {
    prune();
    sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(clean));
    return key;
  } catch {
    return null;
  }
}

/** Read once and delete. A refresh should not silently re-apply a prefill. */
export function takeJob(key: string | null): JobHandoff | null {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    sessionStorage.removeItem(`${PREFIX}${key}`);
    return sanitiseHandoff(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/**
 * The text the builder pastes into its listing box.
 *
 * Rebuilt from the row rather than stored twice, and it reads like something a
 * person would have pasted, because that is exactly what the detectors and the
 * templates are tuned for.
 */
export function handoffToListing(job: JobHandoff) {
  const head = [
    `${job.title}${job.company ? ` at ${job.company}` : ''}`,
    job.pay ? `Rate: ${job.pay}` : '',
    job.skills.length ? `Skills: ${job.skills.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return [head, job.description, job.url].filter(Boolean).join('\n\n').trim();
}

/** `/cover-letter?job=…&role=…&company=…` */
export function coverLetterHref(key: string | null, job: { title: string; company: string }) {
  const params = new URLSearchParams();
  if (key) params.set(JOB_PARAM, key);
  if (job.title) params.set(ROLE_PARAM, short(job.title, 120));
  if (job.company) params.set(COMPANY_PARAM, short(job.company, 120));
  const query = params.toString();
  return query ? `/cover-letter?${query}` : '/cover-letter';
}

/**
 * "You came here from the board."
 *
 * The builder can't tell where you arrived from — a client-side push doesn't
 * update document.referrer, and history.length lies. So the board leaves a flag
 * in sessionStorage on its way out and the builder reads it to decide whether a
 * back control makes sense. Same tab, same session, cleared when you leave.
 */
const RETURN_KEY = 'ally-jobs-return';

export function markJobsReturn() {
  try {
    sessionStorage.setItem(RETURN_KEY, '1');
  } catch {
    /* storage blocked: the builder just won't offer the back link */
  }
}

export function cameFromJobs(): boolean {
  try {
    return sessionStorage.getItem(RETURN_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearJobsReturn() {
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    /* nothing to clear */
  }
}

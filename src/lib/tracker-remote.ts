/**
 * Account-backed storage for the tracker.
 *
 * The tracker started life as a localStorage list, and the nav bell still reads
 * that key. So when someone is signed in we treat `/api/applications` as the
 * source of truth and keep localStorage as a mirror — the bell stays honest and
 * an offline reload still shows something.
 *
 * The database column set is wider than the six statuses the UI exposes, so the
 * two maps below are the only place that translation lives.
 */

import type { App, Status } from '@/lib/followups';

/** Row shape returned by /api/applications. */
export type AppRow = {
  id: string;
  job_url: string;
  job_title: string | null;
  company: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

/**
 * UI status → database status.
 *
 * "Ghosted" has no database equivalent; `withdrawn` is the closest bucket that
 * already passes the check constraint, and it round-trips back to Ghosted.
 * Changing that needs a migration, and migrations here are run by hand.
 */
const TO_DB: Record<Status, string> = {
  Saved: 'saved',
  Applied: 'applied',
  Interviewing: 'interviewing',
  Offer: 'offer',
  Rejected: 'rejected',
  Ghosted: 'withdrawn',
};

/** Database status → UI status. Wider, because rows can come from the API. */
const TO_UI: Record<string, Status> = {
  saved: 'Saved',
  applied: 'Applied',
  follow_up: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  accepted: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Ghosted',
};

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function rowToApp(row: AppRow): App {
  return {
    id: row.id,
    role: row.job_title?.trim() || 'Untitled role',
    company: row.company?.trim() || hostOf(row.job_url) || '—',
    url: row.job_url,
    status: TO_UI[row.status] ?? 'Applied',
    notes: row.notes ?? '',
    appliedAt: (row.created_at ?? '').slice(0, 10),
  };
}

async function readError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error?.trim() || fallback;
  } catch {
    return fallback;
  }
}

/** 401 is not an error here — it just means "you are not signed in". */
export class NotSignedIn extends Error {}

/**
 * A failed request that kept its status code.
 *
 * The saved-job limit comes back as a 403 with a message written by the
 * database function, and the UI wants to show that message *and* a link to
 * /pricing. Losing the status turns both of those into guesswork.
 */
export class RequestFailed extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function listApplications(signal?: AbortSignal): Promise<App[]> {
  const response = await fetch('/api/applications?limit=100', { signal, cache: 'no-store' });
  if (response.status === 401) throw new NotSignedIn();
  if (!response.ok) throw new Error(await readError(response, 'Could not load your applications.'));
  const body = (await response.json()) as { applications?: AppRow[] };
  return (body.applications ?? []).map(rowToApp);
}

export type NewApp = { role: string; company: string; url: string; status: Status; notes: string };

export async function createApplication(draft: NewApp): Promise<App> {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      job_url: draft.url.trim(),
      job_title: draft.role.trim() || null,
      company: draft.company.trim() || null,
      status: TO_DB[draft.status],
      notes: draft.notes.trim() || null,
    }),
  });
  if (response.status === 401) throw new NotSignedIn();
  if (!response.ok) {
    throw new RequestFailed(await readError(response, 'Could not save that application.'), response.status);
  }
  const body = (await response.json()) as { application: AppRow };
  return rowToApp(body.application);
}

export async function patchApplication(id: string, patch: Partial<App>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.status) payload.status = TO_DB[patch.status];
  if (patch.notes !== undefined) payload.notes = patch.notes.trim() || null;
  if (patch.role !== undefined) payload.job_title = patch.role.trim() || null;
  if (patch.company !== undefined) payload.company = patch.company.trim() || null;
  if (!Object.keys(payload).length) return;

  const response = await fetch(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) throw new NotSignedIn();
  if (!response.ok) throw new Error(await readError(response, 'Could not save that change.'));
}

export async function deleteApplication(id: string): Promise<void> {
  const response = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
  if (response.status === 401) throw new NotSignedIn();
  if (!response.ok && response.status !== 404) {
    throw new Error(await readError(response, 'Could not delete that application.'));
  }
}

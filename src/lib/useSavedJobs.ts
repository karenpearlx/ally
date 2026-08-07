'use client';

/**
 * The bookmark on a job card.
 *
 * Saving a listing is just an application row with status "Saved", so the board
 * and the tracker are the same list seen from two ends — bookmark something
 * here and it is already sitting in the Saved column when you open /tracker.
 *
 * Signed in, `/api/applications` is the truth and localStorage is kept as a
 * mirror (the nav bell reads that key). Signed out we still save, but only to
 * this browser, and the caller is told so it can say that out loud rather than
 * pretending the row went somewhere.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { STORE, announceAppsChanged, type App } from '@/lib/followups';
import {
  NotSignedIn,
  RequestFailed,
  createApplication,
  deleteApplication,
  isHttpUrl,
  listApplications,
} from '@/lib/tracker-remote';
import { useAuth } from '@/lib/AuthContext';

export type SavableJob = {
  title: string;
  company: string;
  url: string;
};

/** Two rows for the same listing should never both exist, so the URL is the
 *  identity and it is compared loosely: case and a trailing slash are noise. */
export function jobKey(url: string): string {
  return url.trim().toLowerCase().replace(/\/+$/, '');
}

function readLocal(): App[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORE) ?? '[]');
    return Array.isArray(parsed) ? (parsed as App[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(next: App[]) {
  try {
    localStorage.setItem(STORE, JSON.stringify(next));
    announceAppsChanged();
  } catch {
    /* storage blocked: the in-memory state still reflects the click */
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function indexOf(apps: App[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const app of apps) {
    if (typeof app?.url === 'string' && app.url) map.set(jobKey(app.url), app.id);
  }
  return map;
}

export type SaveNotice = {
  tone: 'info' | 'error';
  text: string;
  /** Rendered as a link beside the message. Set when the backend refused on plan grounds. */
  action?: { href: string; label: string };
} | null;

export function useSavedJobs() {
  const { status: authStatus } = useAuth();
  /** url key → row id. Present means saved. */
  const [saved, setSaved] = useState<Map<string, string>>(new Map());
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<SaveNotice>(null);
  const cloud = useRef(false);
  const ready = useRef(false);

  useEffect(() => {
    if (authStatus === 'unknown') return;
    let alive = true;

    void (async () => {
      if (authStatus === 'out') {
        cloud.current = false;
        if (alive) {
          setSaved(indexOf(readLocal()));
          ready.current = true;
        }
        return;
      }
      try {
        const rows = await listApplications();
        if (!alive) return;
        cloud.current = true;
        setSaved(indexOf(rows));
      } catch (error) {
        if (!alive) return;
        // A dead API shouldn't disable the bookmark — fall back to this device.
        void error;
        cloud.current = false;
        setSaved(indexOf(readLocal()));
      } finally {
        if (alive) ready.current = true;
      }
    })();

    return () => {
      alive = false;
    };
  }, [authStatus]);

  const isSaved = useCallback((url: string) => saved.has(jobKey(url)), [saved]);

  const toggle = useCallback(
    async (job: SavableJob) => {
      const key = jobKey(job.url);
      if (!key || pending) return;
      if (!isHttpUrl(job.url)) {
        setNotice({ tone: 'error', text: 'That listing has no usable link to save.' });
        return;
      }

      const existing = saved.get(key);
      setPending(key);
      setNotice(null);

      try {
        if (existing) {
          if (cloud.current) await deleteApplication(existing);
          writeLocal(readLocal().filter((a) => jobKey(a.url ?? '') !== key));
          setSaved((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
          setNotice({ tone: 'info', text: 'Removed from your tracker.' });
          return;
        }

        let id = newId();
        if (cloud.current) {
          const row = await createApplication({
            role: job.title,
            company: job.company,
            url: job.url,
            status: 'Saved',
            notes: '',
          });
          id = row.id;
        }

        const row: App = {
          id,
          role: job.title || 'Untitled role',
          company: job.company || '—',
          url: job.url,
          status: 'Saved',
          notes: '',
          appliedAt: today(),
        };
        const local = readLocal().filter((a) => jobKey(a.url ?? '') !== key);
        writeLocal([row, ...local]);
        setSaved((prev) => new Map(prev).set(key, id));
        setNotice(
          cloud.current
            ? { tone: 'info', text: 'Saved to your tracker.' }
            : { tone: 'info', text: 'Saved on this device. Sign in to keep it.' },
        );
      } catch (error) {
        if (error instanceof NotSignedIn) {
          cloud.current = false;
          setNotice({ tone: 'error', text: 'Your session expired. Sign in to save this job.' });
        } else {
          // A 403 here is the free saved-job ceiling. The backend writes the
          // sentence; all this adds is somewhere to go about it.
          const limited = error instanceof RequestFailed && error.status === 403;
          setNotice({
            tone: 'error',
            text: error instanceof Error && error.message ? error.message : 'Could not save that job.',
            action: limited ? { href: '/pricing', label: 'See Pro' } : undefined,
          });
        }
      } finally {
        setPending(null);
      }
    },
    [pending, saved],
  );

  const dismissNotice = useCallback(() => setNotice(null), []);

  return { isSaved, toggle, pending, notice, dismissNotice, signedOut: authStatus === 'out' };
}

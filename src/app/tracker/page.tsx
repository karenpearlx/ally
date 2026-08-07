'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
  type App,
  type Status,
  STATUSES,
  STORE,
  STORE_DAYS,
  DEFAULT_DAYS,
  announceAppsChanged,
  daysAgo,
  daysSince,
  needsFollowUp as isOverdue,
} from '@/lib/followups';

const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  Saved: { bg: '#f1efec', fg: '#7d7a75' },
  Applied: { bg: '#eef2ff', fg: '#4453b8' },
  Interviewing: { bg: '#e6f4f1', fg: '#0a7d6f' },
  Offer: { bg: '#e9f6ec', fg: '#2f7a45' },
  Rejected: { bg: '#fbecef', fg: '#a83d55' },
  Ghosted: { bg: '#f2f0ee', fg: '#8b8781' },
};

const SEED: App[] = [
  {
    id: 's1',
    role: 'Executive Assistant to Founder',
    company: 'Northwind Labs',
    url: 'https://www.onlinejobs.ph/jobseekers/job/executive-assistant-1701954',
    status: 'Interviewing',
    notes: 'Second call booked. They asked about Notion + inbox triage.',
    appliedAt: daysAgo(2),
  },
  {
    id: 's2',
    role: 'SEO Content Manager',
    company: 'Peakline Media',
    url: 'https://remoteok.com/remote-jobs/seo-content-manager',
    status: 'Applied',
    notes: 'Sent portfolio + 2 sample briefs.',
    appliedAt: daysAgo(7),
  },
  {
    id: 's3',
    role: 'Ops Coordinator',
    company: 'Salt & Stone',
    url: 'https://www.onlinejobs.ph/jobseekers/job/ops-coordinator-1660483',
    status: 'Applied',
    notes: '',
    appliedAt: daysAgo(6),
  },
];

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}

function Tracker() {
  const params = useSearchParams();
  const [apps, setApps] = useState<App[]>([]);
  const [ready, setReady] = useState(false);
  const [followUpDays, setFollowUpDays] = useState(DEFAULT_DAYS);
  // Deep link from the nav bell: /tracker?filter=followup
  const [filter, setFilter] = useState<'all' | 'followup' | Status>(
    params.get('filter') === 'followup' ? 'followup' : 'all',
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ role: '', company: '', url: '', status: 'Applied' as Status, notes: '' });
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      setApps(raw ? JSON.parse(raw) : SEED);
      const d = localStorage.getItem(STORE_DAYS);
      if (d) setFollowUpDays(Number(d) || DEFAULT_DAYS);
    } catch {
      setApps(SEED);
    }
    setReady(true);
  }, []);

  // persist
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORE, JSON.stringify(apps));
    announceAppsChanged(); // same-tab listeners (the nav bell) don't get `storage`
  }, [apps, ready]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORE_DAYS, String(followUpDays));
    announceAppsChanged();
  }, [followUpDays, ready]);

  const needsFollowUp = (a: App) => isOverdue(a, followUpDays);

  const followUpCount = useMemo(() => apps.filter(needsFollowUp).length, [apps, followUpDays]);

  const visible = useMemo(() => {
    const list =
      filter === 'all'
        ? apps
        : filter === 'followup'
          ? apps.filter(needsFollowUp)
          : apps.filter((a) => a.status === filter);
    return [...list].sort((a, b) => {
      const fa = needsFollowUp(a) ? 0 : 1;
      const fb = needsFollowUp(b) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return b.appliedAt.localeCompare(a.appliedAt);
    });
  }, [apps, filter, followUpDays]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.role.trim() && !draft.url.trim()) return;
    const host = hostOf(draft.url);
    setApps((prev) => [
      {
        id: crypto.randomUUID(),
        role: draft.role.trim() || 'Untitled role',
        company: draft.company.trim() || host || '—',
        url: draft.url.trim(),
        status: draft.status,
        notes: draft.notes.trim(),
        appliedAt: daysAgo(0),
      },
      ...prev,
    ]);
    setDraft({ role: '', company: '', url: '', status: 'Applied', notes: '' });
    setOpen(false);
  };

  const patch = (id: string, p: Partial<App>) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...p } : a)));
  const remove = (id: string) => setApps((prev) => prev.filter((a) => a.id !== id));

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of apps) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [apps]);

  return (
    <div className="min-h-screen">
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Application tracker</p>
          <h1 className="display-lg mt-4">
            Everything you&rsquo;ve sent<span className="dot">.</span>
          </h1>
          <p className="lede mt-5 max-w-xl">
            One list instead of twelve browser tabs. Anything untouched past{' '}
            {followUpDays} days gets flagged so you actually follow up.
          </p>

          {/* summary */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Tracked
              </p>
              <p className="font-display mt-1 text-3xl font-extrabold tracking-tight">
                {ready ? apps.length : '—'}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                In play
              </p>
              <p className="font-display mt-1 text-3xl font-extrabold tracking-tight">
                {ready ? (counts.Applied ?? 0) + (counts.Interviewing ?? 0) : '—'}
              </p>
            </div>
            <div className="card p-5" style={followUpCount ? { background: '#fdf0e8' } : undefined}>
              <p className="text-sm" style={{ color: followUpCount ? '#8a4318' : 'var(--color-muted)' }}>
                Need a nudge
              </p>
              <p
                className="font-display mt-1 text-3xl font-extrabold tracking-tight"
                style={{ color: followUpCount ? '#b5581f' : undefined }}
              >
                {ready ? followUpCount : '—'}
              </p>
            </div>
          </div>

          {/* controls */}
          <div className="card mt-5 p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary" onClick={() => setOpen((v) => !v)}>
                {open ? 'Cancel' : '+ Add application'}
              </button>

              <label
                className="ml-auto flex items-center gap-2 text-sm"
                style={{ color: 'var(--color-muted)' }}
              >
                Remind me after
                <select
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(Number(e.target.value))}
                  className="rounded-full px-3 py-2 text-sm font-semibold"
                  style={{ border: '1px solid var(--color-line-2)', background: '#fff', color: 'var(--color-ink)' }}
                >
                  {[3, 5, 7, 10, 14].map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {open && (
              <form onSubmit={add} className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="url" className="mb-1.5 block text-sm font-medium">
                    Job listing URL
                  </label>
                  <input
                    id="url"
                    className="field"
                    placeholder="https://www.onlinejobs.ph/jobseekers/job/…"
                    value={draft.url}
                    onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
                    Role
                  </label>
                  <input
                    id="role"
                    className="field"
                    placeholder="Executive Assistant"
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="company" className="mb-1.5 block text-sm font-medium">
                    Company
                  </label>
                  <input
                    id="company"
                    className="field"
                    placeholder="Northwind Labs"
                    value={draft.company}
                    onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="status" className="mb-1.5 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="status"
                    className="field"
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    className="field"
                    rows={2}
                    placeholder="What you sent, who you spoke to, anything to remember."
                    value={draft.notes}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn btn-ink w-full !py-3.5">
                    Save application
                  </button>
                </div>
              </form>
            )}

            {/* filters */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="chip" data-on={filter === 'all'} onClick={() => setFilter('all')}>
                All <Pill n={apps.length} on={filter === 'all'} />
              </button>
              <button
                type="button"
                className="chip"
                data-on={filter === 'followup'}
                onClick={() => setFilter('followup')}
              >
                Needs follow-up <Pill n={followUpCount} on={filter === 'followup'} />
              </button>
              {STATUSES.map((s) => (
                <button key={s} type="button" className="chip" data-on={filter === s} onClick={() => setFilter(s)}>
                  {s} <Pill n={counts[s] ?? 0} on={filter === s} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* list */}
      <section className="px-5 pt-6 md:px-8">
        <div className="mx-auto max-w-5xl space-y-4">
          {ready &&
            visible.map((a) => {
              const flag = needsFollowUp(a);
              const st = STATUS_STYLE[a.status];
              const age = daysSince(a.appliedAt);
              const host = hostOf(a.url);
              return (
                <article key={a.id} className="card min-w-0 p-6 md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="wrap-anywhere font-display text-lg font-extrabold leading-snug tracking-tight">
                        {a.role}
                      </h2>
                      <p className="wrap-anywhere mt-0.5 text-sm" style={{ color: 'var(--color-muted)' }}>
                        {a.company}
                        {host && (
                          <>
                            {' · '}
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tap underline underline-offset-2"
                            >
                              {host}
                            </a>
                          </>
                        )}
                      </p>
                    </div>

                    <select
                      aria-label={`Status for ${a.role}`}
                      value={a.status}
                      onChange={(e) => patch(a.id, { status: e.target.value as Status })}
                      className="tap-control flex-none rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold"
                      style={{ background: st.bg, color: st.fg, border: 'none' }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {flag && (
                    <div
                      className="mt-4 flex items-start gap-2.5 rounded-xl p-3"
                      style={{ background: '#fdf0e8' }}
                    >
                      <span aria-hidden>🔔</span>
                      <p className="text-[0.8125rem] leading-relaxed" style={{ color: '#8a4318' }}>
                        No movement in <strong>{age} days</strong>. A one-line follow-up is the
                        cheapest thing you can do today.
                      </p>
                    </div>
                  )}

                  {editingNotes === a.id ? (
                    <div className="mt-4">
                      <textarea
                        className="field"
                        rows={3}
                        autoFocus
                        value={a.notes}
                        onChange={(e) => patch(a.id, { notes: e.target.value })}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost mt-2 !py-2 !text-sm"
                        onClick={() => setEditingNotes(null)}
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingNotes(a.id)}
                      className="wrap-anywhere mt-4 block w-full rounded-xl p-3 text-left text-[0.875rem] leading-relaxed"
                      style={{
                        background: 'var(--color-paper-2)',
                        color: a.notes ? 'var(--color-ink-2)' : 'var(--color-faint)',
                      }}
                    >
                      {a.notes || 'Add a note…'}
                    </button>
                  )}

                  <div
                    className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs"
                    style={{ borderColor: 'var(--color-line)', color: 'var(--color-faint)' }}
                  >
                    <span>
                      {age === 0 ? 'Added today' : `${age} day${age === 1 ? '' : 's'} ago`}
                    </span>
                    <div className="flex gap-3">
                      <Link
                        href={`/cover-letter?role=${encodeURIComponent(a.role)}&company=${encodeURIComponent(a.company)}`}
                        className="tap underline underline-offset-2"
                      >
                        Write a follow-up
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(a.id)}
                        className="tap underline underline-offset-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

          {ready && visible.length === 0 && (
            <div className="card px-6 py-16 text-center">
              <p className="font-display text-xl font-extrabold tracking-tight">Nothing here yet</p>
              <p className="mx-auto mt-3 max-w-sm text-[0.9375rem]" style={{ color: 'var(--color-muted)' }}>
                {filter === 'all'
                  ? 'Add your first application, or save one straight from the job board.'
                  : 'Nothing in this bucket right now.'}
              </p>
              <Link href="/jobs" className="btn btn-ghost mt-6">
                Browse jobs
              </Link>
            </div>
          )}

          <p className="pt-2 text-center text-sm" style={{ color: 'var(--color-faint)' }}>
            Saved in this browser only, for now. Sign in to sync across devices.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Pill({ n, on }: { n: number; on: boolean }) {
  return (
    <span
      className="ml-1 rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums"
      style={{
        background: on ? 'rgba(255,255,255,.18)' : 'var(--color-paper-2)',
        color: on ? '#fff' : 'var(--color-muted)',
      }}
    >
      {n}
    </span>
  );
}

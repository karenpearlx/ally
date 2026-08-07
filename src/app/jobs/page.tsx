'use client';

import { useState, useEffect, useMemo } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
  fetchJobs,
  sourceMeta,
  displayCompany,
  formatSalary,
  formatPostedAt,
  type Job,
} from '@/lib/jobs';

const SOURCES = ['olj', 'remoteok', 'upwork'] as const;

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [paidOnly, setPaidOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchJobs()
      .then((rows) => {
        if (!cancelled) setJobs(rows);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Could not load jobs');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Counts per source, so an empty filter is never a mystery again. */
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    for (const j of jobs) c[j.source] = (c[j.source] ?? 0) + 1;
    return c;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        (job.company ?? '').toLowerCase().includes(q) ||
        (job.skills ?? []).some((s) => s.toLowerCase().includes(q));
      const matchesSource = sourceFilter === 'all' || job.source === sourceFilter;
      const matchesPaid = !paidOnly || Boolean(job.salary_min || job.salary_max);
      return matchesSearch && matchesSource && matchesPaid;
    });
  }, [jobs, searchQuery, sourceFilter, paidOnly]);

  const clearAll = () => {
    setSearchQuery('');
    setSourceFilter('all');
    setPaidOnly(false);
  };

  return (
    <div className="min-h-screen">
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Live job board</p>
          <h1 className="display-lg mt-4">
            Every listing, side by side<span className="dot">.</span>
          </h1>
          <p className="lede mt-5 max-w-xl">
            Pulled from OnlineJobs.ph, RemoteOK and Upwork every 30 minutes. Tap through to apply on
            the original site.
          </p>

          <div className="card mt-10 p-4 md:p-5">
            <div
              className="flex items-center gap-2 rounded-full py-1.5 pl-5 pr-1.5"
              style={{ border: '1px solid var(--color-line-2)' }}
            >
              <input
                type="search"
                placeholder="Search roles or skills"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search jobs"
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none"
              />
              <span
                aria-hidden
                className="grid h-9 w-9 flex-none place-items-center rounded-full"
                style={{ background: 'var(--color-accent)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.4" stroke="#fff" strokeWidth="1.6" />
                  <path d="M9.4 9.4 12.5 12.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="chip"
                data-on={sourceFilter === 'all'}
                aria-pressed={sourceFilter === 'all'}
                onClick={() => setSourceFilter('all')}
              >
                All sources
                {!loading && <Count n={counts.all ?? 0} on={sourceFilter === 'all'} />}
              </button>

              {SOURCES.map((s) => {
                const meta = sourceMeta(s);
                const n = counts[s] ?? 0;
                const on = sourceFilter === s;
                const empty = !loading && n === 0;
                return (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    data-on={on}
                    aria-pressed={on}
                    disabled={empty}
                    title={
                      empty
                        ? s === 'upwork'
                          ? 'Upwork needs an API token — no listings synced yet'
                          : 'No listings from this source right now'
                        : undefined
                    }
                    style={empty ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                    onClick={() => !empty && setSourceFilter(s)}
                  >
                    {meta.label}
                    {!loading && <Count n={n} on={on} />}
                  </button>
                );
              })}

              <button
                type="button"
                className="chip"
                data-on={paidOnly}
                aria-pressed={paidOnly}
                onClick={() => setPaidOnly((v) => !v)}
              >
                Rate listed
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {loading
                ? 'Loading listings…'
                : `Showing ${filteredJobs.length} of ${jobs.length} listings`}
            </p>
            {!loading && (searchQuery || sourceFilter !== 'all' || paidOnly) && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm underline underline-offset-4"
                style={{ color: 'var(--color-muted)' }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 pt-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          {error && (
            <div className="card p-8 text-center">
              <p className="font-display text-xl font-extrabold tracking-tight">
                Couldn&rsquo;t load the board
              </p>
              <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                {error}
              </p>
            </div>
          )}

          {loading && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-6" style={{ opacity: 0.5 }}>
                  <div className="h-4 w-3/4 rounded-full" style={{ background: 'var(--color-paper-2)' }} />
                  <div className="mt-3 h-3 w-1/3 rounded-full" style={{ background: 'var(--color-paper-2)' }} />
                  <div className="mt-8 h-3 w-1/2 rounded-full" style={{ background: 'var(--color-paper-2)' }} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredJobs.map((job) => {
                const meta = sourceMeta(job.source);
                const pay = formatSalary(job);
                return (
                  <a
                    key={job.id}
                    href={job.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card group flex min-w-0 flex-col p-6 transition-transform duration-200 hover:-translate-y-0.5 md:p-7"
                  >
                    <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                      <h2 className="wrap-anywhere font-display min-w-0 text-lg font-extrabold leading-snug tracking-tight">
                        {job.title}
                      </h2>
                      <span
                        className="flex-none rounded-md px-2 py-1 text-[0.6875rem] font-semibold"
                        style={{ background: meta.bg, color: meta.fg }}
                      >
                        {meta.short}
                      </span>
                    </div>

                    <p className="wrap-anywhere text-sm" style={{ color: 'var(--color-muted)' }}>
                      {displayCompany(job)}
                    </p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-4 flex min-w-0 flex-wrap gap-1.5">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="wrap-anywhere rounded-md px-2 py-1 text-xs"
                            style={{ background: 'var(--color-paper-2)', color: 'var(--color-ink-2)' }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className="flex items-baseline justify-between gap-3 border-t pt-4"
                      style={{ borderColor: 'var(--color-line)', marginTop: 'auto', paddingTop: '1rem' }}
                    >
                      <span
                        className="font-display text-base font-extrabold"
                        style={{ color: pay ? 'var(--color-accent)' : 'var(--color-faint)' }}
                      >
                        {pay ?? 'Rate not listed'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-faint)' }}>
                        {formatPostedAt(job)}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="card px-6 py-16 text-center">
              <p className="font-display text-xl font-extrabold tracking-tight">
                Nothing matches that
              </p>
              <p className="mx-auto mt-3 max-w-sm text-[0.9375rem]" style={{ color: 'var(--color-muted)' }}>
                Try a broader keyword, or clear the source filter.
              </p>
              <button type="button" className="btn btn-ghost mt-6" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Count({ n, on }: { n: number; on: boolean }) {
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

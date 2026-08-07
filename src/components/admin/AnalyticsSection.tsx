'use client';

import { useState } from 'react';
import type { AnalyticsResponse } from '@/lib/admin/types';

import { BarRows, Timeline } from './charts';
import { useAdminResource } from './useAdminResource';
import {
  Empty,
  ErrorState,
  Note,
  Panel,
  SectionTitle,
  Skeleton,
  Stat,
  StatStrip,
  num,
  stamp,
  when,
} from './ui';

const RANGES = [7, 30, 90] as const;

export default function AnalyticsSection() {
  const [days, setDays] = useState<number>(30);
  const { data, error, loading, refreshing, reload } = useAdminResource<AnalyticsResponse>(
    `/api/admin/analytics?days=${days}`,
  );

  const notProvisioned = data?.provisioning.missing.includes('analytics_events');

  return (
    <div className="ad-fade space-y-5">
      <SectionTitle
        index="01 / Analytics"
        title="What people actually do"
        sub="Traffic, referrals and on-page behaviour for Versified. Everything here is read straight from the events table; nothing is sampled or estimated."
      />

      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((range) => (
          <button
            key={range}
            type="button"
            className="ad-btn"
            data-variant={days === range ? 'primary' : undefined}
            onClick={() => setDays(range)}
          >
            Last {range} days
          </button>
        ))}
        <button type="button" className="ad-btn ml-auto" onClick={reload} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {loading && !data ? (
        <div className="ad-panel p-5">
          <Skeleton rows={5} />
        </div>
      ) : null}

      {notProvisioned ? (
        <Note tone="warn">
          <p className="font-semibold" style={{ color: 'var(--ad-warn)' }}>
            No analytics are being collected yet
          </p>
          <p className="mt-1">
            The <code className="ad-mono">analytics_events</code> table does not exist, so every number below is
            blank rather than guessed. Paste{' '}
            <code className="ad-mono">src/app/api/admin/schema.sql</code> into the Supabase SQL editor once and
            these fill in on the next refresh. Events are keyed by a random session id, never an IP address.
          </p>
        </Note>
      ) : null}

      {data ? (
        <>
          <StatStrip cols={5}>
            <Stat label="Page views" value={num(data.totals.pageViews)} foot={`Last ${data.rangeDays} days`} />
            <Stat label="Visitors" value={num(data.totals.uniqueVisitors)} foot={`${num(data.totals.sessions)} sessions`} />
            <Stat label="Active last 7d" value={num(data.totals.activeVisitors)} foot="Distinct visitors" />
            <Stat label="Tracked clicks" value={num(data.totals.clicks)} foot={`${num(data.totals.jobViews)} listing opens`} />
            <Stat
              label="Avg scroll"
              value={data.totals.avgScrollDepth == null ? '—' : `${data.totals.avgScrollDepth}%`}
              foot="Depth reached per view"
            />
          </StatStrip>

          <Panel title="Traffic over time" hint="Bars are page views, the line is sessions.">
            <Timeline data={data.timeline} />
          </Panel>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title="Most viewed pages" flush>
              {data.pages.length ? (
                <div className="ad-scroll">
                  <table className="ad-table ad-stack">
                    <thead>
                      <tr>
                        <th>Path</th>
                        <th className="ad-right">Views</th>
                        <th className="ad-right">Sessions</th>
                        <th className="ad-right">Avg scroll</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.map((page) => (
                        <tr key={page.path}>
                          <td className="ad-mono max-w-[16rem] truncate" data-label="Path" title={page.path}>
                            {page.path}
                          </td>
                          <td className="ad-right font-semibold" data-label="Views">{num(page.views)}</td>
                          <td className="ad-right" data-label="Sessions">{num(page.sessions)}</td>
                          <td className="ad-right" data-label="Avg scroll">{page.avgScroll == null ? '—' : `${page.avgScroll}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No page views in this range.</Empty>
              )}
            </Panel>

            <Panel title="Where they came from" hint="Referrer hostname, grouped.">
              <BarRows
                rows={data.referrers.map((row) => ({ label: row.source, value: row.visits }))}
                emptyText="No referrers recorded."
              />
            </Panel>

            <Panel title="Most opened jobs" hint="Counted from clicks on a listing." flush>
              {data.topJobs.length ? (
                <div className="ad-scroll">
                  <table className="ad-table ad-stack">
                    <thead>
                      <tr>
                        <th>Listing</th>
                        <th className="ad-right">Opens</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topJobs.map((job) => (
                        <tr key={job.title}>
                          <td className="max-w-[22rem] truncate" data-label="Listing" title={job.title}>
                            {job.title}
                          </td>
                          <td className="ad-right font-semibold" data-label="Opens">{num(job.views)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No job clicks recorded.</Empty>
              )}
            </Panel>

            <Panel title="Search queries" hint="What people typed into the jobs search.">
              <BarRows
                rows={data.searches.map((row) => ({ label: row.query, value: row.count }))}
                emptyText="No searches recorded."
              />
            </Panel>

            <Panel title="Filter usage" hint="Which filters get touched, and with what value.">
              <BarRows
                rows={data.filters.map((row) => ({
                  label: `${row.filter}: ${row.value || 'any'}`,
                  value: row.count,
                }))}
                emptyText="No filter interactions recorded."
              />
            </Panel>

            <Panel title="Click log" flush>
              {data.clicks.length ? (
                <div className="ad-scroll">
                  <table className="ad-table ad-stack">
                    <thead>
                      <tr>
                        <th>Element</th>
                        <th>Target</th>
                        <th className="ad-right">Clicks</th>
                        <th className="ad-right">Last</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.clicks.map((click) => (
                        <tr key={`${click.label}-${click.target}`}>
                          <td data-label="Element">{click.label}</td>
                          <td className="ad-mono max-w-[14rem] truncate" data-label="Target" title={click.target}>
                            {click.target || '—'}
                          </td>
                          <td className="ad-right font-semibold" data-label="Clicks">{num(click.count)}</td>
                          <td className="ad-right" data-label="Last">{when(click.lastAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No clicks recorded.</Empty>
              )}
            </Panel>
          </div>

          <Panel
            title="Session timeline"
            hint="One row per browser session. No IP addresses, no names, no location."
            flush
          >
            {data.sessions.length ? (
              <div className="ad-scroll">
                <table className="ad-table ad-stack">
                  <thead>
                    <tr>
                      <th>Session</th>
                      <th>Started</th>
                      <th>Last seen</th>
                      <th className="ad-right">Views</th>
                      <th>Landed on</th>
                      <th>Came from</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sessions.map((session) => (
                      <tr key={session.sessionId}>
                        <td className="ad-mono" data-label="Session">{session.sessionId.slice(0, 8)}</td>
                        <td data-label="Started">{stamp(session.firstSeen)}</td>
                        <td data-label="Last seen">{when(session.lastSeen)}</td>
                        <td className="ad-right font-semibold" data-label="Views">{num(session.views)}</td>
                        <td className="ad-mono max-w-[12rem] truncate" data-label="Landed on" title={session.entryPath ?? ''}>
                          {session.entryPath ?? '—'}
                        </td>
                        <td className="max-w-[12rem] truncate" data-label="Came from" title={session.referrer ?? ''}>
                          {session.referrer ?? 'Direct'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>No sessions recorded yet.</Empty>
            )}
          </Panel>
        </>
      ) : null}
    </div>
  );
}

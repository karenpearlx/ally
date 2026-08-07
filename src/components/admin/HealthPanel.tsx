'use client';

import type { HealthCheck, HealthResponse } from '@/lib/admin/types';
import { useAdminResource } from './useAdminResource';
import { ErrorState, Note, Panel, Skeleton, when } from './ui';

const ORDER: Record<HealthCheck['status'], number> = { bad: 0, warn: 1, unknown: 2, ok: 3 };
const WORD: Record<HealthCheck['status'], string> = {
  bad: 'Open',
  warn: 'Needs attention',
  unknown: 'Could not check',
  ok: 'Fine',
};

/**
 * Everything that could quietly be wrong, checked live rather than assumed.
 *
 * The listings check is a real request: it asks Supabase to accept a write
 * from the public browser key against a row id that cannot exist. Nothing is
 * modified either way, and the status code is the answer.
 */
export default function HealthPanel() {
  const { data, error, loading, refreshing, reload } = useAdminResource<HealthResponse>('/api/admin/health');

  const checks = [...(data?.checks ?? [])].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status] || a.label.localeCompare(b.label),
  );
  const problems = checks.filter((check) => check.status === 'bad').length;

  return (
    <Panel
      title="Health and security"
      hint={data ? `Last checked ${when(data.checkedAt)}.` : 'Checking the database and the environment.'}
      action={
        <button type="button" className="ad-btn" onClick={reload} disabled={refreshing}>
          {refreshing ? 'Checking…' : 'Re-check'}
        </button>
      }
    >
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {loading && !data ? <Skeleton rows={5} /> : null}

      {data ? (
        <>
          {problems ? (
            <Note tone="warn">
              <p className="font-semibold" style={{ color: 'var(--ad-bad)' }}>
                {problems === 1 ? 'One thing needs fixing now' : `${problems} things need fixing now`}
              </p>
              <p className="mt-1">
                Anything marked <strong>Open</strong> below is a live problem, not a warning about the future.
              </p>
            </Note>
          ) : null}

          <ul className="ad-checks">
            {checks.map((check) => (
              <li key={check.id} data-status={check.status}>
                <span className="ad-checkdot" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                    {check.label}
                    <span className="ad-checkword">{WORD[check.status]}</span>
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] leading-snug" style={{ color: 'var(--color-muted)' }}>
                    {check.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {data.setupFile ? (
            <Note tone="warn">
              <p className="font-semibold" style={{ color: 'var(--ad-warn)' }}>
                There is SQL waiting to be run
              </p>
              <p className="mt-1">
                Open <code className="ad-mono">{data.setupFile}</code> from the repo, paste the whole file into
                the Supabase SQL editor and run it once. It is idempotent, so running it twice is harmless.
                {data.missingTables.length ? (
                  <>
                    {' '}
                    Missing right now:{' '}
                    {data.missingTables.map((table, index) => (
                      <span key={table}>
                        {index > 0 ? ', ' : ''}
                        <code className="ad-mono">{table}</code>
                      </span>
                    ))}
                    .
                  </>
                ) : null}
              </p>
            </Note>
          ) : null}
        </>
      ) : null}
    </Panel>
  );
}

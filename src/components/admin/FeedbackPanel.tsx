'use client';

import { useState } from 'react';
import type { FeedbackResponse } from '@/lib/admin/types';
import { useAdminResource } from './useAdminResource';
import { Empty, ErrorState, Note, Panel, Skeleton, Stat, StatStrip, Tag, num, when } from './ui';

/**
 * Course feedback, sorted by what is going wrong.
 *
 * The default order is worst first rather than newest first. Newest first is
 * what a feed does; this table exists to find the one lesson people keep
 * marking unhelpful, and burying that under yesterday's five-stars would
 * defeat the point.
 */
export default function FeedbackPanel() {
  const { data, error, loading, refreshing, reload } = useAdminResource<FeedbackResponse>('/api/admin/feedback');
  const [removing, setRemoving] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const notProvisioned = data?.provisioning.missing.includes('lesson_feedback');

  const remove = async (id: string) => {
    setRemoving(id);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/feedback?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!response.ok && response.status !== 204) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? `Failed with ${response.status}.`);
      }
      reload();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not delete that response.');
    } finally {
      setRemoving(null);
    }
  };

  const share = (lesson: { helpful: number; unhelpful: number }) => {
    const total = lesson.helpful + lesson.unhelpful;
    return total ? Math.round((lesson.helpful / total) * 100) : null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button type="button" className="ad-btn ml-auto" onClick={reload} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {actionError ? <ErrorState message={actionError} /> : null}

      {loading && !data ? (
        <div className="ad-panel p-5">
          <Skeleton rows={4} />
        </div>
      ) : null}

      {notProvisioned ? (
        <Note tone="warn">
          <p className="font-semibold" style={{ color: 'var(--ad-warn)' }}>
            Nobody can leave feedback yet
          </p>
          <p className="mt-1">
            The <code className="ad-mono">lesson_feedback</code> table does not exist, so the widget on each
            lesson has nowhere to write. Run{' '}
            <code className="ad-mono">supabase/2026-08-04-fix-feedback.sql</code> once and this fills in.
            Readers can leave feedback signed out; only admins can read all responses.
          </p>
        </Note>
      ) : null}

      {data && !notProvisioned ? (
        <>
          <StatStrip cols={4}>
            <Stat label="Responses" value={num(data.totals.responses)} />
            <Stat label="Marked helpful" value={num(data.totals.helpful)} />
            <Stat label="Marked unhelpful" value={num(data.totals.unhelpful)} />
            <Stat label="With a comment" value={num(data.totals.comments)} />
          </StatStrip>

          <Panel title="By lesson" hint="Most complained-about first. This is the queue, not a leaderboard." flush>
            {data.lessons.length ? (
              <div className="ad-scroll">
                <table className="ad-table ad-stack">
                  <thead>
                    <tr>
                      <th>Lesson</th>
                      <th className="ad-right">Responses</th>
                      <th className="ad-right">Helpful</th>
                      <th className="ad-right">Unhelpful</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lessons.map((lesson) => {
                      const percent = share(lesson);
                      return (
                        <tr key={`${lesson.courseSlug}-${lesson.lessonIndex}`}>
                          <td data-label="Lesson">
                            <span className="block font-semibold" style={{ color: 'var(--color-ink)' }}>
                              {lesson.lessonTitle}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                              {lesson.courseTitle} · lesson {lesson.lessonIndex + 1}
                            </span>
                          </td>
                          <td className="ad-right font-semibold" data-label="Responses">
                            {num(lesson.responses)}
                          </td>
                          <td className="ad-right" data-label="Helpful">
                            {num(lesson.helpful)}
                            {percent != null ? (
                              <span className="block text-xs" style={{ color: 'var(--color-faint)' }}>
                                {percent}%
                              </span>
                            ) : null}
                          </td>
                          <td className="ad-right" data-label="Unhelpful">
                            {lesson.unhelpful > 0 ? (
                              <span style={{ color: 'var(--ad-bad)', fontWeight: 600 }}>{num(lesson.unhelpful)}</span>
                            ) : (
                              num(lesson.unhelpful)
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty>No feedback has been left yet.</Empty>
            )}
          </Panel>

          <Panel title="What people actually wrote" hint="Newest first. Delete anything that is spam." flush>
            {data.recent.length ? (
              <ul className="ad-feed">
                {data.recent.map((row) => (
                  <li key={row.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      {row.helpful === true ? <Tag tone="good">Helpful</Tag> : null}
                      {row.helpful === false ? <Tag tone="bad">Not helpful</Tag> : null}
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {row.lessonTitle} · {row.courseTitle}
                      </span>
                      <span className="ml-auto flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--color-faint)' }}>
                          {row.signedIn ? 'signed in' : 'anonymous'} · {when(row.createdAt)}
                        </span>
                        <button
                          type="button"
                          className="ad-btn"
                          data-variant="danger"
                          disabled={removing === row.id}
                          onClick={() => void remove(row.id)}
                        >
                          {removing === row.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </span>
                    </div>
                    {row.comment ? (
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
                        {row.comment}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm italic" style={{ color: 'var(--color-faint)' }}>
                        No comment left.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Nothing written in yet.</Empty>
            )}
          </Panel>
        </>
      ) : null}
    </div>
  );
}

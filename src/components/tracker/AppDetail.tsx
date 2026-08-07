'use client';

/**
 * The one card, opened up. Board view has no room for notes, the status select
 * or delete, so everything the list row can do lives in here instead.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { STATUSES, daysSince, type App, type Status } from '@/lib/followups';
import { NUDGE, STATUS_STYLE } from '@/lib/tracker-status';

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export default function AppDetail({
  app,
  overdue,
  onPatch,
  onDelete,
  onClose,
}: {
  app: App;
  overdue: boolean;
  onPatch: (patch: Partial<App>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(app.notes);
  const [confirming, setConfirming] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const closer = useRef<HTMLButtonElement>(null);

  // Focus lands inside the dialog, Escape leaves it, and Tab cannot walk out
  // into the page behind. Returning focus is handled by the caller, which is
  // the only thing that knows which card was clicked.
  useEffect(() => {
    closer.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const saveNotes = () => {
    if (notes !== app.notes) onPatch({ notes });
  };

  const st = STATUS_STYLE[app.status];
  const host = hostOf(app.url);
  const age = daysSince(app.appliedAt);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ background: 'rgba(28, 26, 23, 0.42)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-detail-title"
        className="card-float sheet rise max-h-[88vh] w-full max-w-lg overflow-y-auto p-6 md:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="app-detail-title"
              className="wrap-anywhere font-display text-xl font-extrabold leading-snug tracking-tight"
            >
              {app.role}
            </h2>
            <p className="wrap-anywhere mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
              {app.company}
              {host && (
                <>
                  {' · '}
                  <a
                    href={app.url}
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
          <button
            ref={closer}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap-control -mr-1 -mt-1 flex-none rounded-full px-3 py-2 text-sm font-semibold"
            style={{ background: 'var(--color-paper-2)', color: 'var(--color-ink-2)' }}
          >
            Close
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label htmlFor="detail-status" className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Status
          </label>
          <select
            id="detail-status"
            value={app.status}
            onChange={(e) => onPatch({ status: e.target.value as Status })}
            className="tap-control h-10 rounded-full px-3.5 pr-8 text-[0.8125rem] font-semibold leading-none"
            style={{ background: st.bg, color: st.fg, border: 'none' }}
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <span className="ml-auto text-xs" style={{ color: 'var(--color-faint)' }}>
            {age === 0 ? 'Added today' : `${age} day${age === 1 ? '' : 's'} ago`}
          </span>
        </div>

        {overdue && (
          <p
            className="mt-4 rounded-xl p-3 text-[0.8125rem] leading-relaxed"
            style={{ background: NUDGE.bg, color: NUDGE.fg }}
          >
            <span aria-hidden>🔔 </span>
            No movement in <strong>{age} days</strong>. One line is enough.
          </p>
        )}

        <div className="mt-5">
          <label htmlFor="detail-notes" className="mb-1.5 block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="detail-notes"
            className="field"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="What you sent, who you spoke to, anything to remember."
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/cover-letter?role=${encodeURIComponent(app.role)}&company=${encodeURIComponent(app.company)}`}
            className="btn btn-primary !py-2.5 !text-sm"
            onClick={saveNotes}
          >
            Write a follow-up
          </Link>
          {confirming ? (
            <span className="flex flex-wrap items-center gap-3 text-sm">
              <span style={{ color: 'var(--color-ink-2)' }}>Delete for good?</span>
              <button
                type="button"
                onClick={onDelete}
                className="tap font-semibold underline underline-offset-2"
                style={{ color: '#a3384f' }}
              >
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="tap underline underline-offset-2"
              >
                Keep
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="tap ml-auto text-sm underline underline-offset-2"
              style={{ color: 'var(--color-muted)' }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

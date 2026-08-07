'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* --------------------------------------------------------------- formatting */

export const nf = new Intl.NumberFormat('en-US');

export function num(value: number | null | undefined) {
  return value == null ? '—' : nf.format(value);
}

export function when(iso: string | null | undefined) {
  if (!iso) return '—';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '—';
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function stamp(iso: string | null | undefined) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/* ------------------------------------------------------------------ surfaces */

export function Panel({
  title,
  hint,
  action,
  children,
  flush,
}: {
  title: string;
  hint?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="ad-panel">
      <header className="ad-panel-head">
        <div className="min-w-0">
          <h2 className="ad-panel-title">{title}</h2>
          {hint ? (
            <p className="mt-0.5 text-[0.8125rem] leading-snug" style={{ color: 'var(--color-muted)' }}>
              {hint}
            </p>
          ) : null}
        </div>
        {action ? <div className="flex flex-none items-center gap-2">{action}</div> : null}
      </header>
      <div className={flush ? '' : 'p-4 sm:p-5'}>{children}</div>
    </section>
  );
}

export function SectionTitle({ index, title, sub }: { index: string; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <p className="ad-micro" style={{ color: 'var(--color-accent)' }}>
        {index}
      </p>
      <h1 className="font-display mt-1.5 text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[2.125rem]">
        {title}
        <span className="dot">.</span>
      </h1>
      {sub ? (
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  foot,
}: {
  label: string;
  value: string;
  foot?: ReactNode;
}) {
  const empty = value === '—';
  return (
    <div className="ad-stat">
      <p className="ad-micro">{label}</p>
      <p className="ad-statvalue mt-2" data-empty={empty}>
        {value}
      </p>
      {foot ? (
        <p className="mt-1.5 text-xs leading-snug" style={{ color: 'var(--color-muted)' }}>
          {foot}
        </p>
      ) : null}
    </div>
  );
}

export function StatStrip({ cols, children }: { cols: 3 | 4 | 5; children: ReactNode }) {
  return (
    <div className="ad-stats" data-cols={cols}>
      {children}
    </div>
  );
}

export function Tag({ tone, children }: { tone?: 'good' | 'warn' | 'bad'; children: ReactNode }) {
  return (
    <span className="ad-tag" data-tone={tone}>
      {tone ? <span className="ad-dot" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function Note({ tone, children }: { tone?: 'warn'; children: ReactNode }) {
  return (
    <div className="ad-note" data-tone={tone}>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 py-6 text-center text-sm" style={{ color: 'var(--color-faint)' }}>
      {children}
    </p>
  );
}

export function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <pre className="ad-pre">{code}</pre>
      <button
        type="button"
        className="ad-btn mt-2"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? 'Copied' : 'Copy SQL'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ async plumbing */

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ad-skel" style={{ height: 14, width: `${92 - i * 11}%` }} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="ad-note" data-tone="warn" role="alert">
      <p className="font-semibold" style={{ color: 'var(--ad-warn)' }}>
        Could not load this
      </p>
      <p className="mt-1">{message}</p>
      {onRetry ? (
        <button type="button" className="ad-btn mt-3" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- switch */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="ad-switch"
    >
      <span className="ad-track" data-on={checked} aria-hidden>
        <span className="ad-knob" />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

/* ---------------------------------------------------------------- dialog */

export function Dialog({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ad-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="ad-dialog"
      >
        <header className="ad-panel-head">
          <h2 className="ad-panel-title">{title}</h2>
          <button type="button" className="ad-btn" onClick={onClose} aria-label="Close dialog">
            Close
          </button>
        </header>
        <div className="p-4 sm:p-5">{children}</div>
        {footer ? (
          <footer
            className="flex flex-wrap justify-end gap-2 p-4 sm:p-5"
            style={{ borderTop: '1px solid var(--color-line)' }}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

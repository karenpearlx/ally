'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function ReviewPrompt({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const savingRef = useRef(false);

  const close = useCallback(() => {
    if (!savingRef.current) onClose();
  }, [onClose]);

  useEffect(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;
    textarea.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), input:not([disabled])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      restoreFocus.current?.focus?.();
    };
  }, [close]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || saving) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, name }),
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || 'Could not share that right now.');
      onSubmitted();
    } catch (caught) {
      savingRef.current = false;
      setError(caught instanceof Error ? caught.message : 'Could not share that right now.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center p-3 sm:items-center sm:p-6"
      style={{
        background: 'rgba(28, 26, 23, 0.42)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-prompt-title"
        aria-describedby="review-prompt-subtitle"
        className="card-float rise relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[29rem] overflow-y-auto p-6 sm:p-8"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={close}
          disabled={saving}
          aria-label="Close"
          className="absolute right-2.5 top-2.5 grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-[var(--color-paper-2)]"
          style={{ color: 'var(--color-muted)' }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3.2 3.2l9.6 9.6m0-9.6-9.6 9.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div
          className="grid h-14 w-14 place-items-center rounded-2xl text-2xl"
          style={{ background: 'var(--color-accent-soft)' }}
          aria-hidden
        >
          🎉
        </div>
        <h2 id="review-prompt-title" className="font-display mt-5 pr-8 text-[1.6rem] font-extrabold leading-[1.1] tracking-tight sm:text-[1.75rem]">
          Congrats on the offer! 🎉
        </h2>
        <p id="review-prompt-subtitle" className="mt-2.5 text-[0.9375rem] leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
          Mind sharing a quick thought about Verse? Your words help other VAs find us.
        </p>

        <form onSubmit={submit} className="mt-6">
          <label htmlFor="review-text" className="mb-1.5 block text-sm font-medium">
            Your experience
          </label>
          <textarea
            ref={textarea}
            id="review-text"
            className="field min-h-32 resize-y"
            maxLength={2000}
            required
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What's been helpful about Verse?"
          />

          <label htmlFor="review-name" className="mb-1.5 mt-4 block text-sm font-medium">
            Name <span style={{ color: 'var(--color-muted)' }}>(optional)</span>
          </label>
          <input
            id="review-name"
            className="field"
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="How you'd like to be credited"
          />

          {error && <p className="mt-3 text-sm font-medium" style={{ color: '#a83d55' }} role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary mt-6 w-full" disabled={saving || !text.trim()}>
            {saving ? 'Sharing…' : 'Share my experience'}
          </button>
          <button type="button" className="btn btn-ghost mt-2.5 w-full" onClick={close} disabled={saving}>
            Maybe later
          </button>
        </form>
      </div>
    </div>
  );
}

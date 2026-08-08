'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CREATOR_MAILTO } from '@/lib/plans';
import { CONTACT_EMAIL } from '@/lib/contact';

type Props = {
  defaultName?: string;
  defaultEmail?: string;
};

export default function CreatorApplyForm({ defaultName = '', defaultEmail = '' }: Props) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [specialty, setSpecialty] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [pitch, setPitch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/creator-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          specialty,
          portfolio_url: portfolioUrl || null,
          pitch,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; next?: string; error?: string; message?: string }
        | null;
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Could not submit. Try again.');
      }
      setDone(data?.next || `Thanks — we will reply at ${email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div
        className="rounded-[24px] p-7 md:p-9"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}
      >
        <p className="eyebrow">Application received</p>
        <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
          We have it<span className="dot">.</span>
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {done}
        </p>
        <Link href="/pricing" className="btn btn-ghost mt-8">
          Back to pricing
        </Link>
      </div>
    );
  }

  const field =
    'w-full rounded-2xl px-4 py-3 text-[0.9375rem] outline-none transition-[border-color,box-shadow]';
  const fieldStyle = {
    background: 'var(--color-paper)',
    border: '1px solid var(--color-line-2)',
    color: 'var(--color-ink)',
  } as const;

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="rounded-[24px] p-7 md:p-9"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}
      noValidate
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            Name
          </span>
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            style={fieldStyle}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            Email
          </span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            style={fieldStyle}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            Specialty
          </span>
          <input
            required
            name="specialty"
            placeholder="e.g. Email marketing, Real estate VA, Ops"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className={field}
            style={fieldStyle}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            Portfolio URL <span style={{ color: 'var(--color-faint)', fontWeight: 500 }}>(optional)</span>
          </span>
          <input
            type="url"
            name="portfolio_url"
            placeholder="https://"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className={field}
            style={fieldStyle}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            What do you want to teach?
          </span>
          <textarea
            required
            name="pitch"
            rows={6}
            minLength={40}
            placeholder="Who you have taught or managed, what the course would cover, and why someone should trust you with the skill."
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            className={`${field} resize-y`}
            style={fieldStyle}
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-5 text-sm leading-relaxed" style={{ color: 'var(--color-warn, #b03f3a)' }}>
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn btn-primary mt-7 w-full sm:w-auto">
        {busy ? 'Sending…' : 'Submit application'}
      </button>

      <p className="mt-5 text-sm leading-relaxed" style={{ color: 'var(--color-faint)' }}>
        Prefer email?{' '}
        <a href={CREATOR_MAILTO} className="font-semibold underline underline-offset-2" style={{ color: 'var(--color-accent-deep)' }}>
          Write {CONTACT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}

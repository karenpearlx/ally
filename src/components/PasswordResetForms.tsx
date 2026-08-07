'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="animate-spin"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity=".3" strokeWidth="2" />
      <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
    </div>
  );
}

function Status({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className="rounded-xl p-3 text-[0.875rem] leading-relaxed"
      style={
        tone === 'error'
          ? { background: '#fbecef', color: '#8f2f47' }
          : { background: 'var(--color-accent-soft)', color: 'var(--color-accent-deep)' }
      }
    >
      {children}
    </p>
  );
}

function messageFor(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  if (/expired|invalid.*(token|link)|otp/i.test(raw)) return 'That reset link is invalid or has expired. Request a new one.';
  if (/same password/i.test(raw)) return 'Choose a password you have not used before.';
  if (/fetch|network/i.test(raw)) return "Couldn't reach the server. Check your connection and try again.";
  return raw || 'Something went wrong. Try again.';
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        // Exchange the recovery code on the server, then land on the form.
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-8 space-y-5">
        <Status tone="success">
          If an account exists for <strong>{email}</strong>, we sent a password reset link. Check your inbox and spam folder.
        </Status>
        <button type="button" className="btn btn-ghost w-full !py-3.5" onClick={() => setSent(false)}>
          Try another email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />
      {error ? <Status tone="error">{error}</Status> : null}
      <button type="submit" className="btn btn-primary w-full !py-3.5" disabled={busy || !email.trim()}>
        {busy ? <Spinner /> : null}
        Send reset link
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let live = true;
    const supabase = createClient();

    const checkRecoverySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!live) return;
      setReady(Boolean(data.session) && !sessionError);
      setError(sessionError ? messageFor(sessionError) : data.session ? null : 'That reset link is invalid or has expired. Request a new one.');
      setChecking(false);
    };

    void checkRecoverySession();
    return () => {
      live = false;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setUpdated(true);
      setPassword('');
      setConfirmPassword('');
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <div className="mt-8 flex min-h-28 items-center justify-center gap-2 text-sm" role="status" style={{ color: 'var(--color-muted)' }}>
        <Spinner />
        Checking your reset link…
      </div>
    );
  }

  if (updated) {
    return (
      <div className="mt-8 space-y-5">
        <Status tone="success">Your password has been updated. You can sign in with it now.</Status>
        <Link href="/login" className="btn btn-primary w-full !py-3.5">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
      {ready ? (
        <>
          <Field
            label="New password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
          />
          <Field
            label="Confirm new password"
            name="confirm-password"
            type="password"
            placeholder="Type it again"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </>
      ) : null}
      {error ? <Status tone="error">{error}</Status> : null}
      {ready ? (
        <button type="submit" className="btn btn-primary w-full !py-3.5" disabled={busy}>
          {busy ? <Spinner /> : null}
          Update password
        </button>
      ) : (
        <Link href="/forgot-password" className="btn btn-primary w-full !py-3.5">
          Request a new link
        </Link>
      )}
    </form>
  );
}

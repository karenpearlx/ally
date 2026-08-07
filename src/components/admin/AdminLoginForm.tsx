'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Nav from '@/components/Nav';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginForm({ signedInAs, allowlistConfigured }: { signedInAs: string | null; allowlistConfigured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(signedInAs || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) { setError(signInError.message); setBusy(false); return; }
    router.replace('/admin'); router.refresh();
  }

  return <div className="min-h-screen"><Nav/><main className="px-5 py-32 md:px-8 md:py-44"><form onSubmit={submit} className="card-float mx-auto max-w-md p-7 md:p-9"><p className="eyebrow">Restricted area</p><h1 className="display-md mt-3">Admin sign in<span className="dot">.</span></h1><p className="mt-3 text-sm leading-6" style={{ color: 'var(--color-muted)' }}>A valid Supabase session is not enough by itself. The email must also be in the server&rsquo;s <code>ADMIN_EMAILS</code> allowlist.</p>{!allowlistConfigured && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900"><strong>Protection status</strong><br/>The allowlist is not configured, so admin access is currently failing closed. No dashboard data can be opened.</p>}<label className="mt-6 block text-sm font-semibold">Email<input className="field mt-2" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></label><label className="mt-4 block text-sm font-semibold">Password<input className="field mt-2" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required/></label>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<button type="submit" className="btn btn-primary mt-5 w-full" disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button><Link href="/" className="tap mt-5 block text-center text-sm underline underline-offset-4" style={{ color: 'var(--color-muted)' }}>Back to Verse</Link></form></main></div>;
}

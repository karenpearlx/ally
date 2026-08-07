'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { NICHES, type Niche, buildLetter, detectTools } from '@/lib/cover-letter-templates';

/** Skills we can spot in a job post, mapped to how a VA would phrase the proof. */
const SKILL_MAP: { keys: string[]; label: string }[] = [
  { keys: ['inbox', 'email management', 'gmail'], label: 'inbox management' },
  { keys: ['calendar', 'scheduling', 'calendly'], label: 'calendar' },
  { keys: ['seo', 'keyword', 'ahrefs', 'semrush'], label: 'SEO' },
  { keys: ['social media', 'instagram', 'tiktok', 'facebook'], label: 'social media' },
  { keys: ['shopify', 'ecommerce', 'e-commerce', 'woocommerce'], label: 'ecommerce ops' },
  { keys: ['bookkeep', 'xero', 'quickbooks', 'invoice'], label: 'bookkeeping' },
  { keys: ['customer support', 'zendesk', 'helpdesk', 'tickets'], label: 'customer support' },
  { keys: ['notion', 'asana', 'clickup', 'trello', 'monday'], label: 'project tools' },
  { keys: ['video', 'premiere', 'capcut', 'editing'], label: 'video editing' },
  { keys: ['data entry', 'crm', 'hubspot', 'airtable'], label: 'CRM and data' },
  { keys: ['writing', 'content', 'copywriting', 'blog'], label: 'writing' },
  { keys: ['recruit', 'hiring', 'onboarding'], label: 'hiring support' },
];

/** Which niche the listing looks like, so the default pick isn't always "General". */
const NICHE_HINTS: [Niche, RegExp][] = [
  ['seo', /\bseo\b|search engine|backlink|keyword research|ahrefs|semrush/i],
  ['writer', /content writer|copywriter|blog writer|ghostwrit|write.{0,15}articles/i],
  ['ea', /executive assistant|\bea\b|chief of staff|founder'?s assistant|personal assistant/i],
  ['support', /customer (support|service|success)|help ?desk|support agent|tickets/i],
  ['ops', /\boperations\b|ops (manager|lead)|process|sop\b|project manager/i],
];

const AI_STORE = 'ally-ai-settings-v1';
type Provider = 'openai' | 'anthropic';

const STOP = new Set(['the','and','for','with','you','are','our','your','will','who','this','that','have','from','their','been','they','all','can','has','not','but','out','use','using','work','role','team','job','about','into','more','than','when','what','a','an','to','of','in','on','is','be','we','it','as','at','or','by','if']);

function extractCompany(text: string) {
  const m =
    text.match(/(?:at|join|for)\s+([A-Z][A-Za-z0-9&'.-]+(?:\s+[A-Z][A-Za-z0-9&'.-]+){0,2})/) ??
    text.match(/^([A-Z][A-Za-z0-9&'.-]+(?:\s+[A-Z][A-Za-z0-9&'.-]+){0,2})\s+is\s+(?:hiring|looking)/m);
  return m?.[1]?.trim() ?? '';
}

function extractRole(text: string) {
  const m =
    text.match(/(?:hiring|seeking|looking for)\s+(?:an?\s+)?([A-Za-z/ -]{4,40}?)(?:\s+to\b|\s+who\b|[.,\n])/i) ??
    text.match(/^\s*(?:job title|position|role)\s*[:\-]\s*(.+)$/im);
  return (m?.[1] ?? '').trim().replace(/\s+/g, ' ');
}

function extractName(text: string) {
  const m = text.match(/\b(?:hi|hello|contact|reach out to|email|apply to|send it to)\s+([A-Z][a-z]{2,12})\b/i);
  return m?.[1] ?? '';
}

/** Show enough to recognise the key, never enough to use it. */
function maskKey(key: string) {
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 3)}••••••••${key.slice(-4)}`;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CoverLetter />
    </Suspense>
  );
}

function CoverLetter() {
  const params = useSearchParams();

  const [mode, setMode] = useState<'template' | 'ai'>('template');
  const [listing, setListing] = useState('');
  const [name, setName] = useState('');
  const [years, setYears] = useState('3');
  const [headline, setHeadline] = useState('');
  const [roleOverride, setRoleOverride] = useState(params.get('role') ?? '');
  const [companyOverride, setCompanyOverride] = useState(params.get('company') ?? '');
  const [pickedNiche, setPickedNiche] = useState<Niche>('general');
  const [nicheTouched, setNicheTouched] = useState(false);

  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'template' | 'ai' | null>(null);

  // AI settings — provider + the user's own key, kept in this browser only.
  const [ai, setAi] = useState<{ provider: Provider; key: string | null }>({
    provider: 'openai',
    key: null,
  });
  const provider = ai.provider;
  const savedKey = ai.key;
  const setProvider = (p: Provider) => {
    setAi((prev) => {
      // Keep storage in step, otherwise a saved key stays tagged to the old provider.
      if (prev.key) {
        try {
          localStorage.setItem(AI_STORE, JSON.stringify({ provider: p, key: prev.key }));
        } catch {
          /* storage blocked; in-memory state still works for this session */
        }
      }
      return { ...prev, provider: p };
    });
  };
  const setSavedKey = (key: string | null) => setAi((prev) => ({ ...prev, key }));
  const [keyInput, setKeyInput] = useState('');
  const [replacing, setReplacing] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  // localStorage has no server-side equivalent, so saved settings can only be
  // read after hydration. One state write, so hydration can't tear.
  useEffect(() => {
    let restored: { provider: Provider; key: string | null } | null = null;
    try {
      const raw = localStorage.getItem(AI_STORE);
      if (raw) {
        const parsed = JSON.parse(raw) as { provider?: Provider; key?: string };
        restored = {
          provider: parsed.provider === 'anthropic' ? 'anthropic' : 'openai',
          key: typeof parsed.key === 'string' && parsed.key ? parsed.key : null,
        };
      }
    } catch {
      /* corrupt settings shouldn't take the page down */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only store on mount
    if (restored) setAi(restored);
  }, []);

  const detected = useMemo(() => {
    const lower = listing.toLowerCase();
    const skills = SKILL_MAP.filter((s) => s.keys.some((k) => lower.includes(k)));
    const words = lower.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w));
    const freq: Record<string, number> = {};
    for (const w of words) freq[w] = (freq[w] ?? 0) + 1;
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
    return {
      skills,
      tools: detectTools(listing),
      keywords: top,
      company: companyOverride || extractCompany(listing),
      role: roleOverride || extractRole(listing),
      contact: extractName(listing),
    };
  }, [listing, roleOverride, companyOverride]);

  // Suggest the niche from the listing until the user picks one themselves.
  const suggested = useMemo<Niche | null>(() => {
    if (!listing.trim()) return null;
    return NICHE_HINTS.find(([, re]) => re.test(listing))?.[0] ?? null;
  }, [listing]);

  // Derived, not stored: until you pick one yourself, the listing decides.
  const niche: Niche = nicheTouched ? pickedNiche : (suggested ?? pickedNiche);

  const scrollToOutput = () =>
    requestAnimationFrame(() =>
      document.getElementById('out')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );

  const generateTemplate = () => {
    setError(null);
    setGenerated(
      buildLetter(niche, {
        name,
        years,
        headline,
        role: detected.role,
        company: detected.company,
        contact: detected.contact,
        listing,
      }),
    );
    setSource('template');
    setCopied(false);
    scrollToOutput();
  };

  const saveKey = () => {
    const key = keyInput.trim();
    if (!key) return;
    try {
      localStorage.setItem(AI_STORE, JSON.stringify({ provider, key }));
      setSavedKey(key);
      setKeyInput('');
      setReplacing(false);
      setSaveNote('Saved in this browser.');
      setTimeout(() => setSaveNote(null), 2500);
    } catch {
      setError('Could not save the key — this browser is blocking storage.');
    }
  };

  const forgetKey = () => {
    try {
      localStorage.removeItem(AI_STORE);
    } catch {
      /* nothing to clean up */
    }
    setSavedKey(null);
    setKeyInput('');
    setReplacing(false);
    setSaveNote('Key removed from this browser.');
    setTimeout(() => setSaveNote(null), 2500);
  };

  const generateAI = async () => {
    const key = keyInput.trim() || savedKey;
    if (!key) {
      setError('Add your API key first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/cover-letters/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          api_key: key,
          job_listing_content: listing,
          job_title: detected.role || null,
          company: detected.company || null,
          // Only fields the endpoint allow-lists; anything else is dropped there.
          profile: {
            full_name: name.trim() || null,
            experience_years: Number(years) || null,
            headline: headline.trim() || null,
            bio: `Works mainly in ${NICHES.find((n) => n.id === niche)?.label ?? 'general VA'} roles.`,
            skills: detected.skills.map((s) => s.label),
          },
        }),
      });

      const data: unknown = await res.json().catch(() => null);
      const payload = (data ?? {}) as { letter?: string; generated_letter?: string; error?: string };

      if (!res.ok) {
        throw new Error(
          payload.error ||
            (res.status === 401
              ? 'That key was rejected by the provider.'
              : res.status === 404
                ? 'The AI endpoint isn\u2019t available on this deployment yet. Template mode still works.'
                : `Generation failed (${res.status}).`),
        );
      }

      const letter = payload.letter ?? payload.generated_letter;
      if (!letter) throw new Error('The provider returned an empty letter.');

      setGenerated(letter);
      setSource('ai');
      setCopied(false);
      scrollToOutput();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canGenerate = listing.trim().length > 0 && !busy;

  return (
    <div className="min-h-screen">
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Cover letter builder</p>
          <h1 className="display-lg mt-4">
            Paste the job. Get a letter<span className="dot">.</span>
          </h1>
          <p className="lede mt-5 max-w-xl">
            Pick a template built for your niche, or bring your own AI key and let a model write it.
            Either way it stays short enough that a busy founder will actually finish it.
          </p>
        </div>
      </section>

      <section className="px-5 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
          {/* ---------------- input ---------------- */}
          <div className="card p-6 md:p-8">
            {/* mode switch */}
            <div
              role="radiogroup"
              aria-label="How to write the letter"
              className="flex gap-1 rounded-full p-1"
              style={{ background: 'var(--color-paper-2)' }}
            >
              {(
                [
                  ['template', 'Use a template'],
                  ['ai', 'Use AI'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={mode === id}
                  onClick={() => {
                    setMode(id);
                    setError(null);
                  }}
                  className="min-h-[44px] flex-1 rounded-full px-4 py-2.5 text-[0.875rem] font-semibold transition-colors"
                  style={{
                    background: mode === id ? 'var(--color-surface)' : 'transparent',
                    color: mode === id ? 'var(--color-ink)' : 'var(--color-muted)',
                    boxShadow: mode === id ? 'var(--shadow-tile)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[0.8125rem]" style={{ color: 'var(--color-faint)' }}>
              {mode === 'template'
                ? 'Free, instant, works without an account.'
                : 'Runs on your own API key. Nothing is charged to Versified, and nothing is stored on our side.'}
            </p>

            <h2 className="font-display mt-7 text-xl font-extrabold tracking-tight">The job post</h2>
            <label htmlFor="listing" className="sr-only">
              Paste the job listing
            </label>
            <textarea
              id="listing"
              className="field mt-4"
              rows={9}
              placeholder="Paste the whole listing here — responsibilities, requirements, all of it."
              value={listing}
              onChange={(e) => setListing(e.target.value)}
            />

            {listing.trim() && (
              <div className="mt-4">
                <p className="eyebrow" style={{ color: 'var(--color-faint)' }}>
                  What Versified spotted
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {detected.skills.length === 0 && detected.tools.length === 0 && (
                    <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                      No specific skills detected — the letter will stay general.
                    </span>
                  )}
                  {detected.skills.map((s) => (
                    <span
                      key={s.label}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-deep)' }}
                    >
                      {s.label}
                    </span>
                  ))}
                  {detected.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: '#f3eee7', color: '#8a6a3d' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {detected.keywords.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {detected.keywords.map((k) => (
                      <span
                        key={k}
                        className="rounded-md px-2 py-0.5 text-[0.6875rem]"
                        style={{ background: 'var(--color-paper-2)', color: 'var(--color-muted)' }}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* niche picker (template mode) */}
            {mode === 'template' && (
              <>
                <h2 className="font-display mt-8 text-xl font-extrabold tracking-tight">
                  Which kind of role
                </h2>
                <p className="mt-1.5 text-[0.8125rem]" style={{ color: 'var(--color-muted)' }}>
                  Each one is written differently, not the same letter with the job title swapped.
                </p>
                <div role="radiogroup" aria-label="Letter template" className="mt-4 grid gap-2 sm:grid-cols-2">
                  {NICHES.map((n) => {
                    const on = niche === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          setPickedNiche(n.id);
                          setNicheTouched(true);
                        }}
                        className="rounded-2xl p-3.5 text-left transition-colors"
                        style={{
                          border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-line-2)'}`,
                          background: on ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                        }}
                      >
                        <span className="flex items-center gap-2 text-[0.9375rem] font-semibold">
                          {n.label}
                          {suggested === n.id && !nicheTouched && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide"
                              style={{ background: 'var(--color-accent)', color: '#fff' }}
                            >
                              match
                            </span>
                          )}
                        </span>
                        <span
                          className="mt-1 block text-xs leading-relaxed"
                          style={{ color: on ? 'var(--color-accent-deep)' : 'var(--color-muted)' }}
                        >
                          {n.blurb}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* AI settings */}
            {mode === 'ai' && (
              <>
                <h2 className="font-display mt-8 text-xl font-extrabold tracking-tight">Your AI key</h2>
                <div className="mt-4 grid gap-3">
                  <div>
                    <label htmlFor="provider" className="mb-1.5 block text-sm font-medium">
                      Provider
                    </label>
                    <select
                      id="provider"
                      className="field"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as Provider)}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Claude (Anthropic)</option>
                    </select>
                  </div>

                  {savedKey && !replacing ? (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3.5"
                      style={{ background: 'var(--color-accent-soft)' }}
                    >
                      <p className="text-[0.875rem]" style={{ color: 'var(--color-accent-deep)' }}>
                        Key saved <span className="font-mono">{maskKey(savedKey)}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-ghost !px-3.5 !py-2 !text-[0.8125rem]"
                          onClick={() => setReplacing(true)}
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost !px-3.5 !py-2 !text-[0.8125rem]"
                          onClick={forgetKey}
                        >
                          Forget
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="apikey" className="mb-1.5 block text-sm font-medium">
                        API key
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="apikey"
                          className="field"
                          type="password"
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={provider === 'openai' ? 'sk-…' : 'sk-ant-…'}
                          value={keyInput}
                          onChange={(e) => setKeyInput(e.target.value)}
                          aria-describedby="keyhelp"
                        />
                        <button
                          type="button"
                          className="btn btn-ghost flex-none"
                          onClick={saveKey}
                          disabled={!keyInput.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  <p id="keyhelp" className="text-[0.8125rem] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    Your key is kept in this browser&rsquo;s local storage and sent straight to{' '}
                    {provider === 'openai' ? 'OpenAI' : 'Anthropic'} for each request. Versified never
                    stores it, never logs it, and it never appears in a URL. Anyone with access to
                    this device or a script running on this page could read it, so use a key with a
                    spending limit and remove it when you&rsquo;re done.
                  </p>
                  {saveNote && (
                    <p className="text-[0.8125rem] font-medium" style={{ color: 'var(--color-accent-deep)' }} role="status">
                      {saveNote}
                    </p>
                  )}
                </div>
              </>
            )}

            <h2 className="font-display mt-8 text-xl font-extrabold tracking-tight">You</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="n" className="mb-1.5 block text-sm font-medium">
                  Your name
                </label>
                <input id="n" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Karen Ong" />
              </div>
              <div>
                <label htmlFor="y" className="mb-1.5 block text-sm font-medium">
                  Years doing this
                </label>
                <select id="y" className="field" value={years} onChange={(e) => setYears(e.target.value)}>
                  {['1', '2', '3', '4', '5', '6', '8', '10'].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="hl" className="mb-1.5 block text-sm font-medium">
                  Your one-line pitch <span style={{ color: 'var(--color-faint)' }}>(optional)</span>
                </label>
                <input
                  id="hl"
                  className="field"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="I've run ops for a 12-person agency for three years."
                />
              </div>
              <div>
                <label htmlFor="r" className="mb-1.5 block text-sm font-medium">
                  Role <span style={{ color: 'var(--color-faint)' }}>(optional)</span>
                </label>
                <input id="r" className="field" value={roleOverride} onChange={(e) => setRoleOverride(e.target.value)} placeholder="auto-detected" />
              </div>
              <div>
                <label htmlFor="c" className="mb-1.5 block text-sm font-medium">
                  Company <span style={{ color: 'var(--color-faint)' }}>(optional)</span>
                </label>
                <input id="c" className="field" value={companyOverride} onChange={(e) => setCompanyOverride(e.target.value)} placeholder="auto-detected" />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary mt-6 w-full !py-3.5"
              disabled={!canGenerate}
              onClick={mode === 'ai' ? generateAI : generateTemplate}
            >
              {busy ? (
                <>
                  <Spinner /> Writing…
                </>
              ) : mode === 'ai' ? (
                'Write it with AI'
              ) : (
                'Write my letter'
              )}
            </button>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-xl p-3 text-[0.875rem] leading-relaxed"
                style={{ background: '#fbecef', color: '#8f2f47' }}
              >
                {error}
              </p>
            )}
          </div>

          {/* ---------------- output ---------------- */}
          <div id="out" className="card flex flex-col p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-extrabold tracking-tight">Your letter</h2>
              {generated && (
                <div className="flex items-center gap-2">
                  {source && (
                    <span
                      className="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide"
                      style={{ background: 'var(--color-paper-2)', color: 'var(--color-muted)' }}
                    >
                      {source === 'ai' ? (provider === 'openai' ? 'OpenAI' : 'Claude') : 'Template'}
                    </span>
                  )}
                  <button type="button" className="btn btn-ghost !px-4 !py-2 !text-sm" onClick={copy}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            {generated ? (
              <>
                <label htmlFor="letter" className="sr-only">
                  Your cover letter
                </label>
                <textarea
                  id="letter"
                  className="field mt-4 flex-1"
                  rows={20}
                  value={generated}
                  onChange={(e) => setGenerated(e.target.value)}
                  style={{ lineHeight: 1.7 }}
                />
                <p className="mt-3 text-sm" style={{ color: 'var(--color-muted)' }}>
                  Edit it before you send. A letter that sounds 90% like you beats one that sounds
                  100% like a template.
                </p>
              </>
            ) : (
              <div
                className="mt-4 flex flex-1 items-center justify-center rounded-2xl p-10 text-center"
                style={{ background: 'var(--color-paper-2)', minHeight: 320 }}
              >
                <p className="max-w-xs text-[0.9375rem]" style={{ color: 'var(--color-muted)' }}>
                  {busy ? 'Writing your letter…' : 'Paste a listing on the left and your letter shows up here.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden style={{ animation: 'spin .8s linear infinite' }}>
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity=".3" strokeWidth="2" />
        <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </>
  );
}

'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import NichePicker from '@/components/NichePicker';
import { nicheMeta, type Niche } from '@/lib/cover-letter-templates';
import {
  INTERVIEW_TYPES,
  answerMetrics,
  questionsFor,
  type Feedback,
  type InterviewType,
} from '@/lib/interview';

/* Shared with the cover letter builder, so a key saved there works here too. */
const AI_STORE = 'ally-ai-settings-v1';
/* Answers survive a refresh. Never leaves the device. */
const SESSION_STORE = 'ally-interview-v1';

type Provider = 'openai' | 'anthropic';

/* ------------------------------------------------------------------ */
/* Speech recognition — free, built into Chrome and Edge               */
/* ------------------------------------------------------------------ */

type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechEvent = { resultIndex: number; results: { length: number } & Record<number, SpeechResult> };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function clock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ScoreDial({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(1, score / 10));
  const r = 30;
  const c = 2 * Math.PI * r;
  const tone = score >= 8 ? 'var(--color-accent)' : score >= 5 ? '#c98a2e' : '#c4553a';

  return (
    <div className="relative grid h-[72px] w-[72px] flex-none place-items-center">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-line)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <span className="font-display absolute text-xl font-extrabold tabular-nums" style={{ color: tone }}>
        {score}
      </span>
    </div>
  );
}

function Bullet({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[0.9375rem] leading-relaxed">
      <span aria-hidden className="mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full" style={{ background: tone }} />
      <span>{children}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */

export default function InterviewPrep() {
  const uid = useId();
  const answerId = `${uid}-answer`;
  const keyId = `${uid}-key`;
  const providerId = `${uid}-provider`;

  const [niche, setNiche] = useState<Niche>('general');
  const [type, setType] = useState<InterviewType>('behavioral');
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(false);

  const [provider, setProviderState] = useState<Provider>('openai');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [keyNote, setKeyNote] = useState<string | null>(null);

  const questions = useMemo(() => questionsFor(niche, type), [niche, type]);
  const current = questions[Math.min(index, questions.length - 1)];
  const answer = current ? (answers[current.id] ?? '') : '';
  const result = current ? feedback[current.id] : undefined;
  const metrics = useMemo(() => answerMetrics(answer), [answer]);
  const roleLabel = nicheMeta(niche).label;
  const answeredCount = questions.filter((q) => (answers[q.id] ?? '').trim().length > 20).length;

  /* ---------- restore saved key + session ---------- */

  useEffect(() => {
    let restoredAi: { provider: Provider; key: string | null } | null = null;
    let restoredSession: { niche?: string; type?: string; answers?: Record<string, string> } | null = null;
    try {
      const raw = localStorage.getItem(AI_STORE);
      if (raw) {
        const parsed = JSON.parse(raw) as { provider?: Provider; key?: string };
        restoredAi = {
          provider: parsed.provider === 'anthropic' ? 'anthropic' : 'openai',
          key: typeof parsed.key === 'string' && parsed.key ? parsed.key : null,
        };
      }
      const rawSession = localStorage.getItem(SESSION_STORE);
      if (rawSession) restoredSession = JSON.parse(rawSession);
    } catch {
      /* corrupt storage shouldn't take the page down */
    }
    /* eslint-disable react-hooks/set-state-in-effect -- browser-only stores can only be read after hydration */
    if (restoredAi) {
      setProviderState(restoredAi.provider);
      setSavedKey(restoredAi.key);
    }
    if (restoredSession?.answers && typeof restoredSession.answers === 'object') {
      setAnswers(restoredSession.answers);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function persist(next: Record<string, string>) {
    try {
      localStorage.setItem(SESSION_STORE, JSON.stringify({ answers: next }));
    } catch {
      /* storage blocked; the session still works in memory */
    }
  }

  function setAnswerFor(id: string, text: string) {
    const next = { ...answers, [id]: text };
    setAnswers(next);
    persist(next);
  }

  function setAnswer(text: string) {
    if (current) setAnswerFor(current.id, text);
  }

  /* ---------- timer ---------- */

  const [seconds, setSeconds] = useState(0);
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    if (!ticking) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [ticking]);

  /* ---------- dictation ---------- */

  const [listening, setListening] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  // Dictation callbacks fire outside React's flow, so they read the latest
  // answers through a ref rather than closing over a stale render.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection is browser-only
    setSpeechReady(recognitionCtor() != null);
  }, []);

  function stopListening() {
    recognition.current?.stop();
    recognition.current = null;
    setListening(false);
  }

  function startListening() {
    const Ctor = recognitionCtor();
    if (!Ctor || !current) return;
    const qid = current.id;
    const engine = new Ctor();
    engine.continuous = true;
    engine.interimResults = false;
    engine.lang = 'en-PH';
    engine.onresult = (event) => {
      let chunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const item = event.results[i];
        if (item?.isFinal) chunk += item[0].transcript;
      }
      if (!chunk.trim()) return;
      const base = answersRef.current[qid] ?? '';
      setAnswerFor(qid, `${base}${base && !base.endsWith(' ') ? ' ' : ''}${chunk.trim()}`);
    };
    engine.onerror = (event) => {
      setError(
        event.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser, or just type the answer.'
          : 'Dictation stopped. You can keep typing.',
      );
      stopListening();
    };
    engine.onend = () => setListening(false);
    recognition.current = engine;
    engine.start();
    setListening(true);
    setTicking(true);
    setError(null);
  }

  useEffect(() => () => recognition.current?.stop(), []);

  /* ---------- navigation ---------- */

  function goTo(next: number) {
    stopListening();
    setIndex(Math.max(0, Math.min(questions.length - 1, next)));
    setSeconds(0);
    setTicking(false);
    setError(null);
    setCopied(false);
    requestAnimationFrame(() =>
      document.getElementById('practice')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  const start = () => {
    setStarted(true);
    setIndex(0);
    setSeconds(0);
    setTicking(false);
    requestAnimationFrame(() => document.getElementById('practice')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const changeSet = (nextNiche: Niche, nextType: InterviewType) => {
    stopListening();
    setNiche(nextNiche);
    setType(nextType);
    setIndex(0);
    setSeconds(0);
    setTicking(false);
    setError(null);
  };

  /* ---------- key handling ---------- */

  const saveKey = () => {
    const key = keyInput.trim();
    if (!key) return;
    try {
      localStorage.setItem(AI_STORE, JSON.stringify({ provider, key }));
      setSavedKey(key);
      setKeyInput('');
      setKeyNote('Saved in this browser.');
      setTimeout(() => setKeyNote(null), 2500);
    } catch {
      setError('Could not save the key. This browser is blocking storage.');
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
    setKeyNote('Key removed from this browser.');
    setTimeout(() => setKeyNote(null), 2500);
  };

  const setProvider = (next: Provider) => {
    setProviderState(next);
    if (savedKey) {
      try {
        localStorage.setItem(AI_STORE, JSON.stringify({ provider: next, key: savedKey }));
      } catch {
        /* in-memory state still works for this session */
      }
    }
  };

  /* ---------- feedback ---------- */

  const getFeedback = async () => {
    if (!current) return;
    const key = keyInput.trim() || savedKey;
    if (!key) {
      setShowKeyPanel(true);
      setError('Add an API key first. Everything else on this page works without one.');
      return;
    }
    if (answer.trim().length < 20) {
      setError('Write a bit more before asking for feedback.');
      return;
    }
    stopListening();
    setTicking(false);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          api_key: key,
          question: current.q,
          answer,
          role: roleLabel,
          interview_type: type,
          looks_for: current.looksFor,
        }),
      });
      const payload = (await res.json().catch(() => null)) as { feedback?: Feedback; error?: string } | null;
      if (!res.ok) {
        throw new Error(
          payload?.error ||
            (res.status === 401 ? 'That key was rejected by the provider.' : `Feedback failed (${res.status}).`),
        );
      }
      if (!payload?.feedback) throw new Error('The provider returned nothing usable.');
      setFeedback((prev) => ({ ...prev, [current.id]: payload.feedback! }));
      requestAnimationFrame(() =>
        document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const copyRewrite = async () => {
    if (!result?.rewrite) return;
    await navigator.clipboard.writeText(result.rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================================================================ */

  return (
    <>
      {/* ---------------- setup ---------------- */}
      <section className="px-5 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <div className="panel p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <NichePicker
                value={niche}
                onChange={(next) => changeSet(next, type)}
                label="Role you're interviewing for"
              />

              <fieldset className="min-w-0">
                <legend className="mb-1.5 text-sm font-medium">Question set</legend>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="chip"
                      data-on={type === t.id}
                      aria-pressed={type === t.id}
                      onClick={() => changeSet(niche, t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed" style={{ color: '#6b6863' }}>
                  {INTERVIEW_TYPES.find((t) => t.id === type)?.blurb}
                </p>
              </fieldset>
            </div>

            <div
              className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
              style={{ borderColor: 'var(--color-line)' }}
            >
              <p className="text-sm" style={{ color: '#6b6863' }}>
                <strong className="font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {questions.length} question{questions.length === 1 ? '' : 's'}
                </strong>{' '}
                for {roleLabel.toLowerCase()}
                {answeredCount > 0 && ` · ${answeredCount} answered`}
              </p>
              {!started ? (
                <button type="button" className="btn btn-primary" onClick={start} disabled={questions.length === 0}>
                  Start practising
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M2 8h11m0 0-4.2-4.2M13 8l-4.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <span className="text-sm font-semibold" style={{ color: 'var(--color-accent-deep)' }}>
                  Question {index + 1} of {questions.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- practice ---------------- */}
      {started && current && (
        <section id="practice" className="scroll-mt-24 px-5 pt-8 md:px-8 md:pt-10">
          <div className="mx-auto max-w-3xl">
            <div className="bar" aria-hidden>
              <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
            </div>

            <div className="card mt-5 overflow-hidden">
              <div className="p-6 md:p-8">
                <p className="eyebrow">
                  {INTERVIEW_TYPES.find((t) => t.id === type)?.label} · {index + 1}/{questions.length}
                </p>
                <h2 className="font-display mt-3 text-2xl font-extrabold leading-tight tracking-tight md:text-[1.75rem]">
                  {current.q}
                </h2>

                <details className="mt-5 rounded-2xl p-4" style={{ background: 'var(--color-paper-2)' }}>
                  <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
                    Why they ask, and what they&rsquo;re listening for
                  </summary>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
                    {current.why}
                  </p>
                  <ul className="mt-3 grid gap-2" style={{ color: 'var(--color-ink-2)' }}>
                    {current.looksFor.map((point) => (
                      <Bullet key={point} tone="var(--color-accent)">
                        {point}
                      </Bullet>
                    ))}
                  </ul>
                </details>

                {/* answer */}
                <div className="mt-6">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
                    <label htmlFor={answerId} className="text-sm font-medium">
                      Your answer
                    </label>
                    <span
                      className="text-sm tabular-nums"
                      style={{ color: seconds > 105 ? '#c4553a' : '#6b6863' }}
                      aria-live="off"
                    >
                      {clock(seconds)}{ticking ? ' · timing' : ''}
                    </span>
                  </div>

                  <textarea
                    id={answerId}
                    className="field min-h-[13rem] resize-y leading-relaxed"
                    placeholder="Say it the way you would say it out loud. Do not polish it in your head first."
                    value={answer}
                    onFocus={() => setTicking(true)}
                    onChange={(e) => setAnswer(e.target.value)}
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {speechReady && (
                      <button
                        type="button"
                        className="chip"
                        data-on={listening}
                        aria-pressed={listening}
                        onClick={() => (listening ? stopListening() : startListening())}
                      >
                        <span
                          aria-hidden
                          className="h-2 w-2 rounded-full"
                          style={{
                            background: listening ? '#e0523a' : '#6b6863',
                            boxShadow: listening ? '0 0 0 4px rgba(224,82,58,0.18)' : 'none',
                          }}
                        />
                        {listening ? 'Stop dictating' : 'Speak your answer'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="chip"
                      onClick={() => {
                        setSeconds(0);
                        setTicking(false);
                      }}
                    >
                      Reset timer
                    </button>
                    {answer && (
                      <button
                        type="button"
                        className="chip"
                        onClick={() => {
                          setAnswer('');
                          setSeconds(0);
                          setTicking(false);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* live, local, free */}
                  {metrics.words > 0 && (
                    <div
                      className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl px-4 py-3 text-[0.8125rem]"
                      style={{ background: 'var(--color-paper-2)', color: 'var(--color-ink-2)' }}
                      aria-live="polite"
                    >
                      <span>
                        <strong className="font-semibold tabular-nums" style={{ color: 'var(--color-ink)' }}>
                          {metrics.words}
                        </strong>{' '}
                        words
                      </span>
                      <span>
                        <strong
                          className="font-semibold tabular-nums"
                          style={{ color: metrics.length === 'good' ? 'var(--color-accent-deep)' : '#c98a2e' }}
                        >
                          ~{clock(metrics.seconds)}
                        </strong>{' '}
                        spoken
                        {metrics.length === 'short' && ' · thin for this question'}
                        {metrics.length === 'long' && ' · they will tune out'}
                      </span>
                      {!metrics.hasNumber && <span style={{ color: '#c98a2e' }}>No number in this answer</span>}
                      {metrics.fillers.length > 0 && (
                        <span>
                          Filler: {metrics.fillers.slice(0, 3).map((f) => `${f.word} ×${f.count}`).join(', ')}
                        </span>
                      )}
                      {metrics.hedges.length > 0 && (
                        <span>
                          Hedging: {metrics.hedges.slice(0, 3).map((h) => `"${h.phrase}"`).join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <p
                    className="mt-4 rounded-2xl px-4 py-3 text-sm"
                    role="alert"
                    style={{ background: '#fdf0ec', color: '#8d3a26' }}
                  >
                    {error}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="button" className="btn btn-primary" onClick={getFeedback} disabled={busy}>
                    {busy ? (
                      <>
                        <span
                          aria-hidden
                          className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                          style={{ animation: 'ally-spin .8s linear infinite' }}
                        />
                        Grading
                      </>
                    ) : (
                      <>Get feedback</>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => goTo(index + 1)}
                    disabled={index >= questions.length - 1}
                  >
                    Next question
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => goTo(index - 1)}
                    disabled={index === 0}
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* ---------------- feedback ---------------- */}
              {result && (
                <div
                  id="feedback"
                  className="scroll-mt-24 border-t p-6 md:p-8"
                  style={{ borderColor: 'var(--color-line)', background: 'var(--color-paper)' }}
                >
                  <div className="flex items-start gap-4">
                    <ScoreDial score={result.score} />
                    <div className="min-w-0">
                      <p className="eyebrow">Feedback</p>
                      <p className="font-display mt-1.5 text-lg font-extrabold leading-snug tracking-tight">
                        {result.verdict}
                      </p>
                    </div>
                  </div>

                  {result.strengths.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-bold uppercase tracking-[0.1em]" style={{ color: '#6b6863' }}>
                        Working
                      </h3>
                      <ul className="mt-3 grid gap-2" style={{ color: 'var(--color-ink-2)' }}>
                        {result.strengths.map((s) => (
                          <Bullet key={s} tone="var(--color-accent)">
                            {s}
                          </Bullet>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.fixes.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-bold uppercase tracking-[0.1em]" style={{ color: '#6b6863' }}>
                        Fix before the real thing
                      </h3>
                      <div className="mt-3 grid gap-3">
                        {result.fixes.map((fix) => (
                          <div
                            key={fix.issue + fix.fix}
                            className="rounded-2xl border p-4"
                            style={{ borderColor: 'var(--color-line-2)', background: 'var(--color-surface)' }}
                          >
                            <p className="text-[0.9375rem] font-semibold leading-snug">{fix.issue}</p>
                            <p className="mt-1.5 text-[0.9375rem] leading-relaxed" style={{ color: '#6b6863' }}>
                              {fix.fix}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.rewrite && (
                    <div className="mt-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-bold uppercase tracking-[0.1em]" style={{ color: '#6b6863' }}>
                          Stronger version
                        </h3>
                        <button type="button" className="chip" onClick={copyRewrite}>
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p
                        className="mt-3 whitespace-pre-wrap rounded-2xl border p-5 text-[0.9375rem] leading-relaxed"
                        style={{ borderColor: 'var(--color-line-2)', background: 'var(--color-surface)' }}
                      >
                        {result.rewrite}
                      </p>
                      <p className="mt-2.5 text-[0.8125rem]" style={{ color: '#6b6863' }}>
                        Anything in square brackets is a gap only you can fill. Do not read this out as written; say it
                        in your own words with your real numbers.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* question rail */}
            <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Jump to question">
              {questions.map((q, i) => {
                const done = (answers[q.id] ?? '').trim().length > 20;
                const active = i === index;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Question ${i + 1}: ${q.q}`}
                    aria-current={active ? 'true' : undefined}
                    className="tap-control grid h-8 w-8 place-items-center rounded-full text-[0.8125rem] font-semibold tabular-nums transition-colors"
                    style={{
                      background: active ? 'var(--color-ink)' : done ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                      color: active ? '#fff' : done ? 'var(--color-accent-deep)' : '#6b6863',
                      border: `1px solid ${active ? 'var(--color-ink)' : 'var(--color-line-2)'}`,
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- key panel ---------------- */}
      <section className="px-5 pt-10 md:px-8 md:pt-14">
        <div className="mx-auto max-w-3xl">
          <div className="panel p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-extrabold tracking-tight">AI feedback</h2>
                <p className="mt-1.5 max-w-md text-[0.9375rem] leading-relaxed" style={{ color: '#6b6863' }}>
                  {savedKey
                    ? `Ready. Using your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} key, stored in this browser only.`
                    : 'Optional. The questions, the timer and the answer check all work without a key.'}
                </p>
              </div>
              <button type="button" className="chip" onClick={() => setShowKeyPanel((v) => !v)} aria-expanded={showKeyPanel}>
                {showKeyPanel ? 'Hide' : savedKey ? 'Change key' : 'Add a key'}
              </button>
            </div>

            {showKeyPanel && (
              <div className="mt-6 grid gap-4 border-t pt-6" style={{ borderColor: 'var(--color-line)' }}>
                <div>
                  <label htmlFor={providerId} className="mb-1.5 block text-sm font-medium">
                    Provider
                  </label>
                  <select
                    id={providerId}
                    className="field"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as Provider)}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={keyId} className="mb-1.5 block text-sm font-medium">
                    API key
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      id={keyId}
                      type="password"
                      className="field flex-1"
                      style={{ minWidth: '14rem' }}
                      autoComplete="off"
                      placeholder={savedKey ? 'A key is already saved' : provider === 'openai' ? 'sk-…' : 'sk-ant-…'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                    />
                    <button type="button" className="btn btn-ink" onClick={saveKey} disabled={!keyInput.trim()}>
                      Save
                    </button>
                    {savedKey && (
                      <button type="button" className="btn btn-ghost" onClick={forgetKey}>
                        Forget
                      </button>
                    )}
                  </div>
                  {keyNote && (
                    <p className="mt-2 text-sm" style={{ color: 'var(--color-accent-deep)' }} aria-live="polite">
                      {keyNote}
                    </p>
                  )}
                  <p className="mt-2.5 text-[0.8125rem] leading-relaxed" style={{ color: '#6b6863' }}>
                    The key stays in this browser and is sent straight to {provider === 'openai' ? 'OpenAI' : 'Anthropic'}{' '}
                    for each request. Versified never stores it, and never stores your answers on a server. It is the same
                    key the{' '}
                    <Link href="/cover-letter" className="tap link-draw font-semibold" style={{ color: 'var(--color-accent-deep)' }}>
                      cover letter builder
                    </Link>{' '}
                    uses.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

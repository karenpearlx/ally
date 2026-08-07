'use client';

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type Job = { id: string; role: string; company: string; period: string; bullets: string };
type Data = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  jobs: Job[];
};

const TEMPLATES = [
  { id: 'clean', name: 'Clean', note: 'Safest for ATS. What most clients expect.' },
  { id: 'bold', name: 'Bold', note: 'Teal header bar. Stands out in a stack of PDFs.' },
  { id: 'classic', name: 'Classic', note: 'Serif and centred. Formal, corporate-friendly.' },
] as const;
type TemplateId = (typeof TEMPLATES)[number]['id'];

const STORE = 'ally-resume';

const DEFAULTS: Data = {
  name: 'Karen Ong',
  title: 'Operations Lead / Executive Assistant',
  location: 'Negros Occidental, Philippines · Works US hours',
  email: 'you@example.com',
  phone: '+63 900 000 0000',
  summary:
    'Operations and executive support for small remote teams. I build the systems that keep a founder out of the weeds — inbox, calendar, reporting, and the people doing the work.',
  skills:
    'Executive support, Inbox & calendar, SEO, Content ops, Notion, Asana, Reddit ops, VA management, Reporting',
  jobs: [
    {
      id: 'j1',
      role: 'Operations Lead',
      company: 'OGTool',
      period: '2026 — present',
      bullets:
        'Ran blog and content workflow for 9 client accounts.\nManaged 3 VAs across Reddit ops and posting.\n250 posts shipped with a 61% first-page win rate.',
    },
    {
      id: 'j2',
      role: 'Senior SEO Manager',
      company: 'Cascade Web Solutions',
      period: '2024 — 2026',
      bullets:
        'Built operations for 30+ client accounts.\nGrew GBP interactions 762% for a local services client.\nMoved geogrid rank from 17.94 to 3.02.',
    },
  ],
};

export default function Resume() {
  const [tpl, setTpl] = useState<TemplateId>('clean');
  const [d, setD] = useState<Data>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setD({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* keep defaults */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORE, JSON.stringify(d));
  }, [d, ready]);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((p) => ({ ...p, [k]: v }));
  const setJob = (id: string, p: Partial<Job>) =>
    setD((prev) => ({ ...prev, jobs: prev.jobs.map((j) => (j.id === id ? { ...j, ...p } : j)) }));
  const addJob = () =>
    setD((prev) => ({
      ...prev,
      jobs: [...prev.jobs, { id: crypto.randomUUID(), role: '', company: '', period: '', bullets: '' }],
    }));
  const delJob = (id: string) =>
    setD((prev) => ({ ...prev, jobs: prev.jobs.filter((j) => j.id !== id) }));

  return (
    <div className="min-h-screen">
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Resume builder</p>
          <h1 className="display-lg mt-4">
            Fill it once. Reuse it forever<span className="dot">.</span>
          </h1>
          <p className="lede mt-5 max-w-xl">
            Three templates built for remote VA roles. Your details save automatically, so the next
            version takes a minute instead of an evening.
          </p>
        </div>
      </section>

      {/* templates */}
      <section className="px-5 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {TEMPLATES.map((t) => {
              const on = tpl === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTpl(t.id)}
                  className="card p-5 text-left transition-transform hover:-translate-y-0.5"
                  style={on ? { boxShadow: '0 0 0 2px var(--color-accent), var(--shadow-card)' } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-extrabold tracking-tight">{t.name}</span>
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full"
                      style={{
                        border: `1.5px solid ${on ? 'var(--color-accent)' : 'var(--color-line-2)'}`,
                        background: on ? 'var(--color-accent)' : 'transparent',
                      }}
                    >
                      {on && (
                        <svg width="9" height="7" viewBox="0 0 10 8" fill="none" aria-hidden>
                          <path d="M1 4.2 3.5 6.7 9 1.2" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                    {t.note}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* form + preview */}
      <section className="px-5 pt-6 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_1.05fr]">
          {/* form */}
          <div className="card p-6 md:p-8">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Your details</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Input label="Full name" v={d.name} on={(v) => set('name', v)} />
              <Input label="Headline" v={d.title} on={(v) => set('title', v)} />
              <div className="sm:col-span-2">
                <Input label="Location / availability" v={d.location} on={(v) => set('location', v)} />
              </div>
              <Input label="Email" v={d.email} on={(v) => set('email', v)} />
              <Input label="Phone" v={d.phone} on={(v) => set('phone', v)} />
            </div>

            <div className="mt-4">
              <Label>Summary</Label>
              <textarea className="field" rows={3} value={d.summary} onChange={(e) => set('summary', e.target.value)} />
            </div>

            <div className="mt-4">
              <Label>Skills (comma separated)</Label>
              <textarea className="field" rows={2} value={d.skills} onChange={(e) => set('skills', e.target.value)} />
            </div>

            <h3 className="font-display mt-8 text-lg font-extrabold tracking-tight">Experience</h3>
            <div className="mt-4 space-y-4">
              {d.jobs.map((j, i) => (
                <div key={j.id} className="rounded-2xl p-4" style={{ border: '1px solid var(--color-line)' }}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-faint)' }}>
                      Role {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => delJob(j.id)}
                      className="tap text-sm underline underline-offset-2"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Job title" v={j.role} on={(v) => setJob(j.id, { role: v })} />
                    <Input label="Company" v={j.company} on={(v) => setJob(j.id, { company: v })} />
                    <div className="sm:col-span-2">
                      <Input label="Period" v={j.period} on={(v) => setJob(j.id, { period: v })} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label>Bullets (one per line)</Label>
                    <textarea
                      className="field"
                      rows={3}
                      value={j.bullets}
                      onChange={(e) => setJob(j.id, { bullets: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn btn-ghost mt-4 w-full" onClick={addJob}>
              + Add another role
            </button>
          </div>

          {/* preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow" style={{ color: 'var(--color-faint)' }}>
                Live preview
              </p>
              <button type="button" className="btn btn-ink !px-4 !py-2 !text-sm" onClick={() => window.print()}>
                Export PDF
              </button>
            </div>
            <div id="sheet" className="card-float overflow-hidden">
              <Sheet tpl={tpl} d={d} />
            </div>
            <p className="mt-3 text-center text-sm" style={{ color: 'var(--color-faint)' }}>
              Export uses your browser&rsquo;s print dialog — choose &ldquo;Save as PDF&rdquo;.
            </p>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #sheet,
          #sheet * {
            visibility: visible !important;
          }
          #sheet {
            position: absolute;
            inset: 0;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-sm font-medium">{children}</span>;
}

function Input({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input className="field" value={v} onChange={(e) => on(e.target.value)} />
    </label>
  );
}

function Sheet({ tpl, d }: { tpl: TemplateId; d: Data }) {
  const skills = d.skills.split(',').map((s) => s.trim()).filter(Boolean);
  const classic = tpl === 'classic';

  return (
    <div
      className="bg-white p-7 md:p-9"
      style={{ fontFamily: classic ? 'var(--display)' : 'var(--font-sans-body), sans-serif' }}
    >
      {/* header */}
      {tpl === 'bold' ? (
        <div className="-mx-7 -mt-7 mb-6 px-7 py-6 md:-mx-9 md:-mt-9 md:px-9" style={{ background: 'var(--color-accent)' }}>
          <h2 className="font-display wrap-anywhere text-2xl font-extrabold tracking-tight text-white">{d.name}</h2>
          <p className="wrap-anywhere mt-1 text-sm" style={{ color: 'rgba(255,255,255,.85)' }}>
            {d.title}
          </p>
        </div>
      ) : (
        <div className={classic ? 'text-center' : ''}>
          <h2 className="font-display wrap-anywhere text-2xl font-extrabold tracking-tight">{d.name}</h2>
          <p className="wrap-anywhere mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            {d.title}
          </p>
          <div
            className="mt-3 h-px w-full"
            style={{ background: tpl === 'clean' ? 'var(--color-accent)' : 'var(--color-line-2)' }}
          />
        </div>
      )}

      <p
        className={`wrap-anywhere mt-3 text-[0.6875rem] ${classic ? 'text-center' : ''}`}
        style={{ color: 'var(--color-muted)' }}
      >
        {[d.location, d.email, d.phone].filter(Boolean).join(' · ')}
      </p>

      {d.summary && (
        <p className="wrap-anywhere mt-5 text-[0.8125rem] leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
          {d.summary}
        </p>
      )}

      {skills.length > 0 && (
        <>
          <SectionTitle tpl={tpl}>Skills</SectionTitle>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="wrap-anywhere rounded-md px-2 py-1 text-[0.6875rem]"
                style={{
                  background: tpl === 'bold' ? 'var(--color-accent-soft)' : 'var(--color-paper-2)',
                  color: tpl === 'bold' ? 'var(--color-accent-deep)' : 'var(--color-ink-2)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </>
      )}

      <SectionTitle tpl={tpl}>Experience</SectionTitle>
      <div className="mt-2 space-y-4">
        {d.jobs.map((j) => (
          <div key={j.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="wrap-anywhere text-[0.8125rem] font-bold">
                {j.role || 'Role'}
                {j.company && <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}> · {j.company}</span>}
              </p>
              <span className="text-[0.6875rem]" style={{ color: 'var(--color-faint)' }}>
                {j.period}
              </span>
            </div>
            <ul className="mt-1.5 space-y-1">
              {j.bullets
                .split('\n')
                .map((b) => b.trim())
                .filter(Boolean)
                .map((b, i) => (
                  <li key={i} className="wrap-anywhere flex gap-2 text-[0.75rem] leading-relaxed">
                    <span style={{ color: 'var(--color-accent)' }}>▪</span>
                    <span style={{ color: 'var(--color-ink-2)' }}>{b}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ tpl, children }: { tpl: TemplateId; children: React.ReactNode }) {
  return (
    <h3
      className="mt-6 text-[0.625rem] font-bold uppercase tracking-[0.16em]"
      style={{
        color: tpl === 'classic' ? 'var(--color-ink)' : 'var(--color-accent)',
        fontFamily: 'var(--font-sans-body), sans-serif',
      }}
    >
      {children}
    </h3>
  );
}

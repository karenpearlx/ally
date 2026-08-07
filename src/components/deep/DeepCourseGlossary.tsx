'use client';

import { useId, useMemo, useState } from 'react';
import type { DeepCourseGlossaryEntry } from '@/lib/deep-course-types';

export default function DeepCourseGlossary({ entries }: { entries: DeepCourseGlossaryEntry[] }) {
  const [q, setQ] = useState('');
  const inputId = useId();

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter(
      (e) => e.term.toLowerCase().includes(needle) || e.def.toLowerCase().includes(needle),
    );
  }, [entries, q]);

  return (
    <section id="glossary" className="scroll-mt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.75rem] font-semibold text-ink">The words in the job ads</h2>
          <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-ink-2">
            {entries.length} terms you will meet in listings and client calls. Understanding them is most of what
            &ldquo;experienced&rdquo; means.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <label htmlFor={inputId} className="sr-only">
            Search the glossary
          </label>
          <input
            id={inputId}
            type="search"
            placeholder="Search terms…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-full rounded-full border border-line-input bg-card px-4 text-[0.875rem] text-ink placeholder:text-muted-2 focus:border-teal-deep focus:outline-none"
          />
        </div>
      </div>

      {shown.length ? (
        <dl className="mt-7 grid gap-x-8 gap-y-0 sm:grid-cols-2">
          {shown.map((e) => (
            <div key={e.term} className="border-b border-line py-4">
              <dt className="font-display text-[0.9375rem] font-semibold text-ink">{e.term}</dt>
              <dd className="mt-1 text-[0.875rem] leading-relaxed text-ink-2">{e.def}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-7 rounded-xl border border-line-2 bg-paper-2/60 px-4 py-6 text-center text-[0.875rem] text-muted">
          No term matches &ldquo;{q}&rdquo;.
        </p>
      )}
    </section>
  );
}

'use client';

import { useId } from 'react';
import { NICHES, NICHE_GROUPS, nicheMeta, type Niche } from '@/lib/cover-letter-templates';

/**
 * One dropdown for seventeen letter templates.
 *
 * Seventeen cards is a wall, so this is a native <select> with optgroups: real
 * keyboard support, real mobile pickers, no roving-tabindex reimplementation to
 * get wrong. The selected niche's description lives underneath so the tradeoff
 * of losing the card blurbs is only that you see one at a time.
 *
 * `suggested` is what the pasted listing looks like. When it differs from the
 * current pick we offer it as one tap rather than silently switching under
 * someone mid-letter.
 */
export default function NichePicker({
  value,
  onChange,
  suggested = null,
  label = 'Letter template',
  hideLabel = false,
  name,
}: {
  value: Niche;
  onChange: (next: Niche) => void;
  suggested?: Niche | null;
  label?: string;
  hideLabel?: boolean;
  name?: string;
}) {
  const id = useId();
  const selectId = `${id}-niche`;
  const descId = `${id}-desc`;
  const meta = nicheMeta(value);
  const matched = suggested === value;
  const offer = suggested && suggested !== value ? nicheMeta(suggested) : null;

  return (
    <div>
      <label
        htmlFor={selectId}
        className={hideLabel ? 'sr-only' : 'mb-1.5 block text-sm font-medium'}
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={selectId}
          name={name}
          className="field !pr-11"
          style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
          value={value}
          aria-describedby={descId}
          onChange={(e) => onChange(e.target.value as Niche)}
        >
          {NICHE_GROUPS.map((group) => (
            <optgroup key={group} label={group}>
              {NICHES.filter((n) => n.group === group).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                  {suggested === n.id ? ' — suggested' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg
          aria-hidden
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-muted)' }}
        >
          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p
        id={descId}
        className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] leading-relaxed"
        style={{ color: 'var(--color-muted)' }}
      >
        {matched && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            match
          </span>
        )}
        <span>{meta.blurb}</span>
      </p>

      {offer && (
        <p className="mt-2 text-[0.8125rem]" aria-live="polite">
          <span style={{ color: 'var(--color-muted)' }}>This listing reads like </span>
          <button
            type="button"
            onClick={() => onChange(offer.id)}
            className="font-semibold underline underline-offset-2"
            style={{ color: 'var(--color-accent-deep)' }}
          >
            {offer.label}
          </button>
          <span style={{ color: 'var(--color-muted)' }}> — switch?</span>
        </p>
      )}
    </div>
  );
}

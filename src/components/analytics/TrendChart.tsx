'use client';

import { useId, useState } from 'react';
import type { TrendPoint } from '@/lib/insights';

/**
 * Applications over time. One SVG, no chart library.
 *
 * The line is drawn in a 0-100 viewBox with `preserveAspectRatio="none"`, so
 * the stroke needs `vector-effect` to stay 2px instead of smearing wide. Points
 * are read out in a visually hidden list underneath, because a polyline tells a
 * screen reader nothing at all.
 */
export default function TrendChart({
  weekly,
  monthly,
}: {
  weekly: TrendPoint[];
  monthly: TrendPoint[];
}) {
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  const gradientId = useId();
  const data = range === 'weekly' ? weekly : monthly;

  const peak = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? 100 / (data.length - 1) : 100;
  const y = (v: number) => 100 - (v / peak) * 85 - 8;
  const coords = data.map((d, i) => [i * step, y(d.value)] as const);
  const line = coords.map(([x, yy]) => `${x},${yy}`).join(' ');
  const area = `0,100 ${line} 100,100`;
  const totalInRange = data.reduce((s, d) => s + d.value, 0);

  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-tight">Pace</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            {totalInRange} added in the last {range === 'weekly' ? '12 weeks' : '6 months'}
          </p>
        </div>

        <div
          className="flex gap-1 rounded-full p-1"
          role="group"
          aria-label="Trend range"
          style={{ background: 'var(--color-paper-2)' }}
        >
          {(['weekly', 'monthly'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className="tap-control rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors"
              style={{
                background: range === r ? 'var(--color-surface)' : 'transparent',
                color: range === r ? 'var(--color-ink)' : 'var(--color-muted)',
                boxShadow: range === r ? 'var(--shadow-tile)' : 'none',
              }}
            >
              {r === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-6 h-44 md:h-52">
        {[0, 0.5, 1].map((f) => (
          <div
            key={f}
            aria-hidden
            className="absolute inset-x-0"
            style={{ top: `${f * 100}%`, borderTop: '1px dashed var(--color-line)' }}
          />
        ))}
        <span
          aria-hidden
          className="absolute right-0 -top-4 text-xs"
          style={{ color: 'var(--color-faint)' }}
        >
          peak {peak}
        </span>

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          focusable="false"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.26" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#${gradientId})`} />
          <polyline
            points={line}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.25"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Dots live outside the stretched viewBox so they stay round. */}
        <div className="pointer-events-none absolute inset-0">
          {coords.map(([x, yy], i) => (
            <span
              key={data[i].key}
              title={`${data[i].label} · ${data[i].value}`}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${x}%`,
                top: `${yy}%`,
                background: 'var(--color-surface)',
                border: `2px solid var(--color-accent)`,
                opacity: data[i].value > 0 ? 1 : 0.35,
              }}
            />
          ))}
        </div>
      </div>

      <figcaption
        className="mt-3 flex justify-between text-xs"
        style={{ color: 'var(--color-faint)' }}
      >
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </figcaption>

      <ul className="sr-only">
        {data.map((d) => (
          <li key={d.key}>
            {d.label}: {d.value} applications
          </li>
        ))}
      </ul>
    </figure>
  );
}

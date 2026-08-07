'use client';

import { Empty, nf } from './ui';

/**
 * Charts are CSS bars plus one SVG path. No chart library, no canvas.
 * The line uses `vector-effect: non-scaling-stroke` so a stretched viewBox
 * keeps an even 2px stroke instead of a smeared one.
 */

export type TimelineDatum = { date: string; views: number; sessions: number };

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

export function Timeline({
  data,
  height = 168,
  primaryLabel = 'Page views',
  lineLabel = 'Sessions',
}: {
  data: TimelineDatum[];
  height?: number;
  primaryLabel?: string;
  lineLabel?: string;
}) {
  if (!data.length) return <Empty>No days in range.</Empty>;

  const peak = Math.max(1, ...data.map((d) => Math.max(d.views, d.sessions)));
  const step = 100 / data.length;
  const points = data
    .map((d, i) => `${(i + 0.5) * step},${100 - (d.sessions / peak) * 100}`)
    .join(' ');
  const showLine = data.some((d) => d.sessions > 0);

  return (
    <figure className="m-0">
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--color-accent)' }} />
          {primaryLabel}
        </span>
        {showLine ? (
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
            <span className="h-[2px] w-4 rounded-full" style={{ background: 'var(--color-ink)' }} />
            {lineLabel}
          </span>
        ) : null}
        <span className="ml-auto text-xs ad-num" style={{ color: 'var(--color-faint)' }}>
          peak {nf.format(peak)}
        </span>
      </div>

      <div className="relative" style={{ height }}>
        {[0, 0.5, 1].map((fraction) => (
          <div
            key={fraction}
            aria-hidden
            className="absolute inset-x-0"
            style={{ top: `${fraction * 100}%`, borderTop: '1px dashed var(--color-line)' }}
          />
        ))}

        <div className="absolute inset-0 flex items-end gap-[2px]">
          {data.map((d) => (
            <div
              key={d.date}
              className="group relative flex-1"
              style={{ height: '100%' }}
              title={`${dayLabel(d.date)} · ${nf.format(d.views)} views · ${nf.format(d.sessions)} sessions`}
            >
              <div
                className="absolute bottom-0 w-full rounded-t-[3px] transition-[height] duration-500"
                style={{
                  height: `${(d.views / peak) * 100}%`,
                  minHeight: d.views > 0 ? 2 : 0,
                  background: 'var(--color-accent)',
                  opacity: 0.85,
                }}
              />
            </div>
          ))}
        </div>

        {showLine ? (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <polyline
              points={points}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.75"
            />
          </svg>
        ) : null}
      </div>

      <figcaption className="mt-2 flex justify-between text-xs" style={{ color: 'var(--color-faint)' }}>
        <span>{dayLabel(data[0].date)}</span>
        <span>{dayLabel(data[data.length - 1].date)}</span>
      </figcaption>
    </figure>
  );
}

export function BarRows({
  rows,
  emptyText = 'Nothing recorded yet.',
  unit,
}: {
  rows: { label: string; value: number; hint?: string }[];
  emptyText?: string;
  unit?: string;
}) {
  if (!rows.length) return <Empty>{emptyText}</Empty>;
  const peak = Math.max(1, ...rows.map((row) => row.value));

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={`${row.label}-${row.hint ?? ''}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm" title={row.label}>
              {row.label}
            </span>
            <span className="ad-num flex-none text-sm font-semibold">
              {nf.format(row.value)}
              {unit ? <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-faint)' }}>{unit}</span> : null}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-paper-2)' }}>
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${(row.value / peak) * 100}%`, background: 'var(--color-accent)' }}
            />
          </div>
          {row.hint ? (
            <p className="mt-1 truncate text-xs" style={{ color: 'var(--color-faint)' }} title={row.hint}>
              {row.hint}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

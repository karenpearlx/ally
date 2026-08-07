/**
 * /analytics, with the data already fetched.
 *
 * Server-rendered apart from the range toggle on the trend chart: nothing here
 * changes after paint, and a job hunt's numbers are depressing enough without
 * waiting for a chart bundle to boot first.
 */

import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import GradientBg from '@/components/GradientBg';
import TrendChart from '@/components/analytics/TrendChart';
import type { Insights } from '@/lib/insights';

const rate = (v: number | null) => (v === null ? '—' : `${v >= 9.95 ? Math.round(v) : v.toFixed(1)}%`);
const days = (v: number | null) =>
  v === null ? '—' : v < 1 ? `${Math.round(v * 24)}h` : `${v < 10 ? v.toFixed(1) : Math.round(v)}d`;

const dateLabel = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

/* ---------------------------------------------------------------- */

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: 'accent';
}) {
  return (
    <div className="card p-5 md:p-6">
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
      <p
        className="font-display mt-1.5 text-4xl font-extrabold tracking-tight"
        style={tone === 'accent' ? { color: 'var(--color-accent-deep)' } : undefined}
      >
        {value}
      </p>
      <p className="mt-1.5 text-sm" style={{ color: 'var(--color-faint)' }}>
        {sub}
      </p>
    </div>
  );
}

/** Sent → replied → interviewed → offered, as four shrinking bars. */
function Funnel({ data }: { data: Insights }) {
  const steps = [
    { label: 'Sent', value: data.sent, color: 'var(--color-ink)' },
    { label: 'Got a reply', value: data.responded, color: 'var(--color-accent)' },
    { label: 'Interviewed', value: data.interviews, color: '#2f9e8c' },
    { label: 'Offered', value: data.offers, color: '#2f7a45' },
  ];
  const peak = Math.max(1, data.sent);

  return (
    <ol className="mt-6 space-y-3.5">
      {steps.map((s) => (
        <li key={s.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">{s.label}</span>
            <span className="font-display text-sm font-bold">
              {s.value}
              {s.label !== 'Sent' && data.sent > 0 ? (
                <span className="ml-1.5 font-normal" style={{ color: 'var(--color-faint)' }}>
                  {rate((s.value / data.sent) * 100)}
                </span>
              ) : null}
            </span>
          </div>
          <div
            className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--color-paper-2)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(s.value > 0 ? 3 : 0, (s.value / peak) * 100)}%`,
                background: s.color,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Status split. A ring rather than a pie: the total belongs in the hole. */
function Donut({ data }: { data: Insights }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const total = Math.max(1, data.total);

  // Arc lengths and their running start, worked out before the JSX so nothing
  // mutates mid-render.
  const arcs: { key: string; color: string; len: number; start: number }[] = [];
  data.statuses.reduce((start, s) => {
    const len = (s.value / total) * C;
    arcs.push({ key: s.key, color: s.color, len, start });
    return start + len;
  }, 0);

  return (
    <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative flex-none">
        <svg width="148" height="148" viewBox="0 0 140 140" role="img" aria-label="Applications by status">
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-paper-2)" strokeWidth="18" />
          {arcs.map((arc, i) => {
            const drawn = Math.max(0, arc.len - 1.5);
            return (
              <circle
                key={arc.key}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth="18"
                strokeDasharray={`${drawn} ${C - drawn}`}
                strokeDashoffset={-arc.start}
                transform="rotate(-90 70 70)"
              >
                <title>{`${data.statuses[i].label}: ${data.statuses[i].value}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-3xl font-extrabold tracking-tight">{data.total}</p>
            <p className="text-xs" style={{ color: 'var(--color-faint)' }}>
              tracked
            </p>
          </div>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2">
        {data.statuses.map((s) => (
          <li key={s.key} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden
              className="h-2.5 w-2.5 flex-none rounded-full"
              style={{ background: s.color }}
            />
            <span className="min-w-0 truncate">{s.label}</span>
            <span className="ml-auto flex-none font-display font-bold">{s.value}</span>
            <span className="w-11 flex-none text-right" style={{ color: 'var(--color-faint)' }}>
              {rate((s.value / total) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sources({ data }: { data: Insights }) {
  const peak = Math.max(1, ...data.sources.map((s) => s.total));
  // Cap single-source bars at 75% so they don't look broken
  const maxWidth = data.sources.length === 1 ? 75 : 100;

  return (
    <ul className="mt-6 space-y-4">
      {data.sources.map((s) => (
        <li key={s.key}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm font-medium">{s.label}</span>
            <span className="font-display flex-none text-sm font-bold">
              {s.total}
              <span className="ml-1.5 font-normal" style={{ color: 'var(--color-faint)' }}>
                {s.sent > 0 ? `${rate((s.replies / s.sent) * 100)} reply rate` : 'none sent'}
              </span>
            </span>
          </div>
          <div
            className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--color-paper-2)' }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min((s.total / peak) * 100, maxWidth)}%`, background: 'var(--color-accent)' }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Types({ data }: { data: Insights }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <caption className="sr-only">Reply rate by job type</caption>
        <thead>
          <tr style={{ color: 'var(--color-muted)' }}>
            <th scope="col" className="py-2 text-left font-medium">
              Job type
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Sent
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Replies
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Interviews
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {data.types.map((t) => (
            <tr key={t.label} style={{ borderTop: '1px solid var(--color-line)' }}>
              <th scope="row" className="py-3 pr-3 text-left font-medium">
                {t.label}
                {t.offers > 0 ? (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: '#e9f6ec', color: '#2f7a45' }}
                  >
                    {t.offers} offer{t.offers === 1 ? '' : 's'}
                  </span>
                ) : null}
              </th>
              <td className="py-3 text-right tabular-nums">{t.sent}</td>
              <td className="py-3 text-right tabular-nums">{t.replies}</td>
              <td className="py-3 text-right tabular-nums">{t.interviews}</td>
              <td className="py-3 text-right">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
                  style={{
                    background: t.replies > 0 ? 'var(--color-accent-soft)' : 'var(--color-paper-2)',
                    color: t.replies > 0 ? 'var(--color-accent-deep)' : 'var(--color-muted)',
                  }}
                >
                  {rate(t.responseRate)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs" style={{ color: 'var(--color-faint)' }}>
        Types are guessed from the job title. Anything with two or three
        applications behind it is a coincidence, not a pattern.
      </p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <GradientBg position="right" />
      <Nav />
      {children}
      <Footer />
    </div>
  );
}

function Head({ lede }: { lede: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Insights</p>
      <h1 className="display-lg mt-4">
        What the board is telling you<span className="dot">.</span>
      </h1>
      <p className="lede mt-5 max-w-xl">{lede}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- */

export default function AnalyticsView({ data, ready }: { data: Insights; ready: boolean }) {
  if (!ready || data.total === 0) {
    return (
      <Shell>
        <section className="px-5 pt-28 pb-24 md:px-8 md:pt-40">
          <Head
            lede={
              ready
                ? 'Nothing to measure yet. Track a few applications and this page starts telling you which boards and which roles are worth your time.'
                : 'Your applications are not available right now, so there is nothing to count. Try again in a minute.'
            }
          />
          <div className="mx-auto mt-8 max-w-5xl">
            <Link href="/tracker" className="btn btn-primary">
              Open the tracker
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  const since = dateLabel(data.firstAt);
  const thin = data.sent < 10;

  return (
    <Shell>
      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <Head
          lede={`${data.sent} application${data.sent === 1 ? '' : 's'} sent${
            since ? ` since ${since}` : ''
          }. ${data.live} still in play.`}
        />
      </section>

      {/* ---------- headline rates ---------- */}
      <section className="px-5 pt-10 md:px-8 md:pt-12">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Reply rate"
            value={rate(data.responseRate)}
            sub={`${data.responded} of ${data.sent} heard back`}
            tone="accent"
          />
          <Stat
            label="Interview rate"
            value={rate(data.interviewRate)}
            sub={`${data.interviews} reached an interview`}
          />
          <Stat
            label="Offer rate"
            value={rate(data.offerRate)}
            sub={`${data.offers} offer${data.offers === 1 ? '' : 's'}`}
          />
          <Stat
            label="Typical wait"
            value={days(data.medianResponseDays)}
            sub={
              data.responseSample
                ? `median of ${data.responseSample} · avg ${days(data.avgResponseDays)}`
                : 'no replies timed yet'
            }
          />
        </div>

        {thin ? (
          <p
            className="mx-auto mt-4 max-w-5xl text-sm"
            style={{ color: 'var(--color-muted)' }}
          >
            Under ten applications, these percentages swing wildly. Treat them as
            a rough shape, not a verdict.
          </p>
        ) : null}
      </section>

      {/* ---------- funnel + statuses ---------- */}
      <section className="px-5 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
          <div className="card p-6 md:p-7">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Funnel</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
              Where the drop-off happens.
            </p>
            <Funnel data={data} />
          </div>

          <div className="card p-6 md:p-7">
            <h2 className="font-display text-xl font-extrabold tracking-tight">By status</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
              Everything on the board right now, saved rows included.
            </p>
            <Donut data={data} />
          </div>
        </div>
      </section>

      {/* ---------- trend ---------- */}
      <section className="px-5 pt-4 md:px-8 md:pt-6">
        <div className="mx-auto max-w-5xl">
          <div className="card p-6 md:p-7">
            <TrendChart weekly={data.weekly} monthly={data.monthly} />
          </div>
        </div>
      </section>

      {/* ---------- sources + types ---------- */}
      <section className="px-5 pt-4 md:px-8 md:pt-6">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_1.35fr]">
          <div className="card p-6 md:p-7">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Where they came from</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
              Read from each listing&rsquo;s link.
            </p>
            <Sources data={data} />
          </div>

          <div className="card p-6 md:p-7">
            <h2 className="font-display text-xl font-extrabold tracking-tight">What actually lands</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
              Best reply rate first.
            </p>
            <Types data={data} />
          </div>
        </div>
      </section>

      {/* ---------- honesty note ---------- */}
      <section className="px-5 pt-6 pb-24 md:px-8 md:pt-8 md:pb-32">
        <div className="mx-auto max-w-5xl">
          <div className="panel p-5 md:p-6">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              A reply means the status moved to interviewing, offer, accepted or
              rejected — a no counts as an answer. Waiting time is measured from
              when you added the row to the last time you changed it, so it is
              only as accurate as your own updates. Saved rows are left out of
              every rate.{' '}
              <Link href="/tracker" className="tap font-semibold" style={{ color: 'var(--color-accent-deep)' }}>
                Keep the tracker current
              </Link>{' '}
              and these numbers get sharper.
            </p>
          </div>
        </div>
      </section>
    </Shell>
  );
}

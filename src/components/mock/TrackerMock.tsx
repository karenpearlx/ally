const STATUSES: Record<string, { bg: string; fg: string }> = {
  Applied: { bg: '#eef2ff', fg: '#4453b8' },
  Interviewing: { bg: '#e6f4f1', fg: '#0a7d6f' },
  Offer: { bg: '#e9f6ec', fg: '#2f7a45' },
  Rejected: { bg: '#f2f0ee', fg: '#7d7a75' },
};

const ROWS = [
  { role: 'Executive Assistant', co: 'Northwind Labs', status: 'Interviewing', days: 2, flag: false },
  { role: 'SEO Content Manager', co: 'Peakline Media', status: 'Applied', days: 7, flag: true },
  { role: 'Ops Coordinator', co: 'Salt & Stone', status: 'Applied', days: 6, flag: true },
  { role: 'Customer Support Lead', co: 'Fernway', status: 'Offer', days: 1, flag: false },
  { role: 'Video Editor', co: 'Halcyon Studio', status: 'Rejected', days: 12, flag: false },
];

export default function TrackerMock() {
  const needFollowUp = ROWS.filter((r) => r.flag).length;

  return (
    <div className="card-float overflow-hidden">
      {/* header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-7"
        style={{ borderBottom: '1px solid var(--color-line)' }}
      >
        <h3 className="font-display text-lg font-extrabold tracking-tight">Your applications</h3>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: '#fdf0e8', color: '#b5581f' }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#e07a2f' }} />
          {needFollowUp} need a follow-up
        </span>
      </div>

      {/* add row */}
      <div
        className="flex flex-wrap items-center gap-2 px-5 py-4 md:px-7"
        style={{ background: '#faf9f8', borderBottom: '1px solid var(--color-line)' }}
      >
        <span
          className="flex-1 truncate rounded-full px-4 py-2 text-[0.8125rem]"
          style={{ background: '#fff', border: '1px solid var(--color-line-2)', color: 'var(--color-faint)', minWidth: 160 }}
        >
          Paste a job listing URL…
        </span>
        <span
          className="rounded-full px-3.5 py-2 text-[0.8125rem] font-medium"
          style={{ background: '#fff', border: '1px solid var(--color-line-2)', color: 'var(--color-ink-2)' }}
        >
          Applied <span style={{ opacity: 0.5 }}>⌄</span>
        </span>
        <span
          className="rounded-full px-4 py-2 text-[0.8125rem] font-semibold text-white"
          style={{ background: 'var(--color-accent)' }}
        >
          Save
        </span>
      </div>

      {/* rows */}
      <ul>
        {ROWS.map((r, i) => {
          const s = STATUSES[r.status];
          return (
            <li
              key={r.role}
              className="flex items-center gap-3 px-5 py-3.5 md:px-7"
              style={{ borderBottom: i < ROWS.length - 1 ? '1px solid var(--color-line)' : undefined }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-semibold">{r.role}</p>
                <p className="truncate text-[0.8125rem]" style={{ color: 'var(--color-muted)' }}>
                  {r.co}
                </p>
              </div>

              {r.flag && (
                <span
                  className="hidden flex-none rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold sm:inline"
                  style={{ background: '#fdf0e8', color: '#b5581f' }}
                >
                  {r.days}d — nudge them
                </span>
              )}

              <span
                className="flex-none rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold"
                style={{ background: s.bg, color: s.fg }}
              >
                {r.status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

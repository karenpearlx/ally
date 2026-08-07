const LEVELS = [
  { top: "ENTRY", mid: "0–1", bot: "yrs" },
  { top: "JUNIOR", mid: "1–2", bot: "yrs" },
  { top: "MID", mid: "2–4", bot: "yrs" },
  { top: "SENIOR", mid: "4–6", bot: "yrs" },
];

const BREAKDOWN = [
  { role: "Executive Assistant", low: "$8", high: "$14", pct: 62 },
  { role: "SEO Specialist", low: "$9", high: "$17", pct: 78 },
  { role: "Project Manager", low: "$11", high: "$21", pct: 100 },
  { role: "Customer Support", low: "$5", high: "$9", pct: 40 },
];

export default function PhoneMock() {
  return (
    <div className="phone mx-auto w-full max-w-[340px]">
      <div className="px-1">
        <h3 className="font-display text-lg font-extrabold tracking-tight">Rate check</h3>

        {/* experience tiles */}
        <div className="no-bar mt-3 flex gap-2 overflow-x-auto pb-1">
          {LEVELS.map((l, i) => {
            const on = i === 2;
            return (
              <div
                key={l.top}
                className="flex-none rounded-xl px-3.5 py-2.5 text-center"
                style={{
                  background: on ? "var(--color-ink)" : "#fff",
                  border: `1px solid ${on ? "var(--color-ink)" : "var(--color-line-2)"}`,
                  color: on ? "#fff" : "var(--color-ink)",
                  minWidth: 68,
                }}
              >
                <div
                  className="text-[0.5625rem] font-semibold tracking-[0.1em]"
                  style={{ color: on ? "rgba(255,255,255,.65)" : "var(--color-faint)" }}
                >
                  {l.top}
                </div>
                <div className="font-display text-base font-extrabold leading-tight">{l.mid}</div>
                <div
                  className="text-[0.625rem]"
                  style={{ color: on ? "rgba(255,255,255,.65)" : "var(--color-muted)" }}
                >
                  {l.bot}
                </div>
              </div>
            );
          })}
        </div>

        {/* actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            <svg width="11" height="13" viewBox="0 0 12 14" fill="none" aria-hidden>
              <path
                d="M6 13s4.6-4.2 4.6-7.4A4.6 4.6 0 0 0 1.4 5.6C1.4 8.8 6 13 6 13Z"
                stroke="#fff"
                strokeWidth="1.4"
              />
              <circle cx="6" cy="5.6" r="1.5" fill="#fff" />
            </svg>
            Philippines
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold text-white"
            style={{ background: "var(--color-ink)" }}
          >
            Full-time <span style={{ opacity: 0.6 }}>⌄</span>
          </span>
        </div>
        <div className="mt-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem]"
            style={{ border: "1px solid var(--color-line-2)", color: "var(--color-ink-2)" }}
          >
            4 skills selected <span style={{ opacity: 0.5 }}>⌄</span>
          </span>
        </div>

        {/* result */}
        <p
          className="mt-5 text-[0.625rem] font-semibold tracking-[0.14em]"
          style={{ color: "var(--color-faint)" }}
        >
          YOUR RANGE &nbsp;·&nbsp; 812 LISTINGS
        </p>

        <div
          className="mt-2 rounded-2xl p-4"
          style={{ border: "1px solid var(--color-line)", background: "#fff" }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[0.6875rem]" style={{ color: "var(--color-muted)" }}>
                Hourly
              </p>
              <p
                className="font-display text-2xl font-extrabold tracking-tight"
                style={{ color: "var(--color-accent)" }}
              >
                $11–19
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.6875rem]" style={{ color: "var(--color-muted)" }}>
                Monthly
              </p>
              <p className="font-display text-2xl font-extrabold tracking-tight">$1.7k–3k</p>
            </div>
          </div>

          <div
            className="relative mt-4 h-2 rounded-full"
            style={{ background: "var(--color-paper-2)" }}
          >
            <div
              className="absolute inset-y-0 rounded-full"
              style={{ left: "22%", right: "18%", background: "var(--color-accent)" }}
            />
          </div>
          <div
            className="mt-1.5 flex justify-between text-[0.625rem]"
            style={{ color: "var(--color-faint)" }}
          >
            <span>$4</span>
            <span style={{ color: "var(--color-accent-deep)", fontWeight: 600 }}>
              you&rsquo;re here
            </span>
            <span>$25</span>
          </div>
        </div>

        {/* breakdown rows */}
        <p
          className="mt-5 text-[0.625rem] font-semibold tracking-[0.14em]"
          style={{ color: "var(--color-faint)" }}
        >
          BY SKILL
        </p>
        <div className="mt-2 space-y-2">
          {BREAKDOWN.map((b) => (
            <div
              key={b.role}
              className="rounded-xl px-3 py-2.5"
              style={{ border: "1px solid var(--color-line)" }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[0.8125rem] font-medium">{b.role}</span>
                <span
                  className="font-display text-[0.8125rem] font-bold"
                  style={{ color: "var(--color-ink)" }}
                >
                  {b.low}–{b.high}
                </span>
              </div>
              <div
                className="mt-2 h-1.5 rounded-full"
                style={{ background: "var(--color-paper-2)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${b.pct}%`, background: "var(--color-accent)", opacity: 0.85 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

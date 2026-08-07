const FILTERS_1 = ["Newest", "Highest pay", "No interview"];
const FILTERS_2 = ["Remote", "PH-friendly", "Part-time"];

// tiny "demand map" — density of listings by skill, echoing a seat map
const GRID = [
  { label: "EA", cells: [3, 3, 2, 3, 2, 1] },
  { label: "SEO", cells: [2, 3, 3, 2, 1, 1] },
  { label: "SMM", cells: [3, 2, 2, 1, 1, 0] },
  { label: "Bkkp", cells: [2, 2, 1, 1, 0, 0] },
  { label: "Video", cells: [3, 3, 2, 2, 1, 0] },
];

const SHADE = ["#eeecea", "#c3e6df", "#6cc7b8", "#0d9b8a"];

/** `tracked` comes from the live job count so this can never contradict the
 *  stats strip above it. It used to be a second hardcoded "1,940". */
export default function FloatCards({ tracked = "Live" }: { tracked?: string }) {
  return (
    <div className="relative mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-0">
      {/* left card */}
      <div className="card-float relative z-10 p-6 md:mt-14 md:p-8">
        <p className="text-[0.8125rem]" style={{ color: "var(--color-faint)" }}>
          Home <span className="mx-1">/</span> Remote{" "}
          <span className="mx-1">/</span>{" "}
          <span style={{ color: "var(--color-ink-2)" }}>Executive Assistant</span>
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div
            className="font-display grid h-12 w-12 flex-none place-items-center rounded-xl text-lg font-extrabold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            EA
          </div>
          <div>
            <h3 className="font-display text-xl font-extrabold tracking-tight md:text-2xl">
              Executive Assistant
            </h3>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              214 open roles <span className="mx-1">·</span> 38 posted this week
            </p>
          </div>
        </div>

        <h4 className="font-display mt-7 text-lg font-extrabold tracking-tight">Sort it your way</h4>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS_1.map((f, i) => (
            <span
              key={f}
              className="rounded-full px-4 py-2 text-sm font-medium"
              style={
                i === 0
                  ? { background: "var(--color-ink)", color: "#fff" }
                  : { border: "1px solid var(--color-line-2)", color: "var(--color-ink-2)" }
              }
            >
              {f}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {FILTERS_2.map((f, i) => (
            <span
              key={f}
              className="rounded-full px-4 py-2 text-sm font-medium"
              style={
                i === 0
                  ? { background: "var(--color-ink)", color: "#fff" }
                  : { border: "1px solid var(--color-line-2)", color: "var(--color-ink-2)" }
              }
            >
              {f}
            </span>
          ))}
        </div>

        <div
          className="mt-7 flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: "var(--color-accent-soft)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--color-accent-deep)" }}>
            Median rate for this role
          </span>
          <span
            className="font-display text-lg font-extrabold"
            style={{ color: "var(--color-accent-deep)" }}
          >
            $9.50/hr
          </span>
        </div>
      </div>

      {/* right card — overlaps on desktop */}
      <div className="card-float relative z-20 p-6 md:-ml-10 md:mt-0 md:p-8">
        <h3 className="font-display text-lg font-extrabold tracking-tight">Where the demand is</h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Live map of listings by <strong style={{ color: "var(--color-ink-2)" }}>skill</strong> and
          pay band, rebuilt regularly.
        </p>

        <div className="mt-6">
          <div
            className="mx-auto mb-3 h-[3px] w-3/4 rounded-full"
            style={{ background: "linear-gradient(90deg,transparent,#cfcac3,transparent)" }}
          />
          <p
            className="mb-4 text-center text-[0.625rem] font-semibold tracking-[0.3em]"
            style={{ color: "var(--color-faint)" }}
          >
            PAY BAND
          </p>

          <div className="space-y-2">
            {GRID.map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <span
                  className="w-9 flex-none text-right text-[0.625rem] font-semibold"
                  style={{ color: "var(--color-faint)" }}
                >
                  {row.label}
                </span>
                <div className="flex flex-1 gap-1.5">
                  {row.cells.map((c, i) => (
                    <span
                      key={i}
                      className="h-5 flex-1 rounded-[4px]"
                      style={{ background: SHADE[c] }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-3 flex items-center justify-between pl-11 text-[0.625rem]"
            style={{ color: "var(--color-faint)" }}
          >
            <span>$4/hr</span>
            <span>$25/hr</span>
          </div>
        </div>

        <div
          className="mt-6 flex items-center justify-between border-t pt-4 text-sm"
          style={{ borderColor: "var(--color-line)" }}
        >
          <span className="flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: "var(--color-accent)" }}
            />
            Most listings
          </span>
          <span className="font-medium">{tracked} tracked</span>
        </div>

        <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
          <strong>Sweet spot:</strong> mid-level EA and SEO work. Enough volume that you can be
          picky, high enough band that raising your rate won&rsquo;t cost you the job.
        </p>
      </div>
    </div>
  );
}

const SOURCE_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  olj: { bg: "#eef2ff", fg: "#4453b8", label: "OLJ" },
  remoteok: { bg: "#fdf0e8", fg: "#b5581f", label: "RemoteOK" },
  upwork: { bg: "#e9f6ec", fg: "#2f7a45", label: "Upwork" },
};

export type MiniJob = {
  title: string;
  company: string;
  pay: string;
  source: keyof typeof SOURCE_STYLE;
  skills: string[];
  age: string;
};

export default function JobCardMini({ job }: { job: MiniJob }) {
  const s = SOURCE_STYLE[job.source];
  return (
    <div
      className="flex h-full min-w-0 flex-col rounded-2xl p-4 transition-shadow"
      style={{ border: "1px solid var(--color-line)", background: "#fff" }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4
          className="wrap-anywhere font-display min-w-0 text-[0.9375rem] font-bold leading-snug"
          style={{ color: "var(--color-ink)" }}
        >
          {job.title}
        </h4>
        <span
          className="flex-none rounded-md px-1.5 py-0.5 text-[0.625rem] font-semibold"
          style={{ background: s.bg, color: s.fg }}
        >
          {s.label}
        </span>
      </div>

      <p className="text-[0.8125rem]" style={{ color: "var(--color-muted)" }}>
        {job.company}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.map((sk) => (
          <span
            key={sk}
            className="rounded-md px-1.5 py-0.5 text-[0.6875rem]"
            style={{ background: "var(--color-paper-2)", color: "var(--color-ink-2)" }}
          >
            {sk}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-baseline justify-between pt-3">
        <span
          className="font-display text-[0.9375rem] font-bold"
          style={{ color: "var(--color-accent)" }}
        >
          {job.pay}
        </span>
        <span className="text-[0.6875rem]" style={{ color: "var(--color-faint)" }}>
          {job.age}
        </span>
      </div>
    </div>
  );
}

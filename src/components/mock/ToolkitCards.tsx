import Link from "next/link";
import Reveal from "../Reveal";
import PointerCard from "../PointerCard";

function CoverLetterArt() {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#faf9f8", border: "1px solid var(--color-line)" }}>
      <div className="flex items-center gap-2">
        <span
          className="truncate rounded-full px-3 py-1.5 text-[0.6875rem]"
          style={{ background: "#fff", border: "1px solid var(--color-line-2)", color: "var(--color-faint)" }}
        >
          Paste the job post…
        </span>
        <span
          className="flex-none rounded-full px-2.5 py-1.5 text-[0.6875rem] font-semibold text-white"
          style={{ background: "var(--color-accent)" }}
        >
          Write it
        </span>
      </div>
      <div className="mt-3 rounded-xl bg-white p-3.5" style={{ border: "1px solid var(--color-line)" }}>
        <p className="text-[0.6875rem] leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
          Hi Sarah — I saw you need someone to keep the inbox and calendar under control while you
          scale.{" "}
          <mark style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-deep)" }}>
            I did exactly that for a 12-person agency for three years
          </mark>
          , handling…
        </p>
        <div className="mt-2.5 space-y-1.5">
          <span className="block h-1.5 w-full rounded-full" style={{ background: "var(--color-paper-2)" }} />
          <span className="block h-1.5 w-4/5 rounded-full" style={{ background: "var(--color-paper-2)" }} />
        </div>
      </div>
    </div>
  );
}

function ResumeArt() {
  const tpl = [
    { name: "Clean", on: true },
    { name: "Bold", on: false },
    { name: "Classic", on: false },
  ];
  return (
    <div className="rounded-2xl p-4" style={{ background: "#faf9f8", border: "1px solid var(--color-line)" }}>
      <div className="flex gap-2">
        {tpl.map((t) => (
          <div key={t.name} className="flex-1">
            <div
              className="rounded-lg bg-white p-2"
              style={{
                border: `1.5px solid ${t.on ? "var(--color-accent)" : "var(--color-line-2)"}`,
                boxShadow: t.on ? "0 0 0 3px var(--color-accent-soft)" : undefined,
              }}
            >
              <span
                className="block h-1.5 w-2/3 rounded-full"
                style={{ background: t.on ? "var(--color-accent)" : "var(--color-line-2)" }}
              />
              <span className="mt-1.5 block h-1 w-full rounded-full" style={{ background: "var(--color-paper-2)" }} />
              <span className="mt-1 block h-1 w-full rounded-full" style={{ background: "var(--color-paper-2)" }} />
              <span className="mt-1 block h-1 w-3/4 rounded-full" style={{ background: "var(--color-paper-2)" }} />
              <span className="mt-2 block h-1 w-1/2 rounded-full" style={{ background: "var(--color-line-2)" }} />
              <span className="mt-1 block h-1 w-full rounded-full" style={{ background: "var(--color-paper-2)" }} />
            </div>
            <p
              className="mt-1.5 text-center text-[0.625rem] font-medium"
              style={{ color: t.on ? "var(--color-accent-deep)" : "var(--color-faint)" }}
            >
              {t.name}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[0.625rem]" style={{ color: "var(--color-faint)" }}>
        Export to PDF · ATS-safe
      </p>
    </div>
  );
}

function TrackerArt() {
  const rows = [
    { role: "Executive Assistant", status: "Interviewing", bg: "#e6f4f1", fg: "#0a7d6f" },
    { role: "SEO Content Manager", status: "Applied", bg: "#eef2ff", fg: "#4453b8" },
    { role: "Customer Support Lead", status: "Offer", bg: "#e9f6ec", fg: "#2f7a45" },
  ];
  return (
    <div className="rounded-2xl p-4" style={{ background: "#faf9f8", border: "1px solid var(--color-line)" }}>
      <div className="flex items-center gap-2">
        <span
          className="min-w-0 flex-1 truncate rounded-full px-3 py-1.5 text-[0.6875rem]"
          style={{ background: "#fff", border: "1px solid var(--color-line-2)", color: "var(--color-faint)" }}
        >
          onlinejobs.ph/jobseekers/job/…
        </span>
        <span
          className="flex-none rounded-full px-2.5 py-1.5 text-[0.6875rem] font-semibold text-white"
          style={{ background: "var(--color-accent)" }}
        >
          Save
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.role}
            className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2"
            style={{ border: "1px solid var(--color-line)" }}
          >
            <span className="min-w-0 truncate text-[0.6875rem] font-medium">{r.role}</span>
            <span
              className="flex-none rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
              style={{ background: r.bg, color: r.fg }}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReminderArt() {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#faf9f8", border: "1px solid var(--color-line)" }}>
      <div className="flex items-center justify-between rounded-xl bg-white p-3" style={{ border: "1px solid var(--color-line)" }}>
        <span className="text-[0.6875rem]" style={{ color: "var(--color-ink-2)" }}>
          Nudge me after
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold"
          style={{ background: "var(--color-ink)", color: "#fff" }}
        >
          5 days ⌄
        </span>
      </div>
      <div
        className="mt-2.5 flex items-start gap-2.5 rounded-xl p-3 overflow-visible"
        style={{ background: "#fdf0e8" }}
      >
        <span className="mt-0.5 text-sm shrink-0" aria-hidden>
          🔔
        </span>
        <p className="text-[0.6875rem] leading-relaxed min-w-0" style={{ color: "#8a4318" }}>
          <strong>Peakline Media</strong> hasn&rsquo;t replied in 7 days. Want to send a follow-up?
        </p>
      </div>
    </div>
  );
}

const TOOLS = [
  {
    n: "01",
    href: "/cover-letter",
    cta: "Open the builder",
    title: "Cover letter builder",
    body: "Paste the listing. Verse reads what they're asking for, pulls the matching bits out of your profile, and writes a short letter that sounds like you — not like a template.",
    art: <CoverLetterArt />,
  },
  {
    n: "02",
    href: "/resume",
    cta: "Pick a template",
    title: "Resume builder",
    body: "Pick a template built for remote VA roles, fill it once, and export. Your details stay saved, so the next version takes a minute instead of an evening.",
    art: <ResumeArt />,
  },
  {
    n: "03",
    href: "/tracker",
    cta: "Open your tracker",
    title: "Application tracker",
    body: "Drop in the job URL, set a status, add your notes. Everything you've sent lives in one list instead of scattered across tabs and a notes app.",
    art: <TrackerArt />,
  },
  {
    n: "04",
    href: "/tracker",
    cta: "See what needs a nudge",
    title: "Follow-up reminders",
    body: "Anything sitting untouched past five days gets flagged. Change the window if you like. Most people get a reply because they followed up, not because they applied.",
    art: <ReminderArt />,
  },
];

export default function ToolkitCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {TOOLS.map((t, i) => (
        <Reveal key={t.n} delay={(i % 2) * 90}>
          <PointerCard as="article" className="card lift flex h-full flex-col p-7 md:p-8">
            <p
              className="font-display text-sm font-extrabold tracking-[0.1em]"
              style={{ color: "var(--color-accent)" }}
            >
              {t.n}
            </p>
            <h3 className="font-display mt-4 text-2xl font-extrabold tracking-tight">{t.title}</h3>
            <p
              className="mt-3 text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              {t.body}
            </p>
            {t.art && <div className="mt-6">{t.art}</div>}
            <Link
              href={t.href}
              className="tap mt-6 inline-flex items-center gap-1.5 self-start text-[0.9375rem] font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              {t.cta}
              <svg width="13" height="11" viewBox="0 0 16 12" fill="none" aria-hidden>
                <path d="M1 6h13m-4.5-4.5L14 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </PointerCard>
        </Reveal>
      ))}
    </div>
  );
}

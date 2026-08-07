import JobCardMini, { type MiniJob } from "./JobCardMini";

const JOBS: MiniJob[] = [
  {
    title: "Executive Assistant to Founder",
    company: "Northwind Labs",
    pay: "$1,600–2,200/mo",
    source: "olj",
    skills: ["Calendar", "Inbox", "Notion"],
    age: "2h ago",
  },
  {
    title: "SEO Content Manager",
    company: "Peakline Media",
    pay: "$12–18/hr",
    source: "remoteok",
    skills: ["SEO", "Ahrefs", "Editing"],
    age: "5h ago",
  },
  {
    title: "Ecommerce Operations VA",
    company: "Salt & Stone",
    pay: "₱55,000/mo",
    source: "olj",
    skills: ["Shopify", "Ops", "Reports"],
    age: "Yesterday",
  },
  {
    title: "Customer Support Lead",
    company: "Fernway",
    pay: "$9–13/hr",
    source: "upwork",
    skills: ["Zendesk", "QA"],
    age: "Yesterday",
  },
  {
    title: "Short-Form Video Editor",
    company: "Halcyon Studio",
    pay: "$14–20/hr",
    source: "remoteok",
    skills: ["Premiere", "CapCut"],
    age: "2d ago",
  },
  {
    title: "Bookkeeper / Admin",
    company: "Marigold Dental",
    pay: "₱42,000/mo",
    source: "olj",
    skills: ["Xero", "AR/AP"],
    age: "2d ago",
  },
];

export default function BrowserMock() {
  return (
    <div className="browser">
      {/* chrome */}
      <div className="browser-bar">
        <span className="browser-dot" />
        <span className="browser-dot" />
        <span className="browser-dot" />
        <div
          className="mx-auto flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.75rem]"
          style={{ background: "#fff", color: "var(--color-muted)" }}
        >
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
            <rect x="1" y="5" width="8" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.1" />
            <path d="M3 5V3.4a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.1" />
          </svg>
          vrsfd.com
        </div>
        <span className="w-[30px] flex-none sm:w-[54px]" aria-hidden />
      </div>

      {/* app header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--color-line)" }}>
        <div className="flex items-center gap-4 px-4 pt-3.5 sm:px-6">
          <span
            className="font-display text-sm font-extrabold tracking-tight"
            style={{ color: "var(--color-accent)" }}
          >
            versified<span style={{ color: "var(--color-ink)" }}>.</span>
          </span>
          <nav className="no-bar flex gap-4 overflow-x-auto text-[0.75rem]">
            {["Jobs", "Rate check", "Learn", "Courses"].map((t, i) => (
              <span
                key={t}
                className="whitespace-nowrap pb-2 font-medium"
                style={{
                  color: i === 0 ? "var(--color-ink)" : "var(--color-muted)",
                  borderBottom: `2px solid ${i === 0 ? "var(--color-ink)" : "transparent"}`,
                }}
              >
                {t}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* search row */}
      <div className="px-4 py-4 sm:px-6" style={{ background: "#faf9f8" }}>
        <div
          className="mx-auto flex max-w-md items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5"
          style={{ background: "#fff", border: "1px solid var(--color-line-2)" }}
        >
          <span className="truncate text-[0.75rem]" style={{ color: "var(--color-faint)" }}>
            Search roles, skills, or clients
          </span>
          <span
            className="ml-auto hidden text-[0.6875rem] sm:inline"
            style={{ color: "var(--color-ink-2)" }}
          >
            Any rate
          </span>
          <span aria-hidden className="hidden h-4 w-px sm:block" style={{ background: "var(--color-line)" }} />
          <span
            className="grid h-7 w-7 flex-none place-items-center rounded-full"
            style={{ background: "var(--color-accent)" }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="4.4" stroke="#fff" strokeWidth="1.6" />
              <path d="M9.4 9.4 12.5 12.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* results */}
      <div className="px-4 pb-6 pt-5 sm:px-6" style={{ background: "#fff" }}>
        <h3 className="font-display text-base font-extrabold tracking-tight sm:text-lg">
          Fresh this week
        </h3>
        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.75rem]"
          style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-deep)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--color-accent)" }}
          />
          <strong className="font-semibold">120 new listings</strong> pulled in the last hour
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {JOBS.map((j) => (
            <JobCardMini key={j.title} job={j} />
          ))}
        </div>
      </div>
    </div>
  );
}

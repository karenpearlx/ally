import type { TemplateRef } from "@/lib/courses";

/**
 * Download row for a course template.
 *
 * Plain anchor with `download`, no JS — the files are static in /public/templates.
 * `compact` is the inline pill used inside a lesson; the full version is the card
 * used in the downloads section, where the note earns its space.
 */
export default function Download({
  template,
  compact = false,
}: {
  template: TemplateRef;
  compact?: boolean;
}) {
  const ext = template.path.split(".").pop()?.toUpperCase() ?? "FILE";

  if (compact) {
    return (
      <a
        href={template.path}
        download
        className="tap inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold"
        style={{
          background: "var(--color-accent-soft)",
          color: "var(--color-accent-deep)",
        }}
      >
        <ArrowDown />
        {template.name}
        <span className="text-[0.6875rem] font-bold opacity-60">{ext}</span>
      </a>
    );
  }

  return (
    <a href={template.path} download className="lift card flex items-start gap-4 p-5">
      <span
        className="font-display grid h-11 w-11 flex-none place-items-center rounded-xl text-[0.625rem] font-extrabold tracking-tight"
        style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-deep)" }}
        aria-hidden
      >
        {ext}
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-display flex items-center gap-2 text-base font-extrabold tracking-tight">
          {template.name}
          <span style={{ color: "var(--color-accent)" }} aria-hidden>
            <ArrowDown />
          </span>
        </span>
        <span className="mt-1 block text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {template.note}
        </span>
      </span>
    </a>
  );
}

function ArrowDown() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden>
      <path
        d="M6 1v9m0 0L2.5 6.5M6 10l3.5-3.5M1 12h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

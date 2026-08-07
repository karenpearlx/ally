import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export type LegalSection = {
  /** Anchor id. Used by the sticky index and by deep links from support replies. */
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type Props = {
  eyebrow: string;
  title: string;
  /** Trailing word that gets the accent dot, so the heading matches the rest of the site. */
  titleTail: string;
  updated: string;
  /** Plain-language gist, shown before the legal text. */
  summary: string[];
  sections: LegalSection[];
  contactEmail: string;
};

export default function LegalDoc({
  eyebrow,
  title,
  titleTail,
  updated,
  summary,
  sections,
  contactEmail,
}: Props) {
  return (
    <div className="min-h-screen">
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-lg mt-4 max-w-3xl">
            {title}
            {titleTail}
            <span className="dot">.</span>
          </h1>
          <p className="mt-5 text-sm" style={{ color: "var(--color-faint)" }}>
            Last updated {updated}
          </p>

          <div className="card mt-9 p-6 md:p-8">
            <h2
              className="font-display text-xs font-extrabold uppercase tracking-[0.14em]"
              style={{ color: "var(--color-accent)" }}
            >
              The short version
            </h2>
            <ul className="mt-4 space-y-3">
              {summary.map((s) => (
                <li key={s} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--color-accent)" }} />
                  <span style={{ color: "var(--color-ink-2)" }}>{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm" style={{ color: "var(--color-faint)" }}>
              The summary is here to be readable, not to replace what&rsquo;s written below.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-4 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[200px_1fr] lg:gap-14">
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
            <h2
              className="font-display mb-3 text-xs font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--color-faint)" }}
            >
              On this page
            </h2>
            <ol className="space-y-0.5">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-mx-1 flex min-h-[36px] items-center gap-2.5 px-1 text-[0.875rem] leading-snug transition-colors hover:text-accent max-md:min-h-[44px]"
                    style={{ color: "var(--color-ink-2)" }}
                  >
                    <span className="font-display text-xs font-bold tabular-nums" style={{ color: "var(--color-faint)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 max-w-2xl space-y-12">
            {sections.map((s, i) => (
              <article key={s.id} id={s.id} style={{ scrollMarginTop: "6.5rem" }}>
                <p
                  className="font-display text-xs font-extrabold uppercase tracking-[0.14em]"
                  style={{ color: "var(--color-accent)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-display mt-2 text-2xl font-extrabold tracking-tight">{s.title}</h2>

                {s.paragraphs.map((p) => (
                  <p
                    key={p}
                    className="mt-4 text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {p}
                  </p>
                ))}

                {s.bullets && s.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                          style={{ background: "var(--color-line-2)" }}
                        />
                        <span style={{ color: "var(--color-muted)" }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            <div className="card p-6 md:p-7">
              <h2 className="font-display text-lg font-extrabold tracking-tight">Questions</h2>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
                Email{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="underline underline-offset-4"
                  style={{ color: "var(--color-accent)" }}
                >
                  {contactEmail}
                </a>{" "}
                and a person will read it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

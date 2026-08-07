import Link from "next/link";
import Reveal from "../Reveal";
import PointerCard from "../PointerCard";

/**
 * Three-step explainer.
 *
 * The connecting rule between steps is a decorative pseudo-free absolute span,
 * hidden below md where the cards stack. Numbers are oversized display type so
 * the section scans in one pass without any illustration.
 */

const STEPS = [
  {
    n: "1",
    t: "Search once",
    d: "OnlineJobs, RemoteOK and We Work Remotely in a single feed, deduped and filtered to work Filipino VAs actually get hired for.",
    href: "/jobs",
    cta: "Browse jobs",
  },
  {
    n: "2",
    t: "Track smart",
    d: "Save anything worth applying to, move it through your pipeline, and let Verse poke you when a client has gone quiet too long.",
    href: "/tracker",
    cta: "See the tracker",
  },
  {
    n: "3",
    t: "Level up",
    d: "Work through the free courses between applications, then check the rate calculator before you answer the budget question.",
    href: "/learn",
    cta: "Start learning",
  },
];

export default function Steps() {
  return (
    <div className="relative">
      <span
        className="absolute left-[16%] right-[16%] top-[3.25rem] hidden h-px md:block"
        style={{ background: "var(--color-line-2)" }}
        aria-hidden
      />

      <ol className="relative grid gap-5 md:grid-cols-3 md:gap-6">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 100} className="h-full">
            <li className="h-full list-none">
              <PointerCard className="card lift flex h-full flex-col p-7 md:p-8">
                <span
                  className="font-display grid h-[3.25rem] w-[3.25rem] flex-none place-items-center rounded-full text-xl font-extrabold"
                  style={{
                    background: "var(--color-accent-soft)",
                    color: "var(--color-accent-deep)",
                    boxShadow: "0 0 0 8px var(--color-paper)",
                  }}
                  aria-hidden
                >
                  {s.n}
                </span>

                <h3 className="font-display mt-6 text-xl font-extrabold tracking-tight">
                  <span className="sr-only">Step {s.n}: </span>
                  {s.t}
                </h3>
                <p
                  className="mt-3 flex-1 text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--color-muted)" }}
                >
                  {s.d}
                </p>

                <Link
                  href={s.href}
                  className="link-draw tap relative mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--color-accent-deep)" }}
                >
                  {s.cta}
                  <svg width="13" height="10" viewBox="0 0 16 12" fill="none" aria-hidden>
                    <path
                      d="M1 6h13m-4.5-4.5L14 6l-4.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </PointerCard>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

import Link from "next/link";
import Reveal from "../Reveal";
import PointerCard from "../PointerCard";

/**
 * Testimonials.
 *
 * DELIBERATELY EMPTY. Verse is new and has no real users to quote yet, and
 * inventing quotes on a page that also promises "we never sit between you and
 * the client" would poison the one thing the product is selling. So the section
 * ships with an honest early-days panel instead of placeholder people.
 *
 * To turn it on: drop real, permitted quotes into QUOTES and the layout swaps
 * itself. Name + role + city, exactly as the person agreed to be credited.
 */

type Quote = { body: string; name: string; role: string; place?: string };

const QUOTES: Quote[] = [];

function Mark() {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden>
      <path
        d="M0 20V11.6C0 5.2 3.6 1 10 0l1.2 3.4C7.6 4.4 5.8 6.4 5.8 9.4H10V20H0Zm15 0v-8.4C15 5.2 18.6 1 25 0l1.2 3.4c-3.6 1-5.4 3-5.4 6H25V20H15Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Testimonials() {
  if (QUOTES.length === 0) {
    return (
      <Reveal>
        <div
          className="mx-auto max-w-3xl rounded-[28px] p-8 text-center md:p-12"
          style={{ background: "var(--color-paper-2)", border: "1px solid var(--color-line)" }}
        >
          <span style={{ color: "var(--color-line-2)" }} className="inline-block">
            <Mark />
          </span>
          <h3 className="font-display mt-4 text-xl font-extrabold tracking-tight md:text-2xl">
            No made-up reviews here
          </h3>
          <p
            className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--color-ink-2)" }}
          >
            Verse is new, so this space stays empty until real VAs have used it and told us what they
            think. If Verse helps you land something, tell us and your words go here — with your name
            on them.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn btn-primary">
              Try it and tell us
            </Link>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3 md:gap-6">
      {QUOTES.map((q, i) => (
        <Reveal key={q.name} delay={i * 90} className="h-full">
          <PointerCard as="article" className="card lift flex h-full flex-col p-7 md:p-8">
            <span style={{ color: "var(--color-accent-soft)" }}>
              <Mark />
            </span>
            <blockquote
              className="mt-5 flex-1 text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--color-ink-2)" }}
            >
              {q.body}
            </blockquote>
            <footer className="mt-6">
              <p className="font-display text-sm font-extrabold tracking-tight">{q.name}</p>
              <p className="mt-0.5 text-[0.8125rem]" style={{ color: "var(--color-muted)" }}>
                {q.role}
                {q.place ? ` · ${q.place}` : ""}
              </p>
            </footer>
          </PointerCard>
        </Reveal>
      ))}
    </div>
  );
}

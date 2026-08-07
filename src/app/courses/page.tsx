import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import CourseDone from "@/components/CourseDone";
import GradientBg from "@/components/GradientBg";
import {
  BASIC_COURSES,
  COURSES,
  PREMIUM_COURSES,
  SOON_COURSES,
  courseLength,
  type Course,
} from "@/lib/courses";
import { TOTAL_QUESTIONS } from "@/lib/interview";
import { CREATOR_MAILTO } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { hasPaidAccess, readSubscription } from "@/lib/subscription";

export const metadata = {
  title: "Courses — Versified",
  description:
    "Free VA foundations you can read right now, plus premium niche tracks for every specialism on the job board.",
};

/** The lock state depends on the session, so this page is never cached. */
export const dynamic = "force-dynamic";

function LockIcon() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden className="flex-none">
      <rect x="1.6" y="5.4" width="8.8" height="6.4" rx="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.9 5.4V3.9a2.1 2.1 0 0 1 4.2 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CourseCard({ c, i, paid }: { c: Course; i: number; paid: boolean }) {
  const soon = c.status === "soon";
  const locked = Boolean(c.premium) && !paid;

  return (
    <Reveal delay={(i % 3) * 70}>
      <Link
        href={`/courses/${c.slug}`}
        className="lift card flex h-full flex-col overflow-hidden transition-transform"
        aria-label={`${c.title}${soon ? " — coming soon" : locked ? " — premium, locked" : ""}`}
      >
        <div className="flex h-24 items-end justify-between gap-3 p-5" style={{ background: c.tint }}>
          <span
            className="font-display rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em]"
            style={{ color: c.fg }}
          >
            {c.tag}
          </span>
          {soon ? (
            <span
              className="rounded-full bg-white/70 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--color-muted)" }}
            >
              Coming soon
            </span>
          ) : locked ? (
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em]"
              style={{ background: "var(--color-ink)", color: "#5fd0bf" }}
            >
              <LockIcon />
              Premium
            </span>
          ) : (
            <CourseDone slug={c.slug} lessonCount={c.lessons?.length ?? 0} />
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-extrabold leading-snug tracking-tight">{c.title}</h3>
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
            {c.blurb}
          </p>

          <div
            className="mt-auto flex items-center justify-between gap-3 border-t pt-4 text-sm"
            style={{ borderColor: "var(--color-line)", marginTop: "1.5rem" }}
          >
            <span className="flex flex-wrap items-center gap-x-2" style={{ color: "var(--color-faint)" }}>
              {courseLength(c)}
              {locked ? null : <CourseDone slug={c.slug} lessonCount={c.lessons?.length ?? 0} variant="line" />}
            </span>
            <span
              className="font-display font-bold"
              style={{ color: soon ? "var(--color-faint)" : "var(--color-accent)" }}
            >
              {soon ? "Preview →" : locked ? "Unlock →" : c.premium ? "Read it →" : "Read free →"}
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default async function Courses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const account = user ? await readSubscription(supabase, user.id) : null;
  const paid = Boolean(account && hasPaidAccess(account));

  return (
    <div className="min-h-screen">
      <GradientBg position="right" />
      <Nav />

      <section className="px-5 pt-28 md:px-8 md:pt-40">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">Courses</p>
          <h1 className="display-lg mt-4 max-w-3xl">
            Learn one skill properly<span className="dot">.</span>
          </h1>
          <p className="lede mt-5 max-w-xl">
            Depth beats breadth. One specialism you can prove will out-earn a list of ten things you
            &ldquo;have experience with&rdquo;.
          </p>
          <p className="mt-6 text-sm" style={{ color: "var(--color-faint)" }}>
            {BASIC_COURSES.length} free with any account · {PREMIUM_COURSES.length} premium niche tracks ·{" "}
            {COURSES.length} total
          </p>
        </div>
      </section>

      <section className="px-5 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="card overflow-hidden">
              <div className="grid md:grid-cols-[1.15fr_1fr]">
                <div className="p-7 md:p-10">
                  <p className="eyebrow">Practice, not reading</p>
                  <h2 className="font-display mt-3 text-2xl font-extrabold leading-tight tracking-tight md:text-[2rem]">
                    Interview prep<span className="dot">.</span>
                  </h2>
                  <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {TOTAL_QUESTIONS} questions clients actually ask, sorted by niche. Answer out loud or in writing,
                    watch your own timing and filler words, and get the answer graded before someone who can hire you
                    hears it.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <Link href="/interview-prep" className="btn btn-primary">
                      {paid ? "Start practising" : "See interview prep"}
                    </Link>
                    <span className="text-sm" style={{ color: "#6b6863" }}>
                      {paid ? "Included in your plan" : "Included with Pro"}
                    </span>
                  </div>
                </div>

                <div
                  className="flex flex-col justify-center gap-3 p-7 md:p-10"
                  style={{ background: "var(--color-accent-soft)" }}
                >
                  {[
                    "Tell me about yourself.",
                    "How do you handle multiple clients at once?",
                    "Describe your internet and backup setup.",
                  ].map((q) => (
                    <p
                      key={q}
                      className="rounded-2xl bg-white/80 px-4 py-3 text-[0.9375rem] font-medium leading-snug"
                      style={{ color: "var(--color-ink-2)" }}
                    >
                      {q}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display-md">
              Start here, free<span className="dot">.</span>
            </h2>
            <span className="text-sm" style={{ color: "var(--color-faint)" }}>
              Basic · no payment
            </span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BASIC_COURSES.map((c, i) => (
              <CourseCard key={c.slug} c={c} i={i} paid={paid} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display-md">
              One track per niche<span className="dot">.</span>
            </h2>
            <span className="text-sm" style={{ color: "var(--color-faint)" }}>
              {paid ? "Open on your plan" : "Premium"}
            </span>
          </div>
          <p className="lede mt-4 max-w-xl">
            Every niche in the cover letter builder gets its own track, written the same way: tools, walkthroughs,
            a practice project and real listings pulled apart line by line.
            {paid ? "" : " They open with Pro."}
          </p>
          {paid ? null : (
            <Link href="/pricing" className="btn btn-primary mt-6">
              Unlock all {PREMIUM_COURSES.length} tracks
            </Link>
          )}

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PREMIUM_COURSES.map((c, i) => (
              <CourseCard key={c.slug} c={c} i={i} paid={paid} />
            ))}
          </div>
        </div>
      </section>

      {SOON_COURSES.length > 0 && (
        <section className="px-5 pt-20 md:px-8 md:pt-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="display-md">
              Still being written<span className="dot">.</span>
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {SOON_COURSES.map((c, i) => (
                <CourseCard key={c.slug} c={c} i={i} paid={paid} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-5 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[28px] px-7 py-12 text-center md:px-14" style={{ background: "var(--color-ink)" }}>
            <h2 className="display-md" style={{ color: "#fff" }}>
              Taught a VA skill before
              <span style={{ color: "#5fd0bf" }}>?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed" style={{ color: "#a9a6a1" }}>
              We&rsquo;re looking for Filipino VAs to teach what they know. You keep the rights and 90% of the
              sales, we handle the hosting.
            </p>
            <a href={CREATOR_MAILTO} className="btn btn-primary mt-8">
              Apply to become a Creator
            </a>
          </div>
        </div>
      </section>

      <Footer tagline="Real skills. No fluff" />
    </div>
  );
}

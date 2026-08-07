import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const COURSES = [
  {
    tag: "Foundations",
    title: "The Complete VA Starter",
    author: "Ally team",
    length: "12 lessons · 2h 10m",
    price: "Free",
    blurb: "Everything from setting up your workspace to sending your first invoice.",
    tint: "#e6f4f1",
    fg: "#0a7d6f",
  },
  {
    tag: "Writing",
    title: "Applications That Get Replies",
    author: "Ally team",
    length: "7 lessons · 55m",
    price: "Free",
    blurb: "The short human cover letter format, plus 14 annotated real examples.",
    tint: "#eef2ff",
    fg: "#4453b8",
  },
  {
    tag: "Money",
    title: "Pricing & Negotiation",
    author: "Ally team",
    length: "9 lessons · 1h 20m",
    price: "Free",
    blurb: "Quote a number, hold it, and raise it later without losing the client.",
    tint: "#fdf0e8",
    fg: "#b5581f",
  },
  {
    tag: "Specialism",
    title: "SEO for Virtual Assistants",
    author: "Guest instructor",
    length: "14 lessons · 2h 45m",
    price: "Coming soon",
    blurb: "The highest-paying skill on the board right now, taught from scratch.",
    tint: "#f2effa",
    fg: "#5b46a8",
  },
  {
    tag: "Specialism",
    title: "Bookkeeping Basics (Xero)",
    author: "Guest instructor",
    length: "11 lessons · 1h 50m",
    price: "Coming soon",
    blurb: "Enough to take on AR/AP work for a small US or AU business.",
    tint: "#e9f6ec",
    fg: "#2f7a45",
  },
  {
    tag: "Ops",
    title: "Becoming an Operations Lead",
    author: "Guest instructor",
    length: "10 lessons · 1h 35m",
    price: "Coming soon",
    blurb: "How VAs move from task-taker to the person who runs the system.",
    tint: "#fbecef",
    fg: "#a83d55",
  },
];

export default function Courses() {
  return (
    <div className="min-h-screen">
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
        </div>
      </section>

      <section className="px-5 pt-14 md:px-8 md:pt-20">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c, i) => {
            const soon = c.price === "Coming soon";
            return (
              <Reveal key={c.title} delay={(i % 3) * 80}>
                <article className="card flex h-full flex-col overflow-hidden">
                  <div
                    className="flex h-28 items-end p-5"
                    style={{ background: c.tint }}
                  >
                    <span
                      className="font-display rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em]"
                      style={{ color: c.fg }}
                    >
                      {c.tag}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-display text-xl font-extrabold leading-snug tracking-tight">
                      {c.title}
                    </h2>
                    <p
                      className="mt-2.5 text-[0.9375rem] leading-relaxed"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {c.blurb}
                    </p>

                    <div
                      className="mt-auto flex items-center justify-between border-t pt-4 text-sm"
                      style={{ borderColor: "var(--color-line)", marginTop: "1.5rem" }}
                    >
                      <span style={{ color: "var(--color-faint)" }}>{c.length}</span>
                      <span
                        className="font-display font-bold"
                        style={{ color: soon ? "var(--color-faint)" : "var(--color-accent)" }}
                      >
                        {c.price}
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <div
            className="rounded-[28px] px-7 py-12 text-center md:px-14"
            style={{ background: "var(--color-ink)" }}
          >
            <h2 className="display-md" style={{ color: "#fff" }}>
              Taught a VA skill before
              <span style={{ color: "#5fd0bf" }}>?</span>
            </h2>
            <p
              className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed"
              style={{ color: "#a9a6a1" }}
            >
              We&rsquo;re looking for Filipino VAs to teach what they know. You keep the rights, we
              handle the hosting.
            </p>
            <Link href="/signup" className="btn btn-primary mt-8">
              Pitch a course
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

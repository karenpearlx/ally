import Link from "next/link";
import Wordmark from "./Wordmark";

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/jobs", label: "Job board" },
      { href: "/tracker", label: "Application tracker" },
      { href: "/cover-letter", label: "Cover letter builder" },
      { href: "/resume", label: "Resume builder" },
      { href: "/interview-prep", label: "Interview prep" },
      { href: "/follow-up-email", label: "Follow-up writer" },
      { href: "/pricing-tool", label: "Rate check" },
      { href: "/learn", label: "Learn" },
      { href: "/courses", label: "Courses" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
      { href: "/help", label: "Help" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

interface FooterProps {
  tagline?: string;
}

export default function Footer({ tagline = "Free to start. No agency in the middle" }: FooterProps) {
  return (
    <footer className="px-5 pb-10 pt-20 md:px-8 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <p
          className="display-md mx-auto mb-16 max-w-2xl text-center md:mb-24"
          style={{ color: "var(--color-ink)" }}
        >
          {tagline}<span className="dot">.</span>
        </p>

        <div
          className="grid gap-10 border-t pt-10 sm:grid-cols-[1.4fr_1fr_1fr]"
          style={{ borderColor: "var(--color-line)" }}
        >
          <div>
            <Wordmark className="tap" size="sm" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              Built for Filipino virtual assistants who are done guessing what
              they&rsquo;re worth.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h3
                className="font-display mb-3 text-xs font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--color-faint)" }}
              >
                {col.title}
              </h3>
              <ul className="space-y-0.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="-mx-1 inline-flex min-h-[36px] items-center px-1 text-[0.9375rem] transition-colors hover:text-accent max-md:min-h-[44px]"
                      style={{ color: "var(--color-ink-2)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm" style={{ color: "var(--color-faint)" }}>
          © {new Date().getFullYear()} Versified
        </p>
      </div>
    </footer>
  );
}

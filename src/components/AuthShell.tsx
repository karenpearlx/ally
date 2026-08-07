import Link from "next/link";
import Wordmark from "./Wordmark";

export default function AuthShell({
  eyebrow,
  title,
  sub,
  children,
  footer,
  aside,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  aside: { heading: string; points: string[] };
}) {
  return (
    <div className="min-h-screen px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Wordmark />

        <div className="mt-10 grid items-start gap-8 md:mt-14 md:grid-cols-[1fr_0.85fr] md:gap-14">
          {/* form */}
          <div className="card p-7 md:p-10">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display-md mt-3">
              {title}
              <span className="dot">.</span>
            </h1>
            <p className="mt-3 text-[0.9375rem]" style={{ color: "var(--color-muted)" }}>
              {sub}
            </p>

            {/* The form itself is a client component (AuthForm); the shell stays a
                server component so the marketing copy isn't shipped twice. */}
            {children}

            <p className="mt-7 text-center text-[0.9375rem]" style={{ color: "var(--color-muted)" }}>
              {footer}
            </p>
          </div>

          {/* aside */}
          <div className="md:pt-6">
            <h2 className="font-display text-lg font-extrabold tracking-tight">{aside.heading}</h2>
            <ul className="mt-5 space-y-4">
              {aside.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span
                    className="mt-1.5 grid h-4 w-4 flex-none place-items-center rounded-full"
                    style={{ background: "var(--color-accent-soft)" }}
                  >
                    <svg width="9" height="7" viewBox="0 0 10 8" fill="none" aria-hidden>
                      <path
                        d="M1 4.2 3.5 6.7 9 1.2"
                        stroke="var(--color-accent-deep)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className="text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--color-ink-2)" }}
                  >
                    {p}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm" style={{ color: "var(--color-faint)" }}>
              <Link href="/" className="tap underline underline-offset-4">
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  type,
  placeholder,
  autoComplete,
  name,
}: {
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
  name: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium"
        style={{ color: "var(--color-ink-2)" }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="field"
      />
    </div>
  );
}

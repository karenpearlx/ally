import Link from "next/link";

export default function Wordmark({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Versified — home"
      className={`font-display inline-flex items-baseline text-accent max-md:min-h-[44px] ${className}`}
      style={{
        fontWeight: 800,
        letterSpacing: "-0.045em",
        fontSize: size === "sm" ? "1.25rem" : "1.5rem",
      }}
    >
      versified
      <span className="text-ink">.</span>
    </Link>
  );
}

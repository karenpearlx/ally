"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";
import FollowUpBell from "./FollowUpBell";

const LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/tracker", label: "Tracker" },
  { href: "/pricing-tool", label: "Rate check" },
  { href: "/learn", label: "Learn" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300"
        style={{
          background: lifted ? "rgba(247,246,244,0.82)" : "transparent",
          backdropFilter: lifted ? "blur(12px)" : "none",
          borderBottom: `1px solid ${lifted ? "var(--color-line)" : "transparent"}`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-8">
          <Wordmark />

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className="rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors"
                  style={{ color: active ? "var(--color-ink)" : "var(--color-muted)" }}
                >
                  {l.label}
                  <span
                    aria-hidden
                    className="mt-1 block h-[2px] rounded-full transition-all"
                    style={{
                      background: active ? "var(--color-accent)" : "transparent",
                    }}
                  />
                </Link>
              );
            })}
            <FollowUpBell className="ml-2" />
            <Link href="/login" className="btn btn-ink ml-2 !px-5 !py-2.5 !text-sm">
              Sign in
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <FollowUpBell forceClosed={open} />
            <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-full"
            style={{ border: "1px solid var(--color-line-2)", background: "var(--color-surface)" }}
          >
            <span className="relative block h-3 w-4">
              <span
                className="absolute left-0 block h-[2px] w-4 rounded-full transition-all duration-300"
                style={{
                  background: "var(--color-ink)",
                  top: open ? 5 : 0,
                  transform: open ? "rotate(45deg)" : "none",
                }}
              />
              <span
                className="absolute left-0 block h-[2px] w-4 rounded-full transition-all duration-300"
                style={{
                  background: "var(--color-ink)",
                  bottom: open ? 5 : 0,
                  transform: open ? "rotate(-45deg)" : "none",
                }}
              />
            </span>
            </button>
          </div>
        </div>
      </header>

      {/* mobile sheet — sibling of header so backdrop-filter can't trap it */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          pointerEvents: open ? "auto" : "none",
          opacity: open ? 1 : 0,
          transition: "opacity .28s ease",
        }}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen(false)}
          className="absolute inset-0 w-full"
          style={{ background: "rgba(33,32,30,0.35)" }}
        />
        <div
          className="absolute inset-x-3 top-[4.5rem] card p-3"
          style={{
            transform: open ? "none" : "translateY(-10px)",
            transition: "transform .28s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-semibold"
              style={{
                color: pathname === l.href ? "var(--color-accent)" : "var(--color-ink)",
              }}
            >
              {l.label}
              <span aria-hidden style={{ color: "var(--color-faint)" }}>
                ›
              </span>
            </Link>
          ))}
          <Link href="/login" className="btn btn-ink mt-2 w-full !py-3.5 !text-base">
            Sign in
          </Link>
        </div>
      </div>
    </>
  );
}

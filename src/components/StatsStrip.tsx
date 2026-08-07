"use client";

import { useEffect, useRef, useState } from "react";
import { onReveal, prefersReducedMotion } from "@/lib/reveal";

export type Stat = {
  /** Final string, e.g. "700+", "3", "₱0". Always what's shown at rest. */
  display: string;
  /** Numeric part to count up to. Omit to skip the count-up. */
  to?: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

/** Ease-out so the number decelerates into place instead of stopping dead. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function Counter({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  // Always render the TRUE value on the server. If JS never runs, the visitor
  // sees "700+", not "0+". The count-up rewinds to zero inside the effect, and
  // the strip sits below the fold, so nobody sees the rewind.
  const [text, setText] = useState(stat.display);

  useEffect(() => {
    const el = ref.current;
    if (!el || stat.to === undefined) return;
    if (prefersReducedMotion()) return;

    let raf = 0;
    const target = stat.to;

    const stop = onReveal(el, () => {
      // Rewind to zero HERE, not in the effect body. If it rewound eagerly and
      // the visitor jumped the strip (anchor link, Cmd+End, restored scroll),
      // the observer never fires and the stat stays stuck reading "0+", which
      // is worse than no animation at all. Caught by anim.mjs.
      setText(`${stat.prefix ?? ""}0${stat.suffix ?? ""}`);
      const duration = 900;
      const start = performance.now() + index * 90;

      const tick = (now: number) => {
        const t = Math.min(Math.max((now - start) / duration, 0), 1);
        const value = Math.round(easeOut(t) * target);
        setText(`${stat.prefix ?? ""}${value.toLocaleString("en-US")}${stat.suffix ?? ""}`);
        if (t < 1) raf = requestAnimationFrame(tick);
        // Snap to the canonical string at the end so formatting always matches.
        else setText(stat.display);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      stop();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stat, index]);

  return (
    <p
      ref={ref}
      className="font-display text-2xl font-extrabold tracking-tight tabular-nums md:text-3xl"
    >
      {text}
    </p>
  );
}

export default function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div
      className="stat-row grid grid-cols-3 gap-y-8 py-9"
    >
      {stats.map((s, i) => (
        <div key={s.label} className="stat px-2 text-center">
          <Counter stat={s} index={i} />
          <p className="mt-1 text-[0.8125rem]" style={{ color: "var(--color-muted)" }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

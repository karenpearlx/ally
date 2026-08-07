"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { onReveal } from "@/lib/reveal";

/**
 * Headline that reveals word by word as it scrolls in.
 *
 * Each word sits in an inline-block mask so the words rise out of nothing
 * instead of just fading. Only transform/opacity animate, so it runs on the
 * compositor and never triggers layout.
 *
 * Two details that are easy to get wrong and were both bugs here first:
 *  - the inter-word space must be a sibling text node, NOT inside the mask.
 *    Inside an overflow:hidden inline-block the trailing space collapses and
 *    every word runs together.
 *  - overflow:hidden clips descenders (g, y, p), so .word-mask pads the bottom
 *    and pulls it back with a negative margin.
 *
 * Accessibility: split words are aria-hidden and the real string is exposed
 * once via aria-label, so a screen reader reads one clean heading.
 */
export default function RevealWords({
  text,
  as: Tag = "h2",
  className = "",
  dot = false,
  delay = 0,
  stagger = 55,
  immediate = false,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  dot?: boolean;
  delay?: number;
  stagger?: number;
  /** Skip the observer and play on mount — for above-the-fold copy. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (immediate) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    return onReveal(el, () => setShown(true));
  }, [immediate]);

  const words = text.split(" ");

  return (
    <div ref={ref}>
      <Tag className={className} aria-label={dot ? `${text}.` : text}>
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className="word-mask" aria-hidden>
              <span
                className={`word ${shown ? "in" : ""}`}
                style={{ transitionDelay: `${delay + i * stagger}ms` }}
              >
                {word}
                {i === words.length - 1 && dot && <span className="dot">.</span>}
              </span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </Tag>
    </div>
  );
}

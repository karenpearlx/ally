"use client";

import { useCallback, useRef } from "react";

/**
 * Card that tracks the cursor and moves a soft highlight under it.
 *
 * The JS here only ever writes two CSS custom properties. All the actual
 * painting is done by CSS, so there is no React re-render on pointer move and
 * no layout work — the highlight is a composited radial gradient.
 *
 * Writes are coalesced into one rAF, because pointermove can fire far more
 * often than the display refreshes (high-polling mice fire ~1000Hz).
 *
 * Pointer effects are opt-out on touch: `pointerType === "touch"` bails, and
 * the CSS is behind `@media (hover: hover)`, so phones never get a highlight
 * stuck where a finger last was.
 */
export default function PointerCard({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef(0);
  const next = useRef({ x: 0, y: 0 });

  const onMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    next.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const node = ref.current;
      if (!node) return;
      node.style.setProperty("--mx", `${next.current.x}px`);
      node.style.setProperty("--my", `${next.current.y}px`);
    });
  }, []);

  const onLeave = useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
  }, []);

  return (
    <Tag
      ref={ref as never}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`pointer-card ${className}`}
    >
      {children}
    </Tag>
  );
}

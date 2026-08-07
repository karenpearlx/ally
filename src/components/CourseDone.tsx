"use client";

import { courseDone, useProgressMap } from "@/lib/course-progress";

/**
 * Completion badge for a card on /courses.
 *
 * Renders nothing until localStorage has been read and there is something to
 * say, so the grid never flashes a row of empty pills on first paint.
 */
export default function CourseDone({
  slug,
  lessonCount,
  variant = "pill",
}: {
  slug: string;
  lessonCount: number;
  variant?: "pill" | "line";
}) {
  const map = useProgressMap();
  const { done, complete } = courseDone(map, slug, lessonCount);
  if (done === 0) return null;

  if (variant === "line") {
    return (
      <span style={{ color: complete ? "var(--color-accent)" : "var(--color-muted)" }}>
        {complete ? "✓ complete" : `${done}/${lessonCount} done`}
      </span>
    );
  }

  return (
    <span
      className="rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em]"
      style={
        complete
          ? { background: "var(--color-accent)", color: "#fff" }
          : { background: "rgba(255,255,255,0.78)", color: "var(--color-muted)" }
      }
    >
      {complete ? "✓ Complete" : `${done}/${lessonCount}`}
    </span>
  );
}

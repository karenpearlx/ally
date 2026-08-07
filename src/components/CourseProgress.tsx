"use client";

import { useEffect } from "react";
import { hydrateFromAccount, useCourseProgress } from "@/lib/course-progress";

/**
 * Progress header for a course page.
 *
 * Renders the same shape before and after hydration — zero of N, empty bar —
 * so nothing jumps when localStorage arrives. The account pull happens once per
 * page load and unions with local, so a reader who signs in halfway keeps
 * everything they ticked while signed out.
 */
export default function CourseProgress({
  slug,
  lessonCount,
}: {
  slug: string;
  lessonCount: number;
}) {
  const progress = useCourseProgress(slug);

  useEffect(() => {
    void hydrateFromAccount();
  }, []);

  const done = progress.done.filter((n) => n < lessonCount).length;
  const pct = lessonCount ? Math.round((done / lessonCount) * 100) : 0;
  const complete = lessonCount > 0 && done >= lessonCount;

  return (
    <div className="card p-6 md:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-display text-base font-extrabold tracking-tight">
          {complete ? "Course complete" : "Your progress"}
        </p>
        <p className="text-sm tabular-nums" style={{ color: "var(--color-faint)" }}>
          {done}/{lessonCount} lessons
          {progress.quiz ? ` · quiz ${progress.quiz.score}/${progress.quiz.total}` : ""}
        </p>
      </div>

      <div
        className="bar mt-4"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={lessonCount}
        aria-label="Lessons complete"
      >
        <span style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          {complete
            ? "Now do the practice project. Reading is the easy half."
            : "Tick a lesson when you have actually done the checklist, not when you finish reading it."}
        </p>
        {done > 0 && (
          <button
            type="button"
            onClick={progress.reset}
            className="tap text-sm font-semibold underline underline-offset-4"
            style={{ color: "var(--color-faint)" }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

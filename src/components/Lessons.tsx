"use client";

import type { Lesson, TemplateRef } from "@/lib/courses";
import { useCourseProgress } from "@/lib/course-progress";
import Download from "@/components/Download";
import LessonFeedback from "@/components/LessonFeedback";

/**
 * Lesson accordion.
 *
 * Native <details>, deliberately: it opens with JS disabled, it is keyboard and
 * screen-reader correct without any aria bookkeeping, and Ctrl+F finds text in
 * closed sections in Chrome. The first lesson starts open so the page never
 * looks like a list of dead headings.
 *
 * Progress is per course slug and lives in localStorage (see course-progress.ts),
 * so the tick state renders as "not ticked" on the server and settles on the
 * client without a layout jump — the boxes are always there, only the fill moves.
 */
export default function Lessons({
  lessons,
  slug,
  templates = [],
}: {
  lessons: Lesson[];
  /** Progress bucket. Omit and the ticks are hidden entirely. */
  slug?: string;
  /** Course-level templates, used to resolve per-lesson download rows. */
  templates?: TemplateRef[];
}) {
  const progress = useCourseProgress(slug ?? "");
  const track = Boolean(slug);

  return (
    <div className="space-y-3">
      {lessons.map((l, i) => {
        const done = track && progress.isDone(i);
        return (
          <details
            key={l.title}
            open={i === 0}
            className="lesson card overflow-hidden"
            data-done={done ? "true" : undefined}
          >
            <summary className="tap flex cursor-pointer list-none items-baseline gap-4 p-6 md:p-7">
              <span
                className="font-display mt-px flex-none text-sm font-extrabold tabular-nums"
                style={{ color: done ? "var(--color-accent)" : "var(--color-faint)" }}
              >
                {done ? "✓" : String(i + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1">
                <span className="font-display block text-lg font-extrabold leading-snug tracking-tight md:text-xl">
                  {l.title}
                </span>
                <span className="mt-1 block text-sm" style={{ color: "var(--color-faint)" }}>
                  {l.minutes} min read
                  {done && (
                    <>
                      {" · "}
                      <span style={{ color: "var(--color-accent)" }}>done</span>
                    </>
                  )}
                </span>
              </span>

              <span
                className="lesson-chev mt-1 grid h-7 w-7 flex-none place-items-center rounded-full"
                style={{ border: "1px solid var(--color-line-2)" }}
                aria-hidden
              >
                <svg width="11" height="7" viewBox="0 0 12 8" fill="none">
                  <path
                    d="M1 1.5 6 6.5 11 1.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </summary>

            <div className="px-6 pb-7 md:px-7 md:pl-[3.75rem]">
              {l.body.map((p, pi) => (
                <p
                  key={pi}
                  className="mt-3 text-[0.9375rem] leading-relaxed first:mt-0"
                  style={{ color: "var(--color-ink-2)" }}
                >
                  {p}
                </p>
              ))}

              {templates.length > 0 && i === 0 && (
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {templates.map((t) => (
                    <Download key={t.path} template={t} compact />
                  ))}
                </div>
              )}

              {l.checklist && l.checklist.length > 0 && (
                <div
                  className="mt-7 rounded-2xl p-5"
                  style={{ background: "var(--color-paper-2)" }}
                >
                  <p
                    className="font-display text-xs font-extrabold uppercase tracking-[0.12em]"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Do these before moving on
                  </p>
                  <ul className="mt-3.5 space-y-2.5">
                    {l.checklist.map((item, ci) => {
                      const checked = track && progress.isChecked(i, ci);
                      return (
                        <li key={ci}>
                          <label className="tick">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => progress.toggleCheck(i, ci)}
                              disabled={!track}
                            />
                            <span className="tick-box" aria-hidden>
                              <svg width="11" height="9" viewBox="0 0 12 10" fill="none">
                                <path
                                  d="M1 5.2 4.3 8.5 11 1.5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            <span className="tick-text">{item}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {track && (
                <button
                  type="button"
                  onClick={() => progress.toggleLesson(i)}
                  className="tap mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors"
                  style={
                    done
                      ? { background: "var(--color-accent-soft)", color: "var(--color-accent-deep)" }
                      : {
                          border: "1px solid var(--color-line-2)",
                          background: "var(--color-surface)",
                          color: "var(--color-ink-2)",
                        }
                  }
                  aria-pressed={done}
                >
                  <span aria-hidden>{done ? "✓" : "○"}</span>
                  {done ? "Lesson complete" : "Mark lesson complete"}
                </button>
              )}

              {slug && <LessonFeedback slug={slug} lessonIndex={i} />}
            </div>
          </details>
        );
      })}
    </div>
  );
}

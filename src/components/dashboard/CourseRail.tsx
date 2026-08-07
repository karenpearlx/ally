"use client";

import Link from "next/link";
import { COURSES, courseLength, type Course } from "@/lib/courses";
import { courseDone, useProgressMap } from "@/lib/course-progress";

/**
 * Courses this person has actually opened.
 *
 * Progress lives in localStorage (mirrored to the account when the table
 * exists), so this has to be a client component. Until it has read, and when
 * nothing has been started, it shows a suggestion instead of an empty slot —
 * a dashboard card that says "0 courses" teaches nobody anything.
 */
export default function CourseRail() {
  const map = useProgressMap();

  const started = COURSES.map((c) => ({
    course: c,
    ...courseDone(map, c.slug, c.lessons?.length ?? 0),
  }))
    .filter((c) => c.done > 0)
    .sort((a, b) => {
      // Unfinished first — the point of the card is "go back to this one".
      if (a.complete !== b.complete) return a.complete ? 1 : -1;
      return b.done / Math.max(1, b.total) - a.done / Math.max(1, a.total);
    })
    .slice(0, 3);

  if (started.length === 0) return <Suggestion />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {started.map(({ course, done, total, complete }) => (
        <Link
          key={course.slug}
          href={`/courses/${course.slug}`}
          className="lift card flex h-full flex-col p-6 transition-transform"
        >
          <span
            className="font-display self-start rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em]"
            style={{ background: course.tint, color: course.fg }}
          >
            {course.tag}
          </span>
          <h3 className="font-display mt-3.5 text-lg font-extrabold leading-snug tracking-tight">
            {course.title}
          </h3>

          <div className="mt-auto pt-5">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "var(--color-paper-2)" }}
            >
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.round((done / Math.max(1, total)) * 100)}%`,
                  background: complete ? "var(--color-accent)" : "var(--color-ink)",
                }}
              />
            </div>
            <p className="mt-2.5 text-[0.8125rem]" style={{ color: "var(--color-muted)" }}>
              {complete ? "Finished · read it again" : `${done} of ${total} lessons · keep going`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Nothing started yet: point at one course, not at the catalogue. */
function Suggestion() {
  const first: Course | undefined =
    COURSES.find((c) => c.slug === "complete-va-starter") ?? COURSES.find((c) => c.status === "open");
  if (!first) return null;

  return (
    <div className="card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
      <div className="min-w-0">
        <p className="font-display text-lg font-extrabold tracking-tight">
          You haven&rsquo;t started a course yet
        </p>
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {first.title} is the one to open first — {courseLength(first).toLowerCase()}, free, no
          account needed.
        </p>
      </div>
      <Link href={`/courses/${first.slug}`} className="btn btn-primary flex-none">
        Start reading
      </Link>
    </div>
  );
}

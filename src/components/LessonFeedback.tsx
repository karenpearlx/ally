"use client";

import { useState } from "react";

/**
 * "Was this lesson helpful?" — two buttons, an optional comment, done.
 *
 * Deliberately not a review system: no stars, no scores shown back, no account
 * needed. The thumb is sent immediately so we capture the signal even if the
 * reader never writes the comment, and the comment is a second, separate write.
 *
 * A failed request still says thanks. The reader did their bit; a red error on
 * a feedback widget only teaches people not to use it.
 */

const SEEN_KEY = "ally.lesson-feedback.v1";

function markSent(id: string) {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(list) ? [...new Set([...list, id])].slice(-200) : [id];
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  } catch {
    /* nothing here is worth breaking a page over */
  }
}

async function send(payload: Record<string, unknown>) {
  try {
    await fetch("/api/lesson-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* soft failure by design */
  }
}

export default function LessonFeedback({
  slug,
  lessonIndex,
}: {
  slug: string;
  lessonIndex: number;
}) {
  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [comment, setComment] = useState("");
  const [sentComment, setSentComment] = useState(false);

  function pick(value: 1 | -1) {
    setRating(value);
    markSent(`${slug}:${lessonIndex}`);
    void send({ course_slug: slug, lesson_index: lessonIndex, rating: value });
  }

  function submitComment() {
    const text = comment.trim();
    if (!text || rating == null) return;
    setSentComment(true);
    void send({ course_slug: slug, lesson_index: lessonIndex, rating, comment: text });
  }

  return (
    <div
      className="mt-6 border-t pt-5"
      style={{ borderColor: "var(--color-line)" }}
    >
      {rating == null ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm" style={{ color: "var(--color-muted)" }}>
            Was this lesson helpful?
          </span>
          <div className="flex gap-2">
            <button type="button" className="thumb tap" onClick={() => pick(1)} aria-label="Yes, helpful">
              <Thumb />
              Yes
            </button>
            <button
              type="button"
              className="thumb tap"
              onClick={() => pick(-1)}
              aria-label="No, not helpful"
            >
              <Thumb down />
              Not really
            </button>
          </div>
        </div>
      ) : sentComment ? (
        <p className="text-sm" style={{ color: "var(--color-accent-deep)" }}>
          Noted, thank you. This actually gets read.
        </p>
      ) : (
        <div>
          <p className="text-sm" style={{ color: "var(--color-accent-deep)" }}>
            {rating === 1 ? "Good. Thanks." : "Fair enough. What was missing?"}
          </p>
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <label className="sr-only" htmlFor={`fb-${slug}-${lessonIndex}`}>
              Any suggestions to improve this lesson?
            </label>
            <textarea
              id={`fb-${slug}-${lessonIndex}`}
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              rows={2}
              placeholder="Any suggestions to improve this lesson? Optional."
              className="field flex-1 resize-y text-sm"
            />
            <button
              type="button"
              onClick={submitComment}
              disabled={!comment.trim()}
              className="btn btn-primary h-11 self-start whitespace-nowrap"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Thumb({ down = false }: { down?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={down ? { transform: "rotate(180deg)" } : undefined}
    >
      <path
        d="M4.5 14V6.8L8 1c1 0 1.6.7 1.5 1.7L9.2 5.4h3.4c.8 0 1.4.7 1.2 1.5l-1.1 5.6c-.1.9-.9 1.5-1.8 1.5H4.5Zm0 0H2V6.8h2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/courses";
import { useCourseProgress } from "@/lib/course-progress";

/**
 * End-of-course check. Not gamified: no timer, no streak, no badge.
 *
 * You answer everything, submit once, and then every question shows what was
 * right and why — including the ones you got right, because the reasoning is
 * the actual content. Retake clears the answers but keeps your best score,
 * which is the only thing stored.
 */
export default function Quiz({ slug, questions }: { slug: string; questions: QuizQuestion[] }) {
  const progress = useCourseProgress(slug);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [submitted, setSubmitted] = useState(false);

  const answered = answers.filter((a) => a >= 0).length;
  const score = answers.reduce((n, a, i) => (a === questions[i].correct ? n + 1 : n), 0);
  const best = progress.quiz;

  function choose(qi: number, oi: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  }

  function submit() {
    setSubmitted(true);
    progress.saveQuiz({
      answers,
      score,
      total: questions.length,
      at: new Date().toISOString(),
    });
  }

  function retake() {
    setAnswers(questions.map(() => -1));
    setSubmitted(false);
  }

  return (
    <div className="card p-7 md:p-9">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight md:text-2xl">
          Check yourself
        </h2>
        <p className="text-sm" style={{ color: "var(--color-faint)" }}>
          {submitted
            ? `${score} of ${questions.length} right`
            : `${answered} of ${questions.length} answered`}
          {!submitted && best ? ` · best ${best.score}/${best.total}` : ""}
        </p>
      </div>

      <p className="mt-2.5 text-[0.9375rem] leading-relaxed" style={{ color: "var(--color-ink-2)" }}>
        {submitted
          ? "Read the reasoning under each one. That is the part worth keeping."
          : "No score is published anywhere. Answer honestly; the explanations are the point."}
      </p>

      <ol className="mt-8 space-y-9">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <li key={q.question}>
              <p className="font-display text-base font-extrabold leading-snug tracking-tight md:text-lg">
                <span className="tabular-nums" style={{ color: "var(--color-faint)" }}>
                  {String(qi + 1).padStart(2, "0")}.{" "}
                </span>
                {q.question}
              </p>

              <div className="mt-3.5 space-y-2.5">
                {q.options.map((opt, oi) => {
                  const state = !submitted
                    ? undefined
                    : oi === q.correct
                      ? "right"
                      : oi === chosen
                        ? "wrong"
                        : undefined;
                  return (
                    <label key={opt} className="opt" data-state={state} data-locked={submitted}>
                      <input
                        type="radio"
                        name={`${slug}-q${qi}`}
                        checked={chosen === oi}
                        onChange={() => choose(qi, oi)}
                        disabled={submitted}
                      />
                      <span className="opt-dot" aria-hidden />
                      <span className="text-[0.9375rem] leading-snug" style={{ color: "var(--color-ink-2)" }}>
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>

              {submitted && (
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: chosen === q.correct ? "var(--color-accent-deep)" : "var(--color-ink-2)" }}
                >
                  <strong className="font-display font-extrabold">
                    {chosen === q.correct ? "Right. " : chosen < 0 ? "Skipped. " : "Not quite. "}
                  </strong>
                  {q.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div
        className="mt-9 flex flex-wrap items-center gap-3 border-t pt-7"
        style={{ borderColor: "var(--color-line)" }}
      >
        {submitted ? (
          <>
            <button type="button" onClick={retake} className="btn btn-ghost">
              Take it again
            </button>
            <p className="text-sm" style={{ color: "var(--color-faint)" }}>
              Saved on this device{best && best.score > score ? ` · best ${best.score}/${best.total}` : ""}
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={submit}
              disabled={answered < questions.length}
              className="btn btn-primary"
            >
              Check my answers
            </button>
            {answered < questions.length && (
              <p className="text-sm" style={{ color: "var(--color-faint)" }}>
                {questions.length - answered} to go
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

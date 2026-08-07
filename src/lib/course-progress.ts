"use client";

/**
 * Course progress: completed lessons, ticked checklist items, quiz results.
 *
 * localStorage is the source of truth, always. Signing in adds a best-effort
 * mirror to `public.course_progress` — if that table has not been migrated yet
 * the sync fails quietly and nothing in the UI changes. Progress on a free
 * course is not worth a blocking network call or an error toast.
 *
 * State lives in a tiny external store rather than per-component useState so a
 * lesson checkbox, the header progress bar, and the /courses badge all move
 * together, and so useSyncExternalStore keeps the server render honest.
 */

import { useCallback, useSyncExternalStore } from "react";

const KEY = "ally.course-progress.v1";

export type QuizResult = {
  /** Chosen option index per question; -1 for unanswered. */
  answers: number[];
  score: number;
  total: number;
  /** ISO timestamp of the submission. */
  at: string;
};

export type CourseState = {
  /** Indexes of lessons marked complete. */
  lessons: number[];
  /** "lessonIndex:itemIndex" keys that are ticked. */
  checks: string[];
  quiz?: QuizResult;
};

export type ProgressMap = Record<string, CourseState>;

const EMPTY: CourseState = { lessons: [], checks: [] };

/* ------------------------------------------------------------------ */
/* store                                                               */
/* ------------------------------------------------------------------ */

let cache: ProgressMap | null = null;
const listeners = new Set<() => void>();

function isState(value: unknown): value is CourseState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.lessons) && Array.isArray(v.checks);
}

function read(): ProgressMap {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = {});
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    const out: ProgressMap = {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [slug, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (isState(value)) {
          out[slug] = {
            lessons: value.lessons.filter((n) => typeof n === "number"),
            checks: value.checks.filter((s) => typeof s === "string"),
            quiz: value.quiz,
          };
        }
      }
    }
    cache = out;
  } catch {
    cache = {};
  }
  return cache;
}

function emit() {
  for (const fn of listeners) fn();
}

function write(next: ProgressMap) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode, quota, whatever — the session still works */
  }
  emit();
  queueSync(next);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/* ------------------------------------------------------------------ */
/* optional account sync                                               */
/* ------------------------------------------------------------------ */

let syncTimer: ReturnType<typeof setTimeout> | null = null;
/** Flips false the first time the API says it cannot store this. */
let syncEnabled = true;

function queueSync(next: ProgressMap) {
  if (!syncEnabled || typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void fetch("/api/course-progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: next }),
      keepalive: true,
    })
      .then(async (r) => {
        // The route answers 200 with synced:false when there is no session or
        // no table. Either way there is nothing to back up to; stop asking.
        if (!r.ok) return void (syncEnabled = false);
        const body = (await r.json().catch(() => null)) as { synced?: boolean } | null;
        if (body?.synced === false) syncEnabled = false;
      })
      .catch(() => {
        syncEnabled = false;
      });
  }, 800);
}

/** Pull server progress once after sign-in and union it with local. */
export async function hydrateFromAccount(): Promise<void> {
  if (!syncEnabled) return;
  try {
    const res = await fetch("/api/course-progress");
    if (!res.ok) {
      syncEnabled = false;
      return;
    }
    const body = (await res.json()) as { progress?: unknown; synced?: boolean };
    if (body.synced === false) {
      syncEnabled = false;
      return;
    }
    const remote = body.progress;
    if (!remote || typeof remote !== "object" || Array.isArray(remote)) return;

    const local = read();
    const merged: ProgressMap = { ...local };
    let changed = false;
    for (const [slug, value] of Object.entries(remote as Record<string, unknown>)) {
      if (!isState(value)) continue;
      const mine = local[slug] ?? EMPTY;
      const lessons = [...new Set([...mine.lessons, ...value.lessons])].sort((a, b) => a - b);
      const checks = [...new Set([...mine.checks, ...value.checks])];
      const quiz = pickQuiz(mine.quiz, value.quiz);
      if (
        lessons.length !== mine.lessons.length ||
        checks.length !== mine.checks.length ||
        quiz !== mine.quiz
      ) {
        changed = true;
      }
      merged[slug] = { lessons, checks, quiz };
    }
    if (changed) write(merged);
  } catch {
    syncEnabled = false;
  }
}

function pickQuiz(a?: QuizResult, b?: QuizResult) {
  if (!a) return b;
  if (!b) return a;
  return b.score > a.score ? b : a;
}

/* ------------------------------------------------------------------ */
/* hooks                                                               */
/* ------------------------------------------------------------------ */

const SERVER_MAP: ProgressMap = {};

export function useProgressMap(): ProgressMap {
  return useSyncExternalStore(subscribe, read, () => SERVER_MAP);
}

export type CourseProgress = {
  /** True once the client has read localStorage; render neutral before then. */
  ready: boolean;
  done: number[];
  checks: Set<string>;
  quiz?: QuizResult;
  isDone: (lesson: number) => boolean;
  toggleLesson: (lesson: number) => void;
  isChecked: (lesson: number, item: number) => boolean;
  toggleCheck: (lesson: number, item: number) => void;
  saveQuiz: (result: QuizResult) => void;
  reset: () => void;
};

export function useCourseProgress(slug: string): CourseProgress {
  const map = useSyncExternalStore(subscribe, read, () => SERVER_MAP);
  const ready = map !== SERVER_MAP;
  const state = map[slug] ?? EMPTY;

  const update = useCallback(
    (fn: (prev: CourseState) => CourseState) => {
      const current = read();
      write({ ...current, [slug]: fn(current[slug] ?? EMPTY) });
    },
    [slug],
  );

  const toggleLesson = useCallback(
    (lesson: number) =>
      update((prev) => ({
        ...prev,
        lessons: prev.lessons.includes(lesson)
          ? prev.lessons.filter((n) => n !== lesson)
          : [...prev.lessons, lesson].sort((a, b) => a - b),
      })),
    [update],
  );

  const toggleCheck = useCallback(
    (lesson: number, item: number) =>
      update((prev) => {
        const key = `${lesson}:${item}`;
        return {
          ...prev,
          checks: prev.checks.includes(key)
            ? prev.checks.filter((k) => k !== key)
            : [...prev.checks, key],
        };
      }),
    [update],
  );

  const saveQuiz = useCallback(
    (result: QuizResult) => update((prev) => ({ ...prev, quiz: result })),
    [update],
  );

  const reset = useCallback(() => {
    const current = read();
    const next = { ...current };
    delete next[slug];
    write(next);
  }, [slug]);

  const checks = new Set(state.checks);

  return {
    ready,
    done: state.lessons,
    checks,
    quiz: state.quiz,
    isDone: (lesson: number) => state.lessons.includes(lesson),
    toggleLesson,
    isChecked: (lesson: number, item: number) => checks.has(`${lesson}:${item}`),
    toggleCheck,
    saveQuiz,
    reset,
  };
}

/** Lessons complete for one course, for badges outside a course page. */
export function courseDone(map: ProgressMap, slug: string, lessonCount: number) {
  const state = map[slug];
  if (!state) return { done: 0, total: lessonCount, complete: false };
  const done = state.lessons.filter((n) => n < lessonCount).length;
  return { done, total: lessonCount, complete: lessonCount > 0 && done >= lessonCount };
}

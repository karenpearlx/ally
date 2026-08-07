import { ApiError, apiError, readJson, requireActiveUser } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

/**
 * Course progress mirror for signed-in users.
 *
 * The client keeps localStorage as the source of truth and calls this to back
 * it up, so nothing here is allowed to look like a failure. Signed out returns
 * 200 with synced:false rather than 401 — a browser console full of red on a
 * free course page is worse than no sync at all — and the client stops calling
 * once it sees that flag. A missing table (supabase/2026-08-04-course-progress.sql
 * not run yet) is reported the same way.
 *
 * Runs under the caller's own session against RLS. No service role, and the
 * user id never comes from the body.
 */

const MAX_COURSES = 60;
const MAX_LESSONS = 40;
const MAX_CHECKS = 200;

type CourseState = {
  lessons: number[];
  checks: string[];
  quiz?: { answers: number[]; score: number; total: number; at: string };
};

function parseCourse(slug: string, value: unknown): CourseState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, `progress.${slug} must be an object.`);
  }
  const raw = value as Record<string, unknown>;

  if (!Array.isArray(raw.lessons) || raw.lessons.length > MAX_LESSONS) {
    throw new ApiError(400, `progress.${slug}.lessons must be an array of at most ${MAX_LESSONS} numbers.`);
  }
  const lessons = raw.lessons.map((n) => {
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n >= MAX_LESSONS) {
      throw new ApiError(400, `progress.${slug}.lessons must hold lesson indexes.`);
    }
    return n;
  });

  if (!Array.isArray(raw.checks) || raw.checks.length > MAX_CHECKS) {
    throw new ApiError(400, `progress.${slug}.checks must be an array of at most ${MAX_CHECKS} keys.`);
  }
  const checks = raw.checks.map((k) => {
    if (typeof k !== 'string' || !/^\d{1,2}:\d{1,2}$/.test(k)) {
      throw new ApiError(400, `progress.${slug}.checks must hold "lesson:item" keys.`);
    }
    return k;
  });

  let quiz: CourseState['quiz'];
  if (raw.quiz != null) {
    const q = raw.quiz as Record<string, unknown>;
    if (
      !Array.isArray(q.answers) ||
      q.answers.length > 20 ||
      q.answers.some((a) => typeof a !== 'number') ||
      typeof q.score !== 'number' ||
      typeof q.total !== 'number' ||
      typeof q.at !== 'string' ||
      q.at.length > 40
    ) {
      throw new ApiError(400, `progress.${slug}.quiz is malformed.`);
    }
    quiz = {
      answers: q.answers as number[],
      score: q.score,
      total: q.total,
      at: q.at,
    };
  }

  return { lessons: [...new Set(lessons)], checks: [...new Set(checks)], quiz };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ progress: {}, synced: false });

    const { data, error } = await supabase
      .from('course_progress')
      .select('progress')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      console.error('course_progress read failed (migration missing?)', error.message);
      return Response.json({ progress: {}, synced: false });
    }
    return Response.json({ progress: data?.progress ?? {}, synced: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    let auth: Awaited<ReturnType<typeof requireActiveUser>>;
    try {
      auth = await requireActiveUser();
    } catch (error) {
      // Keep anonymous course use quiet while still returning 403 for a signed-
      // in suspended account.
      if (error instanceof ApiError && error.status === 401) {
        return Response.json({ ok: true, synced: false });
      }
      throw error;
    }
    const { supabase, user } = auth;

    const body = await readJson(request);
    const raw = body.progress;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new ApiError(400, 'progress must be an object keyed by course slug.');
    }
    const entries = Object.entries(raw as Record<string, unknown>);
    if (entries.length > MAX_COURSES) throw new ApiError(400, 'Too many courses in one payload.');

    const progress: Record<string, CourseState> = {};
    for (const [slug, value] of entries) {
      if (!/^[a-z0-9-]{1,60}$/.test(slug)) throw new ApiError(400, 'Invalid course slug.');
      progress[slug] = parseCourse(slug, value);
    }

    const { error } = await supabase
      .from('course_progress')
      .upsert(
        { user_id: user.id, progress, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    if (error) {
      console.error('course_progress write failed (migration missing?)', error.message);
      return Response.json({ ok: true, synced: false });
    }

    return Response.json({ ok: true, synced: true });
  } catch (error) {
    return apiError(error);
  }
}

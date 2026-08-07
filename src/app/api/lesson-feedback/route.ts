import { ApiError, apiError, readJson, requireActiveUser } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import { courseBySlug } from '@/lib/courses';

/**
 * Lesson feedback: one thumbs up or down, plus an optional comment.
 *
 * Open to signed-out readers, because most course traffic never signs in and a
 * login wall on a feedback widget just produces no feedback. Writes go through
 * the caller's own session (anon key, RLS insert policy), never a service role,
 * and user_id is taken from the session rather than the body.
 *
 * The client treats failure as non-fatal and still says thanks — a missing
 * migration should not make a reader think they broke something.
 */

const MAX_COMMENT = 1000;

export async function POST(request: Request) {
  try {
    const body = await readJson(request);

    const slug = typeof body.course_slug === 'string' ? body.course_slug : '';
    if (!/^[a-z0-9-]{1,60}$/.test(slug)) throw new ApiError(400, 'course_slug is invalid.');

    const course = courseBySlug(slug);
    if (!course) throw new ApiError(400, 'Unknown course.');

    const index = body.lesson_index;
    if (
      typeof index !== 'number' ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= (course.lessons?.length ?? 0)
    ) {
      throw new ApiError(400, 'lesson_index is out of range.');
    }

    const rating = body.rating;
    if (rating !== 1 && rating !== -1) throw new ApiError(400, 'rating must be 1 or -1.');

    let comment: string | null = null;
    if (body.comment != null) {
      if (typeof body.comment !== 'string') throw new ApiError(400, 'comment must be text.');
      // Strip control characters; this text is only ever read back by us, but
      // there is no reason to store escape sequences.
      const clean = body.comment.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
      if (clean.length > MAX_COMMENT) throw new ApiError(400, 'comment is too long.');
      comment = clean || null;
    }

    let supabase: Awaited<ReturnType<typeof createClient>>;
    let user: { id: string } | null;
    try {
      ({ supabase, user } = await requireActiveUser());
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      supabase = await createClient();
      user = null;
    }

    const { error } = await supabase.from('lesson_feedback').insert({
      user_id: user?.id ?? null,
      course_slug: slug,
      lesson_index: index,
      lesson_title: course.lessons?.[index]?.title ?? null,
      rating,
      comment,
    });
    if (error) {
      // Almost always supabase/2026-08-04-lesson-feedback.sql not run yet.
      // Log it for us, accept it for them.
      console.error('lesson_feedback insert failed (migration missing?)', error.message);
      return Response.json({ ok: true, stored: false }, { status: 202 });
    }

    return Response.json({ ok: true, stored: true });
  } catch (error) {
    return apiError(error);
  }
}

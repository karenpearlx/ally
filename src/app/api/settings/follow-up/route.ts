import { ApiError, apiError, readJson, requireUser } from '@/lib/api';

function parseDays(value: unknown) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 90) {
    throw new ApiError(400, 'follow_up_days must be a whole number from 1 to 90.');
  }
  return value;
}

function dateAfter(isoDate: string, days: number) {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from('users')
      .select('follow_up_days')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await readJson(request);
    const followUpDays = parseDays(body.follow_up_days);

    const { data, error } = await supabase
      .from('users')
      .update({ follow_up_days: followUpDays })
      .eq('id', user.id)
      .select('follow_up_days')
      .single();
    if (error) throw error;

    let updatedApplications = 0;
    if (body.recalculate_existing !== false) {
      const { data: pending, error: pendingError } = await supabase
        .from('applications')
        .select('id,created_at')
        .eq('user_id', user.id)
        .in('status', ['applied', 'follow_up']);
      if (pendingError) throw pendingError;

      const results = await Promise.all((pending ?? []).map((application) =>
        supabase
          .from('applications')
          .update({ follow_up_date: dateAfter(application.created_at, followUpDays) })
          .eq('id', application.id)
          .eq('user_id', user.id)
      ));
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      updatedApplications = results.length;
    }

    return Response.json({ ...data, updated_applications: updatedApplications });
  } catch (error) {
    return apiError(error);
  }
}

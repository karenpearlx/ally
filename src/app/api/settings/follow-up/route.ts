import { ApiError, apiError, readJson, requireActiveUser, requireUser } from '@/lib/api';

function parseDays(value: unknown) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 90) {
    throw new ApiError(400, 'follow_up_days must be a whole number from 1 to 90.');
  }
  return value;
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
    const { supabase, user } = await requireActiveUser();
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
      const { data: affected, error: recalculateError } = await supabase.rpc(
        'recalculate_application_follow_ups',
        { days_to_wait: followUpDays },
      );
      if (recalculateError) throw recalculateError;
      updatedApplications = Number(affected ?? 0);
    }

    return Response.json({ ...data, updated_applications: updatedApplications });
  } catch (error) {
    return apiError(error);
  }
}

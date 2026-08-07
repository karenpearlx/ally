import { ApiError, apiError, readJson, requireActiveUser, requireUser, stringField } from '@/lib/api';

const TEXT_MAX = 2_000;
const NAME_MAX = 80;

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (error.code === '42P01') {
        throw new ApiError(503, 'The reviews table is not ready yet.');
      }
      throw error;
    }

    return Response.json({ hasReviewed: Boolean(data) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireActiveUser();
    const body = await readJson(request);
    const text = stringField(body.text, 'Review', { required: true, max: TEXT_MAX });
    const name = stringField(body.name, 'Name', { max: NAME_MAX });

    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      text,
      name,
    });

    // The unique user_id index makes concurrent/repeated submits harmless. If
    // this account already has a review, the desired final state is achieved.
    if (error?.code === '23505') {
      return Response.json({ hasReviewed: true });
    }
    if (error) {
      if (error.code === '42P01') {
        throw new ApiError(503, 'The reviews table is not ready yet.');
      }
      throw error;
    }

    return Response.json({ hasReviewed: true }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

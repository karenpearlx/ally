import { ApiError, apiError, consumeFeatureUse, requireActiveUser } from '@/lib/api';

const FEATURES = new Set(['cover-letter', 'resume']);

export async function POST(_request: Request, context: { params: Promise<{ feature: string }> }) {
  try {
    const { feature } = await context.params;
    if (!FEATURES.has(feature)) throw new ApiError(404, 'Unknown feature.');
    const { supabase } = await requireActiveUser();
    const result = await consumeFeatureUse(supabase, feature === 'cover-letter' ? 'cover_letter' : 'resume');
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return apiError(error);
  }
}

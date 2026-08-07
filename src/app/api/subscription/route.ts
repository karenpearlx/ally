import { apiError, requireUser } from '@/lib/api';
import { readSubscription, hasPaidAccess } from '@/lib/subscription';

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const account = await readSubscription(supabase, user.id);
    return Response.json({ ...account, has_paid_access: hasPaidAccess(account) }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return apiError(error);
  }
}

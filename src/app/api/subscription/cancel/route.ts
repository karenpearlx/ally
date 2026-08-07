import { apiError, requireActiveUser } from '@/lib/api';
import { paymongoRequest } from '@/lib/paymongo';
import { readSubscription } from '@/lib/subscription';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST() {
  try {
    const { supabase, user } = await requireActiveUser();
    const account = await readSubscription(supabase, user.id);

    if (!account.paymongo_subscription_id) {
      // Hosted Checkout access is prepaid for 30 days and never auto-renews.
      return Response.json({ cancelled: false, prepaid: true, access_ends_at: account.subscription_ends_at });
    }

    await paymongoRequest(`/v1/subscriptions/${encodeURIComponent(account.paymongo_subscription_id)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ data: { attributes: { cancellation_reason: 'other' } } }),
    });
    const { error } = await createServiceClient()
      .from('users')
      .update({ subscription_status: 'cancelled' })
      .eq('id', user.id);
    if (error) throw error;
    return Response.json({ cancelled: true, access_ends_at: account.subscription_ends_at });
  } catch (error) {
    return apiError(error);
  }
}

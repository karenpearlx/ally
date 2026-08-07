import { ApiError, apiError, uuidField } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { FEEDBACK_TABLE, readFeedback, recordAudit } from '@/lib/admin/data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return Response.json(await readFeedback(supabase), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return apiError(error);
  }
}

/** Removing a single response, for spam or for something that should not be kept. */
export async function DELETE(request: Request) {
  try {
    const { supabase, user, email } = await requireAdmin();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) throw new ApiError(400, 'An id is required.');
    const { error } = await supabase.from(FEEDBACK_TABLE).delete().eq('id', uuidField(id));
    if (error) throw new ApiError(400, error.message);
    const audit = await recordAudit(supabase, { actorId: user.id, actorEmail: email, action: 'feedback.delete', subject: id });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] Feedback was deleted without an audit row.`);
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

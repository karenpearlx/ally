import { ApiError, apiError, readJson, stringField, uuidField } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { isMissingColumn, isMissingTable, recordAudit } from '@/lib/admin/data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };

/**
 * Suspend or restore an account.
 *
 * Suspending is deliberately reversible and non-destructive: the row, the
 * applications and the saved documents all stay put, and the person can still
 * sign in and read. What stops is writing: requireActiveUser() and database
 * RLS both reject mutations by a suspended account. Deleting somebody for real is a
 * Supabase dashboard job, not a two-click action behind a web form.
 */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const { supabase, user, email } = await requireAdmin();
    const { id } = await params;
    const target = uuidField(id);
    if (target === user.id) throw new ApiError(400, 'You cannot suspend your own account.');

    const body = await readJson(request);
    if (typeof body.status !== 'string' || !['active', 'suspended'].includes(body.status)) {
      throw new ApiError(400, 'Status must be active or suspended.');
    }
    const suspending = body.status === 'suspended';
    const reason = stringField(body.reason, 'Reason', { max: 300 });

    const { data, error } = await supabase
      .from('users')
      .update({
        status: body.status,
        suspended_at: suspending ? new Date().toISOString() : null,
        suspended_reason: suspending ? reason : null,
      })
      .eq('id', target)
      .select('id,email,status,suspended_at,suspended_reason')
      .maybeSingle();

    if (error) {
      if (isMissingColumn(error) || isMissingTable(error)) {
        throw new ApiError(
          503,
          'Suspending needs the status column on public.users. Run supabase/2026-08-04-admin-hardening.sql first.',
        );
      }
      throw new ApiError(400, error.message);
    }
    if (!data) throw new ApiError(404, 'No account with that id.');

    const audit = await recordAudit(supabase, {
      actorId: user.id,
      actorEmail: email,
      action: suspending ? 'user.suspend' : 'user.restore',
      subject: data.email ?? target,
      detail: reason ? { reason } : {},
    });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] User status changed without an audit row.`);
    }

    return Response.json({ user: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return apiError(error);
  }
}

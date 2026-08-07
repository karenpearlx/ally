import { ApiError, apiError, readJson, stringField, uuidField } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { isMissingColumn, isMissingTable, recordAudit } from '@/lib/admin/data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };

const VALID_PLANS = ['free', 'pro', 'creator'] as const;
type Plan = (typeof VALID_PLANS)[number];

/**
 * Suspend or restore an account, or change their plan.
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

    const body = await readJson(request);

    // Handle plan change
    if ('plan' in body) {
      if (typeof body.plan !== 'string' || !VALID_PLANS.includes(body.plan as Plan)) {
        throw new ApiError(400, 'Plan must be free, pro, or creator.');
      }
      const newPlan = body.plan as Plan;

      const { data, error } = await supabase
        .from('users')
        .update({
          subscription_tier: newPlan,
          subscription_status: newPlan === 'free' ? null : 'active',
        })
        .eq('id', target)
        .select('id,email,subscription_tier')
        .maybeSingle();

      if (error) {
        if (isMissingColumn(error) || isMissingTable(error)) {
          throw new ApiError(503, 'Plan changes need the subscription_tier column on public.users.');
        }
        throw new ApiError(400, error.message);
      }
      if (!data) throw new ApiError(404, 'No account with that id.');

      const audit = await recordAudit(supabase, {
        actorId: user.id,
        actorEmail: email,
        action: 'user.plan_change',
        subject: data.email ?? target,
        detail: { plan: newPlan },
      });
      if (audit.error) {
        console.error(`[admin-action:${audit.correlationId}] Plan changed without an audit row.`);
      }

      return Response.json({ user: data }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Handle status change (suspend/restore)
    if (target === user.id) throw new ApiError(400, 'You cannot suspend your own account.');

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

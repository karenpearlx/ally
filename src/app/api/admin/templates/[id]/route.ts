import { ApiError, apiError, readJson, stringField, uuidField } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { TEMPLATES_TABLE, isMissingTable, recordAudit } from '@/lib/admin/data';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { supabase, user, email } = await requireAdmin();
    const { id } = await params;
    const body = await readJson(request);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if ('label' in body) patch.label = stringField(body.label, 'Label', { required: true, max: 120 });
    if ('blurb' in body) patch.blurb = stringField(body.blurb, 'Description', { max: 400 });
    if ('body' in body) patch.body = stringField(body.body, 'Body', { max: 20_000 });
    const target = uuidField(id);
    const { data, error } = await supabase.from(TEMPLATES_TABLE).update(patch).eq('id', target).select().maybeSingle();
    if (error) {
      if (isMissingTable(error)) throw new ApiError(503, `The ${TEMPLATES_TABLE} table does not exist yet.`);
      throw error;
    }
    if (!data) throw new ApiError(404, 'Template not found.');
    const audit = await recordAudit(supabase, {
      actorId: user.id,
      actorEmail: email,
      action: 'template.update',
      subject: target,
      detail: { fields: Object.keys(patch).filter((field) => field !== 'updated_at') },
    });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] Template was updated without an audit row.`);
    }
    return Response.json(data);
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { supabase, user, email } = await requireAdmin();
    const { id } = await params;
    const target = uuidField(id);
    const { data, error } = await supabase.from(TEMPLATES_TABLE).delete().eq('id', target).select('id').maybeSingle();
    if (error) {
      if (isMissingTable(error)) throw new ApiError(503, `The ${TEMPLATES_TABLE} table does not exist yet.`);
      throw error;
    }
    if (!data) throw new ApiError(404, 'Template not found.');
    const audit = await recordAudit(supabase, {
      actorId: user.id,
      actorEmail: email,
      action: 'template.delete',
      subject: target,
    });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] Template was deleted without an audit row.`);
    }
    return new Response(null, { status: 204 });
  } catch (error) { return apiError(error); }
}

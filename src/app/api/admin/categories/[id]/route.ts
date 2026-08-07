import { ApiError, apiError, readJson, stringField, uuidField } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { recordAudit } from '@/lib/admin/data';

function tableFor(value: string | null) {
  if (value === 'category') return 'job_categories';
  if (value === 'tag') return 'job_tags';
  throw new ApiError(400, 'kind must be category or tag.');
}

function slug(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
}

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { supabase, user, email } = await requireAdmin();
    const { id } = await params;
    const body = await readJson(request);
    const kind = typeof body.kind === 'string' ? body.kind : null;
    const table = tableFor(kind);
    const patch: Record<string, unknown> = {};
    if ('name' in body) {
      const name = stringField(body.name, 'name', { required: true, max: 100 })!;
      patch.name = name;
      patch.slug = slug(name);
    }
    if (kind === 'category' && 'description' in body) {
      patch.description = stringField(body.description, 'description', { max: 500 });
    }
    if (!Object.keys(patch).length) throw new ApiError(400, 'No editable fields were provided.');
    const target = uuidField(id);
    const { data, error } = await supabase.from(table).update(patch).eq('id', target).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, `${kind === 'category' ? 'Category' : 'Tag'} not found.`);
    const audit = await recordAudit(supabase, {
      actorId: user.id,
      actorEmail: email,
      action: `${kind}.update`,
      subject: target,
      detail: { fields: Object.keys(patch) },
    });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] ${kind} was updated without an audit row.`);
    }
    return Response.json({ item: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { supabase, user, email } = await requireAdmin();
    const { id } = await params;
    const kind = new URL(request.url).searchParams.get('kind');
    const table = tableFor(kind);
    const target = uuidField(id);
    const { data, error } = await supabase.from(table).delete().eq('id', target).select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(404, `${kind === 'category' ? 'Category' : 'Tag'} not found.`);
    const audit = await recordAudit(supabase, {
      actorId: user.id,
      actorEmail: email,
      action: `${kind}.delete`,
      subject: target,
    });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] ${kind} was deleted without an audit row.`);
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

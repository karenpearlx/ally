import { ApiError, apiError, readJson, stringField } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { recordAudit } from '@/lib/admin/data';

function slug(value: string) {
  const clean = value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!clean) throw new ApiError(400, 'Name must contain letters or numbers.');
  return clean.slice(0, 100);
}

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    const [{ data: categories, error: categoryError }, { data: tags, error: tagError }] = await Promise.all([
      supabase.from('job_categories').select('*').order('name'),
      supabase.from('job_tags').select('*').order('name'),
    ]);
    if (categoryError) throw categoryError;
    if (tagError) throw tagError;
    return Response.json({ categories: categories ?? [], tags: tags ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user, email } = await requireAdmin();
    const body = await readJson(request);
    const kind = body.kind;
    if (kind !== 'category' && kind !== 'tag') throw new ApiError(400, 'kind must be category or tag.');
    const name = stringField(body.name, 'name', { required: true, max: 100 })!;
    const result = kind === 'category'
      ? await supabase.from('job_categories').insert({
          name,
          slug: slug(name),
          description: stringField(body.description, 'description', { max: 500 }),
        }).select().single()
      : await supabase.from('job_tags').insert({ name, slug: slug(name) }).select().single();
    const { data, error } = result;
    if (error) throw new ApiError(400, error.message);
    const audit = await recordAudit(supabase, {
      actorId: user.id,
      actorEmail: email,
      action: `${kind}.create`,
      subject: data.id,
      detail: { name },
    });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] ${kind} was created without an audit row.`);
    }
    return Response.json({ item: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

import { ApiError, apiError, jsonObject, readJson, requireUser, stringField, uuidField } from '@/lib/api';
import { RESUME_TEMPLATES } from '@/lib/resume';

function patchFrom(body: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  if ('title' in body) patch.title = stringField(body.title, 'title', { required: true, max: 200 });
  if ('template_name' in body) {
    if (typeof body.template_name !== 'string' || !RESUME_TEMPLATES.includes(body.template_name as typeof RESUME_TEMPLATES[number])) {
      throw new ApiError(400, `template_name must be one of: ${RESUME_TEMPLATES.join(', ')}.`);
    }
    patch.template_name = body.template_name;
  }
  if ('content' in body) {
    const content = jsonObject(body.content, 'content');
    if (JSON.stringify(content).length > 200_000) throw new ApiError(400, 'Resume content is too large.');
    patch.content = content;
  }
  if (!Object.keys(patch).length) throw new ApiError(400, 'No editable fields were provided.');
  return patch;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await context.params;
    const { data, error } = await supabase.from('resumes').select('*')
      .eq('id', uuidField(id)).eq('user_id', user.id).single();
    if (error) throw error;
    return Response.json({ resume: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await context.params;
    const { data, error } = await supabase.from('resumes').update(patchFrom(await readJson(request)))
      .eq('id', uuidField(id)).eq('user_id', user.id).select().single();
    if (error) throw error;
    return Response.json({ resume: data });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await context.params;
    const { error } = await supabase.from('resumes').delete()
      .eq('id', uuidField(id)).eq('user_id', user.id);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

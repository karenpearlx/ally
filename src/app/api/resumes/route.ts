import { ApiError, apiError, jsonObject, readJson, requireUser, stringField } from '@/lib/api';
import { RESUME_TEMPLATES } from '@/lib/resume';

function templateName(value: unknown, fallback = 'classic') {
  if (value == null) return fallback;
  if (typeof value !== 'string' || !RESUME_TEMPLATES.includes(value as typeof RESUME_TEMPLATES[number])) {
    throw new ApiError(400, `template_name must be one of: ${RESUME_TEMPLATES.join(', ')}.`);
  }
  return value;
}

function resumeContent(value: unknown) {
  const content = jsonObject(value, 'content');
  if (JSON.stringify(content).length > 200_000) throw new ApiError(400, 'Resume content is too large.');
  return content;
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return Response.json({ resumes: data ?? [], templates: RESUME_TEMPLATES });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await readJson(request);
    const { data, error } = await supabase.from('resumes').insert({
      user_id: user.id,
      title: stringField(body.title, 'title', { max: 200 }) ?? 'Untitled resume',
      template_name: templateName(body.template_name),
      content: resumeContent(body.content),
    }).select().single();
    if (error) throw error;
    return Response.json({ resume: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

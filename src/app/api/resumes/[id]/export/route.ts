import { ApiError, apiError, requireUser, uuidField } from '@/lib/api';
import { RESUME_TEMPLATES, resumeDocx, resumeHtml, resumePdf, resumeText, type ResumeTemplate } from '@/lib/resume';

const FORMATS = ['json', 'txt', 'html', 'pdf', 'docx'] as const;

function filename(value: string) {
  return value.normalize('NFKD').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'resume';
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireUser();
    const { id } = await context.params;
    const format = new URL(request.url).searchParams.get('format') ?? 'pdf';
    if (!FORMATS.includes(format as typeof FORMATS[number])) {
      throw new ApiError(400, `format must be one of: ${FORMATS.join(', ')}.`);
    }

    const { data: resume, error } = await supabase.from('resumes')
      .select('title,template_name,content')
      .eq('id', uuidField(id)).eq('user_id', user.id).single();
    if (error) throw error;
    const template = RESUME_TEMPLATES.includes(resume.template_name as ResumeTemplate)
      ? resume.template_name as ResumeTemplate
      : 'classic';
    const content = resume.content as Record<string, unknown>;
    const base = filename(resume.title);

    let body: BodyInit;
    let contentType: string;
    let extension = format;
    if (format === 'json') {
      body = JSON.stringify({ template_name: template, content }, null, 2);
      contentType = 'application/json; charset=utf-8';
    } else if (format === 'txt') {
      body = resumeText(content);
      contentType = 'text/plain; charset=utf-8';
    } else if (format === 'html') {
      body = resumeHtml(content, template);
      contentType = 'text/html; charset=utf-8';
    } else if (format === 'docx') {
      body = new Uint8Array(await resumeDocx(content, template));
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else {
      body = new Uint8Array(await resumePdf(content, template));
      contentType = 'application/pdf';
      extension = 'pdf';
    }

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${base}.${extension}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

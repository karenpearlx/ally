import { ApiError, apiError, readJson, stringField } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { TEMPLATES_TABLE, isMissingTable, readTemplates, recordAudit } from '@/lib/admin/data';
import type { TemplateKind } from '@/lib/admin/types';

export const dynamic = 'force-dynamic';
const KINDS: TemplateKind[] = ['cover_letter', 'resume', 'tag'];

function templateKind(value: unknown): TemplateKind {
  if (typeof value !== 'string' || !KINDS.includes(value as TemplateKind)) {
    throw new ApiError(400, `Kind must be one of ${KINDS.join(', ')}.`);
  }
  return value as TemplateKind;
}

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return Response.json(await readTemplates(supabase));
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { supabase, user, email } = await requireAdmin();
    const body = await readJson(request);
    const row = {
      kind: templateKind(body.kind),
      label: stringField(body.label, 'Label', { required: true, max: 120 }),
      blurb: stringField(body.blurb, 'Description', { max: 400 }),
      body: stringField(body.body, 'Body', { max: 20_000 }),
    };
    const { data, error } = await supabase.from(TEMPLATES_TABLE).insert(row).select().single();
    if (error) {
      if (isMissingTable(error)) throw new ApiError(503, `The ${TEMPLATES_TABLE} table does not exist yet.`);
      throw new ApiError(400, error.message);
    }
    const audit = await recordAudit(supabase, {
      actorId: user.id,
      actorEmail: email,
      action: 'template.create',
      subject: data.id,
      detail: { kind: row.kind, label: row.label },
    });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] Template was created without an audit row.`);
    }
    return Response.json(data, { status: 201 });
  } catch (error) { return apiError(error); }
}

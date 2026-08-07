/**
 * The three looks offered by the /resume builder.
 *
 * Kept out of the page component so /settings can offer the same list without
 * importing a client page, and so the two can never drift apart. This is the
 * *builder's* set — distinct from RESUME_TEMPLATES in lib/resume.ts, which names
 * the stored server-side export layouts.
 */
export const RESUME_BUILDER_TEMPLATES = [
  { id: 'clean', name: 'Clean', note: 'Safest for ATS. What most clients expect.' },
  { id: 'bold', name: 'Bold', note: 'Teal header bar. Stands out in a stack of PDFs.' },
  { id: 'classic', name: 'Classic', note: 'Serif and centred. Formal, corporate-friendly.' },
] as const;

export type ResumeBuilderTemplateId = (typeof RESUME_BUILDER_TEMPLATES)[number]['id'];

export const RESUME_BUILDER_TEMPLATE_IDS = RESUME_BUILDER_TEMPLATES.map((t) => t.id) as readonly ResumeBuilderTemplateId[];

export function isResumeBuilderTemplate(value: unknown): value is ResumeBuilderTemplateId {
  return typeof value === 'string' && RESUME_BUILDER_TEMPLATE_IDS.includes(value as ResumeBuilderTemplateId);
}

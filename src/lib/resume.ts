import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

export const RESUME_TEMPLATES = ['classic', 'modern', 'compact'] as const;
export type ResumeTemplate = typeof RESUME_TEMPLATES[number];

type Entry = {
  title?: string;
  company?: string;
  school?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
};

type ResumeContent = {
  basics?: {
    name?: string;
    headline?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    links?: string[];
  };
  experience?: Entry[];
  education?: Entry[];
  skills?: string[];
  certifications?: string[];
};

type Block = { kind: 'name' | 'headline' | 'contact' | 'section' | 'entry' | 'body' | 'bullet'; text: string };

const clean = (value: unknown) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

export function resumeBlocks(raw: Record<string, unknown>): Block[] {
  const content = raw as ResumeContent;
  const basics = content.basics ?? {};
  const blocks: Block[] = [];
  const name = clean(basics.name) || 'Your Name';
  blocks.push({ kind: 'name', text: name });
  if (clean(basics.headline)) blocks.push({ kind: 'headline', text: clean(basics.headline) });
  const contact = [basics.email, basics.phone, basics.location, ...(basics.links ?? [])].map(clean).filter(Boolean).join(' | ');
  if (contact) blocks.push({ kind: 'contact', text: contact });
  if (clean(basics.summary)) {
    blocks.push({ kind: 'section', text: 'Summary' }, { kind: 'body', text: clean(basics.summary) });
  }

  const addEntries = (title: string, entries: Entry[] = [], education = false) => {
    if (!entries.length) return;
    blocks.push({ kind: 'section', text: title });
    entries.forEach((entry) => {
      const primary = education
        ? [clean(entry.degree), clean(entry.school)].filter(Boolean).join(' - ')
        : [clean(entry.title), clean(entry.company)].filter(Boolean).join(' - ');
      const dates = [clean(entry.startDate), clean(entry.endDate)].filter(Boolean).join(' to ');
      if (primary || dates) blocks.push({ kind: 'entry', text: [primary, dates].filter(Boolean).join(' | ') });
      if (clean(entry.description)) blocks.push({ kind: 'body', text: clean(entry.description) });
      (entry.highlights ?? []).map(clean).filter(Boolean).forEach((text) => blocks.push({ kind: 'bullet', text }));
    });
  };

  addEntries('Experience', content.experience);
  addEntries('Education', content.education, true);
  if (content.skills?.length) {
    blocks.push({ kind: 'section', text: 'Skills' }, { kind: 'body', text: content.skills.map(clean).filter(Boolean).join(', ') });
  }
  if (content.certifications?.length) {
    blocks.push({ kind: 'section', text: 'Certifications' });
    content.certifications.map(clean).filter(Boolean).forEach((text) => blocks.push({ kind: 'bullet', text }));
  }
  return blocks;
}

export function resumeText(content: Record<string, unknown>) {
  return resumeBlocks(content).map((block) => block.kind === 'bullet' ? `- ${block.text}` : block.text).join('\n');
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]!));

export function resumeHtml(content: Record<string, unknown>, template: ResumeTemplate) {
  const accent = template === 'modern' ? '#0d9b8a' : template === 'compact' ? '#334155' : '#111827';
  const size = template === 'compact' ? '13px' : '15px';
  const body = resumeBlocks(content).map((block) => {
    const text = escapeHtml(block.text);
    if (block.kind === 'name') return `<h1>${text}</h1>`;
    if (block.kind === 'headline') return `<p class="headline">${text}</p>`;
    if (block.kind === 'contact') return `<p class="contact">${text}</p>`;
    if (block.kind === 'section') return `<h2>${text}</h2>`;
    if (block.kind === 'entry') return `<h3>${text}</h3>`;
    if (block.kind === 'bullet') return `<li>${text}</li>`;
    return `<p>${text}</p>`;
  }).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Resume</title><style>body{max-width:800px;margin:40px auto;padding:0 28px;color:#172033;font:${size}/1.5 Arial,sans-serif}h1{font-size:34px;margin:0;color:${accent}}.headline{font-size:18px;color:${accent};margin:2px 0}.contact{font-size:12px;color:#526071;border-bottom:1px solid #dce2e8;padding-bottom:14px}h2{font-size:15px;letter-spacing:.09em;text-transform:uppercase;color:${accent};border-bottom:1px solid ${accent};margin:22px 0 8px}h3{font-size:14px;margin:12px 0 3px}p{margin:5px 0}li{margin:3px 0}@media print{body{margin:0;max-width:none}}</style></head><body>${body}</body></html>`;
}

export async function resumeDocx(content: Record<string, unknown>, template: ResumeTemplate) {
  const compact = template === 'compact';
  const children = resumeBlocks(content).map((block) => {
    if (block.kind === 'name') return new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: block.text, bold: true, color: template === 'modern' ? '0D9B8A' : '172033' })], spacing: { after: compact ? 80 : 140 } });
    if (block.kind === 'section') return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: block.text.toUpperCase(), bold: true, color: template === 'modern' ? '0D9B8A' : '172033' })], spacing: { before: compact ? 120 : 220, after: 60 } });
    if (block.kind === 'entry') return new Paragraph({ children: [new TextRun({ text: block.text, bold: true })], spacing: { before: 100, after: 30 } });
    if (block.kind === 'bullet') return new Paragraph({ text: block.text, bullet: { level: 0 }, spacing: { after: 30 } });
    return new Paragraph({ children: [new TextRun({ text: block.text, italics: block.kind === 'headline', color: block.kind === 'contact' ? '526071' : undefined })], spacing: { after: compact ? 35 : 70 } });
  });
  const document = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBuffer(document);
}

function pdfSafe(value: string) {
  return value.normalize('NFKD').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^\x20-\xFF]/g, '');
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of pdfSafe(text).split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) line = candidate;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

export async function resumePdf(content: Record<string, unknown>, template: ResumeTemplate) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const accent = template === 'modern' ? rgb(0.05, 0.61, 0.54) : rgb(0.09, 0.13, 0.2);
  const margin = 48;
  const pageWidth = 612;
  const pageHeight = 792;
  let page: PDFPage = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const block of resumeBlocks(content)) {
    const style = block.kind === 'name' ? { size: 25, font: bold, gap: 10, color: accent }
      : block.kind === 'section' ? { size: 12, font: bold, gap: 9, color: accent }
      : block.kind === 'entry' ? { size: 10.5, font: bold, gap: 5, color: rgb(0.09, 0.13, 0.2) }
      : block.kind === 'contact' ? { size: 8.5, font: regular, gap: 7, color: rgb(0.33, 0.38, 0.44) }
      : { size: template === 'compact' ? 9 : 10, font: regular, gap: 5, color: rgb(0.09, 0.13, 0.2) };
    const prefix = block.kind === 'bullet' ? '- ' : '';
    const lines = wrap(`${prefix}${block.text}`, style.font, style.size, pageWidth - margin * 2);
    const needed = lines.length * (style.size + 3) + style.gap;
    if (y - needed < margin) { page = pdf.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
    if (block.kind === 'section') y -= 7;
    lines.forEach((line) => {
      page.drawText(line, { x: margin, y, size: style.size, font: style.font, color: style.color });
      y -= style.size + 3;
    });
    y -= style.gap;
  }
  return pdf.save();
}

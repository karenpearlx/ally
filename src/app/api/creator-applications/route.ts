import { ApiError, apiError, readJson, requireActiveUser } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import { CONTACT_EMAIL } from '@/lib/contact';

const MAX = {
  name: 120,
  email: 254,
  specialty: 120,
  portfolio: 500,
  pitch: 4000,
} as const;

function cleanText(value: unknown, max: number, label: string, min = 1): string {
  if (typeof value !== 'string') throw new ApiError(400, `${label} is required.`);
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  if (clean.length < min) throw new ApiError(400, `${label} is too short.`);
  if (clean.length > max) throw new ApiError(400, `${label} is too long.`);
  return clean;
}

function cleanOptionalUrl(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new ApiError(400, 'Portfolio URL must be text.');
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  if (!clean) return null;
  if (clean.length > MAX.portfolio) throw new ApiError(400, 'Portfolio URL is too long.');
  try {
    const url = new URL(clean);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new ApiError(400, 'Portfolio URL must start with http or https.');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, 'Portfolio URL is not valid.');
  }
  return clean;
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);

    const name = cleanText(body.name, MAX.name, 'Name');
    const email = cleanText(body.email, MAX.email, 'Email').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, 'Email does not look valid.');
    }
    const specialty = cleanText(body.specialty, MAX.specialty, 'Specialty');
    const pitch = cleanText(body.pitch, MAX.pitch, 'Pitch', 40);
    const portfolioUrl = cleanOptionalUrl(body.portfolio_url);

    let supabase: Awaited<ReturnType<typeof createClient>>;
    let userId: string | null = null;
    try {
      const session = await requireActiveUser();
      supabase = session.supabase;
      userId = session.user.id;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      supabase = await createClient();
    }

    const { error } = await supabase.from('creator_applications').insert({
      user_id: userId,
      name,
      email,
      specialty,
      portfolio_url: portfolioUrl,
      pitch,
    });

    if (error) {
      console.error('creator_applications insert failed', error.message);
      // Migration may not be applied yet — still acknowledge so the form works.
      return Response.json(
        {
          ok: true,
          stored: false,
          next: `We could not save the form just now. Email ${CONTACT_EMAIL} with the same details and we will pick it up.`,
        },
        { status: 202 },
      );
    }

    return Response.json({
      ok: true,
      stored: true,
      next: `Thanks — we read every application. Expect a reply at ${email} within a few days. Prefer email? Write ${CONTACT_EMAIL}.`,
    });
  } catch (error) {
    return apiError(error);
  }
}

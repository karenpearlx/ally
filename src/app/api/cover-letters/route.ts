import { ApiError, apiError, consumeFeatureUse, jsonObject, paginationFrom, paginationMeta, readJson, requireActiveUser, requireUser, stringField } from '@/lib/api';
import { generateCoverLetter, type CoverLetterProfile } from '@/lib/cover-letter';

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { limit, offset } = paginationFrom(request);
    const { data, error, count } = await supabase
      .from('cover_letters')
      .select('id,job_title,company,created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    const coverLetters = data ?? [];
    return Response.json({
      cover_letters: coverLetters,
      pagination: paginationMeta(count, limit, offset, coverLetters.length),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireActiveUser();
    await consumeFeatureUse(supabase, 'cover_letter');
    const body = await readJson(request);
    const listing = stringField(body.job_listing_content, 'job_listing_content', { required: true, max: 50_000 })!;
    const jobTitle = stringField(body.job_title, 'job_title', { max: 300 });
    const company = stringField(body.company, 'company', { max: 300 });

    const { data: savedProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name,bio,skills,experience_years,experience')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    let profile: CoverLetterProfile = savedProfile ?? {};
    if (body.profile != null) {
      // Request data can supplement a partially completed saved profile, but it
      // cannot select or write another user's profile.
      profile = { ...profile, ...jsonObject(body.profile, 'profile') };
    }
    if (!profile.full_name) profile.full_name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null;

    const generatedLetter = generateCoverLetter({ listing, profile, jobTitle, company });
    if (!generatedLetter.trim()) throw new ApiError(500, 'Could not generate a cover letter.');

    await consumeFeatureUse(supabase, 'cover_letter');
    const { data, error } = await supabase.from('cover_letters').insert({
      user_id: user.id,
      job_listing_content: listing,
      generated_letter: generatedLetter,
      job_title: jobTitle,
      company,
    }).select().single();
    if (error) throw error;

    return Response.json({ cover_letter: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

import { ApiError, apiError, readJson, requireActiveUser, requireUser } from '@/lib/api';
import { cleanBlock, cleanLine, cleanUrl } from '@/lib/cover-letter-rules';
import { isNicheId, type Niche } from '@/lib/cover-letter-templates';
import {
  PROFILE_LIMITS,
  cleanAvatarUrl,
  cleanEmail,
  isAvailability,
  isExperienceLevel,
  parseRate,
  toRow,
  type Profile,
} from '@/lib/profile';
import { readProfile } from '@/lib/profile-store';

/**
 * The signed-in user's VA profile.
 *
 * Everything runs through the caller's own session against RLS. The row is
 * upserted on user_id because most accounts will not have one until their first
 * save, and the insert policy in supabase/migrations/2026-08-04-profiles.sql
 * pins that to auth.uid().
 *
 * PUT takes the whole profile rather than a patch: the form is one Save button,
 * and a full replace means a removed link or language actually disappears.
 */

function text(value: unknown, name: string, max: number, multiline = false) {
  if (value == null) return '';
  if (typeof value !== 'string') throw new ApiError(400, `${name} must be text.`);
  if (value.length > max + 200) throw new ApiError(400, `${name} is longer than ${max} characters.`);
  return multiline ? cleanBlock(value, max) : cleanLine(value, max);
}

function niches(value: unknown): Niche[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new ApiError(400, 'niches must be an array.');
  if (value.length > PROFILE_LIMITS.maxNiches) {
    throw new ApiError(400, `Pick up to ${PROFILE_LIMITS.maxNiches} specialities.`);
  }
  const out: Niche[] = [];
  for (const entry of value) {
    if (!isNicheId(entry)) throw new ApiError(400, `"${String(entry)}" is not a known speciality.`);
    if (!out.includes(entry)) out.push(entry);
  }
  return out;
}

function languages(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new ApiError(400, 'languages must be an array.');
  if (value.length > PROFILE_LIMITS.maxLanguages) {
    throw new ApiError(400, `You can list up to ${PROFILE_LIMITS.maxLanguages} languages.`);
  }
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') throw new ApiError(400, 'Each language must be text.');
    const clean = cleanLine(entry, PROFILE_LIMITS.maxLanguage);
    if (clean && !out.some((l) => l.toLowerCase() === clean.toLowerCase())) out.push(clean);
  }
  return out;
}

function links(value: unknown) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new ApiError(400, 'portfolio_links must be an array.');
  if (value.length > PROFILE_LIMITS.maxLinks) {
    throw new ApiError(400, `You can save up to ${PROFILE_LIMITS.maxLinks} links.`);
  }
  return value.map((entry, i) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new ApiError(400, `Link ${i + 1} must have a label and a url.`);
    }
    const raw = entry as Record<string, unknown>;
    if (typeof raw.url !== 'string') throw new ApiError(400, `Link ${i + 1} needs a url.`);
    const url = cleanUrl(raw.url);
    if (!url) throw new ApiError(400, `Link ${i + 1} must be a valid http or https URL.`);
    return { label: cleanLine(raw.label, PROFILE_LIMITS.maxLabel) || 'Link', url };
  });
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { profile, ready } = await readProfile(supabase, user.id);
    return Response.json({ profile, ready });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await requireActiveUser();
    const body = await readJson(request);

    const email = body.contact_email == null ? '' : cleanEmail(body.contact_email);
    if (body.contact_email && !email) {
      throw new ApiError(400, "That contact email doesn't look right.");
    }

    const profile: Profile = {
      fullName: text(body.full_name, 'Name', PROFILE_LIMITS.maxName),
      headline: text(body.headline, 'Headline', PROFILE_LIMITS.maxHeadline),
      contactEmail: email,
      bio: text(body.bio, 'About', PROFILE_LIMITS.maxBio, true),
      niches: niches(body.niches),
      experience: isExperienceLevel(body.experience_level) ? body.experience_level : 'intermediate',
      hourlyRate: parseRate(body.hourly_rate, PROFILE_LIMITS.maxRateHourly),
      monthlyRate: parseRate(body.monthly_rate, PROFILE_LIMITS.maxRateMonthly),
      links: links(body.portfolio_links),
      location: text(body.location, 'Location', PROFILE_LIMITS.maxLocation),
      timezone: text(body.timezone, 'Timezone', PROFILE_LIMITS.maxTimezone),
      languages: languages(body.languages),
      availability: isAvailability(body.availability) ? body.availability : 'available',
      avatarUrl: cleanAvatarUrl(body.avatar_url),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, ...toRow(profile) }, { onConflict: 'user_id' });

    if (error) {
      if (error.code === '42P01') {
        throw new ApiError(
          503,
          'The profiles table is missing. Run supabase/migrations/2026-08-04-profiles.sql in the Supabase SQL editor.',
        );
      }
      throw new ApiError(400, error.message);
    }

    return Response.json({ profile });
  } catch (error) {
    return apiError(error);
  }
}

import { ApiError, apiError, readJson, requireActiveUser, requireUser } from '@/lib/api';
import { isResumeBuilderTemplate } from '@/lib/resume-builder-templates';
import { MAX_FOLLOW_UP_DAYS, MIN_FOLLOW_UP_DAYS, isNiche } from '@/lib/preferences';
import { SETTINGS_COLUMNS, readUserSettings } from '@/lib/settings';
import {
  RULE_LIMITS,
  cleanBlock,
  cleanLine,
  cleanUrl,
  type RuleLink,
} from '@/lib/cover-letter-rules';

/**
 * Account settings for the signed-in user.
 *
 * Everything runs through the caller's own session against RLS — no service
 * role, no user id from the request body. The row is upserted rather than
 * updated so an account created before the auth trigger existed can still save;
 * the insert policy in supabase/2026-08-04-user-settings.sql pins that to
 * auth.uid() = id.
 */

function parseDays(value: unknown) {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < MIN_FOLLOW_UP_DAYS ||
    value > MAX_FOLLOW_UP_DAYS
  ) {
    throw new ApiError(400, `follow_up_days must be a whole number from ${MIN_FOLLOW_UP_DAYS} to ${MAX_FOLLOW_UP_DAYS}.`);
  }
  return value;
}

/**
 * Cover-letter rules validation.
 *
 * Malformed shapes are rejected rather than quietly coerced — a client sending
 * `links: "portfolio"` has a bug worth surfacing. Content is still normalised
 * (control characters stripped, whitespace collapsed) because the values are
 * rendered straight into a letter, and the same normalisation runs again on
 * read, so a row written by any other route stays safe.
 */
function parseLinks(value: unknown): RuleLink[] {
  if (!Array.isArray(value)) throw new ApiError(400, 'cover_letter_links must be an array.');
  if (value.length > RULE_LIMITS.maxLinks) {
    throw new ApiError(400, `You can save up to ${RULE_LIMITS.maxLinks} links.`);
  }
  return value.map((entry, i) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new ApiError(400, `Link ${i + 1} must be an object with a label and a url.`);
    }
    const raw = entry as Record<string, unknown>;
    if (raw.label != null && typeof raw.label !== 'string') {
      throw new ApiError(400, `Link ${i + 1} label must be text.`);
    }
    if (typeof raw.url !== 'string') throw new ApiError(400, `Link ${i + 1} needs a url.`);
    const url = cleanUrl(raw.url);
    if (!url) throw new ApiError(400, `Link ${i + 1} must be a valid http or https URL.`);
    return { label: cleanLine(raw.label, RULE_LIMITS.maxLabel) || 'Link', url };
  });
}

function parseSnippets(value: unknown): string[] {
  if (!Array.isArray(value)) throw new ApiError(400, 'cover_letter_snippets must be an array.');
  if (value.length > RULE_LIMITS.maxSnippets) {
    throw new ApiError(400, `You can save up to ${RULE_LIMITS.maxSnippets} snippets.`);
  }
  return value
    .map((entry, i) => {
      if (typeof entry !== 'string') throw new ApiError(400, `Snippet ${i + 1} must be text.`);
      if (entry.length > RULE_LIMITS.maxSnippet) {
        throw new ApiError(400, `Snippet ${i + 1} is longer than ${RULE_LIMITS.maxSnippet} characters.`);
      }
      return cleanBlock(entry, RULE_LIMITS.maxSnippet);
    })
    .filter(Boolean);
}

function parseRuleText(value: unknown, field: string, max: number, multiline: boolean) {
  if (typeof value !== 'string') throw new ApiError(400, `${field} must be text.`);
  if (value.length > max) throw new ApiError(400, `${field} is longer than ${max} characters.`);
  return multiline ? cleanBlock(value, max) : cleanLine(value, max);
}

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    return Response.json(await readUserSettings(supabase, user.id));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireActiveUser();
    const body = await readJson(request);

    const patch: Record<string, unknown> = {};

    if ('follow_up_days' in body) patch.follow_up_days = parseDays(body.follow_up_days);

    if ('default_resume_template' in body) {
      if (!isResumeBuilderTemplate(body.default_resume_template)) {
        throw new ApiError(400, 'default_resume_template must be one of clean, bold or classic.');
      }
      patch.default_resume_template = body.default_resume_template;
    }

    if ('default_cover_letter_template' in body) {
      if (!isNiche(body.default_cover_letter_template)) {
        throw new ApiError(400, 'default_cover_letter_template is not a known cover-letter template.');
      }
      patch.default_cover_letter_template = body.default_cover_letter_template;
    }

    if ('cover_letter_links' in body) patch.cover_letter_links = parseLinks(body.cover_letter_links);

    if ('cover_letter_snippets' in body) {
      patch.cover_letter_snippets = parseSnippets(body.cover_letter_snippets);
    }

    if ('cover_letter_sign_off' in body) {
      patch.cover_letter_sign_off = parseRuleText(
        body.cover_letter_sign_off,
        'cover_letter_sign_off',
        RULE_LIMITS.maxSignOff,
        false,
      );
    }

    if ('cover_letter_instructions' in body) {
      patch.cover_letter_instructions = parseRuleText(
        body.cover_letter_instructions,
        'cover_letter_instructions',
        RULE_LIMITS.maxInstructions,
        true,
      );
    }

    if ('in_app_notifications' in body) {
      if (typeof body.in_app_notifications !== 'boolean') {
        throw new ApiError(400, 'in_app_notifications must be true or false.');
      }
      patch.in_app_notifications = body.in_app_notifications;
    }

    if (!Object.keys(patch).length) throw new ApiError(400, 'Nothing to update.');

    const { data, error } = await supabase
      .from('users')
      .upsert({ id: user.id, email: user.email, ...patch }, { onConflict: 'id' })
      .select(SETTINGS_COLUMNS)
      .single();
    if (error) throw error;

    // Keep the stored reminder dates honest when the threshold moves.
    let updatedApplications = 0;
    if (typeof patch.follow_up_days === 'number' && body.recalculate_existing !== false) {
      const { data: affected, error: recalculateError } = await supabase.rpc(
        'recalculate_application_follow_ups',
        { days_to_wait: patch.follow_up_days },
      );
      if (recalculateError) throw recalculateError;
      updatedApplications = Number(affected ?? 0);
    }

    return Response.json({ ...data, updated_applications: updatedApplications });
  } catch (error) {
    return apiError(error);
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_PREFERENCES, type PreferencesRow } from '@/lib/preferences';

export const SETTINGS_COLUMNS =
  'follow_up_days,default_resume_template,default_cover_letter_template,cover_letter_links,cover_letter_sign_off,cover_letter_snippets,cover_letter_instructions,in_app_notifications';

export const DEFAULT_SETTINGS_ROW: PreferencesRow = {
  follow_up_days: DEFAULT_PREFERENCES.followUpDays,
  default_resume_template: DEFAULT_PREFERENCES.resumeTemplate,
  default_cover_letter_template: DEFAULT_PREFERENCES.coverLetterTemplate,
  cover_letter_links: DEFAULT_PREFERENCES.coverLetterRules.links,
  cover_letter_sign_off: DEFAULT_PREFERENCES.coverLetterRules.signOff,
  cover_letter_snippets: DEFAULT_PREFERENCES.coverLetterRules.snippets,
  cover_letter_instructions: DEFAULT_PREFERENCES.coverLetterRules.instructions,
  in_app_notifications: DEFAULT_PREFERENCES.inAppNotifications,
};

/** The column set before cover-letter rules existed. */
export const PRE_RULES_COLUMNS =
  'follow_up_days,default_resume_template,default_cover_letter_template,in_app_notifications';

/**
 * The caller's settings row, defaults filled in.
 *
 * Two things are treated as normal rather than fatal: no row yet (accounts made
 * before the auth trigger — the first save upserts one), and a database that
 * has not run supabase/2026-08-04-user-settings.sql yet, where selecting the new
 * columns errors. In that second case we step down through narrower column
 * sets, so nobody's reminder threshold silently resets mid-rollout.
 */
export async function readUserSettings(supabase: SupabaseClient, userId: string): Promise<PreferencesRow> {
  // Widest set first, then narrower ones, so a database part-way through the
  // rollout still returns everything it does have.
  const attempts = [SETTINGS_COLUMNS, PRE_RULES_COLUMNS, 'follow_up_days'];

  for (const columns of attempts) {
    const { data, error } = await supabase.from('users').select(columns).eq('id', userId).maybeSingle();
    if (!error) return { ...DEFAULT_SETTINGS_ROW, ...((data as PreferencesRow | null) ?? {}) };
  }
  return { ...DEFAULT_SETTINGS_ROW };
}

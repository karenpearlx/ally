import type { SupabaseClient } from '@supabase/supabase-js';
import { EMPTY_PROFILE, PROFILE_COLUMNS, fromRow, type Profile, type ProfileRow } from '@/lib/profile';

export type ProfileRead = {
  profile: Profile;
  /** False when public.profiles does not exist yet — the page says so instead of lying. */
  ready: boolean;
};

/** Postgres codes for "no such table" and "no such column". */
const MISSING = new Set(['42P01', '42703']);

/**
 * The caller's profile, defaults filled in.
 *
 * Two non-fatal cases: no row yet (normal — the first save upserts one), and a
 * database that has not run supabase/migrations/2026-08-04-profiles.sql, where
 * the select errors outright. The second returns ready:false so the UI can tell
 * the truth rather than silently pretend an empty profile saved fine.
 */
export async function readProfile(supabase: SupabaseClient, userId: string): Promise<ProfileRead> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (MISSING.has(error.code)) return { profile: { ...EMPTY_PROFILE }, ready: false };
    // Anything else (a network blip, a policy change) still renders a usable page.
    console.error('readProfile', error);
    return { profile: { ...EMPTY_PROFILE }, ready: true };
  }

  return { profile: fromRow((data as ProfileRow | null) ?? null), ready: true };
}

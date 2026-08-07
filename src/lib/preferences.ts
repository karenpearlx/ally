/**
 * Account preferences, mirrored locally.
 *
 * Supabase is the record of truth for a signed-in user, but three of these are
 * read on every route by components that must render instantly and offline (the
 * nav bell, the builders' opening state). So /settings writes the row *and*
 * mirrors it into localStorage, then fires one event; everything else reads the
 * mirror synchronously and never waits on the network.
 *
 * follow_up_days keeps living in its own long-standing key, `ally-followup-days`,
 * because the tracker and the bell already share it.
 */

import { DEFAULT_DAYS, STORE_DAYS, announceAppsChanged } from '@/lib/followups';
import { isNicheId, type Niche } from '@/lib/cover-letter-templates';
import {
  isResumeBuilderTemplate,
  type ResumeBuilderTemplateId,
} from '@/lib/resume-builder-templates';
import { EMPTY_RULES, parseRules, type CoverLetterRules } from '@/lib/cover-letter-rules';

export type Preferences = {
  followUpDays: number;
  resumeTemplate: ResumeBuilderTemplateId;
  coverLetterTemplate: Niche;
  /** Links, sign-off, snippets and style notes folded into every letter. */
  coverLetterRules: CoverLetterRules;
  inAppNotifications: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  followUpDays: DEFAULT_DAYS,
  resumeTemplate: 'clean',
  coverLetterTemplate: 'general',
  coverLetterRules: EMPTY_RULES,
  inAppNotifications: true,
};

/** Everything except follow-up days, which has its own key. */
export const PREFS_STORE = 'ally-preferences';

/** Same-tab broadcast; the native `storage` event only reaches other tabs. */
export const PREFS_CHANGED = 'ally:preferences-changed';

export const MIN_FOLLOW_UP_DAYS = 1;
export const MAX_FOLLOW_UP_DAYS = 90;

export function isNiche(value: unknown): value is Niche {
  return isNicheId(value);
}


export function clampFollowUpDays(value: unknown): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_PREFERENCES.followUpDays;
  return Math.min(MAX_FOLLOW_UP_DAYS, Math.max(MIN_FOLLOW_UP_DAYS, n));
}

/** Row shape as it comes back from Supabase / the settings API. */
export type PreferencesRow = {
  follow_up_days?: unknown;
  default_resume_template?: unknown;
  default_cover_letter_template?: unknown;
  cover_letter_links?: unknown;
  cover_letter_sign_off?: unknown;
  cover_letter_snippets?: unknown;
  cover_letter_instructions?: unknown;
  in_app_notifications?: unknown;
};

export function fromRow(row: PreferencesRow | null | undefined): Preferences {
  return {
    followUpDays: row?.follow_up_days == null ? DEFAULT_PREFERENCES.followUpDays : clampFollowUpDays(row.follow_up_days),
    resumeTemplate: isResumeBuilderTemplate(row?.default_resume_template)
      ? row.default_resume_template
      : DEFAULT_PREFERENCES.resumeTemplate,
    coverLetterTemplate: isNiche(row?.default_cover_letter_template)
      ? row.default_cover_letter_template
      : DEFAULT_PREFERENCES.coverLetterTemplate,
    coverLetterRules: parseRules({
      links: row?.cover_letter_links,
      signOff: row?.cover_letter_sign_off,
      snippets: row?.cover_letter_snippets,
      instructions: row?.cover_letter_instructions,
    }),
    inAppNotifications:
      typeof row?.in_app_notifications === 'boolean'
        ? row.in_app_notifications
        : DEFAULT_PREFERENCES.inAppNotifications,
  };
}

export function toRow(prefs: Preferences) {
  return {
    follow_up_days: prefs.followUpDays,
    default_resume_template: prefs.resumeTemplate,
    default_cover_letter_template: prefs.coverLetterTemplate,
    cover_letter_links: prefs.coverLetterRules.links,
    cover_letter_sign_off: prefs.coverLetterRules.signOff,
    cover_letter_snippets: prefs.coverLetterRules.snippets,
    cover_letter_instructions: prefs.coverLetterRules.instructions,
    in_app_notifications: prefs.inAppNotifications,
  };
}

/** Never throws: a corrupt key must not take the nav down on every route. */
export function readPreferences(): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  let stored: Partial<Preferences> = {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PREFS_STORE) ?? '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) stored = parsed as Partial<Preferences>;
  } catch {
    /* defaults */
  }
  let days = DEFAULT_PREFERENCES.followUpDays;
  try {
    const raw = localStorage.getItem(STORE_DAYS);
    if (raw !== null && raw !== '') days = clampFollowUpDays(raw);
  } catch {
    /* defaults */
  }
  return {
    followUpDays: days,
    resumeTemplate: isResumeBuilderTemplate(stored.resumeTemplate)
      ? stored.resumeTemplate
      : DEFAULT_PREFERENCES.resumeTemplate,
    coverLetterTemplate: isNiche(stored.coverLetterTemplate)
      ? stored.coverLetterTemplate
      : DEFAULT_PREFERENCES.coverLetterTemplate,
    coverLetterRules: parseRules(stored.coverLetterRules),
    inAppNotifications:
      typeof stored.inAppNotifications === 'boolean'
        ? stored.inAppNotifications
        : DEFAULT_PREFERENCES.inAppNotifications,
  };
}

/**
 * Write the mirror and tell the app.
 *
 * Fires both events on purpose: the bell and tracker listen for the older
 * applications event because follow-up days changes their maths, and the
 * preference event covers the rest.
 */
export function writePreferences(prefs: Preferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      PREFS_STORE,
      JSON.stringify({
        resumeTemplate: prefs.resumeTemplate,
        coverLetterTemplate: prefs.coverLetterTemplate,
        coverLetterRules: prefs.coverLetterRules,
        inAppNotifications: prefs.inAppNotifications,
      }),
    );
    localStorage.setItem(STORE_DAYS, String(prefs.followUpDays));
  } catch {
    /* private mode, quota — the server still has the truth */
  }
  window.dispatchEvent(new Event(PREFS_CHANGED));
  announceAppsChanged();
}

export function subscribePreferences(fn: () => void) {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === PREFS_STORE || e.key === STORE_DAYS) fn();
  };
  window.addEventListener(PREFS_CHANGED, fn);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(PREFS_CHANGED, fn);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * Whether this tab has a signed-in session.
 *
 * Set once by <PreferencesSync>. Local-only visitors should not be firing
 * PATCHes at an endpoint that will only ever 401 at them.
 */
let hasAccount = false;

export function setHasAccount(value: boolean) {
  hasAccount = value;
}

/**
 * Change a preference from anywhere in the app.
 *
 * Mirrors locally first so the UI is instant, then syncs to the row when there
 * is a session. A failed sync is deliberately quiet: the setting still applies
 * on this device, and /settings is where saving is a promise.
 */
export async function persistPreferences(partial: Partial<Preferences>) {
  const next: Preferences = { ...readPreferences(), ...partial };
  writePreferences(next);
  if (!hasAccount) return;
  try {
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(toRow(next)),
    });
  } catch {
    /* offline; the mirror still holds */
  }
}

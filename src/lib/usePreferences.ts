"use client";

import { useMemo, useSyncExternalStore } from "react";
import { STORE_DAYS } from "@/lib/followups";
import {
  DEFAULT_PREFERENCES,
  PREFS_STORE,
  type Preferences,
  readPreferences,
  subscribePreferences,
} from "@/lib/preferences";

/** Primitive snapshot — returning a fresh object here would loop forever. */
function rawSnapshot() {
  try {
    return `${localStorage.getItem(PREFS_STORE) ?? ""}|${localStorage.getItem(STORE_DAYS) ?? ""}`;
  } catch {
    return "";
  }
}

/** The server has no localStorage, so SSR renders defaults and hydration fills in. */
const serverSnapshot = () => null;

/**
 * Live account preferences from the local mirror.
 *
 * `hydrated` is false on the server pass and the first client render, which is
 * what callers use to avoid flipping a control before the real value is known.
 */
export function usePreferences(): Preferences & { hydrated: boolean } {
  const raw = useSyncExternalStore(subscribePreferences, rawSnapshot, serverSnapshot);
  return useMemo(
    () => (raw === null ? { ...DEFAULT_PREFERENCES, hydrated: false } : { ...readPreferences(), hydrated: true }),
    [raw],
  );
}

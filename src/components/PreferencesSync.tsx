"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { fromRow, setHasAccount, writePreferences, type PreferencesRow } from "@/lib/preferences";

/**
 * Pulls the account's preferences into the local mirror once per session.
 *
 * Without this, a signed-in user on a second device keeps whatever the tracker
 * happened to cache locally, and the account setting is silently ignored. The
 * fetch runs once per user per tab; the nav is on every route, so one mount
 * covers the whole app.
 */
let syncedFor: string | null = null;

export default function PreferencesSync({ user }: { user: User | null }) {
  useEffect(() => {
    setHasAccount(Boolean(user));
    if (!user) {
      syncedFor = null;
      return;
    }
    if (syncedFor === user.id) return;
    syncedFor = user.id;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (!res.ok) return;
        const row = (await res.json()) as PreferencesRow;
        if (!cancelled) writePreferences(fromRow(row));
      } catch {
        // Offline or mid-refresh: the mirror keeps whatever it had.
        syncedFor = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return null;
}

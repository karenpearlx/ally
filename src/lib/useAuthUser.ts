"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  /** "unknown" until the client has read the session — render neither state yet. */
  status: "unknown" | "in" | "out";
  user: User | null;
};

const UNKNOWN: AuthUser = { status: "unknown", user: null };

/**
 * Current Supabase user, kept live.
 *
 * onAuthStateChange fires INITIAL_SESSION as soon as it subscribes, so the
 * first read costs nothing over the network; after that, OAuth returns,
 * token refreshes, and sign-outs all arrive on the same channel and the UI
 * follows without a reload.
 */
export function useAuthUser(): AuthUser {
  const [state, setState] = useState<AuthUser>(UNKNOWN);

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session?.user ? { status: "in", user: session.user } : { status: "out", user: null });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}

/** Display name Google gives us, falling back to the local part of the email. */
export function displayName(user: User): string {
  const meta = user.user_metadata ?? {};
  const named = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : "";
  return named.trim() || user.email?.split("@")[0] || "Your account";
}

export function avatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const url = typeof meta.avatar_url === "string" ? meta.avatar_url : typeof meta.picture === "string" ? meta.picture : "";
  return url.startsWith("https://") ? url : null;
}

export function initials(user: User): string {
  const name = displayName(user);
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
  return letters.toUpperCase();
}

"use client";

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type AuthStatus = "unknown" | "in" | "out";

export type AuthState = {
  status: AuthStatus;
  user: User | null;
  /** True once we've received the initial auth state - safe to render auth-dependent UI */
  ready: boolean;
};

const INITIAL: AuthState = { status: "unknown", user: null, ready: false };

const AuthContext = createContext<AuthState>(INITIAL);

/**
 * Single source of truth for auth state across the entire app.
 * 
 * This replaces multiple useAuthUser() subscriptions with one shared context,
 * eliminating race conditions and redundant re-renders.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session synchronously if available in storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        status: session?.user ? "in" : "out",
        user: session?.user ?? null,
        ready: true,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        status: session?.user ? "in" : "out",
        user: session?.user ?? null,
        ready: true,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(() => state, [state.status, state.user?.id, state.ready]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Get auth state from context. Must be used within AuthProvider.
 * This replaces the old useAuthUser() hook.
 */
export function useAuth(): AuthState {
  return useContext(AuthContext);
}

// Re-export helper functions for convenience
export { displayName, avatarUrl, initials } from "./useAuthUser";

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * One GoTrue client per browser tab.
 *
 * createBrowserClient() spins up a fresh auth client every call, and each one
 * registers its own storage listener and refresh timer — which is where the
 * "Multiple GoTrueClient instances detected" console warning comes from, and
 * why two components could disagree about the current session. Components call
 * createClient() freely; they all get the same instance.
 */
let browserClient: SupabaseClient | undefined

export function createClient() {
  if (browserClient) return browserClient

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // OAuth / magic-link codes are exchanged in /auth/callback. Leaving
        // detectSessionInUrl on would race that route and burn the one-time code
        // ("invalid flow state, no valid flow state found").
        detectSessionInUrl: false,
      },
    },
  )

  return browserClient
}

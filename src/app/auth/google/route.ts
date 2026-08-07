import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin, safeNextPath } from "@/lib/supabase/origin";
import { createRouteHandlerClient } from "@/lib/supabase/route";

/**
 * Starts Google OAuth on the server so the PKCE code_verifier is written with
 * Set-Cookie on a same-origin response before the browser leaves for Google.
 *
 * Client-side signInWithOAuth can lose that cookie before navigation, which
 * breaks exchangeCodeForSession on return.
 */
export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const next = safeNextPath(new URL(request.url).searchParams.get("next"));

  try {
    const { supabase, applyCookies } = createRouteHandlerClient(request);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      const destination = new URL("/login", origin);
      destination.searchParams.set("error", error?.message ?? "Could not start Google sign-in");
      return NextResponse.redirect(destination);
    }

    // Bounce through same-origin /auth/continue so Set-Cookie is committed on a
    // first-party navigation before the cross-site hop to Supabase/Google.
    // Some browsers drop Set-Cookie when the 302 Location is already cross-site.
    const continueUrl = new URL("/auth/continue", origin);
    continueUrl.searchParams.set("to", data.url);
    const response = NextResponse.redirect(continueUrl);
    applyCookies(response);
    return response;
  } catch {
    const destination = new URL("/login", origin);
    destination.searchParams.set("error", "Auth is not configured");
    return NextResponse.redirect(destination);
  }
}

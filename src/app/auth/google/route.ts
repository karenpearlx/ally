import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin, safeNextPath } from "@/lib/supabase/origin";

/**
 * Starts Google OAuth on the server so the PKCE code_verifier is written with
 * Set-Cookie on the redirect response. Client-side document.cookie writes can
 * be dropped before navigation; this path keeps the verifier available when
 * /auth/callback exchanges the code.
 */
export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const next = safeNextPath(new URL(request.url).searchParams.get("next"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    const destination = new URL("/login", origin);
    destination.searchParams.set("error", "Auth is not configured");
    return NextResponse.redirect(destination);
  }

  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

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

  const response = NextResponse.redirect(data.url);
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}

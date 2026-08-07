import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin, safeNextPath } from "@/lib/supabase/origin";

/**
 * Exchanges the OAuth/PKCE auth code for a session.
 *
 * Cookie writes must land on the redirect response. Using cookies() from
 * next/headers alone can drop Set-Cookie on NextResponse.redirect, and the
 * PKCE verifier must still be present on the request when we exchange.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = requestOrigin(request);
  const code = url.searchParams.get("code");
  const flowId = url.searchParams.get("sb_flow_id");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=Missing+authentication+code", origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/login?error=Auth+is+not+configured", origin));
  }

  const redirect = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          redirect.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (error) {
    const destination = new URL("/login", origin);
    destination.searchParams.set("error", error.message);
    return NextResponse.redirect(destination);
  }

  return redirect;
}

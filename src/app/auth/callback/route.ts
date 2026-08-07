import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin, safeNextPath } from "@/lib/supabase/origin";
import { createRouteHandlerClient } from "@/lib/supabase/route";

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

  const redirect = NextResponse.redirect(new URL(next, origin));

  let supabase;
  try {
    ({ supabase } = createRouteHandlerClient(request, redirect));
  } catch {
    return NextResponse.redirect(new URL("/login?error=Auth+is+not+configured", origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (error) {
    // A parallel exchange (e.g. browser detectSessionInUrl) may have already
    // consumed the one-time code. If we already have a session, treat as success.
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return redirect;
    }

    const destination = new URL("/login", origin);
    destination.searchParams.set("error", error.message);
    return NextResponse.redirect(destination);
  }

  return redirect;
}

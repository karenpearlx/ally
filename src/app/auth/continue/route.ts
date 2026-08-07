import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin } from "@/lib/supabase/origin";

/**
 * Same-origin hop after PKCE cookies are set on /auth/google.
 *
 * Only allows redirects to this project's Supabase Auth authorize endpoint so
 * the bounce cannot be used as an open redirect.
 */
export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const to = new URL(request.url).searchParams.get("to");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!to || !supabaseUrl) {
    return NextResponse.redirect(new URL("/login?error=Invalid+sign-in+redirect", origin));
  }

  let target: URL;
  try {
    target = new URL(to);
  } catch {
    return NextResponse.redirect(new URL("/login?error=Invalid+sign-in+redirect", origin));
  }

  const allowed = new URL(supabaseUrl);
  const isAuthorize =
    target.origin === allowed.origin &&
    target.pathname === "/auth/v1/authorize" &&
    (target.protocol === "https:" || target.protocol === "http:");

  if (!isAuthorize) {
    return NextResponse.redirect(new URL("/login?error=Invalid+sign-in+redirect", origin));
  }

  return NextResponse.redirect(target);
}

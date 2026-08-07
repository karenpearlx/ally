import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieEntry = { name: string; value: string; options: CookieOptions };

/**
 * Route-handler Supabase client that keeps PKCE verifier cookies coherent.
 *
 * applyServerStorage may call setAll several times while writing verifier
 * slots. Without mirroring into an in-memory jar, later getAll() calls only
 * see the original request cookies and can mis-handle chunk updates.
 *
 * Cookie writes are applied to `response` when provided; otherwise they are
 * buffered so the caller can attach them to a redirect created after
 * signInWithOAuth returns its URL.
 */
export function createRouteHandlerClient(
  request: NextRequest,
  response?: NextResponse,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured");
  }

  const jar = new Map<string, string>();
  for (const cookie of request.cookies.getAll()) {
    jar.set(cookie.name, cookie.value);
  }

  const pending: CookieEntry[] = [];
  const secure =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https" ||
    request.nextUrl.protocol === "https:";

  const cookieOptions: CookieOptions = {
    path: "/",
    sameSite: "lax",
    secure,
  };

  const apply = (cookiesToSet: CookieEntry[]) => {
    for (const { name, value, options } of cookiesToSet) {
      if (!value || options?.maxAge === 0) jar.delete(name);
      else jar.set(name, value);

      if (response) {
        response.cookies.set(name, value, options);
      } else {
        pending.push({ name, value, options });
      }
    }
  };

  const supabase = createServerClient(url, key, {
    cookieOptions,
    cookies: {
      getAll() {
        return Array.from(jar.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        apply(cookiesToSet);
      },
    },
  });

  return {
    supabase,
    /** Attach buffered Set-Cookie headers to a redirect (google start). */
    applyCookies(target: NextResponse) {
      for (const { name, value, options } of pending) {
        target.cookies.set(name, value, options);
      }
    },
  };
}

import type { NextRequest } from "next/server";

/**
 * Public origin for the current request.
 *
 * OAuth PKCE cookies are host-scoped. redirectTo must use the same host the
 * browser hit (including x-forwarded-* on Vercel), or the callback won't see
 * the code_verifier cookie.
 */
export function requestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    return `${proto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

/** Same-origin path only — blocks open redirects. */
export function safeNextPath(raw: string | null, fallback = "/tracker"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

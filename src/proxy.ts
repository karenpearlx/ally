import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Keeps the Supabase session fresh for signed-in surfaces.
 *
 * Access tokens expire after an hour. Without a refresh pass, coming back to
 * /admin the next morning would fail the server-side check and bounce a
 * perfectly valid session to the login screen. This calls getUser(), which
 * rotates the tokens, and copies any updated cookies onto the response.
 *
 * Never match /auth/* here. getUser() on a stale session calls _removeSession(),
 * which deletes PKCE code_verifier cookies before the callback can exchange
 * the OAuth code. Login/signup are also excluded — they do not need refresh,
 * and wiping verifier cookies while a Google sign-in is in flight breaks PKCE.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/settings/:path*',
    '/api/settings/:path*',
    '/profile/:path*',
    '/api/profile/:path*',
    '/profile',
    '/dashboard/:path*',
    '/dashboard',
  ],
};

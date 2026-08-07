import { apiError } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { readUsers } from '@/lib/admin/data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const query = (new URL(request.url).searchParams.get('q') ?? '').slice(0, 120);
    return Response.json(await readUsers(supabase, query), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return apiError(error);
  }
}

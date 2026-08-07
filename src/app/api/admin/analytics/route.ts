import { apiError } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { readAnalytics } from '@/lib/admin/data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const raw = Number(new URL(request.url).searchParams.get('days') ?? 30);
    const days = [7, 30, 90].includes(raw) ? raw : 30;
    return Response.json(await readAnalytics(supabase, days), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return apiError(error);
  }
}

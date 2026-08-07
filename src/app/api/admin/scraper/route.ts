import { apiError } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { readScraper } from '@/lib/admin/data';

/**
 * Read-only view of the scrapers. Triggering a run is POST /api/admin/scrape,
 * which owns the child process and writes the scraper_runs row.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return Response.json(await readScraper(supabase), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return apiError(error);
  }
}

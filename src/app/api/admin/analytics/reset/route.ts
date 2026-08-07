import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createClient } from '@supabase/supabase-js';
import { recordAudit } from '@/lib/admin/data';

export const runtime = 'nodejs';

export async function POST() {
  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: 'Server not configured for analytics reset.' },
      { status: 503 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Delete all analytics events
  const { error, count } = await supabase
    .from('analytics_events')
    .delete({ count: 'exact' })
    .gt('id', 0); // match all rows (id is bigint)

  if (error) {
    console.error('Analytics reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset analytics.' },
      { status: 500 }
    );
  }

  const audit = await recordAudit(admin.supabase, {
    actorId: admin.user.id,
    actorEmail: admin.email,
    action: 'analytics.reset',
    subject: 'analytics_events',
    detail: { deleted: count ?? 0 },
  });
  if (audit.error) {
    console.error(`[admin-action:${audit.correlationId}] Analytics were reset without an audit row.`);
  }

  return NextResponse.json({ 
    success: true, 
    deleted: count ?? 0,
    message: `Deleted ${count ?? 0} analytics events.`
  });
}

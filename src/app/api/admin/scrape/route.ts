import { spawn } from 'node:child_process';
import path from 'node:path';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { ApiError, apiError } from '@/lib/api';
import { requireAdmin } from '@/lib/admin/auth';
import { RUNS_TABLE, recordAudit } from '@/lib/admin/data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Kicks the scraper off and answers straight away.
 *
 * The previous version awaited the whole scrape inside the request, so a run
 * that took longer than the proxy timeout looked like a failure even when it
 * had worked, and the admin got no progress at all until it was over. Now the
 * run is a row in scraper_runs from the first second: the console polls that
 * row and watches the log grow.
 *
 * A reference to the child is held in module scope so it is not collected
 * while the request that started it is long gone.
 */
const RUN_TIMEOUT_MS = 10 * 60_000;
const LOG_LIMIT = 20_000;
const children = new Set<ReturnType<typeof spawn>>();

export async function POST() {
  try {
    const { supabase, user, email } = await requireAdmin();

    const { data: active, error: activeError } = await supabase
      .from(RUNS_TABLE)
      .select('id,started_at')
      .eq('status', 'running')
      .limit(1);
    if (activeError) {
      throw new ApiError(503, `Run history is unavailable: ${activeError.message}`);
    }
    // A row left behind by a crashed process should not block the button
    // forever, so anything older than the timeout is closed out first.
    const stale = active?.[0] && Date.now() - Date.parse(active[0].started_at) > RUN_TIMEOUT_MS;
    if (active?.length && !stale) {
      throw new ApiError(409, 'A scrape is already running.');
    }
    if (stale && active?.[0]) {
      await supabase
        .from(RUNS_TABLE)
        .update({ status: 'error', message: 'Abandoned: no result before the timeout.', finished_at: new Date().toISOString() })
        .eq('id', active[0].id);
    }

    const startedAt = new Date().toISOString();
    const { data: run, error: insertError } = await supabase
      .from(RUNS_TABLE)
      .insert({ source: 'all', status: 'running', job_count: 0, message: 'Starting…', started_at: startedAt })
      .select('id')
      .single();
    if (insertError || !run) throw new ApiError(503, insertError?.message ?? 'Could not open a run.');

    // The background writer cannot read request cookies once this handler has
    // returned, so it carries the admin's own access token instead. It expires
    // in about an hour, comfortably longer than a run.
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token ?? null;

    const runId = String(run.id);
    void execute(runId, startedAt, token);
    const audit = await recordAudit(supabase, { actorId: user.id, actorEmail: email, action: 'scraper.run', subject: runId });
    if (audit.error) {
      console.error(`[admin-action:${audit.correlationId}] Scraper run started without an audit row.`);
    }

    return Response.json({ runId, startedAt }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return apiError(error);
  }
}

async function execute(runId: string, startedAt: string, token: string | null) {
  const script = path.join(process.cwd(), 'scripts', 'scrape-jobs.mjs');
  const child = spawn(process.execPath, [script], { cwd: process.cwd(), env: process.env });
  children.add(child);

  let log = '';
  const append = (chunk: Buffer) => {
    log = `${log}${chunk.toString()}`.slice(-LOG_LIMIT);
  };
  child.stdout?.on('data', append);
  child.stderr?.on('data', append);

  const timer = setTimeout(() => child.kill('SIGKILL'), RUN_TIMEOUT_MS);

  // Progress is written back periodically so the console shows a live log
  // rather than a spinner that reveals everything only at the end.
  const heartbeat = setInterval(() => {
    void patch(token, runId, { message: log.trim() || 'Running…' });
  }, 5_000);

  const code: number | null = await new Promise((resolve) => {
    child.once('error', () => resolve(-1));
    child.once('close', resolve);
  });

  clearTimeout(timer);
  clearInterval(heartbeat);
  children.delete(child);

  const clean = log.trim();
  const indexed = Number(clean.match(/Finished\. (\d+) jobs indexed\./)?.[1] ?? 0);
  await patch(token, runId, {
    status: code === 0 ? 'success' : 'error',
    job_count: code === 0 ? indexed : 0,
    message: clean || (code === 0 ? 'Finished with no output.' : `Exited with code ${code}.`),
    finished_at: new Date().toISOString(),
    started_at: startedAt,
  });
}

/**
 * Bookkeeping writes for a run that outlives its request. RLS still applies:
 * the token belongs to the admin who pressed the button, and the "Admins
 * manage scraper runs" policy is what lets it through.
 */
async function patch(token: string | null, runId: string, values: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return;
  try {
    const supabase = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    await supabase.from(RUNS_TABLE).update(values).eq('id', runId);
  } catch {
    /* the run still finishes; only its bookkeeping is lost */
  }
}

import { createClient } from '@supabase/supabase-js';
import { ApiError } from '@/lib/api';

type RateLimitResult = {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
};

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Durable rate limit backed by Postgres (`consume_rate_limit` RPC).
 *
 * Survives serverless cold starts. If the table/RPC is not migrated yet,
 * fails open with a console warning so deploys are not bricked mid-rollout.
 */
export async function enforceRateLimit(input: {
  bucket: string;
  subject: string;
  limit: number;
  windowSeconds: number;
  message?: string;
}): Promise<RateLimitResult> {
  const supabase = serviceClient();
  if (!supabase) {
    console.warn('rate-limit: service role unavailable; skipping durable check');
    return { allowed: true, count: 0, limit: input.limit, remaining: input.limit };
  }

  const { data, error } = await supabase.rpc('consume_rate_limit', {
    p_bucket: input.bucket,
    p_subject: input.subject,
    p_limit: input.limit,
    p_window_seconds: input.windowSeconds,
  });

  if (error) {
    console.warn('rate-limit: RPC failed; failing open', error.message);
    return { allowed: true, count: 0, limit: input.limit, remaining: input.limit };
  }

  const row = (Array.isArray(data) ? data[0] : data) as Partial<RateLimitResult> | null;
  const result: RateLimitResult = {
    allowed: Boolean(row?.allowed),
    count: Number(row?.count ?? 0),
    limit: Number(row?.limit ?? input.limit),
    remaining: Number(row?.remaining ?? 0),
  };

  if (!result.allowed) {
    throw new ApiError(429, input.message ?? 'Too many requests. Try again in a minute.');
  }

  return result;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

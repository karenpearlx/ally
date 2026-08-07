import { ApiError, apiError, paginationFrom, paginationMeta, readJson, requireActiveUser, requireUser, stringField, urlField } from '@/lib/api';

const STATUSES = ['saved', 'applied', 'follow_up', 'interviewing', 'offer', 'accepted', 'rejected', 'withdrawn'] as const;

function parseStatus(value: unknown, fallback: string | null = null) {
  if (value == null && fallback) return fallback;
  if (typeof value !== 'string' || !STATUSES.includes(value as typeof STATUSES[number])) {
    throw new ApiError(400, `status must be one of: ${STATUSES.join(', ')}.`);
  }
  return value;
}

function parseLinks(value: unknown) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 20) throw new ApiError(400, 'links must be an array with at most 20 items.');
  return value.map((item) => urlField(item, 'link', true));
}

function parseFollowUpDate(value: unknown) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, 'follow_up_date must use YYYY-MM-DD.');
  }
  return value;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const url = new URL(request.url);
    const needsFollowUp = url.searchParams.get('needs_follow_up') === 'true';
    const status = url.searchParams.get('status');
    const { limit, offset } = paginationFrom(request);

    let query = supabase
      .from('applications')
      .select('id,job_url,job_title,company,status,notes,follow_up_date,created_at,updated_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (needsFollowUp) {
      query = query
        .in('status', ['applied', 'follow_up'])
        .not('follow_up_date', 'is', null)
        .lte('follow_up_date', new Date().toISOString().slice(0, 10));
    } else if (status) {
      query = query.eq('status', parseStatus(status));
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;
    const applications = data ?? [];
    return Response.json({
      applications,
      pagination: paginationMeta(count, limit, offset, applications.length),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireActiveUser();
    const body = await readJson(request);
    const status = parseStatus(body.status, 'applied');

    if (status === 'saved') {
      const [{ data: account }, { count, error: countError }] = await Promise.all([
        supabase.from('users').select('subscription_tier,subscription_status,subscription_ends_at').eq('id', user.id).maybeSingle(),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'saved'),
      ]);
      if (countError) throw countError;
      const paid = ['pro', 'creator'].includes(account?.subscription_tier)
        && account?.subscription_status === 'active'
        && (!account?.subscription_ends_at || new Date(account.subscription_ends_at).getTime() > Date.now());
      if (!paid && (count ?? 0) >= 20) throw new ApiError(403, 'Free plans can save up to 20 jobs. Upgrade to Pro for unlimited saved jobs.');
    }

    const { data: settings } = await supabase
      .from('users')
      .select('follow_up_days')
      .eq('id', user.id)
      .maybeSingle();
    const followUpDays = settings?.follow_up_days ?? 5;
    const explicitFollowUp = parseFollowUpDate(body.follow_up_date);

    const record = {
      user_id: user.id,
      job_url: urlField(body.job_url, 'job_url', true),
      job_title: stringField(body.job_title, 'job_title', { max: 300 }),
      company: stringField(body.company, 'company', { max: 300 }),
      status,
      notes: stringField(body.notes, 'notes', { max: 20_000 }),
      links: parseLinks(body.links),
      follow_up_date: explicitFollowUp ?? (status === 'applied' ? addDays(new Date(), followUpDays) : null),
    };

    const { data, error } = await supabase.from('applications').insert(record).select().single();
    if (error) throw error;
    return Response.json({ application: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

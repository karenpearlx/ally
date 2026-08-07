/**
 * Upwork adapter for the Ally job scraper.
 *
 * IMPORTANT CONTEXT (checked 2026-08-03):
 * Upwork permanently discontinued public RSS job feeds on 2024-08-20
 * (https://support.upwork.com/hc/en-us/articles/52052528243731-RSS-deprecation).
 * The old https://www.upwork.com/ab/feed/jobs/rss endpoint now returns HTTP 410.
 *
 * The ONLY sanctioned way to read marketplace job postings is the Upwork
 * GraphQL API, which needs:
 *   1. An API key from https://www.upwork.com/developer/keys
 *   2. An OAuth2 access token (client_credentials or authorization_code)
 *
 * Scraping the search page instead would be fragile and breaks Upwork's ToS,
 * so this adapter deliberately no-ops (returns []) when no token is present.
 * Set UPWORK_ACCESS_TOKEN (and optionally UPWORK_QUERY) to turn it on.
 */

const GRAPHQL_ENDPOINT = 'https://api.upwork.com/graphql';

const SEARCH_QUERY = `
  query marketplaceJobPostingsSearch(
    $marketPlaceJobFilter: MarketplaceJobPostingsSearchFilter
    $searchType: MarketplaceJobPostingSearchType
    $sortAttributes: [MarketplaceJobPostingSearchSortAttribute]
  ) {
    marketplaceJobPostingsSearch(
      marketPlaceJobFilter: $marketPlaceJobFilter
      searchType: $searchType
      sortAttributes: $sortAttributes
    ) {
      totalCount
      edges {
        node {
          id
          title
          description
          ciphertext
          duration
          engagement
          recordNumber
          experienceLevel
          createdDateTime
          publishedDateTime
          category
          skills { name }
          amount { rawValue currency }
          hourlyBudgetMin { rawValue currency }
          hourlyBudgetMax { rawValue currency }
          client { totalHires location { country } }
        }
      }
    }
  }
`;

function mapExperience(level) {
  const v = (level || '').toUpperCase();
  if (v.includes('ENTRY')) return 'entry';
  if (v.includes('EXPERT')) return 'expert';
  return 'mid';
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Turn one GraphQL node into an Ally `jobs` row. */
export function mapUpworkNode(node) {
  const hourlyMin = num(node?.hourlyBudgetMin?.rawValue);
  const hourlyMax = num(node?.hourlyBudgetMax?.rawValue);
  const fixed = num(node?.amount?.rawValue);

  const isHourly = Boolean(hourlyMin || hourlyMax);
  const currency =
    node?.hourlyBudgetMin?.currency || node?.hourlyBudgetMax?.currency || node?.amount?.currency || 'USD';

  const ciphertext = node?.ciphertext || node?.id;

  return {
    source: 'upwork',
    source_id: String(node?.recordNumber ?? node?.id ?? ciphertext),
    title: node?.title || 'Untitled',
    company: node?.client?.location?.country
      ? `Upwork client · ${node.client.location.country}`
      : 'Upwork client',
    description: node?.description ?? null,
    salary_min: isHourly ? hourlyMin ?? hourlyMax : fixed,
    salary_max: isHourly ? hourlyMax ?? hourlyMin : fixed,
    salary_currency: currency,
    salary_type: isHourly ? 'hourly' : 'fixed',
    skills: (node?.skills || []).map((s) => s?.name).filter(Boolean),
    experience_level: mapExperience(node?.experienceLevel),
    location: node?.client?.location?.country || 'Remote',
    is_remote: true,
    original_url: `https://www.upwork.com/jobs/${ciphertext}`,
    posted_at: node?.publishedDateTime || node?.createdDateTime || null,
    scraped_at: new Date().toISOString(),
  };
}

export async function scrapeUpwork({
  token = process.env.UPWORK_ACCESS_TOKEN,
  query = process.env.UPWORK_QUERY || 'virtual assistant',
  limit = 50,
  fetchImpl = fetch,
} = {}) {
  console.log('🔍 Scraping Upwork...');

  if (!token) {
    console.log(
      '⏭️  Upwork skipped — no UPWORK_ACCESS_TOKEN set.\n' +
        '   Upwork retired public RSS feeds on 2024-08-20, so the GraphQL API is the\n' +
        '   only supported source. Create a key at https://www.upwork.com/developer/keys,\n' +
        '   exchange it for an OAuth2 token, then export UPWORK_ACCESS_TOKEN.'
    );
    return [];
  }

  try {
    const res = await fetchImpl(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: {
          marketPlaceJobFilter: {
            searchExpression_eq: query,
            pagination_eq: { first: limit, after: '0' },
          },
          searchType: 'USER_JOBS_SEARCH',
          sortAttributes: [{ field: 'RECENCY' }],
        },
      }),
    });

    if (!res.ok) {
      console.error(`Upwork API returned ${res.status} ${res.statusText}`);
      if (res.status === 401) console.error('   Token looks expired or invalid.');
      return [];
    }

    const payload = await res.json();

    if (payload.errors?.length) {
      console.error('Upwork GraphQL errors:', payload.errors.map((e) => e.message).join('; '));
      return [];
    }

    const edges = payload?.data?.marketplaceJobPostingsSearch?.edges ?? [];
    const jobs = edges.map((e) => mapUpworkNode(e.node)).filter((j) => j.source_id && j.title);

    console.log(`Found ${jobs.length} jobs from Upwork`);
    return jobs;
  } catch (error) {
    console.error('Error scraping Upwork:', error.message);
    return [];
  }
}

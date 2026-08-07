/**
 * Indeed job scraper.
 * Uses Indeed's RSS feed for virtual assistant jobs.
 */

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Indeed RSS feed URLs for different searches
const FEED_URLS = [
  'https://www.indeed.com/rss?q=virtual+assistant&l=Remote&sort=date',
  'https://www.indeed.com/rss?q=executive+assistant+remote&sort=date',
  'https://www.indeed.com/rss?q=operations+assistant+remote&sort=date',
];

/**
 * Parse Indeed RSS feed XML into job objects.
 */
function parseIndeedRSS(xml) {
  const jobs = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractTag(itemXml, 'description');
    const source = extractTag(itemXml, 'source');

    if (!title || !link) continue;

    // Extract job key from URL for deduplication
    const jobKeyMatch = link.match(/jk=([a-f0-9]+)/i) || link.match(/\/([a-f0-9]{16})\?/i);
    const jobKey = jobKeyMatch ? jobKeyMatch[1] : link;

    // Clean up description - remove HTML tags
    const cleanDescription = description
      ? description
          .replace(/<[^>]*>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
      : null;

    // Extract company from source or description
    const company = source || extractCompanyFromDescription(cleanDescription);

    jobs.push({
      source: 'indeed',
      source_id: jobKey,
      title: decodeHtmlEntities(title),
      company: company ? decodeHtmlEntities(company) : null,
      description: cleanDescription,
      salary_min: null,
      salary_max: null,
      salary_currency: 'USD',
      salary_type: null,
      skills: extractSkills(cleanDescription),
      experience_level: 'mid',
      job_type: null,
      location: 'Remote',
      is_remote: true,
      original_url: link,
      posted_at: pubDate ? new Date(pubDate).toISOString() : null,
      scraped_at: new Date().toISOString(),
    });
  }

  return jobs;
}

function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>|<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : null;
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractCompanyFromDescription(description) {
  if (!description) return null;
  // Often the company name appears at the start
  const match = description.match(/^([A-Z][A-Za-z0-9\s&.,'-]+?)(?:\s+is\s+|\s+-\s+|\s+seeks|\s+looking)/);
  return match ? match[1].trim() : null;
}

function extractSkills(description) {
  if (!description) return [];
  const skillKeywords = [
    'virtual assistant', 'administrative', 'data entry', 'customer service',
    'email management', 'calendar management', 'scheduling', 'bookkeeping',
    'social media', 'content creation', 'project management', 'research',
    'excel', 'google sheets', 'quickbooks', 'hubspot', 'salesforce',
    'wordpress', 'canva', 'asana', 'trello', 'slack', 'zoom',
  ];
  const lowerDesc = description.toLowerCase();
  return skillKeywords.filter(skill => lowerDesc.includes(skill));
}

/**
 * Scrape Indeed jobs from RSS feeds.
 */
export async function scrapeIndeed() {
  console.log('🔍 Scraping Indeed...');
  const allJobs = [];
  const seenIds = new Set();

  for (const feedUrl of FEED_URLS) {
    try {
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        console.warn(`Indeed feed returned ${response.status} for ${feedUrl}`);
        continue;
      }

      const xml = await response.text();
      const jobs = parseIndeedRSS(xml);

      for (const job of jobs) {
        if (!seenIds.has(job.source_id)) {
          seenIds.add(job.source_id);
          allJobs.push(job);
        }
      }

      // Rate limit between feeds
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.warn(`Indeed feed error for ${feedUrl}: ${error.message}`);
    }
  }

  console.log(`Found ${allJobs.length} Indeed listings`);
  return allJobs;
}

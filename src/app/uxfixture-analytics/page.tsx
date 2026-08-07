// TEMPORARY visual fixture — delete after screenshots.
import AnalyticsView from '@/components/analytics/AnalyticsView';
import { buildInsights, type InsightRow } from '@/lib/insights';

const DAY = 86_400_000;
const URLS = [
  'https://www.onlinejobs.ph/jobseekers/job/Operations-Lead-166123',
  'https://remoteok.com/remote-jobs/1234-seo-manager',
  'https://www.upwork.com/jobs/~0123',
  'https://careers.acme.io/roles/ops',
];
const TITLES = [
  'Executive Assistant to Founder',
  'Operations Manager (Remote)',
  'SEO Strategist',
  'Content Marketing Manager',
  'Customer Success Manager',
  'Project Manager, Marketing Agency',
  'Social Media Manager',
  'Bookkeeping Assistant',
];
const STATUSES = [
  'saved',
  'applied',
  'applied',
  'applied',
  'follow_up',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
];

function rows(): InsightRow[] {
  const now = Date.now();
  return Array.from({ length: 63 }, (_, i) => {
    const created = now - ((i * 97) % 84) * DAY - (i % 5) * DAY;
    const status = STATUSES[i % STATUSES.length];
    const gap = (2 + (i % 11)) * DAY;
    return {
      job_url: URLS[i % URLS.length],
      job_title: TITLES[i % TITLES.length],
      status,
      created_at: new Date(created).toISOString(),
      updated_at: new Date(created + gap).toISOString(),
    };
  });
}

export default function Fixture() {
  return <AnalyticsView data={buildInsights(rows())} ready />;
}

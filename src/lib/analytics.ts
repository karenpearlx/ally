'use client';

export type AnalyticsEventType = 'page_view' | 'click' | 'search' | 'filter' | 'scroll' | 'job_view';
type Details = Record<string, string | number | boolean | null | undefined>;
const SESSION_KEY = 'ally-analytics-session-v2';
const VISITOR_KEY = 'ally-analytics-visitor-v1';
function sessionId() { let id = sessionStorage.getItem(SESSION_KEY); if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id); } return id; }
/**
 * A session ends when the tab closes; a visitor comes back tomorrow. These
 * were the same value, so "unique visitors" and "sessions" were mathematically
 * incapable of differing and the admin console was reporting one number twice.
 * The visitor id lives in localStorage, is never sent anywhere but /api/analytics,
 * and is hashed server-side before it touches the database.
 */
function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, id); }
    return id;
  } catch {
    // Private mode with storage blocked. Fall back to the session id rather
    // than dropping the event entirely.
    return sessionId();
  }
}
export function track(eventType: AnalyticsEventType, details: Details = {}) {
  if (typeof window === 'undefined' || window.location.pathname.startsWith('/admin')) return;
  if (navigator.doNotTrack === '1' || localStorage.getItem('ally-analytics-excluded') === '1') return;
  const sid = sessionId();
  const payload = {
    event_type: eventType, path: window.location.pathname, referrer: document.referrer || null,
    session_id: sid, visitor_id: visitorId(),
    target: details.href ?? details.target ?? null, label: details.label ?? null, query: details.query ?? null,
    filter_key: details.filter ?? details.filterKey ?? null, filter_value: details.value ?? details.filterValue ?? null,
    job_id: details.jobId ?? null, scroll_depth: details.percent ?? details.scrollDepth ?? null,
    metadata: details.element ? { element: details.element } : {},
  };
  void fetch('/api/analytics', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), keepalive: true });
}

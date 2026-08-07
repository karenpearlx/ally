'use client';

export type AnalyticsEventType = 'page_view' | 'click' | 'search' | 'filter' | 'scroll_depth';

const SESSION_KEY = 'ally_analytics_session';

function sessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function track(eventType: AnalyticsEventType, metadata: Record<string, string | number | boolean | null> = {}) {
  if (typeof window === 'undefined' || window.location.pathname.startsWith('/admin')) return;
  const payload = JSON.stringify({
    eventType,
    path: window.location.pathname,
    referrer: document.referrer,
    sessionId: sessionId(),
    metadata,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }));
    return;
  }

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
    keepalive: true,
  });
}

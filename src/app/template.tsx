'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

export default function Template({ children }: { children: React.ReactNode }) {
  const depths = useRef(new Set<number>());

  useEffect(() => {
    track('page_view');

    const click = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest('a,button');
      if (!target) return;
      const label = (target.getAttribute('aria-label') || target.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100);
      track('click', { element: target.tagName.toLowerCase(), label, href: target instanceof HTMLAnchorElement ? target.pathname : null });
    };

    const scroll = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (available <= 0) return;
      const percent = Math.min(100, Math.round((window.scrollY / available) * 100));
      for (const mark of [25, 50, 75, 100]) {
        if (percent >= mark && !depths.current.has(mark)) {
          depths.current.add(mark);
          track('scroll_depth', { percent: mark });
        }
      }
    };

    const change = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === 'search') {
        const query = target.value.trim().slice(0, 120);
        if (query) track('search', { query });
      }
      if (target instanceof HTMLSelectElement) {
        const context = `${target.name} ${target.id} ${target.getAttribute('aria-label') || ''}`.toLowerCase();
        if (/filter|source|category|skill|level|type/.test(context)) track('filter', { filter: context.slice(0, 80), value: target.value.slice(0, 120) });
      }
    };

    document.addEventListener('click', click, { capture: true });
    document.addEventListener('change', change, { capture: true });
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      document.removeEventListener('click', click, { capture: true });
      document.removeEventListener('change', change, { capture: true });
      window.removeEventListener('scroll', scroll);
    };
  }, []);

  return children;
}

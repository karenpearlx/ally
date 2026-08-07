'use client';

import Link from 'next/link';
import { useCallback, useSyncExternalStore } from 'react';
import AnalyticsSection from './AnalyticsSection';
import ContentSection from './ContentSection';
import ScraperSection from './ScraperSection';
import SettingsSection from './SettingsSection';
import UsersSection from './UsersSection';

const SECTIONS = [
  { id: 'analytics', index: '01', label: 'Analytics' },
  { id: 'scraper', index: '02', label: 'Scraper' },
  { id: 'people', index: '03', label: 'People' },
  { id: 'content', index: '04', label: 'Content' },
  { id: 'settings', index: '05', label: 'Settings' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const isSection = (value: string): value is SectionId =>
  SECTIONS.some((section) => section.id === value);

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function readHash(): SectionId {
  const value = window.location.hash.replace('#', '');
  return isSection(value) ? value : 'analytics';
}

export default function AdminDashboard({
  email,
  lastSignInAt,
}: {
  email: string;
  lastSignInAt: string | null;
}) {
  // The URL hash is the source of truth for the open section, so a reload or a
  // shared link lands in the same place and the back button works.
  const active = useSyncExternalStore(subscribeToHash, readHash, () => 'analytics' as SectionId);

  const go = useCallback((id: SectionId) => {
    window.location.hash = id;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="ad">
      <div className="ad-shell">
        {/* desktop rail */}
        <aside className="ad-railwrap">
          <div>
            <Link href="/" className="font-display text-lg font-extrabold tracking-[-0.02em]">
              Versified<span className="dot">.</span>
            </Link>
            <p className="ad-micro mt-1">Admin console</p>
          </div>

          <nav className="flex flex-col gap-0.5" aria-label="Admin sections">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className="ad-railitem"
                aria-current={active === section.id}
                onClick={() => go(section.id)}
              >
                <span className="ad-railidx">{section.index}</span>
                {section.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-2 border-t pt-4" style={{ borderColor: 'var(--color-line)' }}>
            <p className="truncate text-xs" style={{ color: 'var(--color-muted)' }} title={email}>
              {email}
            </p>
            <Link
              href="/"
              className="inline-flex text-xs font-semibold underline underline-offset-4"
              style={{ color: 'var(--color-accent)' }}
            >
              Back to the site
            </Link>
          </div>
        </aside>

        {/* mobile strip */}
        <div className="ad-strip lg:hidden" role="tablist" aria-label="Admin sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={active === section.id}
              className="ad-btn flex-none"
              data-variant={active === section.id ? 'primary' : undefined}
              onClick={() => go(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <main className="min-w-0 px-5 py-7 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-6xl">
            {active === 'analytics' ? <AnalyticsSection /> : null}
            {active === 'scraper' ? <ScraperSection /> : null}
            {active === 'people' ? <UsersSection /> : null}
            {active === 'content' ? <ContentSection /> : null}
            {active === 'settings' ? <SettingsSection email={email} lastSignInAt={lastSignInAt} /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

/**
 * Pull-to-refresh for a server-rendered route.
 *
 * `router.refresh()` is fire-and-forget, so on its own the spinner would stop
 * before the new HTML arrived. Wrapping it in a transition gives us `isPending`,
 * which stays true until the server render is committed — that is what we hand
 * back to <PullToRefresh> as the promise to wait on.
 */

import { useCallback, useEffect, useRef, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import PullToRefresh from './PullToRefresh';

export default function PullToRefreshRoute({
  children,
  className,
  topOffset,
}: {
  children: ReactNode;
  className?: string;
  topOffset?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const waiting = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!pending && waiting.current) {
      waiting.current();
      waiting.current = null;
    }
  }, [pending]);

  // Never leave a promise hanging if the route unmounts mid-refresh.
  useEffect(
    () => () => {
      waiting.current?.();
      waiting.current = null;
    },
    [],
  );

  const refresh = useCallback(
    () =>
      new Promise<void>((resolve) => {
        waiting.current = resolve;
        startTransition(() => {
          router.refresh();
        });
      }),
    [router],
  );

  return (
    <PullToRefresh onRefresh={refresh} className={className} topOffset={topOffset}>
      {children}
    </PullToRefresh>
  );
}

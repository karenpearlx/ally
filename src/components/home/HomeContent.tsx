'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback } from 'react';
import PullToRefresh from '@/components/PullToRefresh';

export default function HomeContent({ children }: { children: ReactNode }) {
  const router = useRouter();

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <PullToRefresh onRefresh={refresh}>
      {children}
    </PullToRefresh>
  );
}

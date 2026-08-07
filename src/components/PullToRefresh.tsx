'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Pull-to-refresh for PWA/standalone mode.
 * Only activates when scrolled to top and in standalone display mode.
 */
export default function PullToRefresh() {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const isPWA = useRef(false);

  const threshold = 80; // pixels to pull before refresh triggers

  useEffect(() => {
    // Check if running as installed PWA
    isPWA.current =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (!isPWA.current) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate when at top of page
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        setPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling || refreshing) return;
      if (window.scrollY > 0) {
        setPulling(false);
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        // Apply resistance - the further you pull, the harder it gets
        const resistance = Math.min(diff * 0.4, threshold * 1.5);
        setPullDistance(resistance);

        // Prevent default scroll when pulling down
        if (diff > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true);
        setPullDistance(threshold);

        // Trigger refresh
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        setPullDistance(0);
      }
      setPulling(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, pullDistance, refreshing]);

  // Don't render anything if not pulling
  if (pullDistance <= 0) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center pointer-events-none"
      style={{
        height: pullDistance,
        transition: pulling ? 'none' : 'height 0.2s ease-out',
      }}
    >
      <div
        className="rounded-full bg-white shadow-lg p-2"
        style={{
          opacity: progress,
          transform: `rotate(${rotation}deg) scale(${0.5 + progress * 0.5})`,
          transition: pulling ? 'none' : 'all 0.2s ease-out',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--color-accent)' }}
        >
          {refreshing ? (
            // Spinning loader
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          ) : (
            // Arrow down
            <>
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

'use client';

/**
 * Pull-to-refresh, touch only.
 *
 * Wraps the *content* of a page — never the <Nav />. Nav is `position: fixed`,
 * and a fixed element inside a transformed ancestor stops being viewport-fixed,
 * so pulling would drag the header down with the page. Mount it below the nav:
 *
 *   <Nav />
 *   <PullToRefresh onRefresh={reload}>…sections…</PullToRefresh>
 *
 * The gesture is only wired up on coarse pointers. On a mouse the component is
 * a plain passthrough <div> and costs one wrapper element.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** How far you have to drag (after resistance) before letting go refreshes. */
const THRESHOLD = 60;
/** Hard ceiling on the drag, so a long swipe cannot push the page off screen. */
const MAX = 120;
/** Where the sheet parks itself while the refresh is in flight. */
const REST = 52;
/** Ignore the first few pixels so a normal flick-scroll never arms the gesture. */
const SLOP = 4;
/** How long the tick stays up after a successful refresh. */
const DONE_MS = 620;

type Phase = 'idle' | 'pulling' | 'armed' | 'refreshing' | 'done';

/**
 * Rubber band. Linear near zero so the coin tracks your thumb, asymptotic at
 * MAX so the end of the pull goes heavy instead of stopping dead.
 * Using a gentler curve for smoother feel.
 */
function resist(dy: number): number {
  // Gentler resistance - feels more responsive
  return MAX * (1 - Math.exp(-dy / (MAX * 1.3)));
}

/** Anything that scrolls, edits text, or sits behind a modal is not ours to grab. */
function blocked(target: EventTarget | null): boolean {
  let node = target instanceof Element ? target : null;
  while (node) {
    if (node.closest?.('[data-ptr-ignore]')) return true;
    const tag = node.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'DIALOG') return true;
    if (node instanceof HTMLElement && node.isContentEditable) return true;
    // A pulled-down inner scroller (a dropdown, a code block) should scroll,
    // not refresh the page underneath it.
    if (node.scrollTop > 0) {
      const oy = getComputedStyle(node).overflowY;
      if (oy === 'auto' || oy === 'scroll') return true;
    }
    node = node.parentElement;
  }
  return false;
}

export default function PullToRefresh({
  onRefresh,
  children,
  className,
  /** Distance from the top of the viewport to the indicator, under the header. */
  topOffset = 76,
  disabled = false,
}: {
  onRefresh: () => void | Promise<unknown>;
  children: ReactNode;
  className?: string;
  topOffset?: number;
  disabled?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const coin = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);

  const [touch, setTouch] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [reduced, setReduced] = useState(false);

  // Gesture bookkeeping. Refs, not state: these change every touchmove and must
  // not cost a render.
  const startY = useRef(0);
  const startX = useRef(0);
  const active = useRef(false); // a finger is down and eligible
  const engaged = useRef(false); // …and has committed to a vertical pull
  const dist = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const frame = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  useLayoutEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  /** Only place that touches the DOM during a drag. Called inside rAF. */
  const paint = useCallback(
    (d: number, animate: boolean) => {
      const w = wrap.current;
      const c = coin.current;
      if (!w || !c) return;

      // Faster, snappier easing
      const ease = animate ? 'transform .28s cubic-bezier(.25,.46,.45,.94)' : 'none';
      w.style.transition = ease;
      w.style.transform = d > 0 ? `translate3d(0,${d}px,0)` : '';

      const p = Math.min(1, d / THRESHOLD);
      c.style.transition = animate
        ? 'transform .28s cubic-bezier(.25,.46,.45,.94), opacity .15s linear'
        : 'none';
      c.style.opacity = String(Math.min(1, d / 20));
      // Rises and grows into place; a touch of spin on the way down so the
      // gesture feels mechanical rather than like a fading tooltip.
      const spin = reduced ? 0 : p * 120;
      c.style.transform = `translate3d(-50%,${Math.min(d, MAX) * 0.48 - 8}px,0) scale(${0.75 + p * 0.25}) rotate(${spin}deg)`;

      const r = ring.current;
      if (r) r.style.strokeDashoffset = String(58 * (1 - Math.min(1, p * 0.97)));
    },
    [reduced],
  );

  const schedule = useCallback(
    (d: number) => {
      dist.current = d;
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        paint(dist.current, false);
      });
    },
    [paint],
  );

  /** Animate back to zero and reset every flag. */
  const settle = useCallback(() => {
    dist.current = 0;
    paint(0, true);
    setPhaseBoth('idle');
  }, [paint, setPhaseBoth]);

  const run = useCallback(async () => {
    setPhaseBoth('refreshing');
    dist.current = REST;
    paint(REST, true);
    const started = Date.now();
    try {
      await onRefreshRef.current();
    } catch {
      /* the page owns its own error UI; the sheet still has to close */
    }
    // A refresh that resolves in 40ms reads as a broken gesture. Hold the
    // spinner long enough that the pull looks like it did something.
    const wait = Math.max(0, 380 - (Date.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    if (phaseRef.current !== 'refreshing') return; // unmounted or restarted
    setPhaseBoth('done');
    setTimeout(() => {
      if (phaseRef.current === 'done') settle();
    }, DONE_MS);
  }, [paint, setPhaseBoth, settle]);

  // Coarse pointer + reduced motion. Read after mount so SSR and the first
  // client paint agree.
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setTouch(coarse.matches);
      setReduced(rm.matches);
    };
    sync();
    coarse.addEventListener('change', sync);
    rm.addEventListener('change', sync);
    return () => {
      coarse.removeEventListener('change', sync);
      rm.removeEventListener('change', sync);
    };
  }, []);

  const on = touch && !disabled;

  // Chrome's own overscroll refresh would fire underneath ours. Suppress it for
  // as long as this page is mounted, and hand it back on the way out.
  useEffect(() => {
    if (!on) return;
    const el = document.documentElement;
    const prev = el.style.overscrollBehaviorY;
    el.style.overscrollBehaviorY = 'contain';
    return () => {
      el.style.overscrollBehaviorY = prev;
    };
  }, [on]);

  useEffect(() => {
    if (!on) return;

    const start = (e: TouchEvent) => {
      if (phaseRef.current === 'refreshing' || phaseRef.current === 'done') return;
      if (e.touches.length !== 1) return;
      // Already scrolled down, or a sheet/modal has locked the body.
      if (window.scrollY > 0 || document.body.style.overflow === 'hidden') return;
      if (blocked(e.target)) return;
      const t = e.touches[0];
      startY.current = t.clientY;
      startX.current = t.clientX;
      active.current = true;
      engaged.current = false;
    };

    const move = (e: TouchEvent) => {
      if (!active.current) return;
      if (e.touches.length !== 1) {
        active.current = false;
        if (engaged.current) settle();
        engaged.current = false;
        return;
      }
      const t = e.touches[0];
      const dy = t.clientY - startY.current;
      const dx = t.clientX - startX.current;

      if (!engaged.current) {
        // Upward, sideways, or still inside the slop: leave the browser alone.
        if (dy < SLOP) {
          if (dy < -2 || Math.abs(dx) > Math.abs(dy)) active.current = false;
          return;
        }
        if (Math.abs(dx) > Math.abs(dy)) {
          active.current = false;
          return;
        }
        // The page may have scrolled between touchstart and now.
        if (window.scrollY > 0) {
          active.current = false;
          return;
        }
        engaged.current = true;
        setPhaseBoth('pulling');
      }

      // Owned. Stop the document from scrolling under the gesture.
      if (e.cancelable) e.preventDefault();

      const d = resist(Math.max(0, dy - SLOP));
      schedule(d);

      const armed = d >= THRESHOLD;
      if (armed && phaseRef.current === 'pulling') {
        setPhaseBoth('armed');
        navigator.vibrate?.(8);
      } else if (!armed && phaseRef.current === 'armed') {
        setPhaseBoth('pulling');
      }
    };

    const end = () => {
      if (!active.current) return;
      active.current = false;
      if (!engaged.current) return;
      engaged.current = false;
      if (dist.current >= THRESHOLD) void run();
      else settle();
    };

    // passive:false on move only — that is the one that calls preventDefault.
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end, { passive: true });
    window.addEventListener('touchcancel', end, { passive: true });
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [on, run, schedule, setPhaseBoth, settle]);

  // Leaving mid-refresh must not leave the page shoved 58px down.
  useEffect(
    () => () => {
      phaseRef.current = 'idle';
    },
    [],
  );

  if (!on) {
    return <div className={className}>{children}</div>;
  }

  const busy = phase === 'refreshing';
  const done = phase === 'done';

  return (
    <>
      <div
        ref={coin}
        aria-hidden
        className="pointer-events-none fixed left-1/2 z-40 grid h-11 w-11 place-items-center rounded-full"
        style={{
          top: `calc(${topOffset}px + env(safe-area-inset-top, 0px))`,
          transform: 'translate3d(-50%,-10px,0) scale(.7)',
          opacity: 0,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-line)',
          boxShadow: 'var(--shadow-tile)',
          willChange: 'transform, opacity',
        }}
      >
        {done ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4 9.4 7.4 12.8 14 5.6"
              stroke="var(--color-accent-deep)"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : busy ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 22 22"
            fill="none"
            style={reduced ? undefined : { animation: 'ally-spin .78s linear infinite' }}
          >
            <circle cx="11" cy="11" r="8" stroke="var(--color-line-2)" strokeWidth="2.2" />
            <path
              d="M19 11a8 8 0 0 0-8-8"
              stroke="var(--color-accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          // Draws itself as you pull; a full ring means "let go now".
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="8" stroke="var(--color-line-2)" strokeWidth="2.2" />
            <circle
              ref={ring}
              cx="11"
              cy="11"
              r="8"
              stroke={phase === 'armed' ? 'var(--color-accent)' : 'var(--color-faint)'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="58"
              strokeDashoffset="58"
              transform="rotate(-90 11 11)"
              style={{ transition: 'stroke .15s linear' }}
            />
          </svg>
        )}
      </div>

      {/* Screen readers get words, not a spinning circle. */}
      <p className="sr-only" role="status" aria-live="polite">
        {busy ? 'Refreshing' : done ? 'Updated' : ''}
      </p>

      <div ref={wrap} className={className}>
        {children}
      </div>
    </>
  );
}

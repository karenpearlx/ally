'use client';

import { useEffect, useState } from 'react';

/**
 * Registers the service worker and offers an install prompt.
 *
 * Deliberately does NOT register in development: Next's dev server streams
 * HMR chunks, and a service worker sitting in front of that will happily serve
 * stale JavaScript and make you debug a page that no longer exists.
 */

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'ally-install-dismissed';
const DISMISS_DAYS = 14;

export default function PWA() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [show, setShow] = useState(false);
  const [updateReady, setUpdateReady] = useState<ServiceWorkerRegistration | null>(null);

  // --- register
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    let reg: ServiceWorkerRegistration | undefined;
    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((r) => {
          reg = r;
          // A new worker is downloading; tell the user once it's parked.
          r.addEventListener('updatefound', () => {
            const sw = r.installing;
            if (!sw) return;
            sw.addEventListener('statechange', () => {
              if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateReady(r);
              }
            });
          });
        })
        .catch(() => {
          /* a failed SW must never break the page */
        });
    };

    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);

    // Reload once a NEW worker takes control, so the user isn't left running
    // half-old code. Guarded on there already being a controller: on a first
    // visit `clients.claim()` also fires controllerchange, and reloading there
    // would bounce the page for every first-time visitor.
    const hadController = navigator.serviceWorker.controller !== null;
    let reloading = false;
    const onControllerChange = () => {
      if (!hadController || reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      window.removeEventListener('load', onLoad);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      void reg;
    };
  }, []);

  // --- install prompt
  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Chrome fires this and shows nothing unless we preventDefault and
      // stash it. Without this there is no custom install button at all.
      e.preventDefault();
      setDeferred(e as InstallEvent);

      let snoozed = false;
      try {
        const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
        snoozed = Date.now() < until;
      } catch {
        /* private mode */
      }
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

      if (!snoozed && !standalone) setShow(true);
    };

    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setShow(false);
    setDeferred(null);
  };

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 864e5));
    } catch {
      /* ignore */
    }
  };

  if (updateReady) {
    return (
      <Bar
        text="A new version of Ally is ready."
        actionLabel="Refresh"
        onAction={() => updateReady.waiting?.postMessage('SKIP_WAITING')}
        onClose={() => setUpdateReady(null)}
      />
    );
  }

  if (!show) return null;

  return (
    <Bar
      text="Install Ally on your phone for one-tap access."
      actionLabel="Install"
      onAction={install}
      onClose={dismiss}
    />
  );
}

function Bar({
  text,
  actionLabel,
  onAction,
  onClose,
}: {
  text: string;
  actionLabel: string;
  onAction: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 shadow-lg md:inset-x-auto md:right-6"
      style={{
        background: 'var(--color-ink)',
        color: '#fff',
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
      }}
    >
      <p className="min-w-0 flex-1 text-[0.875rem] leading-snug">{text}</p>
      <button
        type="button"
        onClick={onAction}
        className="flex-none rounded-full px-4 text-[0.8125rem] font-semibold"
        style={{ background: 'var(--color-accent)', color: '#fff', minHeight: 44 }}
      >
        {actionLabel}
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="flex-none rounded-full"
        style={{ color: 'rgba(255,255,255,.6)', minHeight: 44, minWidth: 32 }}
      >
        ✕
      </button>
    </div>
  );
}

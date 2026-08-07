/* Ally service worker.
 *
 * Caching policy, and why:
 *
 *  - Navigations (HTML): NETWORK FIRST, cache as fallback.
 *    Cache-first on HTML is the classic PWA footgun — you ship a change and
 *    users keep seeing last week's page until they clear storage. Fresh when
 *    online, last-known-good when not.
 *
 *  - /_next/static/**: CACHE FIRST, immutable.
 *    These filenames are content-hashed by the build, so a given URL can never
 *    change meaning. Safe to keep forever; new builds simply request new URLs.
 *
 *  - Images/fonts: STALE WHILE REVALIDATE. Instant, quietly refreshed.
 *
 *  - Everything else (API, auth, admin): NOT CACHED, ever.
 *    Caching a logged-in API response risks handing one user another user's
 *    data from disk. Not worth it for an offline nicety.
 *
 * Bump SW_VERSION to roll every cache at once.
 */

const SW_VERSION = 'v1';
const SHELL = `ally-shell-${SW_VERSION}`;
const STATIC = `ally-static-${SW_VERSION}`;
const ASSETS = `ally-assets-${SW_VERSION}`;
const OFFLINE_URL = '/offline';

/** Requests we must never serve from disk. */
const NEVER_CACHE = [/^\/api\//, /^\/auth\//, /^\/admin(\/|$)/];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // Only the offline page is precached. Precaching a route list is a
      // maintenance trap: it goes stale the moment someone adds a page.
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, STATIC, ASSETS]);
      const names = await caches.keys();
      await Promise.all(names.map((n) => (keep.has(n) ? null : caches.delete(n))));

      // Navigation preload lets the network request start before this worker
      // has even booted, which removes the usual SW cold-start penalty.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })()
  );
});

// Let the page tell a waiting worker to take over immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function cacheable(response) {
  return response && response.status === 200 && response.type === 'basic';
}

async function networkFirst(event) {
  const cache = await caches.open(SHELL);
  try {
    const preload = await event.preloadResponse;
    const fresh = preload || (await fetch(event.request));
    if (cacheable(fresh)) cache.put(event.request, fresh.clone());
    return fresh;
  } catch {
    const hit = await cache.match(event.request);
    if (hit) return hit;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const fresh = await fetch(request);
  if (cacheable(fresh)) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (cacheable(res)) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GET is safe to replay from cache.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Leave cross-origin alone; we can't reason about those responses.
  if (url.origin !== self.location.origin) return;

  // Range requests (media seeking) break if answered with a full cached body.
  if (request.headers.has('range')) return;

  if (NEVER_CACHE.some((re) => re.test(url.pathname))) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(event));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  if (['image', 'font', 'style'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, ASSETS));
  }
});

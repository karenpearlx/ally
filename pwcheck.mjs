import { chromium } from 'playwright';
const B = 'http://localhost:3061';
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'allow' });
const p = await c.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
let navs = 0;
p.on('framenavigated', (f) => { if (f === p.mainFrame()) navs++; });

await p.goto(B + '/', { waitUntil: 'load' });
await p.waitForTimeout(3000);
console.log('navs on first visit (1 = no reload loop):', navs);

console.log('SW:', JSON.stringify(await p.evaluate(async () => {
  const r = await navigator.serviceWorker.getRegistration();
  return { registered: !!r, scope: r?.scope, controlling: !!navigator.serviceWorker.controller, state: r?.active?.state };
})));

console.log('MANIFEST:', JSON.stringify(await p.evaluate(async () => {
  const h = document.querySelector('link[rel=manifest]').getAttribute('href');
  const m = await (await fetch(h)).json();
  const icons = await Promise.all(m.icons.map(async (i) => `${i.sizes}/${i.purpose}:${(await fetch(i.src)).status}`));
  return { name: m.name, display: m.display, theme: m.theme_color, icons, shortcuts: (m.shortcuts || []).length };
})));

await p.goto(B + '/jobs', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
console.log('CACHES:', JSON.stringify(await p.evaluate(async () => {
  const o = {};
  for (const n of await caches.keys()) o[n] = (await (await caches.open(n)).keys()).length;
  return o;
})));
console.log('API in cache:', await p.evaluate(async () => {
  for (const n of await caches.keys())
    for (const r of await (await caches.open(n)).keys())
      if (new URL(r.url).pathname.startsWith('/api/')) return r.url;
  return 'none (correct)';
}));

await c.setOffline(true);
const r1 = await p.goto(B + '/jobs', { waitUntil: 'load' }).catch(() => null);
console.log('OFFLINE revisit ->', r1 ? r1.status() : 'fail', '|', (await p.textContent('h1').catch(() => '?')).slice(0, 35));
const r2 = await p.goto(B + '/learn?fresh=' + Date.now(), { waitUntil: 'load' }).catch(() => null);
console.log('OFFLINE new url ->', r2 ? r2.status() : 'fail', '| fallback shown:', (await p.textContent('body').catch(() => '')).includes('offline'));
await c.setOffline(false);
console.log('errors:', errs.length ? errs : 'none');
await b.close();

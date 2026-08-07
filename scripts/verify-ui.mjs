import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:3050';
const PAGES = [
  ['home', '/'],
  ['jobs', '/jobs'],
  ['pricing-tool', '/pricing-tool'],
  ['learn', '/learn'],
  ['courses', '/courses'],
  ['login', '/login'],
  ['signup', '/signup'],
  ['tracker', '/tracker'],
  ['cover-letter', '/cover-letter'],
  ['resume', '/resume'],

];
const VIEWPORTS = [
  ['mobile', 390, 844],
  ['desktop', 1440, 900],
];

fs.mkdirSync('/tmp/shots', { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const [vname, w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    // Mobile must emulate touch, otherwise `@media (pointer: coarse)` rules
    // never apply and we'd be auditing a UI no phone actually receives.
    hasTouch: vname === 'mobile',
    isMobile: vname === 'mobile',
  });

  for (const [name, path] of PAGES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

    const res = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });

    // trigger IntersectionObserver reveals
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 350) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 70));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 1200));
    });

    // horizontal overflow check
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      const bad = [];
      if (de.scrollWidth > de.clientWidth + 1) {
        for (const el of document.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.right > de.clientWidth + 1 || r.left < -1) {
            bad.push(
              (el.tagName + '.' + (el.className?.toString?.() || '')).slice(0, 90) +
                ` [${Math.round(r.left)}..${Math.round(r.right)}]`
            );
          }
          if (bad.length > 6) break;
        }
      }
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, bad };
    });

    // tiny tap targets on mobile
    const smallTargets =
      vname === 'mobile'
        ? await page.evaluate(() => {
            const out = [];
            const MIN = 44;
            for (const el of document.querySelectorAll('a,button,input,select')) {
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              // Measure the real touch area: an element can expand its hit box
              // with a ::after overlay (our .tap utility) without changing layout.
              let h = r.height;
              const after = getComputedStyle(el, '::after');
              if (after && after.content !== 'none') {
                const ah = parseFloat(after.height) || 0;
                const amh = parseFloat(after.minHeight) || 0;
                h = Math.max(h, ah, amh);
              }
              // A checkbox/radio inside a <label> inherits the label's hit area,
              // since tapping the label toggles the control.
              const lbl = el.closest('label');
              if (lbl && (el.type === 'checkbox' || el.type === 'radio')) {
                h = Math.max(h, lbl.getBoundingClientRect().height);
              }
              if (h < MIN) out.push(el.tagName + ':' + el.textContent.trim().slice(0, 28) + '@' + Math.round(h));
              if (out.length > 8) break;
            }
            return out;
          })
        : [];

    const unrevealed = await page.evaluate(() =>
      [...document.querySelectorAll('.reveal')].filter((e) => !e.classList.contains('in')).length
    );
    if (unrevealed) console.log(`   !! ${unrevealed} unrevealed blocks on ${name}/${vname}`);

    await page.screenshot({ path: `/tmp/shots/${name}-${vname}.png`, fullPage: true });

    const status = res?.status();
    const entry = { page: name, view: vname, status, overflow, errors: errors.slice(0, 4), smallTargets };
    if (status !== 200 || overflow.bad.length || errors.length || smallTargets.length) problems.push(entry);
    console.log(
      `${vname.padEnd(8)} ${name.padEnd(13)} ${status} ovf=${overflow.scrollW}/${overflow.clientW}` +
        (errors.length ? ` ERR:${errors.length}` : '') +
        (smallTargets.length ? ` SMALL:${smallTargets.length}` : '')
    );
    await page.close();
  }
  await ctx.close();
}

await browser.close();

console.log('\n===== PROBLEMS =====');
console.log(problems.length ? JSON.stringify(problems, null, 1) : 'none');

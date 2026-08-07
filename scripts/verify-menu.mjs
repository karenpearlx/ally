/**
 * End-to-end checks for the toolkit hub, the help page, the jobs dropdowns and
 * the rebuilt phone sheet.
 *
 * Signed-out by default. Pass VRSFD_EMAIL / VRSFD_PASSWORD to also exercise the
 * signed-in sheet (tappable account card, sign out, no Profile/Settings rows)
 * and the account block on /profile.
 *
 *   BASE=http://localhost:3187 node scripts/verify-menu.mjs
 */

import { chromium, devices } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3187';
const EMAIL = process.env.VRSFD_EMAIL;
const PASSWORD = process.env.VRSFD_PASSWORD;
const SHOTS = process.env.SHOTS ?? '/tmp/vrsfd-shots';

/** The first-visit modal sits over everything; get rid of it before looking. */
async function dismiss(page) {
  for (const name of [/Maybe later/i, /Browse jobs first/i, /^Close$/i]) {
    const b = page.getByRole('button', { name }).first();
    if (await b.count().catch(() => 0)) {
      await b.click({ timeout: 2000 }).catch(() => {});
      break;
    }
  }
  await page.waitForTimeout(400);
}

/** Reveal-on-scroll means a full-page shot of an unscrolled page is half blank. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    // Smaller steps and a longer pause than feels necessary: the shared
    // IntersectionObserver needs a frame to fire, and a fast synthetic scroll
    // skips past sections so the full-page shot comes out half blank. That is
    // a screenshot artefact, not a reveal bug, but it hides real ones.
    const step = window.innerHeight * 0.35;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 350));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

async function run() {
  const browser = await chromium.launch();
  const phone = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await phone.newPage();

  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  /* ---------------- /tools ---------------- */

  const toolsRes = await page.goto(`${BASE}/tools`, { waitUntil: 'networkidle' });
  check('/tools responds 200', toolsRes?.status() === 200, `status ${toolsRes?.status()}`);
  check(
    '/tools renders its heading',
    await page.getByRole('heading', { level: 1 }).isVisible(),
  );

  for (const [label, href] of [
    ['Rate check', '/pricing-tool'],
    ['Cover letter builder', '/cover-letter'],
    ['Resume builder', '/resume'],
    ['Interview prep', '/interview-prep'],
    ['Follow-up writer', '/follow-up-email'],
  ]) {
    const link = page.getByRole('link', { name: label, exact: true });
    const count = await link.count();
    const got = count ? await link.first().getAttribute('href') : null;
    check(`/tools links "${label}" to ${href}`, got === href, got ?? 'missing');
  }

  // Every destination actually exists.
  for (const href of ['/pricing-tool', '/cover-letter', '/resume', '/interview-prep', '/follow-up-email']) {
    const r = await page.request.get(`${BASE}${href}`);
    check(`${href} reachable`, r.status() < 400, `status ${r.status()}`);
  }

  await page.goto(`${BASE}/tools`, { waitUntil: 'networkidle' });
  await dismiss(page);
  await scrollThrough(page);
  const hScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  check('/tools has no horizontal scroll on a phone', !hScroll);
  await page.screenshot({ path: `${SHOTS}/tools-phone.png`, fullPage: true });

  /* ---------------- /help ---------------- */

  const helpRes = await page.goto(`${BASE}/help`, { waitUntil: 'networkidle' });
  await dismiss(page);
  check('/help responds 200', helpRes?.status() === 200, `status ${helpRes?.status()}`);
  for (const id of ['faqs', 'fixes', 'guides']) {
    check(`/help has the #${id} section`, (await page.locator(`#${id}`).count()) === 1);
  }
  const details = await page.locator('#faqs details').count();
  check('/help FAQ accordion has entries', details >= 5, `${details} items`);

  // Accordion actually opens.
  const first = page.locator('#faqs details').first();
  await first.locator('summary').click();
  check('/help accordion opens on tap', await first.evaluate((el) => el.open));

  await scrollThrough(page);
  const helpScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  check('/help has no horizontal scroll on a phone', !helpScroll);
  await page.screenshot({ path: `${SHOTS}/help-phone.png`, fullPage: true });

  /* ---------------- /jobs dropdowns ---------------- */

  await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' });
  await dismiss(page);
  await page.waitForTimeout(2500);

  const sourceSel = page.locator('#jobs-source');
  const sortSel = page.locator('#jobs-sort');
  check('/jobs has a source dropdown', (await sourceSel.count()) === 1);
  check('/jobs has a sort dropdown', (await sortSel.count()) === 1);
  check(
    '/jobs no longer renders the old filter chips',
    (await page.getByRole('button', { name: /^All sources/ }).count()) === 0,
  );

  const sortOpts = await sortSel.locator('option').allTextContents();
  check(
    '/jobs sort offers newest, oldest and rate listed',
    sortOpts.length === 3 && /Newest/.test(sortOpts[0]) && /Oldest/.test(sortOpts[1]) && /Rate/.test(sortOpts[2]),
    sortOpts.join(' | '),
  );

  const srcOpts = await sourceSel.locator('option').allTextContents();
  check(
    '/jobs source lists all, OLJ, RemoteOK and We Work Remotely',
    /All sources/.test(srcOpts[0]) &&
      /OnlineJobs\.ph/.test(srcOpts[1]) &&
      /RemoteOK/.test(srcOpts[2]) &&
      /We Work Remotely/.test(srcOpts[3]),
    srcOpts.join(' | '),
  );

  // The counts printed in the options must add up to the "All sources" total,
  // or listings exist that no filter can reach (which is how the legacy
  // `onlinejobs` slug hid 2.5k rows).
  const nums = srcOpts.map((o) => Number((o.match(/\((\d[\d,]*)\)/) ?? [])[1]?.replace(/,/g, '') ?? 0));
  const [total, ...parts] = nums;
  const summed = parts.reduce((a, b) => a + b, 0);
  check(
    '/jobs source counts account for every listing',
    summed === total,
    `${parts.join(' + ')} = ${summed} vs all ${total}`,
  );
  check(
    '/jobs source dropdown has no Upwork option',
    !srcOpts.some((o) => /Upwork/i.test(o)),
    srcOpts.join(' | '),
  );

  // The results line, not whatever other aria-live region the page mounts.
  const countText = async () =>
    (await page.locator('p[aria-live="polite"]').filter({ hasText: /listings|matches|Loading/ }).first().innerText()).trim();
  const before = await countText();

  await sourceSel.selectOption('olj');
  await page.waitForTimeout(600);
  const afterSource = await countText();
  check('/jobs source dropdown changes the result count', afterSource !== before, `${before} -> ${afterSource}`);

  await sortSel.selectOption('paid');
  await page.waitForTimeout(600);
  const afterPaid = await countText();
  check('/jobs "Rate listed only" narrows the list', afterPaid !== afterSource, `${afterSource} -> ${afterPaid}`);

  await sortSel.selectOption('oldest');
  await page.waitForTimeout(600);
  check(
    '/jobs sort=oldest keeps listings visible',
    /Showing|No matches/.test(await countText()),
    await countText(),
  );

  const clear = page.getByRole('button', { name: 'Clear filters' }).first();
  check('/jobs shows Clear filters while a dropdown is off default', await clear.isVisible());
  await clear.click();
  await page.waitForTimeout(500);
  check('/jobs Clear filters resets the source dropdown', (await sourceSel.inputValue()) === 'all');
  check('/jobs Clear filters resets the sort dropdown', (await sortSel.inputValue()) === 'newest');

  const jobsScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  check('/jobs has no horizontal scroll on a phone', !jobsScroll);

  // Both controls clear the 44px tap minimum.
  for (const sel of ['#jobs-source', '#jobs-sort']) {
    const box = await page.locator(sel).boundingBox();
    check(`${sel} is at least 44px tall`, (box?.height ?? 0) >= 44, `${Math.round(box?.height ?? 0)}px`);
  }
  await page.screenshot({ path: `${SHOTS}/jobs-phone.png` });

  /* ---------------- signed-out phone sheet ---------------- */

  await page.goto(`${BASE}/jobs`, { waitUntil: 'domcontentloaded' });
  await dismiss(page);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.waitForTimeout(450);
  check(
    'signed-out sheet still offers Help',
    await page.getByRole('link', { name: 'Help', exact: true }).first().isVisible(),
  );
  check(
    'signed-out sheet still offers Sign in',
    await page.getByRole('link', { name: 'Sign in' }).first().isVisible(),
  );

  /* ---------------- signed-in ---------------- */

  if (EMAIL && PASSWORD) {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);

    const signedIn = !/\/login/.test(page.url());
    check('signed in', signedIn, page.url());

    if (signedIn) {
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.waitForTimeout(500);

      const sheet = page.locator('.card').filter({ hasText: 'Sign out' }).last();
      const sheetLinks = await sheet.getByRole('link').allTextContents();
      const flat = sheetLinks.join(' | ');

      check('sheet keeps Tools', /Tools/.test(flat), flat);
      check('sheet keeps Help', /Help/.test(flat), flat);
      check('sheet drops Dashboard', !/Dashboard/.test(flat), flat);
      check('sheet drops Jobs', !/\bJobs\b/.test(flat), flat);
      check('sheet drops Tracker', !/Tracker/.test(flat), flat);
      check('sheet drops Learn', !/Learn/.test(flat), flat);
      check('sheet drops the standalone Settings row', !/^Settings$/m.test(flat), flat);

      const accountCard = sheet.locator('a[href="/profile"]');
      check('sheet account card is a link to /profile', (await accountCard.count()) === 1);
      const cardBox = await accountCard.boundingBox();
      check('account card is a big tap target', (cardBox?.height ?? 0) >= 60, `${Math.round(cardBox?.height ?? 0)}px`);

      check(
        'sheet keeps a Sign out button',
        await sheet.getByRole('button', { name: /Sign out/ }).isVisible(),
      );

      await page.screenshot({ path: `${SHOTS}/sheet-signed-in.png` });

      // Tapping the card navigates.
      await accountCard.click();
      await page.waitForURL(/\/profile/, { timeout: 15000 }).catch(() => {});
      check('tapping the account card opens /profile', /\/profile/.test(page.url()), page.url());

      await page.waitForTimeout(2000);
      for (const [label, href] of [
        ['Settings', '/settings'],
        ['Plans & pricing', '/pricing'],
      ]) {
        const l = page.locator(`a[href="${href}"]`).filter({ hasText: label });
        check(`/profile links to ${href}`, (await l.count()) >= 1);
      }
      await page.screenshot({ path: `${SHOTS}/profile-account.png`, fullPage: true });
    }
  } else {
    console.log('\n(skipping signed-in checks — set VRSFD_EMAIL and VRSFD_PASSWORD)\n');
  }

  /* ---------------- desktop sanity ---------------- */

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dp = await desktop.newPage();
  await dp.goto(`${BASE}/tools`, { waitUntil: 'networkidle' });
  await dismiss(dp);
  await scrollThrough(dp);
  await dp.screenshot({ path: `${SHOTS}/tools-desktop.png`, fullPage: true });
  await dp.goto(`${BASE}/help`, { waitUntil: 'networkidle' });
  await dismiss(dp);
  await scrollThrough(dp);
  await dp.screenshot({ path: `${SHOTS}/help-desktop.png`, fullPage: true });
  await dp.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' });
  await dismiss(dp);
  await dp.waitForTimeout(2500);
  await dp.screenshot({ path: `${SHOTS}/jobs-desktop.png` });

  const real = consoleErrors.filter((e) => !/favicon|manifest|404|Failed to load resource/i.test(e));
  check('no unexpected console errors', real.length === 0, real.slice(0, 3).join(' ; '));

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('\nFailures:');
    for (const f of failed) console.log(`  - ${f.name} ${f.detail}`);
    process.exitCode = 1;
  }
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

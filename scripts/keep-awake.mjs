#!/usr/bin/env node
/**
 * Keeps free-hosted project apps (Streamlit Community Cloud, Render, HF Spaces…) awake.
 * Streamlit apps sleep after ~12 h without visitors and then show a "wake up" page that
 * takes a while. This opens each sleepy app in a real browser, presses the wake button
 * if the app is asleep, and waits for it to boot. Run it on a schedule (see
 * .github/workflows/keep-apps-awake.yml) or by hand:  npm run keep-awake
 *
 * Needs Playwright:  npm i -D playwright && npx playwright install chromium
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const SLEEPY = /(\.streamlit\.app|\.onrender\.com|\.hf\.space|\.herokuapp\.com)/i;

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. Run:  npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

export async function wake(page, url, { timeout = 120000 } = {}) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const btn = page.getByRole('button', { name: /get this app back up/i }).first();
  if (await btn.isVisible({ timeout: 8000 }).catch(() => false)) {
    console.log('  asleep → pressing wake button');
    await btn.click();
  }
  // Streamlit renders into [data-testid="stApp"] (inside an iframe on *.streamlit.app)
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const f of page.frames()) {
      if (await f.locator('[data-testid="stApp"], [data-testid="stAppViewContainer"]').count().catch(() => 0)) return true;
    }
    await page.waitForTimeout(3000);
  }
  return false;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const dir = 'content/projects';
  const urls = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => YAML.parse(fs.readFileSync(path.join(dir, f), 'utf8'))?.liveUrl)
    .filter((u) => u && SLEEPY.test(u));
  if (!urls.length) {
    console.log('No sleepy apps found.');
    process.exit(0);
  }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let failed = 0;
  for (const u of urls) {
    console.log('→', u);
    try {
      const ok = await wake(page, u);
      console.log(ok ? '  awake ✓' : '  did not finish booting in time');
      if (!ok) failed++;
    } catch (e) {
      failed++;
      console.log('  error:', e.message);
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
}

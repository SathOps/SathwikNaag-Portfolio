#!/usr/bin/env node
/**
 * Takes a screenshot of every project that has a liveUrl and saves it as the
 * project's preview image (shown while the live site loads, and as a fallback
 * when a site refuses to be embedded).
 *
 * One-time setup:  npm i -D playwright && npx playwright install chromium
 * Then:            npm run snap-sites            (all projects)
 *                  npm run snap-sites -- digalert (one project)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import YAML from 'yaml';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. Run:  npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}
const only = process.argv[2];
const dir = 'content/projects';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
  const slug = file.replace(/\.yaml$/, '');
  if (only && slug !== only) continue;
  const doc = YAML.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  if (!doc.liveUrl) continue;
  try {
    process.stdout.write(`→ ${slug} … `);
    if (/(\.streamlit\.app|\.onrender\.com|\.hf\.space|\.herokuapp\.com)/i.test(doc.liveUrl)) {
      // sleepy free host: wake it first, then give it a moment to render
      const { wake } = await import('./keep-awake.mjs');
      await wake(page, doc.liveUrl);
      await page.waitForTimeout(6000);
    } else {
      await page.goto(doc.liveUrl, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2500);
    }
    const png = await page.screenshot();
    const out = path.join('public', 'projects', slug);
    fs.mkdirSync(out, { recursive: true });
    await sharp(png).webp({ quality: 82 }).toFile(path.join(out, 'preview.webp'));
    doc.preview = `/projects/${slug}/preview.webp`;
    fs.writeFileSync(path.join(dir, file), YAML.stringify(doc, { lineWidth: 0 }));
    console.log('saved');
  } catch (e) {
    console.log('failed: ' + e.message.split('\n')[0]);
  }
}
await browser.close();

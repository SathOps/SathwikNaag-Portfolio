#!/usr/bin/env node
/**
 * Add a PDF (brochure, deck, carousel, newsletter…) to an existing design folder.
 * Every page becomes an image on the site; the original PDF is kept as a download.
 *
 *   npm run add-pdf -- "C:\path\Brochure.pdf" --folder gitam-sports --title "Sponsorship brochure" --kind flipbook
 *
 * --folder   slug of the folder (file name in content/folders without .yaml)   [required]
 * --title    group title shown on the site                                     [default: PDF file name]
 * --kind     grid | carousel | flipbook | marquee | stack | compare             [default: flipbook]
 * --pages    only these pages, e.g. "1-4" or "1,3,5"                             [default: all]
 * --no-download   don't offer the original PDF for download
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { args, pdfToImages, slugify } from './lib.mjs';

const { pos, opt } = args();
const src = pos[0];
if (!src || !fs.existsSync(src) || !opt.folder) {
  console.error('Usage: npm run add-pdf -- <file.pdf> --folder <folder-slug> [--title "…"] [--kind flipbook] [--pages 1-4]');
  process.exit(1);
}
const yamlPath = path.join('content', 'folders', `${opt.folder}.yaml`);
if (!fs.existsSync(yamlPath)) {
  console.error(`No folder "${opt.folder}". Existing: ${fs.readdirSync('content/folders').map((f) => f.replace('.yaml', '')).join(', ')}`);
  process.exit(1);
}
const title = typeof opt.title === 'string' ? opt.title : path.parse(src).name.replace(/[-_]+/g, ' ');
const kind = typeof opt.kind === 'string' ? opt.kind : 'flipbook';
const base = slugify(title) || 'pdf';
const outDir = path.join('public', 'work', opt.folder);
const pubPrefix = `/work/${opt.folder}`;

let pages = await pdfToImages(src, outDir, pubPrefix, base);
if (typeof opt.pages === 'string') {
  const keep = new Set();
  for (const part of opt.pages.split(',')) {
    const [a, b] = part.split('-').map(Number);
    for (let i = a; i <= (b || a); i++) keep.add(i);
  }
  pages.forEach((p, i) => !keep.has(i + 1) && fs.rmSync(path.join('public', p.file)));
  pages = pages.filter((_, i) => keep.has(i + 1));
}
let file = null;
if (!opt['no-download']) {
  const pdfName = `${base}.pdf`;
  fs.copyFileSync(src, path.join(outDir, pdfName));
  file = `${pubPrefix}/${pdfName}`;
}
const doc = YAML.parse(fs.readFileSync(yamlPath, 'utf8'));
doc.groups ??= [];
doc.groups.push({
  title,
  kind,
  note: '',
  file,
  items: pages.map((p, i) => ({ image: p.file, video: null, caption: i === 0 ? title : '', span: 'normal', show: true })),
});
fs.writeFileSync(yamlPath, YAML.stringify(doc, { lineWidth: 0 }));
console.log(`✓ ${pages.length} pages added to "${doc.name}" as a ${kind}${file ? ' (PDF downloadable)' : ''}`);
console.log('Reorder / caption it at http://localhost:3000/keystatic');

#!/usr/bin/env node
/**
 * Turn a folder of exported designs into a new Design-world folder.
 *
 *   npm run add-brand -- "inbox/My Club" --name "My Club" --layout comic --kicker "College Club" --role "Design Lead" --period "2026"
 *
 * - images (jpg/png/webp) are resized to max 1600px and saved as WebP
 * - mp4/webm videos are copied as-is (keep them under ~10 MB)
 * - the brand palette is guessed from the images
 * - the first 12 pieces are shown on the site; the rest are added but hidden.
 *   Open /keystatic afterwards to reorder, caption, group and toggle pieces.
 *
 * PDFs are supported: every PDF becomes its own swipeable group (pages → images) with a download link.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import YAML from 'yaml';
import { pdfToImages, slugify } from './lib.mjs';

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
const opt = (k, d = '') => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
if (!src || !fs.existsSync(src)) {
  console.error('Usage: npm run add-brand -- <folder> --name "Brand" [--layout comic|newspaper|google|festival|sports|wedding|rack|cinema|lanyard|masonry] [--parent merch]');
  process.exit(1);
}
const name = opt('name', path.basename(src));
const slug = opt('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
const layout = opt('layout', 'masonry');
const parent = opt('parent', '');
const outDir = path.join('public', 'work', slug);
const yamlPath = path.join('content', 'folders', `${slug}.yaml`);
if (fs.existsSync(yamlPath) && !args.includes('--force')) {
  console.error(`content/folders/${slug}.yaml already exists. Use --force to overwrite or pick another --slug.`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(src).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const imgs = files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const vids = files.filter((f) => /\.(mp4|webm|mov)$/i.test(f));
const pdfs = files.filter((f) => /\.pdf$/i.test(f));

const items = [];
const swatches = [];
let n = 0;
for (const f of imgs) {
  const out = `p${String(n++).padStart(3, '0')}.webp`;
  const img = sharp(f).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });
  await img.webp({ quality: 82 }).toFile(path.join(outDir, out));
  const { dominant } = await sharp(f).stats();
  swatches.push(dominant);
  items.push({ image: `/work/${slug}/${out}`, caption: path.parse(f).name.replace(/[-_]+/g, ' '), span: 'normal', show: items.length < 12 });
  process.stdout.write(`\r  images ${n}/${imgs.length}`);
}
for (const f of vids) {
  const out = `v${String(n++).padStart(3, '0')}${path.extname(f).toLowerCase()}`;
  fs.copyFileSync(f, path.join(outDir, out));
  const mb = fs.statSync(f).size / 1e6;
  if (mb > 12) console.warn(`\n⚠ ${path.basename(f)} is ${mb.toFixed(1)} MB. Consider compressing it (HandBrake, 720p).`);
  // a poster is needed: use the first image as a placeholder until you upload one in /keystatic
  items.push({ image: items[0]?.image ?? null, video: `/work/${slug}/${out}`, caption: path.parse(f).name, span: 'normal', show: true });
}
console.log('');

// palette: darkest dominant -> bg, most saturated -> accent
const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const lum = ({ r, g, b }) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const sat = ({ r, g, b }) => Math.max(r, g, b) - Math.min(r, g, b);
const byLum = [...swatches].sort((a, b) => lum(a) - lum(b));
const bySat = [...swatches].sort((a, b) => sat(b) - sat(a));
const bg = byLum[0] ?? { r: 17, g: 17, b: 17 };
const dark = lum(bg) < 128;
const palette = {
  bg: hex(bg),
  ink: dark ? '#f5f3ee' : '#141414',
  accent: hex(bySat[0] ?? { r: 255, g: 204, b: 0 }),
  accent2: hex(bySat[1] ?? bySat[0] ?? { r: 255, g: 59, b: 59 }),
};

const pdfGroups = [];
for (const f of pdfs) {
  const title = path.parse(f).name.replace(/[-_]+/g, ' ');
  const base = slugify(title) || `pdf-${pdfGroups.length + 1}`;
  const pages = await pdfToImages(f, outDir, `/work/${slug}`, base);
  fs.copyFileSync(f, path.join(outDir, `${base}.pdf`));
  pdfGroups.push({
    title,
    kind: pages.length > 6 ? 'flipbook' : 'carousel',
    note: '',
    file: `/work/${slug}/${base}.pdf`,
    items: pages.map((p, i) => ({ image: p.file, caption: i === 0 ? title : '', span: 'normal', show: true })),
  });
}

const doc = {
  name,
  kicker: opt('kicker', ''),
  role: opt('role', ''),
  period: opt('period', ''),
  description: opt('description', ''),
  layout,
  palette,
  order: Number(opt('order', '50')),
  topLevel: !parent,
  highlight: false,
  parents: parent ? [parent] : [],
  cover: items[0]?.image ?? pdfGroups[0]?.items[0]?.image ?? null,
  groups: [...(items.length ? [{ title: 'Highlights', kind: 'grid', note: '', items }] : []), ...pdfGroups],
};
fs.mkdirSync(path.dirname(yamlPath), { recursive: true });
fs.writeFileSync(yamlPath, YAML.stringify(doc, { lineWidth: 0 }));
console.log(`✓ ${items.length} pieces + ${pdfGroups.length} PDF(s) → public/work/${slug}/`);
console.log(`✓ content/folders/${slug}.yaml (palette ${palette.bg} / ${palette.accent})`);
console.log('Next: npm run dev → http://localhost:3000/keystatic → Design folders → ' + name);

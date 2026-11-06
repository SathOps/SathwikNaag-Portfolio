#!/usr/bin/env node
/**
 * Add or replace a resume (PDF). Creates the preview image automatically.
 *
 *   npm run add-resume -- "C:\path\My Resume.pdf" --side tech --title "Data Scientist" --subtitle "ML · analytics"
 *
 * --side      design | tech                       [required]
 * --title     card title                          [default: PDF file name]
 * --subtitle  small line under the title
 * --order     position (lower = first)            [default: 50]
 * Running it again with the same title replaces that resume.
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { args, pdfToImages, slugify } from './lib.mjs';

const { pos, opt } = args();
const src = pos[0];
if (!src || !fs.existsSync(src) || !['design', 'tech'].includes(opt.side)) {
  console.error('Usage: npm run add-resume -- <file.pdf> --side design|tech [--title "…"] [--subtitle "…"]');
  process.exit(1);
}
const title = typeof opt.title === 'string' ? opt.title : path.parse(src).name;
const slug = slugify(title);
const dir = path.join('public', 'resumes', slug);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const pdfName = `sathwik-naag-${slug}.pdf`;
fs.copyFileSync(src, path.join(dir, pdfName));
const [first] = await pdfToImages(src, dir, `/resumes/${slug}`, 'preview', 1200);
// keep only the first page as preview.webp
for (const f of fs.readdirSync(dir)) if (f.startsWith('preview-') && f !== 'preview-01.webp') fs.rmSync(path.join(dir, f));
fs.renameSync(path.join(dir, 'preview-01.webp'), path.join(dir, 'preview.webp'));
const coll = opt.side === 'design' ? 'resumes-design' : 'resumes-tech';
fs.mkdirSync(path.join('content', coll), { recursive: true });
fs.writeFileSync(
  path.join('content', coll, `${slug}.yaml`),
  YAML.stringify({ title, subtitle: typeof opt.subtitle === 'string' ? opt.subtitle : '', file: `/resumes/${slug}/${pdfName}`, preview: `/resumes/${slug}/preview.webp`, order: Number(opt.order ?? 50) })
);
console.log(`✓ Resume "${title}" added to the ${opt.side} world (${first ? 'preview generated' : 'no preview'})`);

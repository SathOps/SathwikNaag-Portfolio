#!/usr/bin/env node
/**
 * Shrinks any image in public/work, public/projects or public/me that is wider/taller
 * than 1600px or heavier than 700 KB. Files keep their name and format,
 * so nothing in content/ needs to change.  Run it after uploading through /keystatic.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const roots = ['public/work', 'public/projects', 'public/me'];
const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
let saved = 0,
  count = 0;
for (const f of roots.flatMap(walk)) {
  if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
  const size = fs.statSync(f).size;
  const meta = await sharp(f).metadata();
  if ((meta.width ?? 0) <= 1600 && (meta.height ?? 0) <= 1600 && size < 700_000) continue;
  let pipe = sharp(f).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });
  const ext = path.extname(f).toLowerCase();
  pipe = ext === '.png' ? pipe.png({ compressionLevel: 9, palette: true, quality: 85 }) : ext === '.webp' ? pipe.webp({ quality: 82 }) : pipe.jpeg({ quality: 82, mozjpeg: true });
  const buf = await pipe.toBuffer();
  if (buf.length < size) {
    fs.writeFileSync(f, buf);
    saved += size - buf.length;
    count++;
    console.log(`✓ ${f}  ${(size / 1e6).toFixed(2)} → ${(buf.length / 1e6).toFixed(2)} MB`);
  }
}
console.log(`Done. ${count} files optimised, ${(saved / 1e6).toFixed(1)} MB saved.`);

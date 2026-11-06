// Shared helpers for the content scripts.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function args() {
  const a = process.argv.slice(2);
  const pos = [];
  const opt = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) {
      const k = a[i].slice(2);
      const v = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
      opt[k] = v;
    } else pos.push(a[i]);
  }
  return { pos, opt };
}

/** Render every page of a PDF to WebP. Returns [{file, w, h}] (public paths). */
export async function pdfToImages(pdfPath, outDir, publicPrefix, prefix = 'page', maxSide = 1600) {
  const { pdf } = await import('pdf-to-img');
  fs.mkdirSync(outDir, { recursive: true });
  const doc = await pdf(pdfPath, { scale: 2 });
  const out = [];
  let n = 0;
  for await (const png of doc) {
    n++;
    const name = `${prefix}-${String(n).padStart(2, '0')}.webp`;
    const img = sharp(png).resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true });
    const info = await img.webp({ quality: 82 }).toFile(path.join(outDir, name));
    out.push({ file: `${publicPrefix}/${name}`, w: info.width, h: info.height });
    process.stdout.write(`\r  ${path.basename(pdfPath)}: page ${n}`);
  }
  process.stdout.write('\n');
  return out;
}

export async function imageToWebp(src, outFile, maxSide = 1600) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  return sharp(src).rotate().resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(outFile);
}

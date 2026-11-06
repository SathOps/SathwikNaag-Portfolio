import * as si from 'simple-icons';

export type BrandIcon = { path: string; hex: string } | null;

export function brandIcon(slug?: string | null): BrandIcon {
  if (!slug) return null;
  const key = 'si' + slug[0].toUpperCase() + slug.slice(1);
  const ic = (si as unknown as Record<string, { path: string; hex: string } | undefined>)[key];
  if (!ic) return null;
  // very dark brand colours disappear on black, so lift them to white
  const h = ic.hex;
  const r = parseInt(h.slice(0, 2), 16),
    g = parseInt(h.slice(2, 4), 16),
    b = parseInt(h.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return { path: ic.path, hex: lum < 0.22 ? 'FFFFFF' : h };
}

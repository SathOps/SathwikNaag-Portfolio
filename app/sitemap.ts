import type { MetadataRoute } from 'next';
import { getAllFolders } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const folders = await getAllFolders();
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/design`, priority: 0.9 },
    { url: `${base}/tech`, priority: 0.9 },
    ...folders.map((f) => ({ url: `${base}/design/${f.slug}`, priority: f.topLevel ? 0.7 : 0.5 })),
  ];
}

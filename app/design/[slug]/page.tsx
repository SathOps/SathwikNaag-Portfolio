import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllFolders, getFolder } from '@/lib/content';
import FolderSection from '@/components/design/FolderSection';

export async function generateStaticParams() {
  return (await getAllFolders()).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const f = await getFolder((await params).slug);
  return f ? { title: f.name, description: f.description, openGraph: { images: f.cover ? [f.cover.src] : [] } } : {};
}

export default async function FolderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await getFolder(slug);
  if (!f) notFound();
  const parent = f.parents[0];
  return (
    <main>
      <div className="fixed left-3 top-3 z-[90] flex gap-2 sm:left-6 sm:top-5">
        <Link href={parent ? `/design/${parent}` : `/design#${f.slug}`} className="comic-btn rounded-xl bg-white px-4 py-1.5 text-xl text-black">
          ← {parent ? 'BACK' : 'ALL ISSUES'}
        </Link>
      </div>
      <FolderSection f={f} mode="full" />
    </main>
  );
}

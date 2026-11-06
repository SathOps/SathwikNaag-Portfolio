import { StoryTitle } from '@/components/design/ComicMotion';
import type { Metadata } from 'next';
import { getAchievements, getExperience, getProfile, getResumes, getTopFolders } from '@/lib/content';
import DesignNav from '@/components/design/DesignNav';
import DesignHero from '@/components/design/DesignHero';
import FolderSection from '@/components/design/FolderSection';
import { ComicContact, ComicExperience, ComicFooter, ComicStats, IssueIndex } from '@/components/design/Extras';
import Resumes from '@/components/ui/Resumes';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'Design World',
  description: 'Posters, identities, kits, invites and campaigns by Sathwik Naag.',
};

export default async function DesignPage() {
  const [p, folders, exp, ach, resumes] = await Promise.all([getProfile(), getTopFolders(), getExperience('design'), getAchievements('design'), getResumes('design')]);
  const total = folders.reduce((n, f) => n + f.count, 0);
  return (
    <main>
      <DesignNav items={folders.map((f) => ({ slug: f.slug, name: f.name }))} />
      <DesignHero
        shortName={p.shortName}
        intro={p.designIntro}
        roles={p.designRoles}
        stats={[
          { value: p.designsMade || '400+', label: 'creatives made' },
          { value: `${folders.length}`, label: 'design worlds' },
          { value: `${total}`, label: 'pieces on show' },
        ]}
        shortcuts={folders.map((f, i) => ({ slug: f.slug, label: f.heroShortcut, issue: i + 1 })).filter((x) => x.label)}
        covers={folders.filter((f) => f.cover).map((f) => ({ slug: f.slug, name: f.name, src: f.cover!.src, color: f.palette.accent, w: f.cover!.w, h: f.cover!.h }))}
      />
      <IssueIndex folders={folders} />
      {folders.map((f, i) => (
        <FolderSection key={f.slug} f={f} issue={i + 1} />
      ))}
      <ComicStats items={ach.slice(0, 4).map((a) => ({ slug: a.slug, title: a.title, detail: a.detail, stat: a.stat }))} />
      <ComicExperience items={exp} />
      <section id="resumes" className="relative overflow-hidden bg-[#ff5fa2] py-20 sm:py-28">
        <div className="halftone-lg absolute inset-0 text-black/10" />
        <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(from 0deg at 50% 60%, rgba(255,255,255,.22) 0 6deg, transparent 6deg 18deg)' }} />
        <div className="relative mx-auto max-w-[1100px] px-4 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <StoryTitle text="GRAB A RESUME!" />
            <Reveal>
              <div className="speech mb-12 max-w-[260px] rotate-[3deg] p-4 font-comic text-xl leading-tight shadow-[5px_5px_0_#111]">Hiring? Pull one out of the folder, they&apos;re free!</div>
            </Reveal>
          </div>
          <Resumes variant="comic" items={resumes.map((r) => ({ slug: r.slug, title: r.title, subtitle: r.subtitle, file: r.file, preview: r.preview }))} />
        </div>
      </section>
      <ComicContact p={p} />
      <ComicFooter />
    </main>
  );
}

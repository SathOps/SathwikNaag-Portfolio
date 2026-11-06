import SplitHero from '@/components/hero/SplitHero';
import { getProfile, getAllFolders, getProjects } from '@/lib/content';

export default async function Home() {
  const [p, folders, projects] = await Promise.all([getProfile(), getAllFolders(), getProjects()]);
  const pieces = folders.filter((f) => f.topLevel).reduce((n, f) => n + f.count, 0);
  return (
    <main>
      <SplitHero
        name={p.name}
        shortName={p.shortName}
        designTagline={p.designTagline}
        techTagline={p.techTagline}
        designBio={p.designBio}
        techBio={p.techBio}
        location={p.location}
        avatar={{ open: p.avatarSketch || '/me/photo.webp', blink: p.avatarSketchBlink }}
        interests={p.interests.map((i) => ({ label: i.label, icon: i.icon, side: i.side }))}
        stats={{ design: `${pieces}+ pieces on show`, tech: `${projects.length} projects` }}
      />
    </main>
  );
}

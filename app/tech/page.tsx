import type { Metadata } from 'next';
import Link from 'next/link';
import { getAchievements, getExperience, getProfile, getProjects, getResumes, getSkills, getTopFolders, getChatKnowledge } from '@/lib/content';
import UXShortcut from '@/components/tech/UXShortcut';
import TechBot from '@/components/chat/TechBot';
import { brandIcon } from '@/lib/icons';
import Cursor from '@/components/ui/Cursor';
import { TechHero, TechNav, SectionHead } from '@/components/tech/TechChrome';
import Projects, { type ProjectVM } from '@/components/tech/Projects';
import { Experience, Highlights, Stack, Terminal } from '@/components/tech/TechSections';
import GitHubPreview from '@/components/tech/GitHubPreview';
import TechBackground from '@/components/tech/TechBackground';
import { getGitHub } from '@/lib/github';
import Resumes from '@/components/ui/Resumes';

export const metadata: Metadata = {
  title: 'Tech World',
  description: 'Agentic AI, RAG, deep learning and full-stack projects by Sathwik Naag.',
};

// map stack names in projects to icons (falls back to the skills list)
const ALIAS: Record<string, string> = {
  'React 18': 'react',
  React: 'react',
  Vite: 'vite',
  'Tailwind CSS': 'tailwindcss',
  'Tailwind CSS 4': 'tailwindcss',
  'Framer Motion': 'framer',
  'TanStack Query': 'reactquery',
  Leaflet: 'leaflet',
  FastAPI: 'fastapi',
  PostgreSQL: 'postgresql',
  JWT: 'jsonwebtokens',
  'SQLAlchemy 2': 'sqlalchemy',
  'Astro 6': 'astro',
  TypeScript: 'typescript',
  'daisyUI 5': 'daisyui',
  Storybook: 'storybook',
  'Vite PWA': 'pwa',
  i18next: 'i18next',
  'GitLab CI': 'gitlab',
  Figma: 'figma',
  Python: 'python',
  LangChain: 'langchain',
  ChromaDB: '',
  'Sentence-Transformers': 'huggingface',
  Ollama: 'ollama',
  Gemini: 'googlegemini',
  Pydantic: 'pydantic',
  Streamlit: 'streamlit',
  pytest: 'pytest',
  'TensorFlow / Keras': 'tensorflow',
  TensorFlow: 'tensorflow',
  Keras: 'keras',
  XGBoost: '',
  'scikit-learn': 'scikitlearn',
  OpenCV: 'opencv',
  NumPy: 'numpy',
  Pandas: 'pandas',
  MySQL: 'mysql',
  Vercel: 'vercel',
  FAISS: 'meta',
  Transformers: 'huggingface',
};

export const revalidate = 86400; // refresh GitHub data daily

export default async function TechPage() {
  const [p, projects, skills, exp, ach, resumes] = await Promise.all([getProfile(), getProjects(), getSkills(), getExperience('tech'), getAchievements('tech'), getResumes('tech')]);
  const gh = await getGitHub(p.githubUser);
  const chatDocs = await getChatKnowledge('tech');
  const ux = (await getTopFolders()).find((f) => f.caseStudies.length > 0) ?? null;
  const skillIcon = new Map(skills.map((s) => [s.name.toLowerCase(), s.icon]));
  const vm: ProjectVM[] = projects.map((x) => ({
    slug: x.slug,
    title: x.title,
    tagline: x.tagline,
    category: x.category,
    status: x.status,
    featured: x.featured,
    team: x.team,
    badge: x.badge || null,
    largePreview: !!x.largePreview,
    role: x.role,
    period: x.period,
    summary: x.summary,
    highlights: x.highlights,
    metrics: x.metrics,
    stack: x.stack.map((name) => ({ name, icon: brandIcon(ALIAS[name] ?? skillIcon.get(name.toLowerCase()) ?? name.toLowerCase().replace(/[^a-z0-9]/g, '')) })),
    liveUrl: x.liveUrl,
    embedUrl: x.embedUrl || x.liveUrl,
    repoUrl: x.repoUrl,
    repoNote: x.repoNote || null,
    extraLinks: x.extraLinks,
    embed: x.embed,
    preview: x.previewMedia ? { src: x.previewMedia.src, w: x.previewMedia.w, h: x.previewMedia.h } : null,
    accent: x.accent || '#3b82f6',
  }));
  const live = projects.filter((x) => x.liveUrl).length;
  const ghFallback = projects
    .filter((x) => x.repoUrl?.includes('github.com'))
    .map((x) => ({ name: x.repoUrl!.split('/').pop() || x.title, description: x.tagline, url: x.repoUrl! }));
  const internships = exp.filter((e) => e.kind === 'work').length;
  return (
    <div className="tech relative min-h-screen bg-[#04050a] font-sans text-white">
      <TechBackground />
      <Cursor variant="tech" />
      <TechNav />
      <main className="relative">
        <TechHero
          name={p.name}
          intro={p.techIntro}
          roles={p.techRoles}
          location={p.location}
          education={p.education}
          available={p.available}
          email={p.email}
          whatsapp={p.whatsapp}
          socials={p.socials}
          code={{ focus: ['Agentic AI', 'RAG', 'Deep Learning', 'Full-stack'], stack: ['Python', 'LangChain', 'TensorFlow', 'React', 'FastAPI'], leetcode: p.leetcodeSolved || '200+' }}
          stats={[
            { value: p.leetcodeSolved || '200+', label: 'leetcode solved' },
            { value: String(projects.length), label: 'projects' },
            { value: String(live), label: 'live sites' },
            { value: String(internships), label: 'internships' },
          ]}
        />

        <section id="stack" className="relative py-24 sm:py-28">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <SectionHead k="01 · stack" title="Tech stack" sub="What I reach for, from training models to shipping the UI." />
            <Stack skills={skills.map((s) => ({ name: s.name, group: s.group, level: s.level ?? 3, icon: brandIcon(s.icon) }))} />
          </div>
        </section>

        <section id="github" className="relative py-20 sm:py-24">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <SectionHead k="02 · github" title="On GitHub & LeetCode" sub="Where the code lives and where I practise." />
            <GitHubPreview
              user={p.githubUser || 'SathOps'}
              profile={gh?.profile ?? null}
              repos={gh?.repos ?? []}
              days={gh?.days ?? null}
              pinned={(p.githubRepos ?? []).filter((r) => r.name && r.url).map((r) => ({ name: r.name, url: r.url!, description: r.description, language: r.language || null }))}
              fallbackRepos={ghFallback}
              leetcode={p.leetcodeUser ? { user: p.leetcodeUser, solved: p.leetcodeSolved || '200+' } : null}
            />
          </div>
        </section>

        <section id="experience" className="relative py-24 sm:py-28">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-8">
            <SectionHead k="03 · experience" title="Experience" sub="Internships, leadership, where I've shipped real work, and where I study." />
            <Experience
              items={exp.map((e) => ({ slug: e.slug, role: e.role, org: e.org, period: e.period, kind: e.kind, points: e.points, link: e.link, tags: e.tags ?? [], metrics: e.metrics ?? [], current: !!e.current }))}
            />
            {ach.length > 0 && (
              <div className="mt-16">
                <Highlights items={ach.map((a) => ({ slug: a.slug, title: a.title, detail: a.detail, stat: a.stat }))} />
              </div>
            )}
          </div>
        </section>

        <section id="projects" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <SectionHead k="04 · projects" title="Projects" sub="Live sites load right here: hover a browser window to interact with it, or open the full viewer with device sizes." />
            {ux && <UXShortcut slug={ux.slug} label="See how I designed these in the UI/UX issue" />}
            <Projects projects={vm} />
          </div>
        </section>

        <section id="resumes" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
            <SectionHead k="05 · resume" title="Pick a resume" sub="Each one is tuned for a different role. Preview here or download the PDF." />
            <Resumes variant="tech" items={resumes.map((r) => ({ slug: r.slug, title: r.title, subtitle: r.subtitle, file: r.file, preview: r.preview }))} />
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
          <div className="relative mx-auto max-w-[900px] px-4 sm:px-8">
            <SectionHead k="06 · contact" title="Let's build something." />
            <Terminal email={p.email} whatsapp={p.whatsapp} phone={p.phoneDisplay} socials={p.socials} />
          </div>
        </section>
      </main>
      <footer className="relative border-t border-white/[0.06] py-8 text-center font-mono text-xs text-white/40">
        © {new Date().getFullYear()} {p.name} · built with Next.js ·{' '}
        <Link href="/design" className="text-[#ffd23f] hover:underline">
          visit the design world →
        </Link>
      </footer>
      <TechBot docs={chatDocs} whatsapp={p.whatsapp} />
    </div>
  );
}

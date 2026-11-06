import { createReader } from '@keystatic/core/reader';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'node:path';
import fs from 'node:fs';
import keystaticConfig from '../keystatic.config';

export const reader = createReader(process.cwd(), keystaticConfig);

export type Media = {
  src: string;
  w: number;
  h: number;
  video?: string | null;
  caption: string;
  preview?: boolean;
  previewOnly?: boolean;
  span: 'normal' | 'wide' | 'tall' | 'big';
};
export type Group = { title: string; kind: string; note: string; file?: string | null; showIn: 'both' | 'preview' | 'full'; items: Media[] };
export type CaseStudy = {
  title: string;
  role: string;
  period: string;
  challenge: string;
  design: string[];
  build: string;
  tools: string[];
  liveUrl: string | null;
  alsoInTech: boolean;
};
export type Palette = { bg: string; ink: string; accent: string; accent2: string };
export type Folder = {
  slug: string;
  name: string;
  kicker: string;
  role: string;
  period: string;
  description: string;
  layout: string;
  palette: Palette;
  order: number;
  topLevel: boolean;
  highlight: boolean;
  parents: readonly string[];
  fullParents: readonly string[];
  previewGroups: number | null;
  childrenAfter: number | null;
  heroShortcut: string;
  process: { title: string; detail: string }[];
  callout: string;
  caseStudies: CaseStudy[];
  previewMerge: boolean;
  previewStyle: string;
  cover: Media | null;
  groups: Group[];
  children: Folder[];
  /** sub-folders shown on the full page (children + folders repeated here via fullParents) */
  fullChildren: Folder[];
  count: number;
};

const dimCache = new Map<string, { w: number; h: number }>();
async function dims(src: string) {
  if (dimCache.has(src)) return dimCache.get(src)!;
  let out = { w: 1200, h: 1500 };
  try {
    const file = path.join(process.cwd(), 'public', decodeURI(src));
    if (fs.existsSync(file)) {
      const d = await imageSizeFromFile(file);
      if (d.width && d.height) out = { w: d.width, h: d.height };
    }
  } catch {}
  dimCache.set(src, out);
  return out;
}

async function media(image: string | null, extra: Partial<Media> = {}): Promise<Media | null> {
  if (!image) return null;
  const d = await dims(image);
  return { src: image, w: d.w, h: d.h, caption: '', span: 'normal', ...extra };
}

let foldersCache: Promise<Folder[]> | null = null;

async function loadFolders(): Promise<Folder[]> {
  const raw = await reader.collections.folders.all();
  const flat: Folder[] = await Promise.all(
    raw.map(async ({ slug, entry }) => {
      const groups: Group[] = [];
      for (const g of entry.groups) {
        const items: Media[] = [];
        for (const it of g.items) {
          if (!it.show || !it.image) continue;
          const m = await media(it.image, {
            video: it.video || null,
            caption: it.caption,
            span: (it.span as Media['span']) || 'normal',
            preview: it.preview !== false,
            previewOnly: !!(it as any).previewOnly,
          });
          if (m) items.push(m);
        }
        if (items.length) groups.push({ title: g.title, kind: g.kind, note: g.note, file: g.file ?? null, showIn: ((g as any).showIn || 'both') as Group['showIn'], items });
      }
      return {
        slug,
        name: entry.name,
        kicker: entry.kicker,
        role: entry.role,
        period: entry.period,
        description: entry.description,
        layout: entry.layout,
        palette: entry.palette,
        order: entry.order ?? 50,
        topLevel: entry.topLevel,
        highlight: entry.highlight,
        parents: entry.parents ?? [],
        fullParents: (entry as any).fullParents ?? [],
        previewGroups: (entry as any).previewGroups ?? null,
        childrenAfter: (entry as any).childrenAfter ?? null,
        heroShortcut: (entry as any).heroShortcut ?? '',
        process: ((entry as any).process ?? []).map((x: any) => ({ title: x.title ?? '', detail: x.detail ?? '' })),
        callout: (entry as any).callout ?? '',
        caseStudies: ((entry as any).caseStudies ?? []).map((c: any) => ({
          title: c.title ?? '',
          role: c.role ?? '',
          period: c.period ?? '',
          challenge: c.challenge ?? '',
          design: [...(c.design ?? [])],
          build: c.build ?? '',
          tools: [...(c.tools ?? [])],
          liveUrl: c.liveUrl || null,
          alsoInTech: !!c.alsoInTech,
        })),
        previewMerge: !!(entry as any).previewMerge,
        previewStyle: (entry as any).previewStyle || 'row',
        cover: await media(entry.cover),
        groups,
        children: [],
        fullChildren: [],
        count: groups.filter((g) => g.showIn !== 'preview').reduce((n, g) => n + g.items.filter((m) => !m.previewOnly).length, 0),
      };
    })
  );
  const bySlug = new Map(flat.map((f) => [f.slug, f]));
  for (const f of flat) {
    for (const p of f.parents) bySlug.get(p)?.children.push(f);
    for (const p of [...f.parents, ...f.fullParents]) {
      const parent = bySlug.get(p);
      if (parent && !parent.fullChildren.includes(f)) parent.fullChildren.push(f);
    }
  }
  for (const f of flat) {
    f.children.sort((a, b) => a.order - b.order);
    f.fullChildren.sort((a, b) => a.order - b.order);
    f.count += f.children.reduce((n, c) => n + c.count, 0);
  }
  return flat.sort((a, b) => a.order - b.order);
}

export function getAllFolders() {
  if (!foldersCache || process.env.NODE_ENV === 'development') foldersCache = loadFolders();
  return foldersCache;
}
export async function getTopFolders() {
  return (await getAllFolders()).filter((f) => f.topLevel);
}
export async function getFolder(slug: string) {
  return (await getAllFolders()).find((f) => f.slug === slug) ?? null;
}

export async function getProfile() {
  const p = await reader.singletons.profile.readOrThrow();
  return p;
}
export type Profile = Awaited<ReturnType<typeof getProfile>>;

export async function getProjects() {
  const all = await reader.collections.projects.all();
  const list = await Promise.all(
    all.map(async ({ slug, entry }) => ({
      slug,
      ...entry,
      previewMedia: await media(entry.preview),
    }))
  );
  return list.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
}
export type Project = Awaited<ReturnType<typeof getProjects>>[number];

export async function getSkills() {
  const all = await reader.collections.skills.all();
  return all.map(({ slug, entry }) => ({ slug, ...entry })).sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
}
export type Skill = Awaited<ReturnType<typeof getSkills>>[number];

export async function getExperience(side: 'design' | 'tech') {
  const all = await reader.collections.experience.all();
  return all
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((e) => e.side === side || e.side === 'both')
    .sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
}
export type Experience = Awaited<ReturnType<typeof getExperience>>[number];

export async function getAchievements(side: 'design' | 'tech') {
  const all = await reader.collections.achievements.all();
  return all
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((e) => e.side === side || e.side === 'both')
    .sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
}

export async function getResumes(side: 'design' | 'tech') {
  const all = side === 'design' ? await reader.collections.designResumes.all() : await reader.collections.techResumes.all();
  return all.map(({ slug, entry }) => ({ slug, ...entry })).sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
}
export type Resume = Awaited<ReturnType<typeof getResumes>>[number];

/* ---------------- chatbot knowledge (FAQ answers + auto docs from the site's own content) ---------------- */
export type ChatDoc = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  featured: boolean;
  source: string;
  link: { label: string; url: string } | null;
};

export async function getChatKnowledge(world: 'design' | 'tech'): Promise<ChatDoc[]> {
  const all = await reader.collections.chat.all();
  const faq: ChatDoc[] = all
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((e) => e.world === world || e.world === 'both')
    .sort((a, b) => (a.order ?? 50) - (b.order ?? 50))
    .map((e) => ({
      id: e.slug,
      question: e.question,
      answer: e.answer,
      keywords: [...(e.keywords ?? [])],
      featured: !!e.featured,
      source: 'FAQ',
      link: e.linkUrl ? { label: e.linkLabel || 'Open', url: e.linkUrl } : null,
    }));

  // Retrieval also covers the site's own content, so questions like "tell me about DigAlert" get answered.
  const auto: ChatDoc[] = [];
  if (world === 'tech') {
    for (const p of await getProjects()) {
      auto.push({
        id: `project-${p.slug}`,
        question: p.title,
        answer: `${p.title}: ${p.tagline} ${p.summary}${p.team ? ' (A group project.)' : ''}`,
        keywords: [p.title, ...(p.stack ?? []), p.category, p.role].filter(Boolean) as string[],
        featured: false,
        source: `Projects · ${p.title}`,
        link: { label: 'See it in Projects', url: '#projects' },
      });
    }
    for (const e of await getExperience('tech')) {
      auto.push({
        id: `exp-${e.slug}`,
        question: `${e.role} at ${e.org}`,
        answer: `${e.role}, ${e.org}${e.period ? ` (${e.period})` : ''}. ${(e.points ?? []).join(' ')}`,
        keywords: [e.role, e.org, ...(e.tags ?? [])],
        featured: false,
        source: `Experience · ${e.org}`,
        link: { label: 'See the experience', url: '#experience' },
      });
    }
  } else {
    for (const f of await getTopFolders()) {
      auto.push({
        id: `folder-${f.slug}`,
        question: f.name,
        answer: `${f.name}: ${f.description}${f.role ? ` My role: ${f.role}.` : ''}`,
        keywords: [f.name, f.kicker, f.role, f.slug.replace(/-/g, ' ')].filter(Boolean),
        featured: false,
        source: `Issue · ${f.name}`,
        link: { label: `Open ${f.name}`, url: `#${f.slug}` },
      });
    }
    for (const e of await getExperience('design')) {
      auto.push({
        id: `exp-${e.slug}`,
        question: `${e.role} at ${e.org}`,
        answer: `${e.role}, ${e.org}. ${(e.points ?? []).join(' ')}`,
        keywords: [e.role, e.org, ...(e.tags ?? [])],
        featured: false,
        source: `The story so far · ${e.role}`,
        link: { label: 'See the story so far', url: '#experience' },
      });
    }
  }
  return [...faq, ...auto];
}

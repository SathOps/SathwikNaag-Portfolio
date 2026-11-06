import Link from 'next/link';
import Image from 'next/image';
import type { Folder } from '@/lib/content';
import GroupView from '@/components/groups/GroupView';
import Decor from './Decor';
import Reveal from '@/components/ui/Reveal';
import UXIssue from './UXIssue';

type G = Folder['groups'][number];

/** The short preview on /design: only pieces marked for preview; groups with none are left out. */
function previewGroups(f: Folder): G[] {
  const gs = f.groups
    .filter((g) => g.showIn !== 'full')
    .map((g) => ({ ...g, items: g.items.filter((m) => m.preview !== false) }))
    .filter((g) => g.items.length > 0);
  const n = f.previewGroups ?? (f.highlight ? 3 : 2);
  if (f.previewMerge) {
    // one tidy grid of the chosen pieces, in folder order
    const items = gs.flatMap((g) => g.items);
    return items.length ? [{ title: 'Highlights', kind: f.previewStyle === 'line' ? 'line' : 'row', note: '', file: null, showIn: 'both', items }] : [];
  }
  return gs.slice(0, n);
}
function fullGroups(f: Folder): G[] {
  return f.groups
    .filter((g) => g.showIn !== 'preview')
    .map((g) => ({ ...g, items: g.items.filter((m) => !m.previewOnly) }))
    .filter((g) => g.items.length > 0);
}
/** consecutive flipbooks are shown side by side on the full page */
function pairUp(gs: G[]): (G | [G, G])[] {
  const out: (G | [G, G])[] = [];
  for (let i = 0; i < gs.length; i++) {
    if (gs[i].kind === 'flipbook' && gs[i + 1]?.kind === 'flipbook') {
      out.push([gs[i], gs[i + 1]]);
      i++;
    } else out.push(gs[i]);
  }
  return out;
}

function vars(f: Folder): React.CSSProperties {
  return { ['--bg' as any]: f.palette.bg, ['--ink' as any]: f.palette.ink, ['--accent' as any]: f.palette.accent, ['--accent2' as any]: f.palette.accent2 };
}

const GOOGLE = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
/** In the Google theme, the word "Google" in a folder name is set in Google's letter colours. */
function Title({ f }: { f: Folder }) {
  if (f.layout !== 'google') return <>{f.name}</>;
  return (
    <>
      {f.name.split(/(Google)/).map((part, i) =>
        part === 'Google' ? (
          <span key={i} aria-label="Google">
            {[...part].map((ch, k) => (
              <span key={k} style={{ color: GOOGLE[k] }}>
                {ch}
              </span>
            ))}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

function Header({ f, issue, size = 'lg', main = false }: { f: Folder; issue?: number; size?: 'lg' | 'sm'; main?: boolean }) {
  const H = main ? 'h1' : 'h2';
  const big = size === 'lg';
  return (
    <header className={`relative ${big ? 'mb-10 sm:mb-14' : 'mb-6'}`}>
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80 sm:text-xs">
        {issue !== undefined && <span className="rounded-full px-2.5 py-1" style={{ background: 'var(--accent)', color: 'var(--bg)' }}>No. {String(issue).padStart(2, '0')}</span>}
        <span>{f.kicker}</span>
      </div>
      <H
        className={`f-title mt-3 ${big ? 'text-[clamp(2.8rem,9vw,8.5rem)]' : 'text-[clamp(2rem,5vw,3.6rem)]'} leading-[0.92]`}
        style={{ color: f.layout === 'comic' ? 'var(--ink)' : undefined }}
      >
        <Title f={f} />
      </H>
      {f.layout === 'newspaper' && big && <div className="f-rule mt-4 pt-1 text-center text-[11px] uppercase tracking-[0.3em]">Est. on campus · Hyderabad edition · Price: one scroll</div>}
      <div className={`mt-5 grid gap-5 ${big ? 'lg:grid-cols-[1.4fr_1fr]' : ''}`}>
        <p className={`${big ? 'text-lg sm:text-xl' : 'text-base'} max-w-2xl leading-relaxed opacity-90`}>{f.description}</p>
        <div className="flex flex-wrap content-start gap-2 lg:justify-end">
          {f.role && <span className="f-chip rounded-full px-3 py-1.5 text-sm">{f.role}</span>}
          {f.period && <span className="f-chip rounded-full px-3 py-1.5 text-sm">{f.period}</span>}
          <span className="f-chip rounded-full px-3 py-1.5 text-sm">{f.caseStudies.length && !f.count ? `${f.caseStudies.length} case studies` : `${f.count} pieces`}</span>
        </div>
      </div>
    </header>
  );
}

function GroupBlock({ g, f, compact, single, className = 'mb-12 last:mb-0 sm:mb-16' }: { g: G; f: Folder; compact?: boolean; single?: boolean; className?: string }) {
  return (
    <Reveal className={className}>
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b pb-3" style={{ borderColor: 'color-mix(in oklab, var(--ink) 18%, transparent)' }}>
        <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{g.title}</h3>
        <div className="flex items-center gap-3">
          {g.note && <p className="hidden max-w-md text-right text-sm opacity-70 md:block">{g.note}</p>}
          {g.file && (
            <a href={g.file} target="_blank" rel="noreferrer" className="f-chip shrink-0 rounded-full px-3 py-1 text-xs font-semibold hover:opacity-80">
              PDF ↓
            </a>
          )}
        </div>
      </div>
      <GroupView g={g} layout={f.layout} compact={compact} single={single} />
    </Reveal>
  );
}

function Groups({ list, f, compact }: { list: (G | [G, G])[]; f: Folder; compact?: boolean }) {
  return (
    <>
      {list.map((x) =>
        Array.isArray(x) ? (
          <div key={x[0].title} className="mb-12 grid gap-8 sm:mb-16 lg:grid-cols-2 [&>*]:min-w-0">
            {x.map((g) => (
              <GroupBlock key={g.title} g={g} f={f} compact single className="" />
            ))}
          </div>
        ) : (
          <GroupBlock key={x.title} g={x} f={f} compact={compact} />
        )
      )}
    </>
  );
}

export function ChildBlock({ f, full }: { f: Folder; full?: boolean }) {
  return (
    <div className="folder relative overflow-hidden rounded-[28px] p-5 sm:p-10" data-layout={f.layout} style={vars(f)}>
      <Decor layout={f.layout} subtle />
      <div className="relative">
        <Header f={f} size="sm" />
        <Groups list={full ? pairUp(fullGroups(f)) : previewGroups(f).slice(0, 2)} f={f} compact />
      </div>
    </div>
  );
}

function ChildCard({ f }: { f: Folder }) {
  return (
    <Link
      href={`/design/${f.slug}`}
      className="folder group relative flex items-center gap-4 overflow-hidden rounded-2xl p-3 pr-5 transition-transform hover:-translate-y-1"
      data-layout={f.layout}
      style={vars(f)}
    >
      {f.cover && (
        <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl">
          <Image src={f.cover.src} alt="" fill sizes="80px" className="object-cover" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-[0.18em] opacity-70">{f.kicker}</span>
        <span className="block truncate text-lg font-bold">{f.name}</span>
        <span className="text-sm opacity-70">{f.count} pieces →</span>
      </span>
    </Link>
  );
}

export default function FolderSection({ f, issue, mode = 'inline' }: { f: Folder; issue?: number; mode?: 'inline' | 'full' }) {
  const full = mode === 'full';
  const groups = full ? fullGroups(f) : previewGroups(f);
  const hidden = Math.max(0, fullGroups(f).length - (f.previewMerge ? 0 : groups.length));
  const expandChildren = full || f.groups.length === 0 || f.highlight;
  const kids = full ? f.fullChildren : f.children;
  return (
    <section id={f.slug} className="folder overflow-hidden" data-layout={f.layout} style={vars(f)}>
      <Decor layout={f.layout} issue={issue} />
      <div className="relative mx-auto max-w-[1400px] px-4 py-20 sm:px-8 sm:py-28 lg:px-12">
        <Reveal>
          <Header f={f} issue={issue} main={full} />
        </Reveal>

        {(() => {
          const list = full ? pairUp(groups) : groups;
          // in the short preview, sub-folders can sit between groups (e.g. the kit right after Headliners)
          const at = !full && expandChildren && f.childrenAfter != null ? Math.max(0, Math.min(list.length, f.childrenAfter)) : list.length;
          const kidsEl = (
            kids.length > 0 &&
            (expandChildren ? (
              <div className="mt-6 space-y-8">
                {kids.map((c) => (
                  <Reveal key={c.slug}>
                    {full || previewGroups(c).length ? <ChildBlock f={c} full={full} /> : <ChildCard f={c} />}
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Also in this folder</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {f.children.map((c) => (
                    <ChildCard key={c.slug} f={c} />
                  ))}
                </div>
              </div>
            ))
          );
          return (
            <>
              <Groups list={list.slice(0, at)} f={f} />
              {at < list.length && <div className="mb-12 sm:mb-16">{kidsEl}</div>}
              <Groups list={list.slice(at)} f={f} />
              {at >= list.length && kidsEl}
            </>
          );
        })()}

        {f.caseStudies.length + f.process.length > 0 && (
          <div className="mt-2">
            <UXIssue f={f} />
          </div>
        )}

        {!full && (hidden > 0 || (!expandChildren && f.children.length > 0)) && (
          <div className="mt-12 flex justify-center">
            <Link
              href={`/design/${f.slug}`}
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-base font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              Open the full {f.layout === 'newspaper' ? 'edition' : f.layout === 'comic' ? 'issue' : 'folder'}
              {hidden > 0 && <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs">+{hidden} more groups</span>}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@/components/ui/Icons';

export type ProjectVM = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  status: string;
  featured: boolean;
  team: boolean;
  badge: string | null;
  largePreview?: boolean;
  role: string;
  period: string;
  summary: string;
  highlights: readonly string[];
  metrics: readonly { value: string; label: string }[];
  stack: { name: string; icon: { path: string; hex: string } | null }[];
  liveUrl: string | null;
  embedUrl: string | null;
  repoUrl: string | null;
  repoNote?: string | null;
  extraLinks: readonly { label: string; url: string | null }[];
  embed: boolean;
  preview: { src: string; w: number; h: number } | null;
  accent: string;
};

const CATS = [
  ['all', 'All'],
  ['ai', 'AI / Agents'],
  ['ml', 'Machine learning'],
  ['fullstack', 'Full-stack'],
  ['frontend', 'Frontend / UI'],
] as const;

const STATUS: Record<string, { label: string; cls: string }> = {
  live: { label: 'Live', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  shipped: { label: 'Shipped', cls: 'border-white/15 bg-white/5 text-white/70' },
  wip: { label: 'In progress', cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
};

/** Free hosts that put apps to sleep when idle: don't auto-load them in cards, wake them on demand. */
export const isSleepy = (u?: string | null) => !!u && /(\.streamlit\.app|\.onrender\.com|\.hf\.space|\.herokuapp\.com)/i.test(u);

function host(u: string) {
  try {
    return new URL(u).host + new URL(u).pathname.replace(/\/$/, '');
  } catch {
    return u;
  }
}

/* ---------- a scaled, lazily loaded live website ---------- */
function LiveFrame({ url, host: shown, title, onOpen, poster }: { url: string; host?: string | null; title: string; onOpen: () => void; poster?: ProjectVM['preview'] }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const VW = 1440;
  const sleepy = isSleepy(shown || url);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / VW));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { rootMargin: '300px' });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0f1a] shadow-[0_40px_80px_-30px_rgba(59,130,246,.35)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-md bg-white/5 px-2.5 py-1 font-mono text-[11px] text-white/50">
          <span className="text-emerald-400">●</span> {host(shown || url)}
        </div>
      </div>
      <div ref={box} className="relative aspect-[16/10] w-full overflow-hidden bg-[#0b0f1a]">
        {poster && <Image src={poster.src} alt={`${title} screenshot`} fill sizes="(max-width:1024px) 92vw, 50vw" className="object-cover object-top" />}
        {sleepy && !poster && <Launcher title={title} />}
        {inView && !sleepy && (
          <iframe
            src={url}
            title={`${title}: live preview`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="pointer-events-none absolute left-0 top-0 origin-top-left border-0 bg-white transition-opacity duration-500"
            style={{ width: VW, height: VW / 1.6, transform: `scale(${scale})`, opacity: loaded ? 1 : 0 }}
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer"
          />
        )}
        {!loaded && !poster && !sleepy && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="font-mono text-xs text-white/40">
              <span className="caret">▌</span> loading {host(shown || url)}
            </div>
          </div>
        )}
        <button
          onClick={onOpen}
          className={`group absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity hover:opacity-100 focus-visible:opacity-100 ${sleepy ? 'opacity-100' : 'opacity-0'}`}
          aria-label={`Open the live ${title} site inside the portfolio`}
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 font-mono text-sm text-white shadow-lg transition group-hover:bg-[#2f6fe0]">
            <Icon name={sleepy ? 'play' : 'eye'} className="h-4 w-4" /> {sleepy ? 'launch live app' : 'interact with live site'}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ---------- instant stand-in for apps on sleepy hosts (no iframe until the visitor asks) ---------- */
function Launcher({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex bg-[#0b0f1a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_70%_30%,rgba(167,139,250,.18),transparent_70%),radial-gradient(50%_60%_at_20%_90%,rgba(59,130,246,.18),transparent_70%)]" />
      {/* skeleton sidebar */}
      <div className="relative hidden w-[26%] flex-col gap-2 border-r border-white/[0.06] p-[3%] sm:flex">
        <div className="mb-2 h-3 w-2/3 rounded bg-white/15" />
        {[80, 60, 72, 50, 66].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[#a78bfa]/40" />
            <span className="h-2 rounded bg-white/[0.08]" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
      {/* skeleton main */}
      <div className="relative flex flex-1 flex-col p-[4%]">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#a78bfa]">live app · streamlit</div>
        <div className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-2xl">{title}</div>
        <div className="mt-[4%] space-y-2">
          <div className="ml-auto h-7 w-[55%] rounded-xl rounded-br-sm bg-[#3b82f6]/30" />
          <div className="h-16 w-[80%] rounded-xl rounded-bl-sm border border-white/[0.07] bg-white/[0.04] p-2">
            <div className="h-2 w-[90%] rounded bg-white/10" />
            <div className="mt-1.5 h-2 w-[75%] rounded bg-white/10" />
            <div className="mt-2 flex gap-1.5">
              <span className="h-3 w-12 rounded-full bg-[#a78bfa]/30" />
              <span className="h-3 w-10 rounded-full bg-[#a78bfa]/30" />
            </div>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 font-mono text-[10px] text-white/45 sm:text-[11px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" /> free hosting naps when idle · wakes in ~30s
        </div>
      </div>
    </div>
  );
}

/* ---------- UI/UX projects without a public link: a stylised dashboard mock ---------- */
function DashboardVisual({ p }: { p: ProjectVM }) {
  const bars = [42, 68, 55, 80, 61, 92, 74];
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#070a12] shadow-[0_40px_80px_-30px_rgba(59,130,246,.45)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] text-white/40">{p.title.toLowerCase().replace(/\s+/g, '-')} · redesign</span>
      </div>
      <div className="relative grid aspect-[16/10] grid-cols-[22%_1fr] gap-3 p-3 sm:p-4">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full blur-3xl" style={{ background: `${p.accent}44` }} />
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.04] p-2 backdrop-blur">
          <div className="h-2.5 w-3/4 rounded bg-white/30" />
          {['Stand-ups', 'Interns', 'Verify', 'Analytics', 'Settings'].map((l, i) => (
            <div key={l} className={`rounded-md px-2 py-1.5 font-mono text-[9px] sm:text-[10px] ${i === 0 ? 'bg-[#3b82f6]/25 text-white shadow-[0_0_14px_-2px_#3b82f6]' : 'text-white/45'}`}>
              {l}
            </div>
          ))}
        </div>
        <div className="grid grid-rows-[auto_1fr_auto] gap-3">
          <div className="grid grid-cols-3 gap-2">
            {p.metrics.slice(0, 3).map((m) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-lg border border-white/10 bg-white/[0.05] p-2 backdrop-blur">
                <div className="text-base font-semibold sm:text-xl" style={{ color: p.accent }}>{m.value}</div>
                <div className="font-mono text-[8px] uppercase tracking-wider text-white/45 sm:text-[9px]">{m.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="flex items-end gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t"
                style={{ background: `linear-gradient(to top, ${p.accent}55, ${p.accent})`, boxShadow: `0 0 12px -2px ${p.accent}` }}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {['Today’s stand-up', 'Pending verifications'].map((l) => (
              <div key={l} className="flex-1 truncate rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 font-mono text-[9px] text-white/55">
                ✓ {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- visual for projects without a public site ---------- */
function CodeVisual({ p }: { p: ProjectVM }) {
  if (p.preview) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/10">
        <Image src={p.preview.src} alt={`${p.title} screenshot`} width={p.preview.w} height={p.preview.h} sizes="(max-width:1024px) 92vw, 50vw" className="w-full" />
      </div>
    );
  }
  const lines = [
    `$ git clone ${p.repoUrl ? host(p.repoUrl) : `${p.slug}.git`}`,
    `$ cd ${p.slug} && ${p.stack.some((s) => /python/i.test(s.name)) ? 'pip install -r requirements.txt' : 'npm install'}`,
    ...p.highlights.slice(0, 3).map((h) => `✓ ${h.length > 64 ? h.slice(0, 62) + '…' : h}`),
  ];
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#070a12] shadow-[0_40px_80px_-30px_rgba(59,130,246,.3)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 font-mono text-[11px] text-white/40">~/{p.slug}</span>
      </div>
      <div className="relative grid gap-6 p-5 sm:p-7">
        <div className="space-y-1.5 font-mono text-[12px] leading-relaxed sm:text-[13px]">
          {lines.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className={l.startsWith('✓') ? 'text-emerald-300/90' : 'text-white/70'}>
              {l}
            </motion.div>
          ))}
          <div className="text-white/70">
            $ <span className="caret text-[#3b82f6]">▌</span>
          </div>
        </div>
        {p.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {p.metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: p.accent }}>
                  {m.value}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/45">{m.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Links({ p, onOpen }: { p: ProjectVM; onOpen: () => void }) {
  return (
    <>
    <div className="flex flex-wrap gap-2">
      {p.liveUrl && p.embed && (
        <button onClick={onOpen} className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2f6fe0]">
          <Icon name="eye" className="h-4 w-4" /> Live preview
        </button>
      )}
      {p.liveUrl && (
        <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/40">
          <Icon name="external" className="h-4 w-4" /> Visit
        </a>
      )}
      {p.repoUrl && (
        <a href={p.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/40">
          <Icon name={p.repoUrl.includes('gitlab') || p.repoUrl.includes('swecha') ? 'gitlab' : 'github'} className="h-4 w-4" /> Code
        </a>
      )}
      {p.extraLinks.map(
        (l) =>
          l.url && (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white">
              <Icon name="link" className="h-4 w-4" /> {l.label}
            </a>
          )
      )}
    </div>
    {p.repoUrl && p.repoNote && (
      <p className="mt-3 flex gap-2 rounded-lg border border-amber-400/30 bg-amber-400/[0.07] px-3 py-2 text-xs leading-relaxed text-amber-100/85">
        <span className="mt-px shrink-0 font-mono text-amber-300">⚠</span>
        {p.repoNote}
      </p>
    )}
    </>
  );
}

function StackPills({ p, limit }: { p: ProjectVM; limit?: number }) {
  const list = limit ? p.stack.slice(0, limit) : p.stack;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((s) => (
        <span key={s.name} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-white/75">
          {s.icon && (
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill={`#${s.icon.hex}`} aria-hidden>
              <path d={s.icon.path} />
            </svg>
          )}
          {s.name}
        </span>
      ))}
      {limit && p.stack.length > limit && <span className="px-1 py-1 font-mono text-[11px] text-white/40">+{p.stack.length - limit}</span>}
    </div>
  );
}

function Featured({ p, i, onOpen }: { p: ProjectVM; i: number; onOpen: () => void }) {
  const flip = i % 2 === 1;
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`grid items-center gap-8 lg:gap-14 [&>*]:min-w-0 ${p.largePreview ? (flip ? 'lg:grid-cols-[1fr_1.7fr] lg:gap-12' : 'lg:grid-cols-[1.7fr_1fr] lg:gap-12') : 'lg:grid-cols-[1.25fr_1fr]'}`}
    >
      <div className={flip ? 'lg:order-2' : ''}>{p.liveUrl && p.embed ? <LiveFrame url={p.embedUrl || p.liveUrl} host={p.liveUrl} title={p.title} onOpen={onOpen} poster={p.preview} /> : !p.preview && p.category === 'frontend' ? <DashboardVisual p={p} /> : <CodeVisual p={p} />}</div>
      <div className={flip ? 'lg:order-1' : ''}>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="text-[#3b82f6]">0{i + 1}</span>
          <span className={`rounded-full border px-2 py-0.5 ${STATUS[p.status]?.cls}`}>{STATUS[p.status]?.label}</span>
          {p.team && <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-violet-200">Group project</span>}
          <span className="text-white/40">{p.period}</span>
        </div>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">{p.title}</h3>
        <p className="mt-2 text-lg text-[#9fc6ff]">{p.tagline}</p>
        <p className="mt-4 leading-relaxed text-white/60">{p.summary}</p>
        <ul className="mt-5 space-y-2">
          {p.highlights.slice(0, 4).map((h) => (
            <li key={h} className="flex gap-3 text-[15px] leading-snug text-white/75">
              <span className="mt-[9px] h-1 w-3 shrink-0 bg-[#3b82f6]" />
              {h}
            </li>
          ))}
        </ul>
        {p.metrics.length > 0 && p.liveUrl && (
          <div className="mt-5 flex flex-wrap gap-6">
            {p.metrics.map((m) => (
              <div key={m.label}>
                <div className="text-2xl font-semibold text-white">{m.value}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">{m.label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <StackPills p={p} />
        </div>
        <div className="mt-6 font-mono text-xs text-white/40">role · {p.role}</div>
        <div className="mt-5">
          <Links p={p} onOpen={onOpen} />
        </div>
      </div>
    </motion.article>
  );
}

function Card({ p, onOpen }: { p: ProjectVM; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty('--mx', `${e.clientX - r.left}px`);
        ref.current!.style.setProperty('--my', `${e.clientY - r.top}px`);
      }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-colors ${p.badge ? 'border-amber-400/50 bg-gradient-to-b from-amber-400/[0.08] to-white/[0.02] shadow-[0_0_60px_-25px_rgba(251,191,36,.7)] hover:border-amber-300' : 'border-white/10 bg-white/[0.02] hover:border-[#3b82f6]/50'}`}
    >
      {p.badge && (
        <>
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative -mx-6 -mt-6 mb-5 flex items-center gap-2 border-b border-amber-400/30 bg-gradient-to-r from-amber-400/25 via-amber-400/10 to-transparent px-6 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
            <span className="text-amber-300">★</span> {p.badge}
          </div>
        </>
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: 'radial-gradient(400px circle at var(--mx) var(--my), rgba(59,130,246,.12), transparent 60%)' }}
      />
      <div className="relative flex items-center justify-between gap-2 font-mono text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 ${STATUS[p.status]?.cls}`}>{STATUS[p.status]?.label}</span>
          {p.team && <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-violet-200">Group project</span>}
        </span>
        <span className="text-white/40">{p.period}</span>
      </div>
      <h3 className="relative mt-4 text-xl font-semibold tracking-tight text-white">{p.title}</h3>
      <p className="relative mt-1 text-sm text-[#9fc6ff]">{p.tagline}</p>
      {p.liveUrl && p.embed ? (
        <div className="relative mt-4">
          <LiveFrame url={p.embedUrl || p.liveUrl} host={p.liveUrl} title={p.title} onOpen={onOpen} poster={p.preview} />
        </div>
      ) : (
        p.metrics.length > 0 && (
          <div className="relative mt-5 flex gap-6">
            {p.metrics.slice(0, 3).map((m) => (
              <div key={m.label}>
                <div className="text-2xl font-semibold tracking-tight" style={{ color: p.accent }}>
                  {m.value}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">{m.label}</div>
              </div>
            ))}
          </div>
        )
      )}
      <p className="relative mt-4 line-clamp-4 text-sm leading-relaxed text-white/55">{p.summary}</p>
      <div className="relative mt-5">
        <StackPills p={p} limit={6} />
      </div>
      <div className="relative mt-auto pt-6">
        <Links p={p} onOpen={onOpen} />
      </div>
    </motion.article>
  );
}

/* ---------- full-screen live site viewer ---------- */
function Viewer({ p, onClose }: { p: ProjectVM; onClose: () => void }) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop');
  const [key, setKey] = useState(0);
  const [slow, setSlow] = useState(false);
  const [ready, setReady] = useState(false);
  const sleepy = isSleepy(p.liveUrl);
  useEffect(() => {
    const l = (window as any).__lenis;
    l?.stop();
    document.body.style.overflow = 'hidden';
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    if (innerWidth < 700) setDevice('phone');
    const t = setTimeout(() => setSlow(true), 6000);
    return () => {
      l?.start();
      document.body.style.overflow = '';
      removeEventListener('keydown', k);
      clearTimeout(t);
    };
  }, [onClose]);
  const w = device === 'desktop' ? '100%' : device === 'tablet' ? '820px' : '390px';
  return (
    <motion.div className="fixed inset-0 z-[160] flex flex-col bg-[#05060a]/95 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2.5 font-mono text-xs text-white sm:px-5">
        <span className="hidden text-white/50 sm:inline">{p.title}</span>
        <div className="mx-auto flex min-w-0 max-w-xl flex-1 items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-white/60">
          <span className="text-emerald-400">●</span>
          <span className="truncate">{p.liveUrl}</span>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-white/10 p-0.5">
          {(['desktop', 'tablet', 'phone'] as const).map((d) => (
            <button key={d} aria-label={d} onClick={() => setDevice(d)} className={`grid h-7 w-8 place-items-center rounded ${device === d ? 'bg-[#3b82f6] text-white' : 'text-white/50 hover:text-white'}`}>
              <Icon name={d} className="h-4 w-4" />
            </button>
          ))}
        </div>
        <button aria-label="Reload" onClick={() => setKey((k) => k + 1)} className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-white/60 hover:text-white">
          ↻
        </button>
        <a href={p.liveUrl!} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-white/70 hover:text-white">
          <Icon name="external" className="h-3.5 w-3.5" /> new tab
        </a>
        <button aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md bg-white/10 hover:bg-white/20">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 justify-center overflow-hidden p-2 sm:p-5">
        <motion.div layout className="relative h-full overflow-hidden rounded-lg border border-white/10 bg-white" style={{ width: w, maxWidth: '100%' }}>
          <iframe key={key} src={(p.embedUrl || p.liveUrl)!} title={`${p.title}: live site`} onLoad={() => setTimeout(() => setReady(true), sleepy ? 1500 : 0)} className="h-full w-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" />
          {sleepy && !ready && (
            <div className="absolute inset-0 grid place-items-center bg-[#05060a] font-mono text-white">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-[#3b82f6]" />
                <p className="mt-4 text-sm">waking up {p.title}…</p>
                <p className="mt-1 text-xs text-white/45">free Streamlit hosting naps when idle. usually 20–40 seconds.</p>
              </div>
            </div>
          )}
        </motion.div>
        {slow && (
          <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 font-mono text-[11px] text-white/60">
            {sleepy ? 'asleep? press the wake button, or use “new tab”' : 'blank? the site may block embedding. use “new tab”'}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Projects({ projects }: { projects: ProjectVM[] }) {
  const [cat, setCat] = useState<string>('all');
  const [open, setOpen] = useState<ProjectVM | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured && (cat === 'all' || p.category === cat)).sort((a, b) => Number(!!b.badge) - Number(!!a.badge));
  const counts = Object.fromEntries(CATS.map(([k]) => [k, projects.filter((p) => !p.featured && (k === 'all' || p.category === k)).length]));
  return (
    <>
      <div className="space-y-24 sm:space-y-32">
        {featured.map((p, i) => (
          <Featured key={p.slug} p={p} i={i} onOpen={() => setOpen(p)} />
        ))}
      </div>

      <div className="mt-28">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold tracking-tight text-white">More projects</h3>
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 font-mono text-xs sm:mx-0 sm:px-0">
            {CATS.map(([k, l]) =>
              counts[k] || k === 'all' ? (
                <button
                  key={k}
                  onClick={() => setCat(k)}
                  className={`shrink-0 rounded-md border px-3 py-1.5 transition ${cat === k ? 'border-[#3b82f6] bg-[#3b82f6]/15 text-white' : 'border-white/10 text-white/50 hover:text-white'}`}
                >
                  {l} <span className="text-white/30">{counts[k]}</span>
                </button>
              ) : null
            )}
          </div>
        </div>
        <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {rest.map((p) => (
              <Card key={p.slug} p={p} onOpen={() => setOpen(p)} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>{open && open.liveUrl && <Viewer p={open} onClose={close} />}</AnimatePresence>
    </>
  );
}

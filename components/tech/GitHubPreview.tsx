'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import { Icon } from '@/components/ui/Icons';
import type { Day, GHRepo, GHUser } from '@/lib/github';

const LANG: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  'Jupyter Notebook': '#DA5B0B',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#663399',
  Astro: '#ff5a03',
  React: '#61dafb',
};
const langColor = (l: string) => LANG[l] ?? LANG[l.split(/[\s·+/]/)[0]] ?? '#7cc4ff';

type Repo = { name: string; description: string | null; url: string; language: string | null };

/* ---------------- contribution grid: last 26 weeks, always fills the card ---------------- */
const LEVEL = ['rgba(255,255,255,.05)', '#0e3a7a', '#1d5fc4', '#3b82f6', '#8ec0ff'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ContribGrid({ days }: { days: Day[] }) {
  const { weeks, labels, total } = useMemo(() => {
    const last = new Date(days[days.length - 1].date + 'T00:00:00Z');
    const start = new Date(last);
    start.setUTCDate(start.getUTCDate() - 7 * 26 + 1);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // back to Sunday
    const by = new Map(days.map((d) => [d.date, d]));
    const weeks: (Day | null)[][] = [];
    for (let d = new Date(start); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
      if (d.getUTCDay() === 0) weeks.push([]);
      const key = d.toISOString().slice(0, 10);
      weeks[weeks.length - 1].push(by.get(key) ?? { date: key, count: 0, level: 0 });
    }
    const labels: { i: number; m: string }[] = [];
    weeks.forEach((w, i) => {
      const m = new Date(w[0]!.date + 'T00:00:00Z').getUTCMonth();
      const prev = i ? new Date(weeks[i - 1][0]!.date + 'T00:00:00Z').getUTCMonth() : -1;
      const gap = labels.length ? i - labels[labels.length - 1].i : 99;
      if (m !== prev && i < weeks.length - 2) {
        if (gap < 3) labels[labels.length - 1] = { i, m: MONTHS[m] };
        else labels.push({ i, m: MONTHS[m] });
      }
    });
    const total = weeks.flat().reduce((n, d) => n + (d?.count ?? 0), 0);
    return { weeks, labels, total };
  }, [days]);
  const cols = { gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` };
  return (
    <>
      <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-white/40">
        <span>contributions · last 6 months</span>
        <span className="text-white/60">
          <b className="text-white">{total}</b> total
        </span>
      </div>
      <div className="grid gap-[3px] font-mono text-[10px] text-white/40" style={cols}>
        {labels.map((l) => (
          <span key={l.i} className="whitespace-nowrap" style={{ gridColumn: `${l.i + 1} / span 3` }}>
            {l.m}
          </span>
        ))}
      </div>
      <div className="mt-1.5 grid grid-flow-col grid-rows-7 gap-[3px]" style={cols}>
        {weeks.flatMap((w, wi) =>
          Array.from({ length: 7 }, (_, di) => {
            const d = w[di];
            if (!d) return <span key={`${wi}-${di}`} />;
            return (
              <motion.span
                key={d.date}
                title={`${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}`}
                className="aspect-square rounded-[3px]"
                style={{ background: LEVEL[d.level], boxShadow: d.level >= 3 ? '0 0 8px rgba(59,130,246,.55)' : undefined, gridRow: di + 1 }}
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: wi * 0.018, duration: 0.3 }}
              />
            );
          })
        )}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 font-mono text-[10px] text-white/35">
        less
        {LEVEL.map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />
        ))}
        more
      </div>
    </>
  );
}

/* fallback when the data API is unreachable: the ghchart image, right half (last ~6 months) scaled to fill */
function ContribImage({ user, onFail }: { user: string; onFail: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [fit, setFit] = useState<{ s: number; w: number; h: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const el = img.current, b = box.current;
      if (!el || !b || !el.naturalWidth) return;
      const half = el.naturalWidth / 2;
      setFit({ s: b.clientWidth / half, w: el.naturalWidth, h: el.naturalHeight });
    };
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    // the image may have failed before React hydrated (onError never fires then)
    if (img.current?.complete && img.current.naturalWidth === 0) onFail();
    img.current?.complete && measure();
    img.current?.addEventListener('load', measure);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">contributions · last 6 months</div>
      <div ref={box} className="relative overflow-hidden" style={{ height: fit ? fit.h * fit.s : 110 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={img}
          src={`https://ghchart.rshah.org/3b82f6/${user}`}
          alt={`${user} GitHub contributions, last 6 months`}
          className="absolute left-0 top-0 block max-w-none origin-top-left [filter:invert(1)_hue-rotate(180deg)_brightness(1.1)] opacity-90"
          style={fit ? { width: fit.w, height: fit.h, transform: `scale(${fit.s}) translateX(-${fit.w / 2}px)` } : { visibility: 'hidden' }}
          onError={onFail}
        />
      </div>
    </>
  );
}

/* ---------------- LeetCode ---------------- */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const n = parseInt(value, 10);
  const suffix = Number.isFinite(n) ? value.slice(String(n).length) : '';
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView || !Number.isFinite(n)) return;
    const c = animate(0, n, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, n]);
  return <span ref={ref}>{Number.isFinite(n) ? `${v}${suffix}` : value}</span>;
}

function LeetCodeCard({ user, solved }: { user: string; solved: string }) {
  const ticks = Array.from({ length: 48 });
  return (
    <motion.a
      href={`https://leetcode.com/u/${user}/`}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070a12]/75 p-5 backdrop-blur-xl transition hover:border-[#ffa116]/60 sm:p-6"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#ffa116]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#ffcc4d]/[0.07] blur-3xl" />

      <div className="relative flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#ffa116]/30 to-[#ffa116]/5 text-[#ffa116] ring-1 ring-[#ffa116]/30">
          <Icon name="leetcode" className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-white">LeetCode</div>
          <div className="truncate font-mono text-xs text-white/45">@{user}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2cbb5d]/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#2cbb5d] ring-1 ring-[#2cbb5d]/30">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2cbb5d]" /> accepted
        </span>
      </div>

      {/* dial */}
      <div className="relative flex flex-1 items-center justify-center py-6">
      <div className="relative grid aspect-square w-full max-w-[250px] place-items-center">
        <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 60, ease: 'linear' }} aria-hidden>
          {ticks.map((_, i) => {
            const a = (i / ticks.length) * Math.PI * 2;
            const r1 = 96, r2 = i % 4 === 0 ? 88 : 92;
            return <line key={i} x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1} x2={100 + Math.cos(a) * r2} y2={100 + Math.sin(a) * r2} stroke="rgba(255,161,22,.35)" strokeWidth={i % 4 === 0 ? 1.6 : 0.8} />;
          })}
        </motion.svg>
        <svg viewBox="0 0 200 200" className="absolute inset-[9%] h-[82%] w-[82%] -rotate-90" aria-hidden>
          <defs>
            <linearGradient id="lc-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffcc4d" />
              <stop offset="1" stopColor="#ff7a00" />
            </linearGradient>
            <filter id="lc-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="12" />
          <motion.circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="url(#lc-g)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#lc-glow)"
            strokeDasharray={528}
            initial={{ strokeDashoffset: 528 }}
            whileInView={{ strokeDashoffset: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        {/* orbiting spark */}
        <motion.span className="absolute inset-[9%]" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }} aria-hidden>
          <span className="absolute left-1/2 top-[-3px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#ffe29a] shadow-[0_0_14px_4px_rgba(255,161,22,.7)]" />
        </motion.span>
        <div className="relative text-center">
          <div className="bg-gradient-to-b from-white to-[#ffd38a] bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-[3.25rem]">
            <CountUp value={solved} />
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">problems solved</div>
        </div>
      </div>
      </div>

      {/* tiny editor */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#0b0f1a] font-mono text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-1.5 text-white/35">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-2">daily-practice</span>
        </div>
        <pre className="px-3 py-2 text-white/70">
          <span className="text-[#c792ea]">while</span> (learning) {'{'}
          {'\n'}  solve(<span className="text-[#ffcb6b]">nextProblem</span>());
          {'\n'}  solved++;<span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-[#ffa116]" />
          {'\n'}
          {'}'}
        </pre>
      </div>

      <span className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-xs text-white transition group-hover:border-[#ffa116] group-hover:bg-[#ffa116] group-hover:text-black">
        view profile <Icon name="external" className="h-3.5 w-3.5" />
      </span>
    </motion.a>
  );
}

/* ---------------- section ---------------- */
export default function GitHubPreview({
  user,
  profile,
  repos,
  pinned = [],
  days,
  fallbackRepos,
  leetcode,
}: {
  user: string;
  profile: GHUser | null;
  repos: GHRepo[];
  pinned?: Repo[];
  days: Day[] | null;
  fallbackRepos: { name: string; description: string; url: string }[];
  leetcode: { user: string; solved: string } | null;
}) {
  const [chartOk, setChartOk] = useState(true);
  const url = profile?.url ?? `https://github.com/${user}`;
  const list: Repo[] = pinned.length ? pinned : repos.length ? repos : fallbackRepos.map((r) => ({ ...r, language: null }));
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      {/* GitHub card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070a12]/75 p-5 backdrop-blur-xl sm:p-6"
      >
        <a href={url} target="_blank" rel="noreferrer" className="group flex flex-wrap items-center gap-4">
          {profile?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt="" className="h-14 w-14 rounded-full border border-white/15" />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-white/5 text-white">
              <Icon name="github" className="h-7 w-7" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 text-lg font-semibold text-white">
              {profile?.name || 'Sathwik Naag'}
              <span className="font-mono text-sm font-normal text-white/40">@{profile?.login || user}</span>
            </div>
            {profile?.bio && <p className="truncate text-sm text-white/55">{profile.bio}</p>}
          </div>
          <span className="hidden items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-xs text-white transition group-hover:border-[#3b82f6] group-hover:bg-[#3b82f6] sm:inline-flex">
            view profile <Icon name="external" className="h-3.5 w-3.5" />
          </span>
        </a>

        {/* contributions */}
        {(days || chartOk) && (
          <a href={url} target="_blank" rel="noreferrer" className="mt-5 block rounded-xl border border-white/[0.07] bg-[#0b0f1a] p-3 transition hover:border-[#3b82f6]/40 sm:p-4">
            {days ? <ContribGrid days={days} /> : <ContribImage user={user} onFail={() => setChartOk(false)} />}
          </a>
        )}

        {/* repos */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.slice(0, 4).map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="group/repo relative rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 transition hover:-translate-y-0.5 hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/[0.06]"
            >
              <div className="flex items-center gap-2 font-mono text-sm text-[#9fc6ff]">
                <Icon name="github" className="h-3.5 w-3.5 shrink-0 text-white/50" />
                <span className="truncate">{r.name}</span>
                <Icon name="external" className="ml-auto h-3.5 w-3.5 shrink-0 text-white/30 transition group-hover/repo:text-[#9fc6ff]" />
              </div>
              {r.description && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55">{r.description}</p>}
              {r.language && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-white/45">
                  <span className="h-2 w-2 rounded-full" style={{ background: langColor(r.language) }} />
                  {r.language}
                </div>
              )}
            </a>
          ))}
        </div>
      </motion.div>

      {leetcode && <LeetCodeCard user={leetcode.user} solved={leetcode.solved} />}
    </div>
  );
}

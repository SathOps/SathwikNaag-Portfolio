'use client';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Group, Media } from '@/lib/content';
import Piece from './Piece';
import { useLightbox } from './Lightbox';
import { Icon } from '@/components/ui/Icons';

export default function GroupView({ g, layout, compact = false, single = false }: { g: Group; layout: string; compact?: boolean; single?: boolean }) {
  switch (g.kind) {
    case 'row':
      return <Row items={g.items} layout={layout} />;
    case 'line':
      return <PosterLine items={g.items} />;
    case 'process':
      return <Process items={g.items} />;
    case 'cinema':
      return <Cinema items={g.items} />;
    case 'carousel':
      return <Carousel items={g.items} layout={layout} />;
    case 'marquee':
      return <Marquee items={g.items} layout={layout} />;
    case 'flipbook':
      return <Flipbook items={g.items} single={single} />;
    case 'compare':
      return <Compare items={g.items} />;
    case 'stack':
      return <Stack items={g.items} layout={layout} />;
    default:
      if (g.items.length && g.items.every((m) => m.video) && g.items.every((m) => m.h > m.w)) return <PhoneRow items={g.items} />;
      // two or three pieces read better side by side at one shared height
      if (g.items.length >= 2 && g.items.length <= 3 && !single) return <Row items={g.items} layout={layout} />;
      return <Masonry items={g.items} layout={layout} compact={compact} />;
  }
}

/* ---------------- vertical videos in phone frames ---------------- */
function PhoneRow({ items }: { items: Media[] }) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-10">
      {items.map((m, i) => (
        <div key={m.src} className="flex flex-col items-center">
          <div
            className="relative rounded-[34px] border-[10px] border-[#111] bg-[#111] shadow-[0_30px_60px_-20px_rgba(0,0,0,.55)]"
            style={{ height: 'min(68vh, 580px)', aspectRatio: `${m.w} / ${m.h}` }}
          >
            <span className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-[#111]" />
            <Piece m={m} list={items} index={i} fit="cover" caption={false} className="h-full overflow-hidden rounded-[24px]" />
          </div>
          {m.caption && <p className="mt-3 text-sm opacity-75">{m.caption}</p>}
        </div>
      ))}
    </div>
  );
}

/* ---------------- masonry (balanced columns, aspect preserved) ---------------- */
function useCols(ref: React.RefObject<HTMLDivElement | null>, initial = 3) {
  const [cols, setCols] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      setCols(w < 420 ? 1 : w < 720 ? 2 : w < 1100 ? 3 : 4);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return cols;
}

export function Masonry({ items, layout, compact }: { items: Media[]; layout: string; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const colsRaw = useCols(ref, 3);
  const hero = items.length >= 3 && (items[0].span === 'tall' || items[0].span === 'big');
  const cols = Math.min(colsRaw, Math.max(1, items.length - (hero ? 1 : 0)), compact ? 3 : 4);
  const rest = hero ? items.slice(1) : items;
  const columns = useMemo(() => {
    const c: { m: Media; i: number }[][] = Array.from({ length: hero && colsRaw > 2 ? Math.max(1, Math.min(2, cols)) : cols }, () => []);
    const hts = c.map(() => 0);
    rest.forEach((m, idx) => {
      const k = hts.indexOf(Math.min(...hts));
      const ar = m.h / m.w;
      c[k].push({ m, i: idx + (hero ? 1 : 0) });
      hts[k] += ar + 0.12;
    });
    return c;
  }, [rest, cols, hero, colsRaw]);
  const tilt = layout === 'wedding' || layout === 'comic';

  return (
    <div ref={ref} className={hero && colsRaw > 2 ? 'grid grid-cols-[minmax(0,1.05fr)_minmax(0,1.3fr)] gap-5 lg:gap-7' : ''}>
      {hero && (
        <Piece
          m={items[0]}
          list={items}
          index={0}
          fit="contain"
          sizes="(max-width: 768px) 92vw, 42vw"
          className={`${colsRaw > 2 ? '' : 'mb-5'} ${tilt ? '-rotate-1' : ''}`}
        />
      )}
      <div className="flex gap-4 lg:gap-6">
        {columns.map((col, ci) => (
          <div key={ci} className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-6">
            {col.map(({ m, i }) => (
              <Piece
                key={m.src}
                m={m}
                list={items}
                index={i}
                fit="contain"
                sizes={`(max-width: 768px) ${Math.round(92 / Math.max(1, cols))}vw, ${Math.round(70 / cols)}vw`}
                className={tilt ? (i % 2 ? 'rotate-[0.8deg]' : '-rotate-[0.6deg]') : ''}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- carousel ---------------- */
function Carousel({ items, layout }: { items: Media[]; layout: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const scroll = (d: number) => track.current?.scrollBy({ left: d * track.current.clientWidth * 0.8, behavior: 'smooth' });
  const onScroll = () => {
    const t = track.current;
    if (!t) return;
    setAtStart(t.scrollLeft < 8);
    setAtEnd(t.scrollLeft + t.clientWidth > t.scrollWidth - 8);
  };
  // drag to scroll on desktop
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let down = false,
      sx = 0,
      sl = 0,
      moved = 0;
    const d = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      sx = e.clientX;
      sl = t.scrollLeft;
      moved = 0;
    };
    const m = (e: PointerEvent) => {
      if (!down) return;
      moved = Math.abs(e.clientX - sx);
      t.scrollLeft = sl - (e.clientX - sx);
    };
    const u = () => (down = false);
    const c = (e: MouseEvent) => {
      if (moved > 6) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    t.addEventListener('pointerdown', d);
    addEventListener('pointermove', m);
    addEventListener('pointerup', u);
    t.addEventListener('click', c, true);
    onScroll();
    return () => {
      t.removeEventListener('pointerdown', d);
      removeEventListener('pointermove', m);
      removeEventListener('pointerup', u);
      t.removeEventListener('click', c, true);
    };
  }, []);
  const h = layout === 'sports' || layout === 'festival' ? 'h-[300px] sm:h-[440px]' : 'h-[280px] sm:h-[400px]';
  return (
    <div className="relative">
      <div ref={track} onScroll={onScroll} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:px-0" data-lenis-prevent-wheel>
        {items.map((m, i) => (
          <div key={m.src} className={`${h} shrink-0 snap-start`} style={{ aspectRatio: `${m.w} / ${m.h}` }}>
            <Piece m={m} list={items} index={i} fit="cover" sizes="(max-width: 768px) 70vw, 30vw" caption={false} className="h-full" />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="truncate text-xs opacity-60">{items.length} pieces · drag or swipe</p>
        <div className="flex gap-2">
          <button aria-label="Scroll left" disabled={atStart} onClick={() => scroll(-1)} className="f-chip grid h-10 w-10 place-items-center rounded-full disabled:opacity-30">
            <Icon name="chevronLeft" className="h-5 w-5" />
          </button>
          <button aria-label="Scroll right" disabled={atEnd} onClick={() => scroll(1)} className="f-chip grid h-10 w-10 place-items-center rounded-full disabled:opacity-30">
            <Icon name="chevronRight" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- marquee ---------------- */
function Marquee({ items, layout }: { items: Media[]; layout: string }) {
  const { open } = useLightbox();
  const transparent = items.every((m) => Math.abs(m.w / m.h - 1) < 0.6) && layout === 'comic';
  const h = transparent ? 120 : 300;
  const loop = [...items, ...items];
  return (
    <div className="marquee relative -mx-4 overflow-hidden py-2 sm:-mx-10" style={{ maskImage: 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)' }}>
      <div className="marquee-track flex w-max gap-5" style={{ ['--dur' as any]: `${Math.max(25, items.length * 6)}s` }}>
        {loop.map((m, i) => (
          <button
            key={i}
            onClick={() => open(items, i % items.length)}
            className={`relative shrink-0 transition-transform hover:-translate-y-1 hover:rotate-2 ${transparent ? '' : 'f-piece overflow-hidden rounded-xl'}`}
            style={{ height: h, aspectRatio: `${m.w} / ${m.h}` }}
            aria-label={m.caption || 'Open'}
            data-cursor
          >
            <Image src={m.src} alt={m.caption || ''} fill sizes="240px" className={transparent ? 'object-contain drop-shadow-[3px_3px_0_rgba(0,0,0,.5)]' : 'object-cover'} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- flipbook ---------------- */
function Flipbook({ items, single = false }: { items: Media[]; single?: boolean }) {
  const { open } = useLightbox();
  const [wide, setWide] = useState(!single);
  useEffect(() => {
    const f = () => setWide(!single && innerWidth >= 768);
    f();
    addEventListener('resize', f);
    return () => removeEventListener('resize', f);
  }, [single]);
  // spreads: [cover], [1,2], [3,4] ...
  const spreads = useMemo(() => {
    if (!wide) return items.map((_, i) => [i]);
    const s: number[][] = [[0]];
    for (let i = 1; i < items.length; i += 2) s.push(items[i + 1] ? [i, i + 1] : [i]);
    return s;
  }, [items, wide]);
  const [k, setK] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    setDir(d);
    setK((v) => Math.max(0, Math.min(spreads.length - 1, v + d)));
  };
  const ar = items[0].w / items[0].h;
  const cur = spreads[Math.min(k, spreads.length - 1)];
  return (
    <div>
      <div className="relative mx-auto flex justify-center" style={{ perspective: 2200 }}>
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={cur.join('-')}
            custom={dir}
            className="flex justify-center"
            initial={{ rotateY: dir > 0 ? 70 : -70, opacity: 0, x: dir > 0 ? 60 : -60 }}
            animate={{ rotateY: 0, opacity: 1, x: 0 }}
            exit={{ rotateY: dir > 0 ? -70 : 70, opacity: 0, x: dir > 0 ? -60 : 60 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: dir > 0 ? 'left center' : 'right center', transformStyle: 'preserve-3d' }}
          >
            {cur.map((idx, j) => (
              <button
                key={idx}
                onClick={() => open(items, idx)}
                className="relative overflow-hidden bg-white shadow-[0_30px_60px_-25px_rgba(0,0,0,.7)]"
                style={{
                  height: single ? 'min(66vh, 520px)' : 'min(70vh, 560px)',
                  maxWidth: single ? '100%' : undefined,
                  aspectRatio: `${ar}`,
                  borderRadius: cur.length === 2 ? (j === 0 ? '8px 0 0 8px' : '0 8px 8px 0') : '8px',
                }}
                data-cursor
                aria-label={`Open page ${idx + 1}`}
              >
                <Image src={items[idx].src} alt={`Page ${idx + 1}`} fill sizes={single ? '(max-width:1024px) 90vw, 30vw' : '(max-width:768px) 90vw, 40vw'} className="object-cover" />
                {cur.length === 2 && (
                  <span
                    className="pointer-events-none absolute inset-y-0 w-10"
                    style={{
                      [j === 0 ? 'right' : 'left']: 0,
                      background: `linear-gradient(${j === 0 ? 'to left' : 'to right'}, rgba(0,0,0,.25), transparent)`,
                    }}
                  />
                )}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-center justify-center gap-4">
        <button aria-label="Previous page" onClick={() => go(-1)} disabled={k === 0} className="f-chip grid h-11 w-11 place-items-center rounded-full disabled:opacity-30">
          <Icon name="chevronLeft" className="h-5 w-5" />
        </button>
        <span className="min-w-[90px] text-center font-mono text-xs opacity-70">
          {cur.map((c) => c + 1).join('–')} / {items.length}
        </span>
        <button aria-label="Next page" onClick={() => go(1)} disabled={k >= spreads.length - 1} className="f-chip grid h-11 w-11 place-items-center rounded-full disabled:opacity-30">
          <Icon name="chevronRight" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- compare: drafts → final ---------------- */
function Compare({ items }: { items: Media[] }) {
  const final = items[items.length - 1];
  const drafts = items.slice(0, -1);
  const [sel, setSel] = useState(0);
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const drag = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr]">
      <div
        ref={box}
        className="relative mx-auto touch-none select-none overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{ height: 'min(72vh, 600px)', aspectRatio: `${final.w} / ${final.h}` }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          drag(e.clientX);
        }}
        onPointerMove={(e) => e.buttons && drag(e.clientX)}
        data-cursor
      >
        <Image src={final.src} alt="Final" fill sizes="(max-width:1024px) 92vw, 760px" quality={90} className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={drafts[sel].src} alt={`Draft ${sel + 1}`} fill sizes="(max-width:1024px) 92vw, 760px" quality={90} className="object-cover" />
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.4)]" style={{ left: `${pos}%` }}>
          <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-lg">
            ⇆
          </div>
        </div>
        <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[11px] text-white">draft {sel + 1}</span>
        <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[11px] text-white">final</span>
      </div>
      <div>
        <p className="mb-3 text-sm opacity-75">Drag across the jersey to compare. Pick a draft:</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4">
          {drafts.map((d, i) => (
            <button
              key={d.src}
              onClick={() => setSel(i)}
              className={`relative overflow-hidden rounded-md bg-white transition ${sel === i ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]' : 'opacity-60 hover:opacity-100'}`}
              style={{ aspectRatio: `${d.w} / ${d.h}` }}
              aria-label={`Draft ${i + 1}`}
            >
              <Image src={d.src} alt="" fill sizes="160px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- stack (fanned cards / lanyards) ---------------- */
function Stack({ items, layout }: { items: Media[]; layout: string }) {
  const { open } = useLightbox();
  const [hover, setHover] = useState(false);
  const lanyard = layout === 'lanyard';
  const n = items.length;
  const cardH = lanyard ? 'clamp(220px, 34vw, 380px)' : 'clamp(240px, 36vw, 420px)';
  return (
    <div
      className={`relative flex items-center justify-center ${lanyard ? 'h-[clamp(380px,52vw,620px)] overflow-hidden pt-16' : 'h-[clamp(320px,48vw,560px)]'}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {items.map((m, i) => {
        const mid = (n - 1) / 2;
        const off = i - mid;
        const spread = hover ? 1 : 0.42;
        return (
          <motion.button
            key={m.src}
            onClick={() => open(items, i)}
            className="absolute origin-top"
            style={{ height: cardH, aspectRatio: `${m.w} / ${m.h}`, zIndex: 10 + i }}
            animate={{
              x: `${off * 62 * spread}%`,
              rotate: off * (hover ? 4 : 7),
              y: hover ? Math.abs(off) * 10 : Math.abs(off) * 14,
            }}
            whileHover={{ y: -18, rotate: 0, zIndex: 50, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            data-cursor
            aria-label={m.caption || `Open card ${i + 1}`}
          >
            {lanyard && (
              <span className="absolute -top-[300px] left-1/2 h-[300px] w-3 -translate-x-1/2 bg-[var(--accent)]/80" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.2)' }} />
            )}
            {lanyard && <span className="absolute -top-3 left-1/2 z-10 h-6 w-9 -translate-x-1/2 rounded-md border-2 border-white/60 bg-zinc-300 shadow" />}
            <span className="f-piece relative block h-full w-full overflow-hidden">
              <Image src={m.src} alt={m.caption || ''} fill sizes="30vw" className="object-cover" />
            </span>
            {m.caption && <span className="absolute -bottom-7 left-0 right-0 truncate text-center text-xs opacity-70">{m.caption}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---------------- row: one justified line, every piece the same height ---------------- */
function Row({ items, layout }: { items: Media[]; layout: string }) {
  const tilt = layout === 'wedding' || layout === 'comic';
  return (
    <div className="flex flex-wrap gap-4 lg:gap-6">
      {items.map((m, i) => {
        const ar = m.w / m.h;
        return (
          <div key={m.src} className="min-w-0" style={{ flex: `${ar} 1 ${Math.round(ar * 170)}px` }}>
            <Piece m={m} list={items} index={i} fit="cover" sizes="(max-width:768px) 46vw, 26vw" className={tilt ? (i % 2 ? 'rotate-[0.8deg]' : '-rotate-[0.6deg]') : ''} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- poster line: pieces pegged to a sagging string of festival lights ----------------
   The tallest piece hangs in the middle; the string is drawn through the real peg positions. */
function PosterLine({ items }: { items: Media[] }) {
  const { open } = useLightbox();
  const order = useMemo(() => {
    const list = items.map((m, i) => ({ m, i }));
    const k = list.findIndex((x) => x.m.span === 'tall' || x.m.span === 'big');
    if (k < 0) return list;
    const [hero] = list.splice(k, 1);
    list.splice(Math.floor((list.length) / 2), 0, hero);
    return list;
  }, [items]);
  const content = useRef<HTMLDivElement>(null);
  const pins = useRef<(HTMLSpanElement | null)[]>([]);
  const [line, setLine] = useState<{ d: string; bulbs: { x: number; y: number }[]; w: number; h: number } | null>(null);
  useEffect(() => {
    const el = content.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const pts = pins.current.filter(Boolean).map((p) => {
        const b = p!.getBoundingClientRect();
        return { x: b.left + b.width / 2 - r.left, y: b.top + 4 - r.top };
      });
      if (!pts.length) return;
      const all = [{ x: 0, y: 6 }, ...pts, { x: r.width, y: 6 }];
      let d = `M${all[0].x},${all[0].y}`;
      const bulbs: { x: number; y: number }[] = [];
      for (let i = 0; i < all.length - 1; i++) {
        const a = all[i], b = all[i + 1];
        const c = { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + 22 };
        d += ` Q${c.x},${c.y} ${b.x},${b.y}`;
        for (const t of [0.25, 0.5, 0.75]) {
          const u = 1 - t;
          bulbs.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y });
        }
      }
      setLine({ d, bulbs, w: r.width, h: r.height });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const t = setTimeout(measure, 400);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [order]);
  const n = order.length;
  const tilts = [-3, 2, -2, 3, -1.5, 2.5];
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div ref={content} className="relative mx-auto flex w-max min-w-full items-start justify-center gap-5 px-4 pb-6 pt-4 sm:gap-8">
        {line && (
          <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width={line.w} height={line.h} aria-hidden>
            <path d={line.d} fill="none" stroke="color-mix(in oklab, var(--ink) 55%, transparent)" strokeWidth="2" />
            {line.bulbs.map((b, i) => (
              <g key={i} className="fest-bulb" style={{ animationDelay: `${(i % 5) * 0.35}s` }}>
                <rect x={b.x - 2.5} y={b.y - 1} width="5" height="5" rx="1" fill="#2a2a2a" />
                <ellipse cx={b.x} cy={b.y + 9} rx="5" ry="7" fill={i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? '#fff3c4' : 'var(--accent2)'} />
              </g>
            ))}
          </svg>
        )}
        {order.map(({ m, i }, k) => {
          const hero = m.span === 'tall' || m.span === 'big';
          const sag = Math.round(Math.sin((Math.PI * (k + 0.5)) / n) * 26);
          const h = hero ? 'clamp(280px, 30vw, 520px)' : 'clamp(220px, 23vw, 380px)';
          return (
            <motion.div
              key={m.src}
              className="relative flex shrink-0 flex-col items-center"
              style={{ marginTop: 18 + sag, transformOrigin: '50% 0%' }}
              initial={{ rotate: tilts[k % tilts.length] }}
              animate={{ rotate: [tilts[k % tilts.length], tilts[k % tilts.length] * 0.4, tilts[k % tilts.length]] }}
              transition={{ repeat: Infinity, duration: 4 + k * 0.6, ease: 'easeInOut' }}
              whileHover={{ rotate: 0, y: -8, scale: 1.03, zIndex: 10 }}
            >
              {/* wooden peg */}
              <span ref={(el) => { pins.current[k] = el; }} className="relative z-10 -mb-3 block h-7 w-3.5 rounded-[3px] bg-gradient-to-b from-[#d9b27a] to-[#9c7445] shadow-[0_2px_4px_rgba(0,0,0,.5)]" />
              <button onClick={() => open(items, i)} className="f-piece group relative block overflow-hidden" style={{ height: h, aspectRatio: `${m.w} / ${m.h}` }} data-cursor aria-label={m.caption || `Open piece ${i + 1}`}>
                <Image src={m.src} alt={m.caption} fill sizes={hero ? '(max-width:768px) 70vw, 32vw' : '(max-width:768px) 55vw, 24vw'} className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </button>
              {m.caption && <p className="mt-3 max-w-[90%] text-center text-sm opacity-80">{m.caption}</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- process: design → print → in hand ----------------
   Each item's caption is "Step: detail". Items sharing a step name are shown together in that step. */
function Process({ items }: { items: Media[] }) {
  const { open } = useLightbox();
  const steps = useMemo(() => {
    const out: { name: string; list: { m: Media; i: number; detail: string }[] }[] = [];
    items.forEach((m, i) => {
      const [a, ...b] = (m.caption || `Step ${i + 1}`).split(':');
      const name = a.trim();
      const detail = b.join(':').trim();
      const last = out[out.length - 1];
      if (last && last.name.toLowerCase() === name.toLowerCase()) last.list.push({ m, i, detail });
      else out.push({ name, list: [{ m, i, detail }] });
    });
    return out;
  }, [items]);
  const [act, setAct] = useState(0);
  const weights = steps.map((s) => s.list.reduce((n, x) => n + x.m.w / x.m.h, 0));
  return (
    <div>
      {/* the route: big step tabs joined by an ink line that fills as you move along */}
      <div className="relative mb-6 grid gap-2" style={{ gridTemplateColumns: weights.map((w) => `minmax(0,${w.toFixed(3)}fr)`).join(' ') }}>
        <span className="absolute left-[8%] right-[8%] top-6 h-[3px] rounded bg-current opacity-15" />
        <motion.span
          className="absolute left-[8%] top-6 h-[3px] rounded"
          style={{ background: 'var(--accent)' }}
          animate={{ width: `${(act / Math.max(1, steps.length - 1)) * 84}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        {steps.map((s, k) => (
          <button key={s.name} onMouseEnter={() => setAct(k)} onFocus={() => setAct(k)} onClick={() => setAct(k)} className="relative flex flex-col items-center text-center">
            <span
              className="grid h-12 w-12 place-items-center rounded-full border-[3px] font-mono text-base font-bold transition-colors"
              style={{ borderColor: k <= act ? 'var(--accent)' : 'color-mix(in oklab, var(--ink) 30%, transparent)', background: k <= act ? 'var(--accent)' : 'var(--bg)', color: k <= act ? 'var(--bg)' : 'var(--ink)' }}
            >
              {String(k + 1).padStart(2, '0')}
            </span>
            <span className="mt-2 text-sm font-bold uppercase tracking-[0.18em] sm:text-base">{s.name}</span>
          </button>
        ))}
      </div>

      {/* the pieces: on wide screens every step shares one exact height (container-query maths) */}
      <div
        className="flex flex-col gap-4 md:flex-row md:items-center md:gap-0"
        style={{
          containerType: 'inline-size',
          ['--ph' as any]: `calc((100cqw - ${(steps.length - 1) * 48 + steps.length * 18 + steps.reduce((n, s) => n + (s.list.length - 1) * 8, 0)}px) / ${weights.reduce((a, b) => a + b, 0).toFixed(4)})`,
        }}
      >
        {steps.map((s, k) => (
          <div key={s.name} className="flex min-w-0 flex-col md:flex-none md:flex-row md:items-center" onMouseEnter={() => setAct(k)}>
            <motion.div
              className="relative min-w-0 rounded-2xl p-[8px] transition-colors"
              animate={{ opacity: act === k ? 1 : 0.72 }}
              transition={{ duration: 0.35 }}
              style={{ outline: act === k ? '2px solid var(--accent)' : '1px solid color-mix(in oklab, var(--ink) 15%, transparent)' }}
            >
              <span className="absolute -top-3 left-4 z-10 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold" style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                STEP {k + 1}
              </span>
              <div className="flex justify-center gap-2">
                {s.list.map(({ m, i, detail }) => (
                  <button
                    key={m.src}
                    onClick={() => open(items, i)}
                    className="group relative min-w-0 flex-[var(--f)] overflow-hidden rounded-xl md:h-[var(--ph)] md:flex-none"
                    style={{ ['--f' as any]: `${m.w / m.h} 1 0`, aspectRatio: `${m.w} / ${m.h}`, maxWidth: `calc(56svh * ${(m.w / m.h).toFixed(3)})` }}
                    data-cursor
                    aria-label={m.caption}
                  >
                    <Image src={m.src} alt={m.caption} fill sizes="(max-width:768px) 90vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    {detail && <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">{detail}</span>}
                  </button>
                ))}
              </div>
            </motion.div>
            {k < steps.length - 1 && (
              <div className="flex shrink-0 items-center justify-center py-1 md:w-12 md:py-0" aria-hidden>
                <motion.svg viewBox="0 0 40 24" className="h-6 w-10 rotate-90 md:rotate-0" animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
                  <path d="M2 12h30M24 4l9 8-9 8" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- cinema: featured poster + a now-showing board ---------------- */
function Cinema({ items }: { items: Media[] }) {
  const { open } = useLightbox();
  const [k, setK] = useState(0);
  const cur = items[k];
  const split = (c: string) => {
    const [a, ...b] = (c || '').split(':');
    return { title: a.trim(), sub: b.join(':').trim() };
  };
  const t = split(cur.caption);
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
      <button onClick={() => open(items, k)} className="group relative mx-auto block" style={{ height: 'min(78vh, 700px)', maxWidth: '100%', aspectRatio: `${cur.w} / ${cur.h}` }} data-cursor aria-label={`Open ${cur.caption}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={cur.src} className="f-piece absolute inset-0 block overflow-hidden" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Image src={cur.src} alt={cur.caption} fill sizes="(max-width:1024px) 90vw, 40vw" className="object-cover" priority />
          </motion.span>
        </AnimatePresence>
      </button>

      <div className="relative min-w-0">
        {/* marquee board */}
        <div className="cine-board relative rounded-2xl border-2 p-5 sm:p-7" style={{ borderColor: 'var(--accent2)' }}>
          <div className="cine-bulbs pointer-events-none absolute inset-1.5 rounded-xl" aria-hidden />
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.4em]" style={{ color: 'var(--accent2)' }}>
            ★ Now showing ★
          </p>
          <AnimatePresence mode="wait">
            <motion.div key={cur.src} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.3 }} className="mt-3 text-center">
              <h4 className="f-title text-[clamp(2.2rem,5vw,4.2rem)] leading-none">{t.title}</h4>
              {t.sub && <p className="mt-2 text-sm uppercase tracking-[0.25em] opacity-70">{t.sub}</p>}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ticket stubs: pick a show */}
        <p className="mb-3 mt-7 font-mono text-[11px] uppercase tracking-[0.3em] opacity-60">Pick a show · {items.length} on the reel</p>
        <div className="grid gap-3">
          {items.map((m, i) => {
            const s = split(m.caption);
            const on = i === k;
            return (
              <button
                key={m.src}
                onClick={() => setK(i)}
                onMouseEnter={() => setK(i)}
                className="cine-ticket group relative flex items-center gap-4 overflow-hidden rounded-xl p-2.5 pr-5 text-left transition-transform hover:translate-x-1"
                style={{ background: on ? 'var(--accent)' : 'color-mix(in oklab, var(--ink) 8%, transparent)', color: on ? '#fff' : 'var(--ink)' }}
                aria-pressed={on}
              >
                <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md">
                  <Image src={m.src} alt="" fill sizes="96px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold sm:text-lg">{s.title}</span>
                  <span className="block truncate text-xs uppercase tracking-[0.18em] opacity-75">{s.sub || 'Poster'}</span>
                </span>
                <span className="hidden shrink-0 border-l-2 border-dashed border-current/40 pl-4 text-right font-mono text-[10px] uppercase leading-tight opacity-80 sm:block">
                  Admit one
                  <br />
                  Row {String.fromCharCode(65 + i)} · Seat {String(7 + i * 3).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

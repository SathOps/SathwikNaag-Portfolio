'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export type DeckCover = { slug: string; name: string; src: string; color: string; w: number; h: number };

/* where each card sits in the pile (0 = front). Cards keep their real ratio: only the height is fixed. */
const SPOTS = [
  { x: 0, y: 0, r: -3, s: 1 },
  { x: 16, y: -4, r: 6, s: 0.93 },
  { x: -15, y: -7, r: -9, s: 0.87 },
  { x: 27, y: -10, r: 12, s: 0.8 },
];
const HIDDEN = { x: 0, y: -12, r: 0, s: 0.75 };

/** black or white text, whichever reads better on the folder's accent colour */
function ink(hex: string) {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return '#111';
  const [r, g, b] = m.slice(1).map((v) => parseInt(v, 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5 ? '#111' : '#fff';
}

/**
 * A comic "issue" deck: every folder cover, uncropped, shuffled on a pile.
 * The front issue flies off every few seconds; hover pauses; the numbers below jump to any issue.
 */
export default function CoverDeck({ covers }: { covers: DeckCover[] }) {
  const [order, setOrder] = useState(() => covers.map((_, i) => i));
  const [leaving, setLeaving] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [entered, setEntered] = useState(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setEntered(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (paused || leaving !== null || reduce.current || !entered || covers.length < 2) return;
    const t = setTimeout(() => setLeaving(order[0]), 2600);
    return () => clearTimeout(t);
  }, [paused, leaving, order, entered, covers.length]);

  const finishLeave = () => {
    setOrder((o) => [...o.slice(1), o[0]]);
    setLeaving(null);
  };
  const jump = (i: number) => {
    if (leaving !== null) return;
    setOrder((o) => {
      const k = o.indexOf(i);
      return [...o.slice(k), ...o.slice(0, k)];
    });
  };

  const front = order[0];
  const current = leaving !== null ? order[1] : front;

  return (
    <div className="absolute inset-0" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {covers.map((c, i) => {
        const raw = order.indexOf(i);
        const pos = leaving !== null && i !== leaving ? raw - 1 : raw;
        const isLeaving = i === leaving;
        const spot = SPOTS[pos] ?? HIDDEN;
        const visible = pos < SPOTS.length;
        const isFront = pos === 0 && !isLeaving;
        return (
          <div key={c.slug} className="pointer-events-none absolute inset-x-0 top-0 bottom-[12%] flex items-center justify-center" style={{ zIndex: isLeaving ? 60 : 50 - pos }}>
            <motion.a
              href={`#${c.slug}`}
              tabIndex={isFront ? 0 : -1}
              aria-hidden={!isFront}
              aria-label={`Jump to ${c.name}`}
              className={`group relative block h-[90%] max-w-full ${isFront ? 'pointer-events-auto' : ''}`}
              style={{ aspectRatio: `${c.w} / ${c.h}` }}
              initial={{ opacity: 0, scale: 0.3, rotate: -30, y: '40%' }}
              animate={
                isLeaving
                  ? { x: '-115%', y: '12%', rotate: -28, scale: 0.92, opacity: 0 }
                  : { x: `${spot.x}%`, y: `${spot.y}%`, rotate: spot.r, scale: spot.s, opacity: visible ? 1 : 0 }
              }
              transition={
                isLeaving
                  ? { duration: 0.5, ease: [0.5, 0, 0.75, 0] }
                  : { type: 'spring', stiffness: 170, damping: 20, delay: entered ? 0 : 0.35 + pos * 0.12 }
              }
              onAnimationComplete={() => isLeaving && finishLeave()}
              whileHover={isFront ? { rotate: 0, scale: 1.03 } : undefined}
              data-cursor={isFront ? '' : undefined}
            >
              <span className="absolute inset-0 overflow-hidden border-[4px] border-black bg-white shadow-[8px_8px_0_#111]">
                <Image
                  src={c.src}
                  alt={isFront ? `${c.name} cover` : ''}
                  fill
                  sizes="(max-width:1024px) 70vw, 30vw"
                  className="object-cover"
                  priority={i < 3}
                />
                {/* comic page gloss + darkening for cards further back */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                <motion.span className="pointer-events-none absolute inset-0 bg-black" animate={{ opacity: isFront ? 0 : Math.min(0.35, pos * 0.12) }} transition={{ duration: 0.4 }} />
              </span>

              {/* issue tag: a sticker hanging off the frame, never covering the artwork */}
              <motion.span
                className="absolute -bottom-5 -left-4 z-10 flex items-center gap-2 border-[3px] border-black px-2.5 py-1 font-comic text-base leading-none tracking-wide shadow-[3px_3px_0_#111] sm:text-lg"
                style={{ background: c.color, rotate: '-4deg' }}
                animate={{ opacity: isFront ? 1 : 0, scale: isFront ? 1 : 0.6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: isFront ? 0.15 : 0 }}
              >
                <span className="rounded bg-black px-1.5 py-0.5 text-[0.8em] text-white">#{String(i + 1).padStart(2, '0')}</span>
                <span className="whitespace-nowrap" style={{ color: ink(c.color) }}>{c.name}</span>
              </motion.span>
            </motion.a>
          </div>
        );
      })}

      {/* issue picker */}
      <div className="absolute inset-x-0 bottom-0 z-[70] flex justify-center gap-1 sm:gap-1.5">
        {covers.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => jump(i)}
            aria-label={`Show ${c.name}`}
            aria-current={i === current}
            className={`grid h-6 min-w-6 place-items-center rounded-md border-2 border-black px-0.5 font-comic text-xs leading-none sm:h-7 sm:min-w-7 sm:px-1 sm:text-sm transition ${i === current ? '-translate-y-0.5 bg-black text-[#ffd23f] shadow-[2px_2px_0_#ef3e36]' : 'bg-white text-black hover:-translate-y-0.5'}`}
          >
            {String(i + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );
}

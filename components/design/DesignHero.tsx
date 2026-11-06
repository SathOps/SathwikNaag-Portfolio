'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CoverDeck, { type DeckCover } from './CoverDeck';

type Cover = DeckCover;

// a spiky comic burst (viewBox 0..200)
function burst(points = 16, rOut = 98, rIn = 70, seed = 2) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = (i % 2 === 0 ? rOut : rIn) * (1 + Math.sin(i * 12.9898 + seed) * 0.08);
    pts.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}
const BURST = burst();





export default function DesignHero({
  shortName,
  intro,
  roles,
  stats,
  covers,
  shortcuts = [],
}: {
  shortName: string;
  intro: string;
  roles: readonly string[];
  stats: { value: string; label: string }[];
  covers: Cover[];
  shortcuts?: { slug: string; label: string; issue: number }[];
}) {
  const [ri, setRi] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const id = setInterval(() => setRi((v) => (v + 1) % roles.length), 2200);
    return () => clearInterval(id);
  }, [roles.length]);

  // collage tilts toward the cursor
  useEffect(() => {
    const el = box.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const mv = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    };
    const loop = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', mv, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener('pointermove', mv);
      cancelAnimationFrame(raf);
    };
  }, []);

  const ticker = [...covers, ...covers];

  return (
    <>
    <section className="relative flex flex-col overflow-clip bg-[#ffd23f] pt-20 text-black sm:pt-24 lg:h-[100svh] lg:min-h-[640px]">
      <div className="halftone-lg absolute inset-0 text-[#ef3e36]/20" />
      <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(from 0deg at 72% 45%, rgba(255,255,255,.5) 0 5deg, transparent 5deg 15deg)' }} />
      <div className="absolute -left-[10%] bottom-[-20%] h-[60vmin] w-[60vmin] rounded-full bg-[#ff5fa2]/35" />

      <div className="relative mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 items-center gap-10 px-4 pb-10 sm:px-8 lg:min-h-0 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-12 lg:pb-6 [&>*]:min-w-0">
        {/* ---------- text ---------- */}
        <div className="relative z-10">
          <motion.div initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: -3, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 12 }} className="inline-block">
            <span className="comic-btn inline-block rounded-lg bg-[#ef3e36] px-3 py-1 text-xl text-white sm:text-2xl">ISSUE #01 · THE DESIGN WORLD</span>
          </motion.div>
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 14 }}
            className="comic-title mt-4 text-[clamp(3.4rem,min(12vw,13svh),10rem)] text-white lg:mt-3"
          >
            {shortName.toUpperCase()}
            <br />
            <span className="text-[#2e86de]">DESIGNS</span>
            <span className="text-[#ef3e36]">!</span>
          </motion.h1>
          <div className="mt-5 h-12 overflow-hidden sm:h-14">
            <motion.div key={ri} initial={{ y: 60 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="comic-panel inline-block rounded-xl px-4 py-1.5 font-comic text-2xl tracking-wide sm:text-3xl">
              {roles[ri]}
            </motion.div>
          </div>
          <p className="mt-4 max-w-xl font-grotesk text-lg font-semibold leading-snug sm:text-xl lg:mt-3 lg:text-[clamp(1rem,2.2svh,1.25rem)]">{intro}</p>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-[2.5svh]">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 260, damping: 14 }}
                className="comic-panel rounded-2xl px-4 py-2"
                style={{ rotate: `${[-2, 2, -1, 3][i % 4]}deg` }}
              >
                <div className="font-comic text-3xl leading-none text-[#ef3e36] sm:text-4xl">{s.value}</div>
                <div className="font-grotesk text-xs font-bold uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
          <a href="#work" className="comic-btn mt-6 lg:mt-[2.5svh] inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-2xl text-[#ffd23f]">
            READ THE ISSUES ↓
          </a>
          {shortcuts.map((sc, k) => (
            <motion.a
              key={sc.slug}
              href={`#${sc.slug}`}
              className="sv-chip group ml-0 mt-4 inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2 font-comic text-lg tracking-wide text-white sm:ml-3 sm:mt-6 lg:mt-[2.5svh]"
              initial={{ scale: 0, rotate: -8 }}
              animate={{ scale: 1, rotate: -2 }}
              whileHover={{ rotate: 0, y: -3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.75 + k * 0.1 }}
            >
              <span className="rounded bg-[#6fe0ee] px-1.5 py-0.5 text-sm leading-none text-[#0d0e18]">#{String(sc.issue).padStart(2, '0')}</span>
              <span className="sv-misprint">{sc.label}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </motion.a>
          ))}
        </div>

        {/* ---------- comic-page collage of real work ---------- */}
        <div className="relative mx-auto aspect-[1/1.05] w-full max-w-[600px] lg:max-h-full lg:w-auto lg:h-[min(600px,calc(100svh-210px))]">
          {/* burst behind */}
          <motion.svg
            viewBox="-14 -14 228 228"
            overflow="visible"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[128%] -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 90, damping: 12 }}
            aria-hidden
          >
            <path d={BURST} fill="#111" transform="translate(4 5)" opacity=".9" />
            <path d={BURST} fill="#fff" stroke="#111" strokeWidth="2.5" />
            <path d={burst(16, 80, 58, 5)} fill="#ef3e36" opacity=".9" />
          </motion.svg>

          <div ref={box} className="absolute inset-[4%] will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
            <CoverDeck covers={covers} />

            {/* speech bubble + stickers */}
            <motion.div
              className="speech pointer-events-none absolute -left-[7%] top-[1%] z-[80] max-w-[190px] rotate-[-6deg] p-3 font-comic text-lg leading-tight shadow-[4px_4px_0_#111] sm:text-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 220, damping: 12 }}
            >
              Every folder has its own look. Tap one!
            </motion.div>
            <motion.div
              className="pointer-events-none absolute -right-[5%] bottom-[16%] z-[80] grid h-24 w-24 rotate-12 place-items-center sm:h-28 sm:w-28"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 12 }}
              transition={{ delay: 1.05, type: 'spring', stiffness: 220, damping: 10 }}
            >
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
                <path d={burst(12, 98, 74, 9)} fill="#2e86de" stroke="#111" strokeWidth="6" />
              </svg>
              <span className="relative text-center font-comic text-lg leading-none text-white sm:text-xl">
                {stats[0]?.value}
                <br />
                <span className="text-xs sm:text-sm">CREATIVES</span>
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ticker of every design world: pinned to the bottom of the first screen */}
      <div className="sticky bottom-0 z-30 shrink-0 border-t-[4px] border-black bg-black py-2 text-white lg:relative">
        <div className="marquee overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-6" style={{ ['--dur' as any]: `${Math.max(30, covers.length * 5)}s` }}>
            {ticker.map((c, i) => (
              <a key={i} href={`#${c.slug}`} className="flex items-center gap-6 whitespace-nowrap font-comic text-xl tracking-wide hover:text-[#ffd23f] sm:text-2xl">
                {c.name.toUpperCase()}
                <span className="text-[#ffd23f]">★</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
    {/* torn edge: below the first screen, so the ticker is the very bottom of the hero */}
    <svg className="relative block h-6 w-full shrink-0 bg-black text-[#f7f0e1]" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
      <path d="M0 10 L0 4 L4 7 L8 3 L13 8 L18 2 L24 7 L29 4 L35 8 L41 3 L47 7 L53 2 L59 8 L65 4 L71 7 L77 3 L83 8 L89 4 L95 7 L100 3 L100 10 Z" fill="currentColor" />
    </svg>
    </>
  );
}

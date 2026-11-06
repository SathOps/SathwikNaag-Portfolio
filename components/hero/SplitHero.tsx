'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import PaperAvatar from './PaperAvatar';
import Floaters, { type Interest } from './Floaters';
import { useWorldNav } from '@/components/ui/Transition';
import { Icon } from '@/components/ui/Icons';

type Props = {
  name: string;
  shortName: string;
  designTagline: string;
  techTagline: string;
  designBio: string;
  techBio: string;
  location: string;
  avatar: { open: string; blink?: string | null };
  interests: Interest[];
  stats: { design: string; tech: string };
};

export default function SplitHero(p: Props) {
  const { go } = useWorldNav();
  const [hoverSide, setHoverSide] = useState<'design' | 'tech' | null>(null);

  // "SATHWIK NAAG" → "SATHWI" | "K NAAG": the split falls right after the middle letter,
  // so the "I" stays whole on the design side and the seam never cuts a letter.
  const nm = (() => {
    const full = p.name.split(' ').slice(0, 2).join(' ').toUpperCase();
    const letters = [...full].map((c, i) => [c, i] as const).filter(([c]) => c !== ' ');
    const cut = letters[Math.floor(letters.length / 2)][1] + 1;
    return { left: full.slice(0, cut).trim(), right: full.slice(cut).trim() };
  })();

  return (
    <section
      onPointerMove={(e) => setHoverSide(e.clientX < innerWidth / 2 ? 'design' : 'tech')}
      onPointerLeave={() => setHoverSide(null)}
      className="relative h-[100svh] min-h-[680px] w-full overflow-hidden select-none [contain:paint]"
    >
      {/* ===== DESIGN WORLD (left half) ===== */}
      <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden bg-[#ffd23f]">
        <div className="halftone-lg absolute inset-0 text-[#ef3e36]/25" />
        <div className="absolute -left-[20%] top-[6%] h-[70vmin] w-[70vmin] rounded-full bg-[#ff5fa2]/40" />
        <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(from 0deg at 30% 72%, rgba(255,255,255,.35) 0 6deg, transparent 6deg 18deg)' }} />
        <div className="absolute left-4 top-4 z-20 font-comic text-xl tracking-wide text-black sm:left-8 sm:top-6 sm:text-2xl">
          <span className="rounded-md border-[3px] border-black bg-white px-2 py-0.5 shadow-[3px_3px_0_#111]">DESIGN WORLD</span>
        </div>
      </div>

      {/* ===== TECH WORLD (right half) ===== */}
      <div className="tech absolute inset-y-0 right-0 w-1/2 overflow-hidden bg-[#05060a]">
        <div className="tech-grid absolute inset-0" />
        <div className="absolute -right-[25%] top-[10%] h-[80vmin] w-[80vmin] rounded-full bg-[#3b82f6]/20 blur-[90px]" />
        <div className="absolute right-4 top-5 z-20 font-mono text-xs uppercase tracking-[0.25em] text-[#7cc4ff] sm:right-8 sm:top-7 sm:text-sm">[ tech_world ]</div>
      </div>

      {/* floating interest icons */}
      <Floaters items={p.interests.filter((i) => i.side !== 'tech')} world="design" />
      <Floaters items={p.interests.filter((i) => i.side !== 'design')} world="tech" />

      {/* ===== name: split right after the "I", same size on both sides ===== */}
      <h1
        className="absolute inset-x-0 top-[11%] z-[27] flex items-baseline justify-center text-[clamp(2.4rem,9vw,9.5rem)] leading-[0.9] uppercase"
        aria-label={p.name}
      >
        <span aria-hidden className="comic-title flex-1 pr-[0.12em] text-right text-[#ffd23f]">{nm.left}</span>
        <span aria-hidden className="flex-1 pl-[0.12em] text-left">
          {/* same letter height as the comic side, narrowed so both halves read at the same size */}
          <span className="inline-block origin-left scale-x-[0.8] whitespace-pre font-sans font-semibold tracking-[-0.03em] text-white">{nm.right}</span>
        </span>
      </h1>

      {/* ===== per-world tagline ===== */}
      <div className="absolute inset-x-0 top-[calc(11%+clamp(2.4rem,9vw,9.5rem)+16px)] z-20 flex">
        <p className="w-1/2 pr-4 text-right font-grotesk text-sm font-bold leading-snug text-black sm:pr-8 sm:text-xl">{p.designTagline}</p>
        <p className="w-1/2 pl-4 font-mono text-xs leading-snug text-[#9fc6ff] sm:pl-8 sm:text-lg">{p.techTagline}</p>
      </div>

      {/* ===== per-world descriptions ===== */}
      <motion.div
        initial={{ opacity: 0, x: -30, rotate: -4 }}
        animate={{ opacity: 1, x: 0, rotate: -2 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 120, damping: 14 }}
        className="absolute left-[3%] top-[44%] z-30 hidden w-[min(25vw,350px)] md:block"
      >
        <div className="speech p-4 font-grotesk text-[14px] font-semibold leading-snug text-black shadow-[5px_5px_0_#111]">
          <span className="font-comic text-xl tracking-wide text-[#ef3e36]">THE DESIGNER</span>
          <br />
          {p.designBio}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.45, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-[3%] top-[44%] z-30 hidden w-[min(25vw,350px)] md:block"
      >
        <div className="rounded-xl border border-[#3b82f6]/40 bg-[#05060a]/85 p-4 font-mono text-[12px] leading-relaxed text-white/80 shadow-[0_0_40px_-10px_#3b82f6] backdrop-blur">
          <div className="mb-2 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
          </div>
          <span className="text-[#3b82f6]">❯</span> cat engineer.md
          <p className="mt-1.5">{p.techBio}</p>
        </div>
      </motion.div>

      {/* ===== the sketch portrait on its paper-cut backdrop, over both worlds ===== */}
      <div className="absolute bottom-0 left-1/2 z-[26] h-[44svh] w-[min(96vw,460px)] -translate-x-1/2 sm:h-[48svh] md:h-[54svh]">
        <PaperAvatar open={p.avatar.open} blink={p.avatar.blink} backdrop="split" alt={`${p.name}: pencil sketch portrait`} className="h-full w-full" />
      </div>

      {/* ===== the seam (exact centre) ===== */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-[25] w-0">
        <div className="absolute inset-y-0 -left-[3px] w-[6px] bg-black" />
        <div className="absolute inset-y-0 left-[3px] w-px bg-[#3b82f6] shadow-[0_0_14px_2px_#3b82f6]" />
      </div>

      {/* mobile descriptions */}
      <div className="absolute inset-x-0 top-[calc(11%+clamp(2.4rem,9vw,9.5rem)+76px)] z-30 flex gap-3 px-3 md:hidden">
        <p className="w-1/2 rounded-xl border-2 border-black bg-white/95 p-2 font-grotesk text-[10.5px] font-semibold leading-snug text-black shadow-[3px_3px_0_#111]">{p.designBio}</p>
        <p className="w-1/2 rounded-xl border border-[#3b82f6]/50 bg-[#05060a]/90 p-2 font-mono text-[9.5px] leading-snug text-white/80">{p.techBio}</p>
      </div>

      {/* ===== CTAs ===== */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex items-end justify-between gap-3 p-4 sm:p-8">
        <button
          onClick={() => go('/design', 'design')}
          className={`comic-btn group flex items-center gap-2 rounded-xl px-4 py-3 text-lg sm:px-6 sm:text-2xl ${hoverSide === 'design' ? 'bg-[#ef3e36] text-white' : 'bg-white text-black'}`}
        >
          <Icon name="arrowLeft" className="h-5 w-5 transition-transform group-hover:-translate-x-1 sm:h-6 sm:w-6" strokeWidth={3} />
          <span>
            <span className="hidden sm:inline">Enter the </span>Design World
          </span>
        </button>
        <button
          onClick={() => go('/tech', 'tech')}
          className={`group flex items-center gap-2 rounded-xl border border-[#3b82f6]/60 bg-[#05060a]/90 px-4 py-3 font-mono text-sm text-white backdrop-blur transition-all hover:border-[#3b82f6] hover:bg-[#3b82f6] hover:shadow-[0_0_30px_-4px_#3b82f6] sm:px-6 sm:text-base ${hoverSide === 'tech' ? 'border-[#3b82f6] shadow-[0_0_30px_-6px_#3b82f6]' : ''}`}
        >
          <span>
            <span className="hidden sm:inline">enter_</span>tech_world()
          </span>
          <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
        </button>
      </div>
    </section>
  );
}

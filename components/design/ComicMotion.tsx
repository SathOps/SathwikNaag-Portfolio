'use client';
import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ---------- achievements: bursts that pop in, count up and wobble ---------- */
const BURST =
  'M100 4 L118 34 L152 14 L148 50 L194 48 L162 76 L196 104 L150 106 L160 148 L120 124 L100 158 L80 124 L40 148 L50 106 L4 104 L38 76 L6 48 L52 50 L48 14 L82 34 Z';
const FILLS = ['#ffd23f', '#ffffff', '#19c3b1', '#ff5fa2'];

function CountStat({ value, start }: { value: string; start: boolean }) {
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  const [v, setV] = useState(m ? 0 : null);
  useEffect(() => {
    if (!m || !start) return;
    const c = animate(0, +m[2], { duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [start]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{m ? `${m[1]}${v}${m[3]}` : value}</>;
}

export function StatBursts({ items }: { items: { slug: string; title: string; detail: string; stat: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="relative mx-auto grid max-w-[1400px] gap-5 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
      {items.map((a, i) => (
        <motion.div
          key={a.slug}
          className="group relative mx-auto grid aspect-[5/4] w-full max-w-[360px] cursor-default place-items-center text-center"
          initial={{ scale: 0, rotate: -40 + i * 12, opacity: 0 }}
          animate={inView ? { scale: 1, rotate: 0, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 220, damping: 11, delay: 0.1 + i * 0.13 }}
          whileHover={{ scale: 1.08, rotate: [0, -4, 4, -2, 0], transition: { duration: 0.45 } }}
        >
          {/* the burst itself, gently breathing */}
          <motion.svg
            className="absolute inset-0 h-full w-full drop-shadow-[5px_6px_0_rgba(0,0,0,.35)]"
            viewBox="0 0 200 160"
            preserveAspectRatio="none"
            aria-hidden
            animate={{ rotate: [0, 1.5, -1.5, 0], scale: [1, 1.025, 1] }}
            transition={{ repeat: Infinity, duration: 3.2 + i * 0.4, ease: 'easeInOut' }}
          >
            <path d={BURST} fill={FILLS[i % 4]} stroke="#111" strokeWidth="3" />
          </motion.svg>
          <div className="relative w-[58%]">
            <div className="font-comic text-[clamp(1.8rem,3vw,2.6rem)] leading-none transition-transform group-hover:scale-110">
              <CountStat value={a.stat} start={inView} />
            </div>
            <div className="mt-1 font-comic text-[15px] leading-tight tracking-wide sm:text-base">{a.title}</div>
            <div className="mt-1 font-grotesk text-[11px] font-semibold leading-snug">{a.detail}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- "THE STORY SO FAR…": letters drop in, panels get slapped onto the page ---------- */
export function StoryTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const words = text.split(' ');
  let n = 0;
  return (
    <h2 ref={ref} className="comic-title mb-12 text-[clamp(2.8rem,8vw,6.5rem)] text-white" aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {[...w].map((ch) => {
            const k = n++;
            return (
              <motion.span
                key={k}
                className="inline-block"
                aria-hidden
                initial={{ y: -90, opacity: 0, rotate: -25 }}
                animate={inView ? { y: 0, opacity: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 420, damping: 14, delay: k * 0.035 }}
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block w-[0.25em]" />}
        </span>
      ))}
    </h2>
  );
}

export function StoryPanel({ i, children }: { i: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const base = [-1, 1.2, -0.6][i % 3];
  // tilt toward the cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 18 });
  const from = i % 3 === 0 ? -140 : i % 3 === 2 ? 140 : 0;
  return (
    <div ref={ref} className="h-full [perspective:1000px]">
      <motion.div
        className="relative h-full"
        initial={{ opacity: 0, x: from, y: from ? 30 : 120, rotate: base * 8, scale: 0.85 }}
        animate={inView ? { opacity: 1, x: 0, y: 0, rotate: base, scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 160, damping: 15, delay: (i % 3) * 0.12 }}
        style={{ rotateX: rx, rotateY: ry }}
        whileHover={{ y: -8, scale: 1.02 }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        {/* impact puff when the panel lands */}
        <motion.span
          className="pointer-events-none absolute -right-3 -top-4 z-10 grid h-12 w-12 place-items-center rounded-full border-[3px] border-black bg-[#ffd23f] font-comic text-lg"
          initial={{ scale: 0, rotate: -30 }}
          animate={inView ? { scale: [0, 1.3, 1], rotate: 12 } : {}}
          transition={{ delay: 0.35 + (i % 3) * 0.12, duration: 0.45 }}
          aria-hidden
        >
          {String(i + 1).padStart(2, '0')}
        </motion.span>
        {children}
      </motion.div>
    </div>
  );
}

export function StoryPoints({ points }: { points: readonly string[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <ul ref={ref} className="mt-3 space-y-1.5 font-grotesk text-[15px] leading-snug">
      {points.map((p, j) => (
        <motion.li key={j} className="flex gap-2" initial={{ opacity: 0, x: -14 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.45 + j * 0.08, duration: 0.35 }}>
          <motion.span
            className="mt-[7px] h-2 w-2 shrink-0 rotate-45 bg-black"
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1, rotate: 225 } : {}}
            transition={{ delay: 0.5 + j * 0.08, duration: 0.4 }}
          />
          {p}
        </motion.li>
      ))}
    </ul>
  );
}

'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

type World = 'design' | 'tech' | 'home';
type Ctx = { go: (href: string, world: World) => void };
const TransitionCtx = createContext<Ctx>({ go: () => {} });
export const useWorldNav = () => useContext(TransitionCtx);

const WORDS = ['KA-BOOM!', 'KA-POW!', 'BLAM!', 'WHAM!'];

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<{ phase: 'idle' | 'in' | 'out'; world: World; target?: string; hash?: string }>({ phase: 'idle', world: 'home' });
  const word = useRef(WORDS[0]);
  const started = useRef(0);

  const go = useCallback(
    (href: string, world: World) => {
      const [path, hash] = href.split('#');
      if (path === pathname) {
        if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return router.push(href);
      word.current = WORDS[Math.floor(Math.random() * WORDS.length)];
      router.prefetch(href);
      started.current = performance.now();
      setState({ phase: 'in', world, target: path, hash });
      window.setTimeout(() => {
        router.push(path);
        window.scrollTo(0, 0);
      }, world === 'tech' ? 900 : world === 'design' ? 880 : 800);
    },
    [pathname, router]
  );

  useEffect(() => {
    if (state.phase === 'in' && state.target && pathname === state.target) {
      // Open up only once the blast has peaked AND the browser has gone quiet (no long tasks,
      // no dropped frames) after mounting the new page, so the exit plays every frame.
      const minIn = state.world === 'design' ? 1000 : 0;
      const wait = Math.max(60, minIn - (performance.now() - started.current));
      let stop = () => {};
      const t = window.setTimeout(() => {
        stop = waitForQuiet(() => {
          // land on the requested section (e.g. /design#ui-ux) while still covered
          if (state.hash) {
            const el = document.getElementById(state.hash);
            const l = (window as any).__lenis;
            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY;
              l ? l.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y);
            }
          }
          setState((s) => ({ ...s, phase: 'out' }));
        }, state.world === 'design' ? 200 : 120, 1800);
      }, wait);
      return () => {
        window.clearTimeout(t);
        stop();
      };
    }
    if (state.phase === 'out') {
      // the design blast ends itself on animationend; this is only a safety net
      const t = window.setTimeout(() => setState((s) => ({ ...s, phase: 'idle' })), state.world === 'design' ? 2200 : 900);
      return () => window.clearTimeout(t);
    }
  }, [pathname, state]);

  const done = useCallback(() => setState((s) => (s.phase === 'out' ? { ...s, phase: 'idle' } : s)), []);

  return (
    <TransitionCtx.Provider value={{ go }}>
      {children}
      <AnimatePresence>
        {state.phase !== 'idle' && state.world === 'design' && <ComicCover key="c" out={state.phase === 'out'} word={word.current} onDone={done} />}
        {state.phase !== 'idle' && state.world === 'tech' && <TechCover key="t" out={state.phase === 'out'} />}
        {state.phase !== 'idle' && state.world === 'home' && <HomeCover key="h" out={state.phase === 'out'} />}
      </AnimatePresence>
    </TransitionCtx.Provider>
  );
}

/** Calls cb once the main thread has been quiet for `quiet` ms (no long tasks, no frame gaps > 50 ms), or after `max` ms. */
function waitForQuiet(cb: () => void, quiet: number, max: number) {
  const start = performance.now();
  let busyUntil = start;
  let prev = start;
  let done = false;
  let po: PerformanceObserver | null = null;
  try {
    po = new PerformanceObserver((l) => {
      for (const e of l.getEntries()) busyUntil = Math.max(busyUntil, e.startTime + e.duration);
    });
    po.observe({ type: 'longtask', buffered: false } as PerformanceObserverInit);
  } catch {}
  const frame = (t: number) => {
    if (done) return;
    if (t - prev > 80) busyUntil = Math.max(busyUntil, t);
    prev = t;
    if (t - busyUntil >= quiet || t - start >= max) {
      done = true;
      po?.disconnect();
      cb();
      return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return () => {
    done = true;
    po?.disconnect();
  };
}

// spiky comic-explosion outline (viewBox 0..200)
function burstPath(points = 14, rOut = 96, rIn = 58, seed = 3) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const jitter = 1 + Math.sin(i * 12.9898 + seed) * 0.14;
    const r = (i % 2 === 0 ? rOut : rIn) * jitter;
    pts.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r * 0.82).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

const RAYS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + 0.2;
  const len = 0.6 + ((i * 37) % 10) / 25;
  return { a, len, w: 2 + ((i * 13) % 5) };
});
/* ---------- design: a comic explosion that grows from a spark until it fills the screen,
   idles (never freezes) while the design world loads, then blasts outward onto it.
   Only transform/opacity are animated, and layers are kept moderately sized, so it stays smooth. ---------- */
const LAYERS = [
  { size: 210, fill: '#111', seed: 3, pts: 16, rIn: 66, delay: 0, rot: -14 },
  { size: 200, fill: '#ffd23f', seed: 5, pts: 16, rIn: 66, delay: 0.03, rot: -10 },
  { size: 135, fill: '#ff8a1f', seed: 8, pts: 14, rIn: 60, delay: 0.07, rot: 8 },
  { size: 92, fill: '#ef3e36', seed: 11, pts: 13, rIn: 58, delay: 0.11, rot: -6 },
  { size: 50, fill: '#fff6c9', seed: 13, pts: 12, rIn: 56, delay: 0.15, rot: 12 },
].map((l) => ({ ...l, d: burstPath(l.pts, 98, l.rIn, l.seed) }));

const SHARDS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + ((i * 7) % 5) * 0.09;
  const dist = 55 + ((i * 37) % 40);
  return {
    x: Math.cos(a) * dist,
    y: Math.sin(a) * dist * 0.8,
    r: ((i * 53) % 360) - 180,
    s: 0.6 + ((i * 17) % 10) / 10,
    c: ['#111', '#ef3e36', '#ffd23f', '#fff', '#2e86de'][i % 5],
  };
});

/* Everything below is driven by CSS keyframes (see "comic explosion" in globals.css), not JS.
   CSS transform/opacity animations run on the compositor, so the blast keeps moving smoothly
   even while the browser is busy mounting the design world underneath it. */
function ComicCover({ out, word, onDone }: { out: boolean; word: string; onDone: () => void }) {
  return (
    <div className={`cx pointer-events-none fixed inset-0 z-[200] overflow-hidden ${out ? 'cx-out' : ''}`}>
      <div className="cx-blast absolute inset-0" onAnimationEnd={(e) => out && e.target === e.currentTarget && e.animationName === 'cx-blast' && onDone()}>
        <div className="cx-fill absolute inset-0 bg-[#ffd23f]" />
        <div className="cx-shake absolute inset-0">
          <div className="cx-drift absolute inset-0">
            {LAYERS.map((l, i) => (
              <svg
                key={i}
                viewBox="0 0 200 200"
                overflow="visible"
                className="cx-layer absolute left-1/2 top-1/2"
                style={
                  {
                    width: `${l.size}vmax`,
                    height: `${l.size}vmax`,
                    marginLeft: `-${l.size / 2}vmax`,
                    marginTop: `-${l.size / 2}vmax`,
                    animationDelay: `${l.delay}s`,
                    ['--r0' as any]: `${l.rot * 2}deg`,
                    ['--r1' as any]: `${l.rot * 0.4}deg`,
                  } as React.CSSProperties
                }
                aria-hidden
              >
                <path d={l.d} fill={l.fill} stroke="#111" strokeWidth={i ? 1.4 : 0} strokeLinejoin="miter" />
              </svg>
            ))}
            {/* speed lines: each streaks outward on a loop, so nothing ever sits still */}
            <div className="cx-rays absolute inset-0">
              {RAYS.map((r, i) => (
                <span
                  key={i}
                  className="cx-ray absolute left-1/2 top-1/2 block bg-[#111]"
                  style={
                    {
                      width: `${34 + r.len * 30}vmax`,
                      height: `${0.9 + r.w * 0.35}vmax`,
                      marginTop: `-${(0.9 + r.w * 0.35) / 2}vmax`,
                      ['--a' as any]: `${(r.a * 180) / Math.PI}deg`,
                      animationDelay: `${0.9 + ((i * 7) % 14) * 0.06}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          </div>
          <div className="cx-dots absolute inset-0" />
          <div className="cx-word absolute inset-0 grid place-items-center">
            <span className="cx-bounce comic-title block text-[clamp(4rem,16vmin,12rem)] text-white [filter:drop-shadow(6px_6px_0_#111)]">{word}</span>
          </div>
        </div>
      </div>

      {SHARDS.map((d, i) => (
        <div
          key={i}
          className="cx-shard absolute left-1/2 top-1/2 -ml-[2.5vmin] -mt-[2.5vmin] h-[5vmin] w-[5vmin]"
          style={{ ['--x' as any]: d.x, ['--y' as any]: d.y, ['--r' as any]: `${d.r}deg`, ['--s' as any]: d.s } as React.CSSProperties}
          aria-hidden
        >
          <svg viewBox="0 0 20 20" className="cx-spin h-full w-full" style={{ animationDuration: `${1.6 + (i % 5) * 0.35}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>
            <path d="M2 18L10 1l8 13z" fill={d.c} stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
      ))}

      <div className="cx-spark absolute left-1/2 top-1/2 -ml-2.5 -mt-2.5 h-5 w-5 rounded-full bg-white shadow-[0_0_30px_16px_rgba(255,246,201,.95)]" />
      <div className="cx-flash absolute inset-0 bg-white" />
      <div className="cx-ring absolute left-1/2 top-1/2 aspect-square w-[12vmax] -ml-[6vmax] -mt-[6vmax] rounded-full border-[12px] border-[#111]" />
    </div>
  );
}

function TechCover({ out }: { out: boolean }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let p = 0;
    const id = window.setInterval(() => {
      p = Math.min(100, p + 7 + Math.random() * 14);
      setPct(Math.round(p));
    }, 60);
    return () => window.clearInterval(id);
  }, []);
  return (
    <motion.div
      className="tech pointer-events-none fixed inset-0 z-[200] bg-[#05060a] font-mono text-[#7cc4ff]"
      initial={{ clipPath: 'inset(0 0 0 100%)' }}
      animate={out ? { clipPath: 'inset(0 0 100% 0)' } : { clipPath: 'inset(0 0 0 0%)' }}
      transition={{ duration: out ? 0.7 : 0.55, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="tech-dots absolute inset-0" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="w-[min(520px,86vw)] text-sm">
          <div className="text-white/50">~/sathwik</div>
          <div className="mt-1 text-white">
            <span className="text-[#3b82f6]">❯</span> boot tech_world --fast<span className="caret">▌</span>
          </div>
          <div className="mt-6 h-[2px] w-full bg-white/10">
            <div className="h-full bg-[#3b82f6] transition-[width] duration-75" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-white/40">
            <span>loading modules</span>
            <span>{pct}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- back to home: the two worlds slam shut like doors, then swing open onto the split hero ---------- */
function HomeCover({ out }: { out: boolean }) {
  const ease = [0.76, 0, 0.24, 1] as const;
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex overflow-hidden">
      <motion.div
        className="relative h-full w-1/2 overflow-hidden border-r-[3px] border-black bg-[#ffd23f]"
        initial={{ x: '-100%' }}
        animate={{ x: out ? '-102%' : '0%' }}
        transition={{ duration: out ? 0.65 : 0.5, ease, delay: out ? 0.05 : 0 }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(239,62,54,.25) 1.6px, transparent 2.2px)', backgroundSize: '14px 14px' }} />
        <div className="absolute inset-0" style={{ background: 'repeating-conic-gradient(from 0deg at 100% 50%, rgba(255,255,255,.45) 0 5deg, transparent 5deg 15deg)' }} />
        <motion.span
          className="comic-title absolute right-[3vw] top-1/2 -translate-y-1/2 text-[clamp(2.5rem,10vw,11rem)] leading-none text-white"
          initial={{ x: '-40%', opacity: 0 }}
          animate={out ? { x: '-30%', opacity: 0 } : { x: '0%', opacity: 1 }}
          transition={{ duration: 0.45, delay: out ? 0 : 0.2, ease: 'easeOut' }}
        >
          SATHWI
        </motion.span>
      </motion.div>
      <motion.div
        className="tech relative h-full w-1/2 overflow-hidden bg-[#05060a]"
        initial={{ x: '100%' }}
        animate={{ x: out ? '102%' : '0%' }}
        transition={{ duration: out ? 0.65 : 0.5, ease, delay: out ? 0.05 : 0 }}
      >
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(#3b82f6_1px,transparent_1px),linear-gradient(90deg,#3b82f6_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute -left-1/4 top-1/2 h-[70vh] w-[70vh] -translate-y-1/2 rounded-full bg-[#3b82f6]/25 blur-3xl" />
        <motion.span
          className="absolute left-[3vw] top-1/2 -translate-y-1/2 font-sans text-[clamp(2.5rem,10vw,11rem)] font-semibold leading-none tracking-tight text-white"
          initial={{ x: '40%', opacity: 0 }}
          animate={out ? { x: '30%', opacity: 0 } : { x: '0%', opacity: 1 }}
          transition={{ duration: 0.45, delay: out ? 0 : 0.2, ease: 'easeOut' }}
        >
          K NAAG
        </motion.span>
      </motion.div>
      {/* the seam flash when the doors meet */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_40px_12px_rgba(255,255,255,.8)]"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={out ? { opacity: 0 } : { opacity: [0, 0, 1, 0.6], scaleY: [0, 0, 1, 1] }}
        transition={{ duration: out ? 0.2 : 0.75, times: [0, 0.6, 0.75, 1] }}
      />
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.4em] text-white/80 mix-blend-difference"
        initial={{ opacity: 0 }}
        animate={{ opacity: out ? 0 : 1 }}
        transition={{ delay: out ? 0 : 0.35, duration: 0.3 }}
      >
        home
      </motion.div>
    </div>
  );
}

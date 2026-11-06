'use client';
import { useEffect, useMemo, useRef } from 'react';
import { Icon } from '@/components/ui/Icons';

export type Interest = { label: string; icon: string; side: string };

const POP = ['#ef3e36', '#2e86de', '#ff5fa2', '#19c3b1', '#ffffff', '#111111'];

// deterministic pseudo-random so SSR and client agree
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/** Interests that drift around, bob, and get pushed away by the cursor. */
export default function Floaters({ items, world }: { items: Interest[]; world: 'design' | 'tech' }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const layout = useMemo(() => {
    // slots around the edges of each half so they don't sit on the face
    const slotsDesign = [
      [5, 37], [20, 40], [36, 44], [29, 76], [6, 80], [38, 86], [24, 62], [42, 64],
    ];
    const slotsTech = slotsDesign.map(([x, y]) => [100 - x, y + (x % 3) - 1]);
    const slots = world === 'design' ? slotsDesign : slotsTech;
    return items.map((it, i) => {
      const [x, y] = slots[i % slots.length];
      return {
        ...it,
        x,
        y,
        rot: (rand(i + (world === 'tech' ? 50 : 0)) - 0.5) * 24,
        phase: rand(i * 3 + 1) * Math.PI * 2,
        amp: 6 + rand(i * 7) * 10,
        color: POP[i % POP.length],
      };
    });
  }, [items, world]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let mx = -9999,
      my = -9999,
      raf = 0;
    const off = layout.map(() => ({ x: 0, y: 0 }));
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    addEventListener('pointermove', onMove, { passive: true });
    const t0 = performance.now();
    const loop = (t: number) => {
      const time = (t - t0) / 1000;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const L = layout[i];
        const parent = el.parentElement?.parentElement as HTMLElement | null;
        const W = parent?.clientWidth ?? innerWidth;
        const H = parent?.clientHeight ?? innerHeight;
        const lx = W < 768 ? (world === 'design' ? [7, 13, 6][i % 3] : [93, 87, 94][i % 3]) : L.x;
        const bx = (lx / 100) * W;
        const ly = W < 768 ? [64, 76, 88][i % 3] : L.y;
        const by = (ly / 100) * H;
        // cursor repulsion
        const dx = bx + off[i].x - mx;
        const dy = by + off[i].y - my;
        const d = Math.hypot(dx, dy);
        const R = 160;
        let tx = 0,
          ty = 0;
        if (d < R && d > 0.1) {
          const f = (1 - d / R) * 90;
          tx = (dx / d) * f;
          ty = (dy / d) * f;
        }
        off[i].x += (tx - off[i].x) * 0.08;
        off[i].y += (ty - off[i].y) * 0.08;
        const bob = reduce ? 0 : Math.sin(time * 1.1 + L.phase) * L.amp;
        const sway = reduce ? 0 : Math.cos(time * 0.7 + L.phase) * L.amp * 0.6;
        const rot = L.rot + (reduce ? 0 : Math.sin(time * 0.9 + L.phase) * 4);
        el.style.transform = `translate(${bx + off[i].x + sway}px, ${by + off[i].y + bob}px) translate(-50%,-50%) rotate(${rot}deg)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
    };
  }, [layout, world]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[15]">
      {layout.map((it, i) => (
        <div
          key={it.label}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`absolute left-0 top-0 will-change-transform ${i > 2 ? 'hidden md:block' : ''}`}
          style={{ transform: `translate(${it.x}vw, ${it.y}vh)` }}
        >
          {world === 'design' ? (
            <div
              title={it.label}
              aria-label={it.label}
              className="grid h-11 w-11 place-items-center rounded-full border-[3px] border-black shadow-[3px_3px_0_#111] sm:h-14 sm:w-14"
              style={{ background: it.color, color: it.color === '#111111' || it.color === '#2e86de' || it.color === '#ef3e36' ? '#fff' : '#111' }}
            >
              <Icon name={it.icon} className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={2.3} />
            </div>
          ) : (
            <div
              title={it.label}
              aria-label={it.label}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#3b82f6]/60 bg-[#0a0f1c]/85 text-[#9fc6ff] shadow-[0_0_22px_-4px_#3b82f6] backdrop-blur sm:h-12 sm:w-12"
            >
              <Icon name={it.icon} className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.6} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

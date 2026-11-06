'use client';
import { useEffect, useRef } from 'react';
import { useBlink } from './Avatar';

/**
 * Pencil-sketch portrait (cut out of paper) with depth behind it:
 *  - a soft spotlight halo (warm on the design side, blue on the tech side)
 *  - thin orbit rings that drift slowly
 *  - a blurred cast shadow of the cut-out that moves opposite the cursor (parallax)
 * backdrop: "split" (warm left of centre, blue right) | "design" | "tech" | "none"
 * The portrait floats, sways with the cursor and blinks.
 */
type Props = {
  open: string;
  blink?: string | null;
  alt: string;
  backdrop?: 'split' | 'design' | 'tech' | 'none';
  className?: string;
};

function Glow({ tone }: { tone: 'warm' | 'cool' }) {
  const warm = tone === 'warm';
  return (
    <div data-glow className="absolute inset-0 will-change-transform">
      {/* spotlight */}
      <div
        className="absolute left-1/2 top-[30%] aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: warm
            ? 'radial-gradient(closest-side, #fff 0%, rgba(255,255,255,.92) 34%, rgba(255,246,220,.7) 56%, rgba(255,150,90,.3) 80%, rgba(255,150,90,0) 100%)'
            : 'radial-gradient(closest-side, rgba(124,196,255,.55), rgba(59,130,246,.38) 40%, rgba(37,99,235,.14) 66%, rgba(5,6,10,0) 100%)',
        }}
      />
      {/* orbit rings */}
      {[0.62, 0.84, 1.06].map((s, i) => (
        <div
          key={s}
          className="absolute left-1/2 top-[30%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${s * 100}%`,
            border: `${i === 0 ? 2 : 1}px ${i === 1 ? 'dashed' : 'solid'} ${warm ? 'rgba(17,17,17,.22)' : 'rgba(124,196,255,.35)'}`,
            animation: `spin-slow ${50 + i * 25}s linear infinite ${i % 2 ? 'reverse' : ''}`,
          }}
        />
      ))}
      {/* a few dots on the rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute left-1/2 top-[30%] aspect-square -translate-x-1/2 -translate-y-1/2"
          style={{ width: `${[0.62, 0.84, 1.06][i] * 100}%`, animation: `spin-slow ${30 + i * 18}s linear infinite` }}
        >
          <span
            className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: warm ? '#ef3e36' : '#3b82f6', boxShadow: warm ? '0 0 0 2px #111' : '0 0 12px #3b82f6' }}
          />
        </div>
      ))}
    </div>
  );
}

export default function PaperAvatar({ open, blink, alt, backdrop = 'split', className = '' }: Props) {
  const closed = useBlink();
  const fig = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      raf = 0;
    const move = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    };
    addEventListener('pointermove', move, { passive: true });
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      const gx = touch ? Math.sin(t * 0.5) * 0.6 : tx;
      const gy = touch ? Math.sin(t * 0.35) * 0.3 : ty;
      x += (gx - x) * 0.06;
      y += (gy - y) * 0.06;
      if (!reduce) {
        const bob = Math.sin(t * 1.2) * 6;
        if (fig.current) fig.current.style.transform = `translate(${x * 10}px, ${bob + y * 4}px) rotate(${x * 1.6}deg)`;
        // shadow sits "behind" the cut-out and slides the other way → depth
        if (shadow.current) shadow.current.style.transform = `translate(${18 - x * 22}px, ${14 - y * 8 + bob * 0.4}px) rotate(${x * 1.2}deg)`;
        halo.current?.querySelectorAll<HTMLElement>('[data-glow]').forEach((g) => (g.style.transform = `translate(${-x * 14}px, ${-y * 8}px)`));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', move);
    };
  }, []);

  return (
    <div className={`relative ${className}`} role="img" aria-label={alt}>
      {/* depth: halo + rings */}
      {backdrop !== 'none' && (
        <div ref={halo} className="pointer-events-none absolute inset-x-[-10%] bottom-0 top-[-6%]">
          {(backdrop === 'split' || backdrop === 'design') && (
            <div className="absolute inset-0" style={backdrop === 'split' ? { clipPath: 'inset(-60% 50% -10% -60%)' } : undefined}>
              <Glow tone="warm" />
            </div>
          )}
          {(backdrop === 'split' || backdrop === 'tech') && (
            <div className="absolute inset-0" style={backdrop === 'split' ? { clipPath: 'inset(-60% -60% -10% 50%)' } : undefined}>
              <Glow tone="cool" />
            </div>
          )}
        </div>
      )}

      {/* depth: cast shadow of the cut-out */}
      <div ref={shadow} className="pointer-events-none absolute inset-0 origin-bottom will-change-transform" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={open} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain object-bottom" style={{ filter: 'brightness(0) blur(10px)', opacity: 0.38 }} />
      </div>

      {/* the paper cut-out portrait */}
      <div ref={fig} className="absolute inset-0 origin-bottom will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={open}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain object-bottom"
          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.25))' }}
        />
        {blink && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blink} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full select-none object-contain object-bottom" style={{ opacity: closed ? 1 : 0 }} />
        )}
      </div>
    </div>
  );
}

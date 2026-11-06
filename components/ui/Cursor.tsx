'use client';
import { useEffect, useRef } from 'react';

/**
 * variant="ink": a black ink blob that stretches with speed and splats on click.
 * variant="tech": a small blue dot that snaps into [ ] brackets around anything clickable.
 */
export default function Cursor({ variant }: { variant: 'ink' | 'tech' }) {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.documentElement.classList.add('has-custom-cursor');
    let x = innerWidth / 2,
      y = innerHeight / 2,
      rx = x,
      ry = y,
      vx = 0,
      vy = 0,
      raf = 0,
      target: HTMLElement | null = null;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = (e.target as HTMLElement)?.closest?.('a,button,[role=button],[data-cursor]') as HTMLElement | null;
      target = el;
    };
    const down = () => {
      if (variant !== 'ink') return;
      const s = document.createElement('div');
      s.className = 'pointer-events-none fixed z-[300] rounded-full bg-black';
      const size = 46;
      Object.assign(s.style, {
        left: `${x - size / 2}px`,
        top: `${y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        transition: 'transform .45s cubic-bezier(.16,1,.3,1), opacity .5s',
        transform: 'scale(.2)',
        borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%',
      });
      document.body.appendChild(s);
      requestAnimationFrame(() => {
        s.style.transform = `scale(1.3) rotate(${Math.random() * 90}deg)`;
        s.style.opacity = '0';
      });
      setTimeout(() => s.remove(), 600);
    };

    const loop = () => {
      const k = variant === 'ink' ? 0.22 : 0.3;
      vx = (x - rx) * k;
      vy = (y - ry) * k;
      rx += vx;
      ry += vy;
      const d = dot.current,
        r = ring.current;
      if (d && r) {
        if (variant === 'ink') {
          const speed = Math.min(Math.hypot(vx, vy), 40);
          const ang = Math.atan2(vy, vx);
          const stretch = 1 + speed / 40;
          const hover = !!target;
          d.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%) rotate(${ang}rad) scale(${stretch * (hover ? 2.2 : 1)}, ${(1 / stretch) * (hover ? 2.2 : 1)})`;
          d.style.opacity = '1';
        } else {
          d.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
          if (target) {
            const b = target.getBoundingClientRect();
            r.style.width = `${b.width + 14}px`;
            r.style.height = `${b.height + 10}px`;
            r.style.transform = `translate(${b.left - 7}px, ${b.top - 5}px)`;
            r.style.opacity = '1';
            d.style.opacity = '0';
          } else {
            r.style.width = `22px`;
            r.style.height = `22px`;
            r.style.transform = `translate(${rx - 11}px, ${ry - 11}px)`;
            r.style.opacity = '0.0';
            d.style.opacity = '1';
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', down);
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerdown', down);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [variant]);

  if (variant === 'ink') {
    return (
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] hidden h-4 w-4 opacity-0 mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block"
        style={{ background: '#fff', borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%' }}
      >
        <div ref={ring} />
      </div>
    );
  }
  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] hidden h-2 w-2 rounded-full bg-[#3b82f6] shadow-[0_0_12px_#3b82f6] [@media(hover:hover)_and_(pointer:fine)]:block"
      />
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[299] hidden [@media(hover:hover)_and_(pointer:fine)]:block"
        style={{ transition: 'width .18s, height .18s, transform .18s cubic-bezier(.16,1,.3,1), opacity .18s' }}
      >
        <span className="absolute left-0 top-0 h-full w-2 border-y-2 border-l-2 border-[#3b82f6]" />
        <span className="absolute right-0 top-0 h-full w-2 border-y-2 border-r-2 border-[#3b82f6]" />
      </div>
    </>
  );
}

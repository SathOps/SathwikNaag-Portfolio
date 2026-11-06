'use client';
import { useEffect, useRef } from 'react';

/** Per-theme background ornaments. Purely decorative. */
export default function Decor({ layout, issue, subtle }: { layout: string; issue?: number; subtle?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  // cinema spotlight follows the cursor
  useEffect(() => {
    if (layout !== 'cinema') return;
    const el = ref.current?.parentElement;
    if (!el) return;
    const mv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sx', `${e.clientX - r.left}px`);
      el.style.setProperty('--sy', `${e.clientY - r.top}px`);
    };
    el.addEventListener('pointermove', mv);
    return () => el.removeEventListener('pointermove', mv);
  }, [layout]);

  const o = subtle ? 0.5 : 1;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" style={{ opacity: o }}>
      {layout === 'spiderverse' && (
        <>
          <div className="sv-rain absolute inset-0" />
          <div className="sv-glow absolute inset-0" />
          <div className="sv-halftone absolute inset-0" />
          <div className="sv-sweep absolute inset-x-0 top-0" />
          {[
            { l: '6%', t: '18%', w: 70, h: 44, c: '#6fe0ee', c2: '#a33a8d', d: '5.2s', dl: '0s' },
            { l: '84%', t: '34%', w: 54, h: 80, c: '#a33a8d', c2: '#6fe0ee', d: '6.4s', dl: '1.7s' },
            { l: '72%', t: '62%', w: 90, h: 34, c: '#5d78cf', c2: '#a33a8d', d: '5.8s', dl: '3.1s' },
            { l: '14%', t: '70%', w: 46, h: 46, c: '#6fe0ee', c2: '#5d78cf', d: '7s', dl: '2.4s' },
            { l: '46%', t: '8%', w: 64, h: 28, c: '#a33a8d', c2: '#6fe0ee', d: '6.8s', dl: '4.4s' },
          ].map((x, i) => (
            <span
              key={i}
              className="sv-shard absolute"
              style={{ left: x.l, top: x.t, ['--w' as any]: `${x.w}px`, ['--h' as any]: `${x.h}px`, ['--c' as any]: x.c, ['--c2' as any]: x.c2, ['--d' as any]: x.d, ['--dl' as any]: x.dl } as React.CSSProperties}
            />
          ))}
          <svg className="absolute inset-x-0 bottom-0 h-[34%] w-full opacity-70" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sv-city" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5d78cf" stopOpacity=".55" />
                <stop offset="1" stopColor="#0d0e18" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 300V190h40v-40h30v60h35V120h45v70h25v-90h50v110h30V150h40v-60h20v60h35v80h30V110h55v90h20v-70h45v100h30V140h40v60h35V90h50v110h25v-80h45v90h30V160h40v-70h25v70h40v110h30V130h50v80h35v-50h45v140z"
              fill="url(#sv-city)"
            />
          </svg>
          {issue !== undefined && (
            <div className="sv-misprint absolute right-4 top-4 font-comic text-[18vw] leading-none text-white/[0.06] sm:text-[12vw]">#{String(issue).padStart(2, '0')}</div>
          )}
        </>
      )}
      {layout === 'comic' && (
        <>
          <div className="absolute -right-10 top-10 rotate-12 font-comic text-[22vw] leading-none opacity-[0.06] sm:text-[16vw]">POW!</div>
          {issue !== undefined && (
            <div className="absolute right-6 top-6 hidden h-24 w-24 rotate-6 place-items-center rounded-full border-[3px] font-comic text-xl sm:grid" style={{ borderColor: 'var(--ink)' }}>
              #{String(issue).padStart(2, '0')}
            </div>
          )}
        </>
      )}
      {layout === 'newspaper' && (
        <svg className="spin-slow absolute -right-16 -top-16 h-72 w-72 opacity-[0.12]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 30a20 20 0 1 0 0 40 20 20 0 0 0 0-40zm0 12a8 8 0 1 1 0 16 8 8 0 0 1 0-16z" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x="46" y="6" width="8" height="16" rx="2" transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="6" />
        </svg>
      )}
      {layout === 'google' && (
        <>
          {['#4285f4', '#ea4335', '#fbbc05', '#34a853'].map((c, i) => (
            <span
              key={c}
              className="absolute rounded-full"
              style={{
                background: c,
                width: [180, 120, 90, 140][i],
                height: [180, 120, 90, 140][i],
                left: ['-4%', '88%', '70%', '8%'][i],
                top: ['12%', '6%', '70%', '82%'][i],
                opacity: 0.9,
                animation: `float-y ${5 + i}s ease-in-out infinite`,
              }}
            />
          ))}
        </>
      )}
      {layout === 'festival' && (
        <svg className="spin-slow absolute -right-40 -top-40 h-[560px] w-[560px] opacity-[0.14]" viewBox="0 0 200 200" fill="none" stroke="var(--accent)" strokeWidth="0.8">
          {Array.from({ length: 24 }).map((_, i) => (
            <ellipse key={i} cx="100" cy="55" rx="12" ry="45" transform={`rotate(${i * 15} 100 100)`} />
          ))}
          <circle cx="100" cy="100" r="22" />
          <circle cx="100" cy="100" r="96" />
        </svg>
      )}
      {layout === 'sports' && (
        <div className="pointer-events-none absolute -right-6 top-6 font-sport text-[26vw] leading-none opacity-[0.06] sm:text-[18vw] lg:-right-4 lg:top-2 lg:text-[12.5vw]" style={{ WebkitTextStroke: '2px var(--accent)', color: 'transparent', opacity: 0.35 }}>
          26/27
        </div>
      )}
      {layout === 'wedding' && (
        <>
          <div className="absolute inset-4 rounded-[32px] border" style={{ borderColor: 'color-mix(in oklab, var(--accent) 50%, transparent)' }} />
          <div className="absolute left-1/2 top-6 -translate-x-1/2 font-script text-5xl opacity-30" style={{ color: 'var(--accent)' }}>
            ❦
          </div>
        </>
      )}
      {layout === 'rack' && !subtle && (
        <div className="absolute left-0 right-0 top-10 h-[6px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in oklab, var(--ink) 40%, transparent), transparent)' }} />
      )}
      {layout === 'cinema' && (
        <>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(420px circle at var(--sx, 50%) var(--sy, 30%), rgba(255,235,200,.13), transparent 70%)' }} />
          <div className="absolute inset-x-0 top-0 flex justify-around py-3">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full bg-amber-200 shadow-[0_0_10px_3px_rgba(253,230,138,.6)]" style={{ animation: `blink-caret ${1 + (i % 3) * 0.3}s steps(1) infinite`, animationDelay: `${(i % 5) * 0.15}s` }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

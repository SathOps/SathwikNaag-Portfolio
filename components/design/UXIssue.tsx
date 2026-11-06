'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CaseStudy, Folder } from '@/lib/content';

/* Multiverse (UI/UX) issue: process strip, design ⇄ code callout and case-study panels.
   Everything here comes from the folder's YAML (process, callout, caseStudies). */

const SWATCH = ['#6fe0ee', '#a33a8d', '#5d78cf', '#dadde3', '#ef4b5f'];

function Misprint({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`sv-misprint ${className}`}>{children}</span>;
}

/** live site, scaled down like a screenshot; only loads when asked */
function Peek({ url, title }: { url: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.3);
  const [on, setOn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setS(el.clientWidth / 1280));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="sv-screen relative aspect-[16/10] w-full overflow-hidden rounded-lg">
      {on ? (
        <>
          {!loaded && <div className="absolute inset-0 grid place-items-center font-comic text-xl tracking-wide text-[#6fe0ee]">loading the live UI…</div>}
          <iframe
            src={url}
            title={`${title}: live UI`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="absolute left-0 top-0 origin-top-left border-0"
            style={{ width: 1280, height: 800, transform: `scale(${s})` }}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </>
      ) : (
        <button onClick={() => setOn(true)} className="group absolute inset-0 grid place-items-center" data-cursor>
          <span className="sv-scan absolute inset-0" />
          <span className="relative rounded-md border-2 border-[#6fe0ee] bg-[#0d0e18]/80 px-4 py-2 font-comic text-xl tracking-wide text-white transition group-hover:bg-[#6fe0ee] group-hover:text-[#0d0e18]">
            ▶ PEEK AT THE LIVE UI
          </span>
        </button>
      )}
    </div>
  );
}

function Case({ c, i }: { c: CaseStudy; i: number }) {
  const col = SWATCH[i % SWATCH.length];
  return (
    <motion.article
      className="sv-card group relative flex flex-col overflow-hidden rounded-2xl p-5 sm:p-7"
      style={{ ['--c' as any]: col }}
      initial={{ opacity: 0, y: 60, rotate: i % 2 ? 2 : -2, clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotate: 0,
        // the panel "prints" in a few jumpy slices, like a frame from another dimension
        clipPath: ['inset(0 0 100% 0)', 'inset(0 0 62% 0)', 'inset(0 0 66% 0)', 'inset(0 0 24% 0)', 'inset(0 0 30% 0)', 'inset(0 0 0% 0)'],
        x: [0, -10, 8, -5, 3, 0],
      }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 16,
        delay: (i % 2) * 0.12,
        clipPath: { duration: 0.55, ease: 'linear', delay: (i % 2) * 0.12 },
        x: { duration: 0.55, ease: 'linear', delay: (i % 2) * 0.12 },
      }}
    >
      <span className="sv-dots pointer-events-none absolute inset-0" />
      <div className="relative flex flex-wrap items-center gap-2 font-grotesk text-[11px] font-bold uppercase tracking-[0.2em]">
        <span className="rounded px-2 py-0.5 text-[#0d0e18]" style={{ background: col }}>
          Case {String(i + 1).padStart(2, '0')}
        </span>
        <span className="opacity-70">{c.period}</span>
        {c.alsoInTech && (
          <span className="ml-auto rounded-full border border-[#6fe0ee]/60 px-2.5 py-0.5 normal-case tracking-normal text-[#6fe0ee]">designed here · coded in the Tech World</span>
        )}
      </div>
      <h3 className="relative mt-3 font-comic text-[clamp(2rem,4vw,3rem)] leading-[0.95] tracking-wide text-white">
        <Misprint>{c.title}</Misprint>
      </h3>
      <p className="relative mt-1 font-grotesk text-sm font-semibold" style={{ color: col }}>
        {c.role}
      </p>

      <p className="relative mt-4 border-l-4 pl-3 font-grotesk text-[15px] leading-relaxed text-white/85" style={{ borderColor: col }}>
        <span className="mr-1 font-comic tracking-wide" style={{ color: col }}>
          THE CHALLENGE:
        </span>
        {c.challenge}
      </p>

      <div className="relative mt-5">
        <p className="font-comic text-lg tracking-wide text-white">HOW I DESIGNED IT</p>
        <ul className="mt-2 space-y-2">
          {c.design.map((d, k) => (
            <motion.li
              key={k}
              className="flex gap-3 font-grotesk text-[15px] leading-snug text-white/80"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + k * 0.07 }}
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded font-comic text-xs text-[#0d0e18]" style={{ background: SWATCH[(i + k + 1) % SWATCH.length] }}>
                {k + 1}
              </span>
              {d}
            </motion.li>
          ))}
        </ul>
      </div>

      {c.build && (
        <div className="relative mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
          <p className="font-comic text-lg tracking-wide text-[#a3b4ff]">‹/› THEN I BUILT IT</p>
          <p className="mt-1 font-grotesk text-sm leading-relaxed text-white/75">{c.build}</p>
        </div>
      )}

      {c.liveUrl && (
        <div className="relative mt-5">
          <Peek url={c.liveUrl} title={c.title} />
        </div>
      )}

      <div className="relative mt-5 flex flex-wrap items-center gap-1.5 pt-1">
        {c.tools.map((t) => (
          <span key={t} className="rounded-md border border-white/15 bg-[#0d0e18]/60 px-2 py-1 font-grotesk text-xs font-semibold text-white/80">
            {t}
          </span>
        ))}
        {c.liveUrl && (
          <a
            href={c.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-comic text-lg tracking-wide text-[#0d0e18] transition hover:-translate-y-0.5"
            style={{ background: col, boxShadow: '3px 3px 0 #a33a8d' }}
          >
            VISIT LIVE ↗
          </a>
        )}
      </div>
    </motion.article>
  );
}

export default function UXIssue({ f }: { f: Folder }) {
  return (
    <div className="relative">
      {f.process.length > 0 && (
        <div className="mb-14">
          <p className="mb-5 font-comic text-2xl tracking-wide text-white sm:text-3xl">
            <Misprint>HOW I WORK</Misprint>
          </p>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {f.process.map((p, i) => (
              <motion.li
                key={p.title}
                className="sv-step group relative rounded-xl p-4"
                style={{ ['--c' as any]: SWATCH[i % SWATCH.length] }}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 16, delay: i * 0.09 }}
              >
                <span className="sv-misprint block font-comic text-5xl leading-none" style={{ color: SWATCH[i % SWATCH.length] }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mt-2 block font-comic text-xl tracking-wide text-white">{p.title}</span>
                <span className="mt-1 block font-grotesk text-sm leading-snug text-white/70">{p.detail}</span>
                {i < f.process.length - 1 && <span className="sv-arrow absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden />}
              </motion.li>
            ))}
          </ol>
        </div>
      )}

      {f.callout && (
        <motion.div
          className="sv-callout relative mb-14 overflow-hidden rounded-2xl p-5 sm:p-7"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="sv-dots pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="shrink-0 font-comic text-[2.6rem] leading-none tracking-wide text-white">
              <Misprint>DESIGN ⇄ CODE</Misprint>
            </span>
            <p className="font-grotesk text-base leading-relaxed text-white/90 sm:text-lg">{f.callout}</p>
          </div>
        </motion.div>
      )}

      {f.caseStudies.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {f.caseStudies.map((c, i) => (
            <Case key={c.title} c={c} i={i} />
          ))}
        </div>
      )}
    </div>
  );
}

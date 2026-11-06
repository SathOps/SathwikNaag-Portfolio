'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './Icons';

type R = { slug: string; title: string; subtitle: string; file: string | null; preview: string | null };

export default function Resumes({ items, variant }: { items: R[]; variant: 'comic' | 'tech' }) {
  const [open, setOpen] = useState<R | null>(null);
  const [canEmbed, setCanEmbed] = useState(true);
  useEffect(() => {
    setCanEmbed(window.matchMedia('(min-width: 900px) and (hover: hover)').matches);
  }, []);
  useEffect(() => {
    if (!open) return;
    const l = (window as any).__lenis;
    l?.stop();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    addEventListener('keydown', k);
    return () => {
      l?.start();
      removeEventListener('keydown', k);
    };
  }, [open]);

  const comic = variant === 'comic';
  return (
    <>
      {comic ? (
        <div className="flex flex-wrap items-end justify-center gap-x-10 gap-y-16 pt-10">
          {items.map((r, i) => (
            <FolderCard key={r.slug} r={r} i={i} onOpen={() => setOpen(r)} />
          ))}
        </div>
      ) : (
      <div className={`grid gap-5 ${items.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
        {items.map((r, i) => (
          <motion.div
            key={r.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={
              comic
                ? 'comic-panel group overflow-hidden rounded-2xl'
                : 'group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-[#3b82f6]/60'
            }
            style={comic ? { rotate: `${[-1.5, 1.2, -0.8, 1.6][i % 4]}deg` } : undefined}
          >
            <button onClick={() => setOpen(r)} className="relative block aspect-[1/1.2] w-full overflow-hidden bg-white" aria-label={`Preview ${r.title} resume`} data-cursor>
              {r.preview && (
                <Image src={r.preview} alt={`${r.title} resume, first page`} fill sizes="(max-width:768px) 90vw, 25vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              )}
              <span className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 py-3 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100 ${comic ? 'bg-[#ffd23f] font-comic text-lg text-black' : 'bg-[#3b82f6] font-mono text-white'}`}>
                <Icon name="eye" className="h-4 w-4" /> Preview
              </span>
            </button>
            <div className={`flex items-center justify-between gap-3 p-4 ${comic ? 'border-t-[3px] border-black' : 'border-t border-white/10'}`}>
              <div className="min-w-0">
                <div className={comic ? 'font-comic text-2xl leading-none tracking-wide' : 'font-sans text-base font-semibold text-white'}>{r.title}</div>
                <div className={comic ? 'mt-1 font-grotesk text-xs font-semibold' : 'mt-1 font-mono text-[11px] text-white/50'}>{r.subtitle}</div>
              </div>
              {r.file && (
                <a
                  href={r.file}
                  download
                  aria-label={`Download ${r.title} resume`}
                  className={comic ? 'comic-btn grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#2e86de] text-white' : 'grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/15 text-white hover:border-[#3b82f6] hover:bg-[#3b82f6]'}
                >
                  <Icon name="download" className="h-5 w-5" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[160] flex flex-col bg-black/85 p-3 backdrop-blur sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div
              className={`mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl ${comic ? 'border-[3px] border-black bg-white' : 'border border-white/15 bg-[#0a0d16]'}`}
              initial={{ y: 40, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex items-center justify-between gap-3 px-4 py-3 ${comic ? 'border-b-[3px] border-black bg-[#ffd23f] text-black' : 'border-b border-white/10 text-white'}`}>
                <div className={comic ? 'font-comic text-2xl tracking-wide' : 'font-mono text-sm'}>{open.title}</div>
                <div className="flex items-center gap-2">
                  {open.file && (
                    <>
                      <a href={open.file} target="_blank" rel="noreferrer" className={`hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold sm:inline-flex ${comic ? 'border-2 border-black bg-white' : 'border border-white/15 hover:border-[#3b82f6]'}`}>
                        <Icon name="external" className="h-4 w-4" /> Open
                      </a>
                      <a href={open.file} download className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${comic ? 'border-2 border-black bg-[#2e86de] text-white' : 'bg-[#3b82f6] text-white'}`}>
                        <Icon name="download" className="h-4 w-4" /> Download
                      </a>
                    </>
                  )}
                  <button aria-label="Close" onClick={() => setOpen(null)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-black/10">
                    <Icon name="close" className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-neutral-200" data-lenis-prevent>
                {canEmbed && open.file ? (
                  <iframe src={`${open.file}#view=FitH&toolbar=0`} title={`${open.title} resume`} className="h-full w-full" />
                ) : (
                  open.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={open.preview} alt={`${open.title} resume`} className="mx-auto w-full max-w-3xl" />
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- design world: each resume is a sheet sticking out of a comic file folder ---------- */
const FOLDER = [
  { back: '#2e86de', front: '#ffd23f', tab: '#ef3e36' },
  { back: '#ef3e36', front: '#19c3b1', tab: '#ffd23f' },
  { back: '#19c3b1', front: '#ffffff', tab: '#2e86de' },
  { back: '#ffd23f', front: '#2e86de', tab: '#ff5fa2' },
];

function FolderCard({ r, i, onOpen }: { r: R; i: number; onOpen: () => void }) {
  const c = FOLDER[i % FOLDER.length];
  const tilt = [-3, 3, -2, 2][i % 4];
  return (
    <motion.div
      className="group relative w-[min(88vw,380px)]"
      initial={{ opacity: 0, y: 80, rotate: tilt * 4 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 140, damping: 14, delay: i * 0.15 }}
      whileHover={{ rotate: 0, y: -6 }}
    >
      {/* FREE! sticker */}
      <motion.span
        className="absolute -right-5 -top-8 z-30 grid h-20 w-20 place-items-center"
        initial={{ scale: 0, rotate: -60 }}
        whileInView={{ scale: 1, rotate: 14 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 260, damping: 10, delay: 0.45 + i * 0.15 }}
        aria-hidden
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <path d="M50 2 L58 22 L78 10 L76 32 L98 34 L82 50 L98 66 L76 68 L78 90 L58 78 L50 98 L42 78 L22 90 L24 68 L2 66 L18 50 L2 34 L24 32 L22 10 L42 22 Z" fill="#fff" stroke="#111" strokeWidth="4" />
        </svg>
        <span className="relative font-comic text-xl leading-none text-[#ef3e36]">FREE!</span>
      </motion.span>

      <button onClick={onOpen} className="relative block h-[430px] w-full text-left" aria-label={`Preview ${r.title} resume`} data-cursor>
        {/* folder back + tab */}
        <span className="absolute inset-x-0 bottom-0 top-6 rounded-2xl rounded-tl-none border-[3px] border-black shadow-[7px_7px_0_#111]" style={{ background: c.back }} />
        <span className="absolute left-0 top-0 h-8 w-[42%] rounded-t-xl border-[3px] border-b-0 border-black" style={{ background: c.back }} />
        <span className="absolute left-3 top-1.5 font-comic text-sm tracking-widest text-white">FILE No.{String(i + 1).padStart(2, '0')}</span>

        {/* the resume sheet: slides up when you reach for it */}
        <motion.span
          className="absolute left-[8%] top-[13%] block h-[74%] w-[84%] overflow-hidden border-[3px] border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,.35)] transition-transform duration-500 ease-[cubic-bezier(.2,1.4,.4,1)] group-hover:-translate-y-16 group-hover:-rotate-3"
        >
          {r.preview && <Image src={r.preview} alt={`${r.title} resume, first page`} fill sizes="340px" className="object-cover object-top" />}
          <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgba(0,0,0,.025)_3px_4px)]" />
        </motion.span>

        {/* folder front pocket */}
        <span
          className="absolute inset-x-0 bottom-0 z-10 flex h-[46%] flex-col justify-between rounded-2xl border-[3px] border-black p-5"
          style={{ background: c.front, clipPath: 'polygon(0 14%, 62% 14%, 70% 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          <span className="halftone pointer-events-none absolute inset-0 rounded-2xl text-black/10" />
          <span className="relative mt-6 block">
            <span className="block font-comic text-[2.1rem] leading-[0.95] tracking-wide text-black">{r.title}</span>
            <span className="mt-1 block font-grotesk text-sm font-bold text-black/75">{r.subtitle}</span>
          </span>
          <span className="relative flex items-center justify-between">
            <span className="rotate-[-6deg] rounded border-[3px] px-2 py-0.5 font-comic text-lg tracking-widest" style={{ borderColor: '#ef3e36', color: '#ef3e36', background: 'rgba(255,255,255,.8)' }}>
              RESUME
            </span>
            <span className="inline-flex items-center gap-1.5 font-comic text-lg tracking-wide text-black">
              <Icon name="eye" className="h-5 w-5" /> PEEK
            </span>
          </span>
        </span>
      </button>

      {r.file && (
        <a
          href={r.file}
          download
          className="comic-btn relative z-20 mx-auto -mt-4 flex w-fit items-center gap-2 rounded-xl bg-black px-5 py-2.5 font-comic text-xl tracking-wide text-[#ffd23f]"
        >
          <Icon name="download" className="h-5 w-5" /> DOWNLOAD
        </a>
      )}
    </motion.div>
  );
}

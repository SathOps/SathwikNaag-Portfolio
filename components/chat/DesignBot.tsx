'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ChatDoc } from '@/lib/content';
import { follow, useChat } from './useChat';
import Typer from './Typer';
import { Icon } from '@/components/ui/Icons';

/* "Doodle": a cute comic ink-blob who answers design questions. */
function Doodle({ size = 64, mood = 'idle' }: { size?: number; mood?: 'idle' | 'happy' | 'think' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="db-doodle overflow-visible" aria-hidden>
      {/* antenna with a star */}
      <path d="M50 18 Q54 8 62 6" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
      <path className="db-star" d="M64 1l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L56.2 6.7l5.4-.8z" fill="#ff5fa2" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      {/* body */}
      <path d="M50 16c22 0 38 15 38 36 0 22-17 38-38 38S12 74 12 52c0-21 16-36 38-36z" fill="#ffd23f" stroke="#111" strokeWidth="5" />
      <path d="M26 40c3-9 11-15 20-16" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".8" />
      {/* eyes */}
      <g className="db-eyes">
        {mood === 'happy' ? (
          <>
            <path d="M33 52q5-7 10 0" fill="none" stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M57 52q5-7 10 0" fill="none" stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="38" cy={mood === 'think' ? 47 : 51} rx="5.5" ry="7" fill="#111" />
            <ellipse cx="62" cy={mood === 'think' ? 47 : 51} rx="5.5" ry="7" fill="#111" />
            <circle cx="40" cy={mood === 'think' ? 44 : 48} r="2" fill="#fff" />
            <circle cx="64" cy={mood === 'think' ? 44 : 48} r="2" fill="#fff" />
          </>
        )}
      </g>
      {/* cheeks + mouth */}
      <ellipse cx="27" cy="63" rx="6" ry="4" fill="#ff5fa2" opacity=".75" />
      <ellipse cx="73" cy="63" rx="6" ry="4" fill="#ff5fa2" opacity=".75" />
      {mood === 'think' ? <path d="M45 68h10" stroke="#111" strokeWidth="4" strokeLinecap="round" /> : <path d="M42 65q8 8 16 0" fill="#ef3e36" stroke="#111" strokeWidth="4" strokeLinejoin="round" />}
      {/* little pencil arm */}
      <g className="db-arm">
        <path d="M86 58l10-8" stroke="#111" strokeWidth="5" strokeLinecap="round" />
        <path d="M93 46l6-5 3 3-5 6z" fill="#2e86de" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default function DesignBot({ docs, whatsapp }: { docs: ChatDoc[]; whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chipsOpen, setChipsOpen] = useState(true);
  const [hint, setHint] = useState(false);
  const { msgs, thinking, ask, reset, featured } = useChat(docs, 'design', whatsapp);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 4000);
    const u = setTimeout(() => setHint(false), 11000);
    return () => {
      clearTimeout(t);
      clearTimeout(u);
    };
  }, []);
  // keep the newest line in view, including while an answer is typing out
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    const mo = new MutationObserver(() => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
    });
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [msgs, thinking, open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [open]);

  const go = (url: string) => {
    if (!follow(url, () => setOpen(false))) window.location.href = url.startsWith('#') ? `/design${url}` : url;
  };
  const asked = new Set(msgs.filter((m) => m.from === 'user').map((m) => m.text));
  const mood = thinking ? 'think' : msgs.length ? 'happy' : 'idle';

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex flex-col items-end sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            className="db-panel pointer-events-auto relative mb-4 flex h-[min(620px,calc(100svh-120px))] w-[min(400px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-[22px] border-[4px] border-black bg-white shadow-[8px_8px_0_#111]"
            initial={{ scale: 0.2, opacity: 0, rotate: 8, y: 40 }}
            animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.3, opacity: 0, rotate: 10, y: 40, transition: { duration: 0.22, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            role="dialog"
            aria-label="Ask Doodle about Sathwik's design work"
            data-lenis-prevent
          >
            {/* POP! burst on open */}
            <motion.span
              className="pointer-events-none absolute -left-3 -top-3 z-20 grid h-16 w-16 place-items-center"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: [0, 1.3, 1], rotate: -12 }}
              transition={{ delay: 0.12, duration: 0.4 }}
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <path d="M50 2 L58 22 L78 10 L76 32 L98 34 L82 50 L98 66 L76 68 L78 90 L58 78 L50 98 L42 78 L22 90 L24 68 L2 66 L18 50 L2 34 L24 32 L22 10 L42 22 Z" fill="#ff5fa2" stroke="#111" strokeWidth="5" />
              </svg>
              <span className="relative font-comic text-lg leading-none text-white">POP!</span>
            </motion.span>

            {/* header */}
            <div className="relative flex items-center gap-3 border-b-[4px] border-black bg-[#ffd23f] px-4 py-3 pl-14">
              <span className="halftone pointer-events-none absolute inset-0 text-[#ef3e36]/20" />
              <span className="relative -my-2">
                <Doodle size={48} mood={mood} />
              </span>
              <div className="relative min-w-0 flex-1">
                <p className="font-comic text-2xl leading-none tracking-wide">ASK DOODLE!</p>
                <p className="font-grotesk text-[11px] font-bold uppercase tracking-wider text-black/70">Design questions about Sathwik</p>
              </div>
              {msgs.length > 0 && (
                <button onClick={reset} className="relative rounded-lg border-2 border-black bg-white px-2 py-1 font-comic text-sm" aria-label="Start over">
                  RESET
                </button>
              )}
              <button onClick={() => setOpen(false)} className="relative grid h-9 w-9 place-items-center rounded-lg border-2 border-black bg-white" aria-label="Close chat">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            {/* conversation */}
            <div ref={scroller} className="relative min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#f7f0e1] p-4">
              <span className="halftone pointer-events-none absolute inset-0 text-black/[0.05]" />
              <Bubble side="bot">
                Hi! I&apos;m Doodle 👋 Pick a question below or type your own. If I don&apos;t know the answer, I&apos;ll pass it straight to Sathwik on WhatsApp.
              </Bubble>
              {msgs.map((m) =>
                m.from === 'user' ? (
                  <Bubble key={m.id} side="user">
                    {m.text}
                  </Bubble>
                ) : m.from === 'bot' ? (
                  <Bubble key={m.id} side="bot">
                    <Typer text={m.text} speed={3} />
                    {(m.source || m.link) && (
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        {m.source && <span className="rounded border-2 border-black bg-[#19c3b1] px-1.5 py-0.5 font-grotesk text-[10px] font-bold uppercase tracking-wider">from: {m.source}</span>}
                        {m.link && (
                          <button onClick={() => go(m.link!.url)} className="rounded-md border-2 border-black bg-[#ffd23f] px-2 py-0.5 font-comic text-sm tracking-wide shadow-[2px_2px_0_#111] hover:-translate-y-0.5">
                            {m.link.label} →
                          </button>
                        )}
                      </span>
                    )}
                  </Bubble>
                ) : (
                  <motion.div key={m.id} className="relative rounded-2xl border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_#111]" initial={{ scale: 0.6, rotate: -4, opacity: 0 }} animate={{ scale: 1, rotate: -1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                    <p className="font-comic text-xl leading-tight tracking-wide text-[#ef3e36]">STUMPED ME!</p>
                    <p className="mt-1 font-grotesk text-sm leading-snug">I don&apos;t have that one yet. Send it to Sathwik and he&apos;ll answer you himself.</p>
                    <a href={m.wa} target="_blank" rel="noreferrer" className="comic-btn mt-3 inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-3 py-2 font-comic text-lg tracking-wide text-black">
                      <Icon name="whatsapp" className="h-5 w-5" strokeWidth={2.2} /> SEND ON WHATSAPP
                    </a>
                    <p className="mt-2 font-grotesk text-[11px] text-black/55">Opens WhatsApp with your question ready to send.</p>
                  </motion.div>
                )
              )}
              {thinking && (
                <Bubble side="bot">
                  <span className="inline-flex gap-1 py-1" aria-label="Doodle is thinking">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-2.5 w-2.5 rounded-full bg-black" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.12 }} />
                    ))}
                  </span>
                </Bubble>
              )}
            </div>

            {/* suggested questions */}
            <div className="relative border-t-[3px] border-black bg-white px-3 pt-2">
              <button onClick={() => setChipsOpen((v) => !v)} className="mb-1 flex w-full items-center justify-between py-1 font-comic text-sm tracking-wide text-black/60" aria-expanded={chipsOpen}>
                TRY ASKING…
                <span className="transition-transform" style={{ transform: chipsOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>
              <AnimatePresence initial={false}>
              {chipsOpen && (
              <motion.div className="overflow-hidden" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.25 }}>
              <div className="flex flex-wrap gap-2 px-2 pb-3 pt-2">
                {featured.map((d, i) => (
                  <motion.button
                    key={d.id}
                    onClick={() => {
                      ask(d.question, d);
                      setChipsOpen(false);
                    }}
                    disabled={thinking}
                    className={`chat-chip rounded-xl border-[3px] border-black px-3 py-1.5 text-left font-grotesk text-[13px] font-bold leading-tight shadow-[3px_3px_0_#111] transition disabled:opacity-50 ${asked.has(d.question) ? 'bg-black/10' : ''}`}
                    style={{ background: asked.has(d.question) ? undefined : ['#ffd23f', '#ff5fa2', '#19c3b1', '#ffffff', '#8ec5ff'][i % 5], rotate: `${[-2, 1.5, -1, 2, -1.5][i % 5]}deg` }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 260, damping: 16 }}
                    whileHover={{ y: -3, rotate: 0 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {d.question}
                  </motion.button>
                ))}
              </div>
              </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* input */}
            <form
              className="relative flex items-center gap-2 border-t-[3px] border-black bg-[#ffd23f] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
                setInput('');
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your own question…"
                className="min-w-0 flex-1 rounded-xl border-[3px] border-black bg-white px-3 py-2 font-grotesk text-sm font-semibold outline-none placeholder:text-black/40 focus:shadow-[3px_3px_0_#ef3e36]"
                aria-label="Your question"
                maxLength={300}
              />
              <button type="submit" disabled={!input.trim() || thinking} className="comic-btn shrink-0 rounded-xl bg-black px-3 py-2 font-comic text-lg tracking-wide text-[#ffd23f] disabled:opacity-40">
                ASK!
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hint bubble */}
      <AnimatePresence>
        {hint && !open && (
          <motion.button
            onClick={() => setOpen(true)}
            className="speech pointer-events-auto mb-3 mr-2 max-w-[200px] p-3 text-left font-comic text-lg leading-tight shadow-[4px_4px_0_#111]"
            initial={{ scale: 0, rotate: 10, opacity: 0 }}
            animate={{ scale: 1, rotate: -3, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
          >
            Psst! Got a design question? Ask me!
          </motion.button>
        )}
      </AnimatePresence>

      {/* launcher */}
      <motion.button
        onClick={() => {
          setOpen((v) => !v);
          setHint(false);
        }}
        className="db-launch pointer-events-auto relative grid h-[76px] w-[76px] place-items-center rounded-full border-[4px] border-black bg-white shadow-[5px_5px_0_#111]"
        whileHover={{ scale: 1.08, rotate: -6 }}
        whileTap={{ scale: 0.9 }}
        animate={open ? { rotate: 0 } : { y: [0, -6, 0] }}
        transition={open ? { type: 'spring' } : { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        aria-label={open ? 'Close the design chat' : 'Open the design chat'}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} className="font-comic text-3xl">
              ✕
            </motion.span>
          ) : (
            <motion.span key="d" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="mt-1">
              <Doodle size={66} />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full border-[3px] border-black bg-[#ef3e36] font-comic text-sm text-white">?</span>
        )}
      </motion.button>
    </div>
  );
}

function Bubble({ side, children }: { side: 'bot' | 'user'; children: React.ReactNode }) {
  const bot = side === 'bot';
  return (
    <motion.div
      className={`relative flex ${bot ? 'justify-start' : 'justify-end'}`}
      initial={{ scale: 0.5, opacity: 0, x: bot ? -20 : 20 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      style={{ transformOrigin: bot ? 'left bottom' : 'right bottom' }}
    >
      <div
        className={`relative max-w-[85%] rounded-2xl border-[3px] border-black px-3 py-2 font-grotesk text-[14px] font-medium leading-snug shadow-[3px_3px_0_#111] ${bot ? 'rounded-bl-sm bg-white' : 'rounded-br-sm bg-[#2e86de] text-white'}`}
      >
        {children}
      </div>
    </motion.div>
  );
}

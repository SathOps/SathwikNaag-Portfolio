'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ChatDoc } from '@/lib/content';
import { follow, useChat } from './useChat';
import Typer from './Typer';
import { Icon } from '@/components/ui/Icons';

/* A multiverse-style bot: a glitchy portal with a little bot face, misprinted in cyan and magenta. */
function Portal({ size = 64, busy = false }: { size?: number; busy?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`tb-portal overflow-visible ${busy ? 'tb-busy' : ''}`} aria-hidden>
      <defs>
        <radialGradient id="tb-core" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#283b5c" />
          <stop offset="1" stopColor="#06060c" />
        </radialGradient>
        <pattern id="tb-dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.1" fill="#a33a8d" opacity=".55" />
        </pattern>
      </defs>
      {/* spinning dashed rings */}
      <g className="tb-ring">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#6fe0ee" strokeWidth="2" strokeDasharray="10 7" />
      </g>
      <g className="tb-ring tb-ring-rev">
        <circle cx="50" cy="50" r="41" fill="none" stroke="#a33a8d" strokeWidth="2" strokeDasharray="4 9" />
      </g>
      {/* core with offset misprint */}
      <circle cx="47" cy="51" r="33" fill="#a33a8d" opacity=".9" />
      <circle cx="53" cy="49" r="33" fill="#6fe0ee" opacity=".9" />
      <circle cx="50" cy="50" r="33" fill="url(#tb-core)" stroke="#dadde3" strokeWidth="2" />
      <circle cx="50" cy="50" r="33" fill="url(#tb-dots)" />
      {/* face */}
      <g className="tb-face">
        <rect x="33" y="40" width="10" height="13" rx="3" fill="#6fe0ee" className="tb-eye" />
        <rect x="57" y="40" width="10" height="13" rx="3" fill="#6fe0ee" className="tb-eye" />
        <path d="M40 63 Q50 70 60 63" fill="none" stroke="#dadde3" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      {/* antenna spark */}
      <path d="M50 17 V8" stroke="#dadde3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="6" r="4" fill="#ef4b5f" className="tb-spark" />
    </svg>
  );
}

export default function TechBot({ docs, whatsapp }: { docs: ChatDoc[]; whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chipsOpen, setChipsOpen] = useState(true);
  const { msgs, thinking, ask, reset, featured } = useChat(docs, 'tech', whatsapp);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 450);
    return () => {
      removeEventListener('keydown', k);
      clearTimeout(t);
    };
  }, [open]);

  const go = (url: string) => {
    if (!follow(url, () => setOpen(false))) window.location.href = url.startsWith('#') ? `/tech${url}` : url;
  };
  const asked = new Set(msgs.filter((m) => m.from === 'user').map((m) => m.text));

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex flex-col items-end font-mono sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            className="tb-panel pointer-events-auto relative mb-4 flex h-[min(620px,calc(100svh-120px))] w-[min(420px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-2xl"
            initial={{ opacity: 0, scale: 0.85, y: 30, clipPath: 'inset(100% 0 0 0)' }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              // opens in jumpy slices, like a frame tearing in from another universe
              clipPath: ['inset(100% 0 0 0)', 'inset(70% 0 0 0)', 'inset(74% 0 0 0)', 'inset(35% 0 0 0)', 'inset(40% 0 0 0)', 'inset(0% 0 0 0)'],
              x: [0, -8, 6, -4, 2, 0],
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20, clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.25, ease: 'easeIn' } }}
            transition={{ duration: 0.5, ease: 'linear', opacity: { duration: 0.15 }, scale: { type: 'spring', stiffness: 260, damping: 22 } }}
            role="dialog"
            aria-label="Ask about Sathwik's tech work"
            data-lenis-prevent
          >
            <span className="tb-scan pointer-events-none absolute inset-0 z-10" />
            {/* header */}
            <div className="relative flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#a33a8d]/30 via-[#283b5c]/40 to-[#6fe0ee]/20 px-4 py-3">
              <Portal size={40} busy={thinking} />
              <div className="min-w-0 flex-1">
                <p className="tb-misprint truncate font-sans text-base font-semibold tracking-tight text-white">ask_sathwik()</p>
                <p className="truncate text-[10px] uppercase tracking-[0.25em] text-[#6fe0ee]/80">rag · {docs.length} docs indexed · tech</p>
              </div>
              {msgs.length > 0 && (
                <button onClick={reset} className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-white/70 hover:border-[#6fe0ee] hover:text-white" aria-label="Clear chat">
                  clear
                </button>
              )}
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-md border border-white/15 text-white/80 hover:border-[#a33a8d] hover:text-white" aria-label="Close chat">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            {/* conversation */}
            <div ref={scroller} className="relative min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 text-[13px] leading-relaxed">
              <Line from="bot">
                <span className="text-white/85">
                  Hey, I answer questions about Sathwik&apos;s tech side by retrieving from his projects, experience and FAQs. Pick a prompt or type your own. No match? I&apos;ll route it to him on WhatsApp.
                </span>
              </Line>
              {msgs.map((m) =>
                m.from === 'user' ? (
                  <Line key={m.id} from="user">
                    {m.text}
                  </Line>
                ) : m.from === 'bot' ? (
                  <Line key={m.id} from="bot">
                    <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-[#a3b4ff]/70">
                      ▸ retrieve → {m.retrieved} match{m.retrieved === 1 ? '' : 'es'} · score {(m.confidence ?? 0).toFixed(2)}
                    </span>
                    <span className="font-sans text-[14px] text-white/90">
                      <Typer text={m.text} speed={4} caret={<span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-[#6fe0ee]" />} />
                    </span>
                    {(m.source || m.link) && (
                      <span className="mt-2.5 flex flex-wrap items-center gap-2">
                        {m.source && <span className="rounded border border-[#6fe0ee]/40 bg-[#6fe0ee]/10 px-1.5 py-0.5 text-[10px] text-[#6fe0ee]">src: {m.source}</span>}
                        {m.link && (
                          <button onClick={() => go(m.link!.url)} className="rounded border border-[#a33a8d]/60 bg-[#a33a8d]/15 px-2 py-0.5 text-[11px] text-white hover:bg-[#a33a8d]/40">
                            {m.link.label} →
                          </button>
                        )}
                      </span>
                    )}
                  </Line>
                ) : (
                  <motion.div
                    key={m.id}
                    className="tb-fallback relative rounded-xl p-3.5"
                    initial={{ opacity: 0, x: -10, clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#ef4b5f]">404 · no confident match</p>
                    <p className="mt-1 font-sans text-[14px] text-white/90">That one isn&apos;t in my index yet. Route it to Sathwik and he&apos;ll reply himself.</p>
                    <a href={m.wa} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25d366] px-3 py-2 font-sans text-sm font-semibold text-black transition hover:brightness-110">
                      <Icon name="whatsapp" className="h-4 w-4" /> Send on WhatsApp
                    </a>
                    <p className="mt-2 text-[10px] text-white/40">opens WhatsApp with your question prefilled</p>
                  </motion.div>
                )
              )}
              {thinking && (
                <Line from="bot">
                  <span className="tb-misprint text-[11px] uppercase tracking-[0.2em] text-[#6fe0ee]">
                    retrieving<span className="tb-dots" />
                  </span>
                </Line>
              )}
            </div>

            {/* prompts */}
            <div className="relative border-t border-white/10 px-3 pt-2">
              <button onClick={() => setChipsOpen((v) => !v)} className="mb-1 flex w-full items-center justify-between py-1 text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white/70" aria-expanded={chipsOpen}>
                // suggested prompts
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
                    className={`chat-chip rounded-lg px-3 py-1.5 text-left text-[12px] leading-snug transition disabled:opacity-40 ${asked.has(d.question) ? 'tb-chip-asked' : 'tb-chip'}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    aria-label={asked.has(d.question) ? `${d.question} (already asked)` : undefined}
                  >
                    <span className={asked.has(d.question) ? 'text-white/35' : 'text-[#6fe0ee]'}>{asked.has(d.question) ? '✓' : '>'}</span> {d.question}
                  </motion.button>
                ))}
              </div>
              </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* input */}
            <form
              className="relative flex items-center gap-2 border-t border-white/10 bg-black/30 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
                setInput('');
              }}
            >
              <span className="text-[#a33a8d]">❯</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ask anything about my tech work…"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
                aria-label="Your question"
                maxLength={300}
              />
              <button type="submit" disabled={!input.trim() || thinking} className="rounded-md bg-gradient-to-r from-[#a33a8d] to-[#5d78cf] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:brightness-125 disabled:opacity-30">
                run ↵
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* launcher */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="tb-launch pointer-events-auto relative grid h-[72px] w-[72px] place-items-center rounded-full"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        aria-label={open ? 'Close the tech chat' : 'Open the tech chat'}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" className="grid h-14 w-14 place-items-center rounded-full border border-[#6fe0ee]/50 bg-[#06060c] text-2xl text-white" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}>
              ✕
            </motion.span>
          ) : (
            <motion.span key="p" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Portal size={72} />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && <span className="tb-tag absolute -left-2 -top-1 rounded bg-[#a33a8d] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">ask</span>}
      </motion.button>
    </div>
  );
}

function Line({ from, children }: { from: 'bot' | 'user'; children: React.ReactNode }) {
  const bot = from === 'bot';
  return (
    <motion.div className={`flex ${bot ? 'justify-start' : 'justify-end'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className={`max-w-[88%] rounded-xl px-3 py-2 ${bot ? 'tb-bot-msg' : 'border border-[#6fe0ee]/40 bg-[#6fe0ee]/10 text-[#e8fbff]'}`}>
        {!bot && <span className="mr-1 text-[#6fe0ee]">$</span>}
        {children}
      </div>
    </motion.div>
  );
}

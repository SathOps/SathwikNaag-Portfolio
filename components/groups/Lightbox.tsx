'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Media } from '@/lib/content';
import { Icon } from '@/components/ui/Icons';

type Ctx = { open: (items: Media[], index: number) => void };
const LightboxCtx = createContext<Ctx>({ open: () => {} });
export const useLightbox = () => useContext(LightboxCtx);

export function LightboxProvider({ children, tone = 'dark' }: { children: React.ReactNode; tone?: 'dark' | 'comic' }) {
  const [state, setState] = useState<{ items: Media[]; index: number } | null>(null);
  const open = useCallback((items: Media[], index: number) => setState({ items, index }), []);
  const close = () => setState(null);
  const step = useCallback(
    (d: number) => setState((s) => (s ? { ...s, index: (s.index + d + s.items.length) % s.items.length } : s)),
    []
  );

  useEffect(() => {
    if (!state) return;
    const lenis = (window as any).__lenis;
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    addEventListener('keydown', key);
    return () => {
      removeEventListener('keydown', key);
      lenis?.start();
      document.body.style.overflow = '';
    };
  }, [state, step]);

  const cur = state?.items[state.index];
  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {state && cur && (
          <motion.div
            className="fixed inset-0 z-[150] flex flex-col bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
              <span className={tone === 'comic' ? 'font-comic text-xl tracking-wide' : 'font-mono text-xs'}>
                {state.index + 1} / {state.items.length}
              </span>
              <button aria-label="Close" onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={cur.src}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="flex h-full max-h-full w-full items-center justify-center"
                >
                  {cur.video ? (
                    <video src={cur.video} poster={cur.src} controls autoPlay muted loop playsInline className="max-h-[78vh] max-w-full rounded-lg" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cur.src} alt={cur.caption || ''} className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-2xl" />
                  )}
                </motion.div>
              </AnimatePresence>
              {state.items.length > 1 && (
                <>
                  <button aria-label="Previous" onClick={() => step(-1)} className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/25 sm:left-5">
                    <Icon name="chevronLeft" className="h-6 w-6" />
                  </button>
                  <button aria-label="Next" onClick={() => step(1)} className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/25 sm:right-5">
                    <Icon name="chevronRight" className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            <div className="px-6 py-4 text-center text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
              {cur.caption}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxCtx.Provider>
  );
}

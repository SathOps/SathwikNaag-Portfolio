'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ChatDoc } from '@/lib/content';
import { buildIndex, isConfident, search, type Hit } from '@/lib/chatSearch';

export type Msg =
  | { id: number; from: 'user'; text: string }
  | { id: number; from: 'bot'; text: string; source?: string; link?: { label: string; url: string } | null; confidence?: number; retrieved?: number }
  | { id: number; from: 'fallback'; text: string; wa: string };

export function useChat(docs: ChatDoc[], world: 'design' | 'tech', whatsapp: string) {
  const index = useMemo(() => buildIndex(docs), [docs]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const id = useRef(0);
  const gen = useRef(0); // bumps on reset so a pending answer can't land in a cleared chat
  const featured = useMemo(() => docs.filter((d) => d.featured), [docs]);

  const ask = useCallback(
    (text: string, direct?: ChatDoc) => {
      const q = text.trim();
      if (!q || thinking) return;
      setMsgs((m) => [...m, { id: ++id.current, from: 'user', text: q }]);
      setThinking(true);
      const hits: Hit[] = direct ? [{ doc: direct, score: 10, confidence: 1, coverage: 1, phrase: true }] : search(index, q);
      const best = hits[0];
      const g = gen.current;
      window.setTimeout(
        () => {
          if (g !== gen.current) return;
          setThinking(false);
          if (isConfident(best)) {
            setMsgs((m) => [
              ...m,
              { id: ++id.current, from: 'bot', text: best.doc.answer, source: best.doc.source, link: best.doc.link, confidence: best.confidence, retrieved: hits.length },
            ]);
          } else {
            const msg = `Hi Sathwik! A question from your portfolio (${world === 'tech' ? 'Tech' : 'Design'} World): ${q}`;
            setMsgs((m) => [
              ...m,
              {
                id: ++id.current,
                from: 'fallback',
                text: q,
                wa: `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`,
              },
            ]);
          }
        },
        direct ? 450 : 750
      );
    },
    [index, thinking, whatsapp, world]
  );

  const reset = useCallback(() => {
    gen.current++;
    setThinking(false);
    setMsgs([]);
  }, []);
  return { msgs, thinking, ask, reset, featured };
}

/** scroll to an in-page section (#id) through Lenis, or follow a normal link */
export function follow(url: string, close: () => void) {
  if (url.startsWith('#')) {
    const el = document.getElementById(url.slice(1));
    if (el) {
      close();
      const l = (window as any).__lenis;
      const y = el.getBoundingClientRect().top + window.scrollY;
      l ? l.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: 'smooth' });
      return true;
    }
  }
  return false;
}

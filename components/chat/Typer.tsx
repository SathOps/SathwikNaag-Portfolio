'use client';
import { useEffect, useState } from 'react';

/** Types text out a few characters per frame; calls onDone once finished. */
export default function Typer({ text, speed = 2, onDone, caret }: { text: string; speed?: number; onDone?: () => void; caret?: React.ReactNode }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(text.length);
      onDone?.();
      return;
    }
    let raf = 0;
    let i = 0;
    const tick = () => {
      i = Math.min(text.length, i + speed);
      setN(i);
      if (i < text.length) raf = requestAnimationFrame(tick);
      else onDone?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && caret}
    </>
  );
}

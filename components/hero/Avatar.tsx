'use client';
import { useEffect, useState } from 'react';

/** Shared blink clock so several avatar layers blink together. */
export function useBlink() {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let t: number;
    const schedule = () => {
      t = window.setTimeout(() => {
        setClosed(true);
        window.setTimeout(() => {
          setClosed(false);
          // occasional double blink
          if (Math.random() < 0.25)
            window.setTimeout(() => {
              setClosed(true);
              window.setTimeout(() => setClosed(false), 110);
            }, 160);
          schedule();
        }, 120);
      }, 2600 + Math.random() * 3400);
    };
    schedule();
    return () => window.clearTimeout(t);
  }, []);
  return closed;
}

export default function Avatar({
  open,
  blink,
  closed,
  alt,
  className = '',
  style,
  priority,
}: {
  open: string;
  blink?: string | null;
  closed: boolean;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  return (
    <div className={`relative ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={open} alt={alt} className="block h-full w-full object-contain object-bottom select-none" draggable={false} fetchPriority={priority ? 'high' : 'auto'} />
      {blink && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blink}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain object-bottom select-none"
          style={{ opacity: closed ? 1 : 0 }}
          draggable={false}
        />
      )}
    </div>
  );
}

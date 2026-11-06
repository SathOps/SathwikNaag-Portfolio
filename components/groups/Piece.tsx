'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { Media } from '@/lib/content';
import { useLightbox } from './Lightbox';

/** A single design piece: image or autoplaying (in-view) muted video. Click opens the lightbox. */
export default function Piece({
  m,
  list,
  index,
  sizes = '(max-width: 768px) 90vw, 40vw',
  className = '',
  fit = 'cover',
  priority,
  rounded = '',
  caption = true,
}: {
  m: Media;
  list: Media[];
  index: number;
  sizes?: string;
  className?: string;
  fit?: 'cover' | 'contain';
  priority?: boolean;
  rounded?: string;
  caption?: boolean;
}) {
  const { open } = useLightbox();
  const vref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <figure className={`group/piece relative ${className}`}>
      <button
        type="button"
        onClick={() => open(list, index)}
        className={`f-piece relative block h-full w-full overflow-hidden ${rounded} transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1`}
        aria-label={m.caption ? `Open ${m.caption}` : 'Open piece'}
        data-cursor
      >
        {m.video ? (
          <video
            ref={vref}
            src={m.video}
            poster={m.src}
            muted
            loop
            playsInline
            preload="none"
            className={`h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain'}`}
          />
        ) : (
          <Image
            src={m.src}
            alt={m.caption || 'Design piece'}
            width={m.w}
            height={m.h}
            sizes={sizes}
            priority={priority}
            className={`h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain'} transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover/piece:scale-[1.03]`}
          />
        )}
        {m.video && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">motion</span>
        )}
      </button>
      {caption && m.caption && (
        <figcaption className="pointer-events-none mt-2 text-[13px] leading-tight opacity-75">{m.caption}</figcaption>
      )}
    </figure>
  );
}

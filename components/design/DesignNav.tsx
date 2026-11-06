'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWorldNav } from '@/components/ui/Transition';

export default function DesignNav({ items }: { items: { slug: string; name: string }[] }) {
  const { go } = useWorldNav();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(scrollY > 40);
    f();
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-[90] transition-all ${scrolled ? 'py-2' : 'py-4'}`}>
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-3 sm:px-6">
        <Link
          href="/"
          aria-label="Back to home"
          className="comic-btn whitespace-nowrap rounded-xl bg-[#ffd23f] px-3 py-1 text-lg text-black sm:text-xl"
          onClick={(e) => {
            e.preventDefault();
            go('/', 'home');
          }}
        >
          ← <span className="hidden sm:inline">BACK TO </span>HOME
        </Link>
        <div className="comic-panel hidden items-center gap-1 rounded-full px-2 py-1 font-comic text-lg tracking-wide text-black md:flex">
          {[
            ['Work', '#work'],
            ['Experience', '#experience'],
            ['Resumes', '#resumes'],
            ['Contact', '#contact'],
          ].map(([l, h]) => (
            <a key={h} href={h} className="rounded-full px-3 py-1 transition-colors hover:bg-[#ffd23f]">
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => go('/tech', 'tech')}
            className="flex items-center gap-2 rounded-xl border-[3px] border-black bg-[#05060a] px-3 py-1.5 font-mono text-xs text-white shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-0.5 sm:text-sm"
          >
            tech_world <span className="text-[#3b82f6]">→</span>
          </button>
          <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="comic-btn rounded-xl bg-white px-3 py-1 text-xl text-black md:hidden">
            {open ? '×' : '≡'}
          </button>
        </div>
      </nav>
      {open && (
        <div className="comic-panel mx-3 mt-2 max-h-[70vh] overflow-auto rounded-2xl p-3 font-comic text-xl text-black md:hidden">
          {[['Work', '#work'], ['Experience', '#experience'], ['Resumes', '#resumes'], ['Contact', '#contact']].map(([l, h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-[#ffd23f]">
              {l}
            </a>
          ))}
          <div className="mt-2 border-t-2 border-black pt-2 font-grotesk text-sm font-semibold">
            {items.map((i) => (
              <a key={i.slug} href={`#${i.slug}`} onClick={() => setOpen(false)} className="block rounded px-3 py-1.5 hover:bg-[#ffd23f]">
                {i.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

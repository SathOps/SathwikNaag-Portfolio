'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWorldNav } from '@/components/ui/Transition';
import { Icon } from '@/components/ui/Icons';
import { gmailLink } from '@/lib/links';

export function TechNav() {
  const { go } = useWorldNav();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(scrollY > 30);
    f();
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);
  const links = [
    ['stack', '#stack'],
    ['github', '#github'],
    ['experience', '#experience'],
    ['projects', '#projects'],
    ['resume', '#resumes'],
    ['contact', '#contact'],
  ];
  return (
    <header className={`fixed inset-x-0 top-0 z-[90] transition-all ${scrolled ? 'border-b border-white/[0.06] bg-[#05060a]/75 py-3 backdrop-blur-xl' : 'py-5'}`}>
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 font-mono text-sm sm:px-8">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go('/', 'home');
          }}
          className="group inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-white transition hover:border-[#3b82f6] hover:bg-[#3b82f6]/15"
          aria-label="Back to home"
        >
          <Icon name="arrowLeft" className="h-4 w-4 text-[#3b82f6] transition-transform group-hover:-translate-x-0.5" />
          <span>
            back<span className="hidden sm:inline">_to</span>_home
          </span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([l, h], i) => (
            <a key={h} href={h} className="rounded-md px-3 py-1.5 text-white/60 transition-colors hover:bg-white/5 hover:text-white">
              <span className="text-[#3b82f6]">0{i + 1}.</span>
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => go('/design', 'design')}
            className="rounded-lg border-2 border-black bg-[#ffd23f] px-3 py-1 font-comic text-base tracking-wide text-black shadow-[3px_3px_0_#3b82f6] transition-transform hover:-translate-y-0.5"
          >
            ← DESIGN<span className="hidden sm:inline"> WORLD</span>
          </button>
          <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-white md:hidden">
            <Icon name={open ? 'close' : 'menu'} className="h-4 w-4" />
          </button>
        </div>
      </nav>
      {open && (
        <div className="mx-4 mt-3 rounded-xl border border-white/10 bg-[#0a0d16] p-2 font-mono text-sm md:hidden">
          {links.map(([l, h], i) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-white/80 hover:bg-white/5">
              <span className="text-[#3b82f6]">0{i + 1}.</span>
              {l}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

function useTyped(words: readonly string[]) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[i % words.length];
    const t = setTimeout(
      () => {
        if (!del && n < w.length) setN(n + 1);
        else if (!del && n === w.length) setDel(true);
        else if (del && n > 0) setN(n - 1);
        else {
          setDel(false);
          setI(i + 1);
        }
      },
      !del && n === w.length ? 1600 : del ? 28 : 60
    );
    return () => clearTimeout(t);
  }, [n, del, i, words]);
  return words[i % words.length].slice(0, n);
}

type Social = { label: string; url: string | null; icon: string };

export function TechHero({
  name,
  intro,
  roles,
  stats,
  location,
  education,
  available,
  email,
  whatsapp,
  socials,
  code,
}: {
  name: string;
  intro: string;
  roles: readonly string[];
  stats: { value: string; label: string }[];
  location: string;
  education: string;
  available: string;
  email: string;
  whatsapp: string;
  socials: readonly Social[];
  code: { focus: string[]; stack: string[]; leetcode: string };
}) {
  const typed = useTyped(roles);
  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi Sathwik, I saw your portfolio and would like to connect.')}`;
  const quick = socials.filter((s) => ['github', 'linkedin', 'leetcode', 'gitlab'].includes(s.icon));
  const first = name.split(' ')[0];
  const rest = name.split(' ').slice(1).join(' ');
  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-36">
      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-4 sm:px-8 lg:grid-cols-[1.35fr_1fr] [&>*]:min-w-0">
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-xs text-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {available}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-[clamp(2.8rem,7.4vw,6.4rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white"
          >
            {first} <span className="bg-gradient-to-r from-[#7cc4ff] via-[#3b82f6] to-[#818cf8] bg-clip-text text-transparent">{rest}</span>
            <span className="text-[#3b82f6]">.</span>
          </motion.h1>
          <div className="mt-5 h-8 font-mono text-lg text-[#9fc6ff] sm:text-2xl">
            <span className="text-white/40">&gt; </span>
            {typed}
            <span className="caret text-[#3b82f6]">▌</span>
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            {intro}
          </motion.p>

          {/* contact shortcuts */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#contact" className="group inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-5 py-3 font-medium text-white shadow-[0_0_40px_-8px_#3b82f6] transition hover:bg-[#2f6fe0]">
              Contact me <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href={gmailLink(email)} target="_blank" rel="noreferrer" aria-label="Email" title={email} className="grid h-12 w-12 place-items-center rounded-lg border border-white/15 bg-white/[0.03] text-white transition hover:border-[#3b82f6] hover:bg-[#3b82f6]/15">
              <Icon name="mail" className="h-5 w-5" />
            </a>
            <a href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp" className="grid h-12 w-12 place-items-center rounded-lg border border-white/15 bg-white/[0.03] text-white transition hover:border-[#25d366] hover:bg-[#25d366]/15">
              <Icon name="whatsapp" className="h-5 w-5" />
            </a>
            {quick.map((s) => (
              <a key={s.label} href={s.url || '#'} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label} className="grid h-12 w-12 place-items-center rounded-lg border border-white/15 bg-white/[0.03] text-white transition hover:border-[#3b82f6] hover:bg-[#3b82f6]/15">
                <Icon name={s.icon} className="h-5 w-5" />
              </a>
            ))}
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#070a12]/90 p-4 backdrop-blur">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-white/40">{s.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* code card about me */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="glow-border rounded-2xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070a12]/90 shadow-[0_40px_100px_-30px_rgba(59,130,246,.55)] backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-xs text-white/40">sathwik.ts</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.8] sm:text-[13.5px]">
              <code>
                <span className="text-[#c792ea]">const</span> <span className="text-[#82aaff]">sathwik</span> <span className="text-white/50">=</span> {'{'}
                {'\n'}  <span className="text-[#7cc4ff]">role</span>: <span className="text-[#c3e88d]">&quot;{roles[0]}&quot;</span>,
                {'\n'}  <span className="text-[#7cc4ff]">based</span>: <span className="text-[#c3e88d]">&quot;{location}&quot;</span>,
                {'\n'}  <span className="text-[#7cc4ff]">studying</span>: <span className="text-[#c3e88d]">&quot;{education.split('·')[0].trim()}&quot;</span>,
                {'\n'}  <span className="text-[#7cc4ff]">focus</span>: [{code.focus.map((f, i) => (
                  <span key={f}>
                    <span className="text-[#c3e88d]">&quot;{f}&quot;</span>
                    {i < code.focus.length - 1 ? ', ' : ''}
                  </span>
                ))}],
                {'\n'}  <span className="text-[#7cc4ff]">stack</span>: [{code.stack.map((f, i) => (
                  <span key={f}>
                    <span className="text-[#c3e88d]">&quot;{f}&quot;</span>
                    {i < code.stack.length - 1 ? ', ' : ''}
                  </span>
                ))}],
                {'\n'}  <span className="text-[#7cc4ff]">leetcode</span>: <span className="text-[#f78c6c]">&quot;{code.leetcode} solved&quot;</span>,
                {'\n'}  <span className="text-[#7cc4ff]">available</span>: <span className="text-[#f78c6c]">true</span>,
                {'\n'}{'}'};
                {'\n'}
                {'\n'}<span className="text-white/35">{'// '}scroll down ↓</span>
              </code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function SectionHead({ k, title, sub }: { k: string; title: string; sub?: string }) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#3b82f6]">{k}</div>
        <h2 className="mt-3 text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-none tracking-[-0.04em] text-white">{title}</h2>
      </div>
      {sub && <p className="max-w-md text-white/55">{sub}</p>}
    </div>
  );
}

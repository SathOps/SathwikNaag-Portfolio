'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/Icons';
import { gmailLink } from '@/lib/links';

type SkillVM = { name: string; group: string; level: number; icon: { path: string; hex: string } | null };


function Glyph({ s, size = 22 }: { s: SkillVM; size?: number }) {
  if (s.icon)
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={`#${s.icon.hex}`} aria-hidden>
        <path d={s.icon.path} />
      </svg>
    );
  return (
    <span className="grid place-items-center rounded-md bg-white/10 font-mono font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {s.name
        .split(/\s|\./)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}

const GROUP_META: Record<string, { title: string; blurb: string; span: string; hue: string }> = {
  ai: { title: 'AI / ML', blurb: 'agents, RAG, deep learning', span: 'lg:col-span-2 lg:row-span-2', hue: '#a78bfa' },
  languages: { title: 'Languages', blurb: 'what I think in', span: '', hue: '#3b82f6' },
  frontend: { title: 'Frontend', blurb: 'interfaces that feel fast', span: '', hue: '#22d3ee' },
  backend: { title: 'Backend & data', blurb: 'APIs and storage', span: 'lg:col-span-2', hue: '#34d399' },
  tools: { title: 'Tools & platforms', blurb: 'ship and collaborate', span: '', hue: '#f59e0b' },
  design: { title: 'Design', blurb: 'the other half of me', span: '', hue: '#f472b6' },
};

function Tile({ s }: { s: SkillVM }) {
  const hex = s.icon ? `#${s.icon.hex}` : '#7cc4ff';
  return (
    <div
      className="group/t relative flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-1.5 transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
      title={`${s.name}: ${s.level}/5`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover/t:opacity-100" style={{ boxShadow: `0 0 0 1px ${hex}55, 0 8px 28px -10px ${hex}aa` }} />
      <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-md" style={{ background: `${hex}1a`, boxShadow: `inset 0 0 0 1px ${hex}33` }}>
        <Glyph s={s} size={17} />
      </span>
      <span className="relative min-w-0">
        <span className="block truncate text-[12.5px] leading-tight text-white/85">{s.name}</span>
        <span className="mt-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="h-[3px] w-2 rounded-full" style={{ background: i < s.level ? hex : 'rgba(255,255,255,.1)' }} />
          ))}
        </span>
      </span>
    </div>
  );
}

export function Stack({ skills }: { skills: SkillVM[] }) {
  const groups = Object.keys(GROUP_META).map((g) => ({ g, list: skills.filter((s) => s.group === g) })).filter((x) => x.list.length);
  const withIcons = skills.filter((s) => s.icon);
  return (
    <div>
      {/* masonry columns: cards size to their content, so no empty space */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {groups.map(({ g, list }, gi) => {
          const m = GROUP_META[g];
          return (
            <motion.div
              key={g}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: gi * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-[#070a12]/70 p-4 backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl" style={{ background: `${m.hue}26` }} />
              <div className="relative mb-3 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: m.hue }}>
                    {m.title}
                  </span>
                  <span className="hidden text-xs text-white/40 sm:inline">{m.blurb}</span>
                </div>
                <span className="font-mono text-sm font-semibold text-white/25">{String(list.length).padStart(2, '0')}</span>
              </div>
              <div className="relative grid grid-cols-2 gap-1.5">
                {list.map((s) => (
                  <Tile key={s.name} s={s} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* logo ribbon */}
      <div className="relative -mx-4 mt-8 overflow-hidden sm:-mx-8" style={{ maskImage: 'linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)' }}>
        <div className="marquee">
          <div className="marquee-track flex w-max items-center gap-10 py-2" style={{ ['--dur' as any]: '60s' }}>
            {[...withIcons, ...withIcons].map((s, i) => (
              <span key={i} className="opacity-50 grayscale transition hover:opacity-100 hover:grayscale-0" title={s.name}>
                <Glyph s={s} size={26} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type Exp = {
  slug: string;
  role: string;
  org: string;
  period: string;
  kind: string;
  points: readonly string[];
  link: string | null;
  tags: readonly string[];
  metrics: readonly { value: string; label: string }[];
  current: boolean;
};

const KIND: Record<string, string> = { work: 'Internship / work', leadership: 'Leadership', freelance: 'Freelance', education: 'Education' };

export function Experience({ items: all }: { items: Exp[] }) {
  const items = all.filter((e) => e.kind !== 'education');
  const edu = all.filter((e) => e.kind === 'education');
  return (
    <>
    <div className="relative">
      <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-[#3b82f6] via-[#3b82f6]/30 to-transparent sm:left-[15px]" />
      <ol className="space-y-6">
        {items.map((e, i) => (
          <motion.li
            key={e.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative pl-9 sm:pl-14"
          >
            <span className={`absolute left-0 top-7 grid h-6 w-6 place-items-center rounded-full border-2 sm:h-8 sm:w-8 ${e.current ? 'border-emerald-400 bg-emerald-400/20' : 'border-[#3b82f6] bg-[#05060a]'}`}>
              <span className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${e.current ? 'animate-pulse bg-emerald-400' : 'bg-[#3b82f6]'}`} />
            </span>
            <article className={`group relative overflow-hidden rounded-2xl border bg-[#070a12]/75 p-6 backdrop-blur-xl transition hover:border-[#3b82f6]/50 sm:p-8 ${i === 0 ? 'glow-border border-white/10' : 'border-white/10'}`}>
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#3b82f6]/10 blur-3xl transition-opacity group-hover:opacity-100" />
              <div className="relative flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="rounded-full border border-[#3b82f6]/40 bg-[#3b82f6]/10 px-2.5 py-0.5 text-[#9fc6ff]">{e.period}</span>
                <span className="rounded-full border border-white/10 px-2.5 py-0.5 uppercase tracking-wider text-white/50">{KIND[e.kind] ?? e.kind}</span>
                {e.current && <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 uppercase tracking-wider text-emerald-300">Now</span>}
              </div>
              <div className="relative mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">{e.role}</h3>
                  <div className="mt-1 text-lg text-[#7cc4ff]">
                    {e.link ? (
                      <a href={e.link} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                        {e.org} ↗
                      </a>
                    ) : (
                      e.org
                    )}
                  </div>
                </div>
                {e.metrics.length > 0 && (
                  <div className="flex gap-6">
                    {e.metrics.map((m) => (
                      <div key={m.label} className="text-right">
                        <div className="text-3xl font-semibold tracking-tight text-white">{m.value}</div>
                        <div className="max-w-[9rem] font-mono text-[10px] uppercase leading-tight tracking-wider text-white/40">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <ul className="relative mt-5 grid gap-2.5 md:grid-cols-2 md:gap-x-8">
                {e.points.map((p, j) => (
                  <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-white/70">
                    <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[#3b82f6]" />
                    {p}
                  </li>
                ))}
              </ul>
              {e.tags.length > 0 && (
                <div className="relative mt-5 flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <span key={t} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </motion.li>
        ))}
      </ol>
    </div>
    {edu.map((e) => (
      <Education key={e.slug} e={e} />
    ))}
    </>
  );
}

/** Education sits under the timeline, off the line, as its own highlighted card. */
function Education({ e }: { e: Exp }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mt-14"
    >
      <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-[#9fc6ff]">
        <span className="h-px w-8 bg-[#3b82f6]" /> education
      </div>
      <div className="relative rounded-[22px] bg-gradient-to-br from-[#3b82f6] via-[#7c5cff] to-[#22d3ee] p-px shadow-[0_0_90px_-30px_#3b82f6]">
        <article className="relative overflow-hidden rounded-[21px] bg-[#060912] p-6 sm:p-9">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#7c5cff]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-[#22d3ee]/10 blur-3xl" />
          {/* faint grid like ruled paper */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#3b82f6]/30 to-[#7c5cff]/20 text-white ring-1 ring-white/15 sm:h-20 sm:w-20">
              <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2 9l10-5 10 5-10 5L2 9z" />
                <path d="M6 11.2V16c0 1.3 2.7 3 6 3s6-1.7 6-3v-4.8" />
                <path d="M22 9v5" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="rounded-full border border-[#7c5cff]/50 bg-[#7c5cff]/15 px-2.5 py-0.5 text-[#c9bbff]">{e.period}</span>
                {e.current && <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 uppercase tracking-wider text-emerald-300">Now</span>}
              </div>
              <h3 className="mt-3 bg-gradient-to-r from-white via-white to-[#9fc6ff] bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-[2rem]">{e.role}</h3>
              <div className="mt-1 text-lg text-[#7cc4ff]">{e.org}</div>
              {e.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <span key={t} className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-white/75">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {e.metrics.length > 0 && (
              <div className="flex gap-4">
                {e.metrics.map((m) => (
                  <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center">
                    <div className="bg-gradient-to-b from-white to-[#9fc6ff] bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">{m.value}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {e.points.filter((p) => !e.metrics.some((m) => p.includes(m.value))).length > 0 && (
            <ul className="relative mt-6 grid gap-2 md:grid-cols-2">
              {e.points
                .filter((p) => !e.metrics.some((m) => p.includes(m.value)))
                .map((p, j) => (
                  <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-white/70">
                    <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[#7c5cff]" />
                    {p}
                  </li>
                ))}
            </ul>
          )}
        </article>
      </div>
    </motion.section>
  );
}

export function Highlights({ items }: { items: { slug: string; title: string; detail: string; stat: string }[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((a) => (
        <div key={a.slug} className="bg-[#05060a] p-6">
          <div className="text-3xl font-semibold tracking-tight text-white">{a.stat}</div>
          <div className="mt-2 text-sm font-medium text-white/85">{a.title}</div>
          <div className="mt-1 text-sm text-white/45">{a.detail}</div>
        </div>
      ))}
    </div>
  );
}

export function Terminal({
  email,
  whatsapp,
  phone,
  socials,
}: {
  email: string;
  whatsapp: string;
  phone: string;
  socials: readonly { label: string; url: string | null; icon: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi Sathwik, I saw your portfolio and would like to connect.')}`;
  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-white/10 bg-[#070a12] shadow-[0_0_80px_-30px_#3b82f6]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-white/40">contact.sh</span>
      </div>
      <div className="space-y-5 p-5 font-mono text-sm sm:p-8 sm:text-base">
        <div>
          <span className="text-[#3b82f6]">❯</span> <span className="text-white">whoami</span>
          <div className="mt-1 text-white/60">An engineer who also designs. Open to AI/ML, full-stack and product roles.</div>
        </div>
        <div>
          <span className="text-[#3b82f6]">❯</span> <span className="text-white">contact --fast</span>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#25d366] px-4 py-2 font-sans text-sm font-semibold text-black transition hover:brightness-110">
              <Icon name="whatsapp" className="h-4 w-4" /> WhatsApp
            </a>
            <a href={gmailLink(email)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 font-sans text-sm font-semibold text-white transition hover:bg-[#2f6fe0]">
              <Icon name="mail" className="h-4 w-4" /> {email}
            </a>
          </div>
        </div>
        <div>
          <span className="text-[#3b82f6]">❯</span> <span className="text-white">ls ./links</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {socials.map((s) => (
              <a key={s.label} href={s.url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/75 transition hover:border-[#3b82f6] hover:text-white">
                <Icon name={s.icon} className="h-4 w-4" /> {s.label}
              </a>
            ))}
          </div>
        </div>
        <div className="text-white/40">
          <span className="text-[#3b82f6]">❯</span> <span className="caret text-[#3b82f6]">▌</span>
        </div>
      </div>
    </div>
  );
}

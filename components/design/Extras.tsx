import Image from 'next/image';
import Link from 'next/link';
import type { Experience, Folder, Profile } from '@/lib/content';
import Reveal from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icons';
import { gmailLink } from '@/lib/links';
import { StatBursts, StoryPanel, StoryPoints, StoryTitle } from './ComicMotion';

const POPS = ['#ffd23f', '#ff5fa2', '#19c3b1', '#2e86de', '#ef3e36', '#ffffff'];

export function IssueIndex({ folders }: { folders: Folder[] }) {
  return (
    <section id="work" className="relative bg-[#f7f0e1] py-20 text-black sm:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-comic text-2xl tracking-wide text-[#ef3e36]">THE COLLECTION</p>
            <h2 className="comic-title text-[clamp(2.8rem,8vw,6.5rem)] text-[#ffd23f]">PICK AN ISSUE</h2>
          </div>
          <p className="max-w-md font-grotesk text-lg font-semibold">Each club, fest and client got its own visual world. Jump into any of them, or keep scrolling to read them all.</p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {folders.map((f, i) => (
            <Reveal key={f.slug} delay={(i % 4) * 0.05}>
              <a
                href={`#${f.slug}`}
                className="comic-panel group relative block overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-0"
                style={{ rotate: `${[-1.5, 1, -0.5, 1.8, -1, 0.6][i % 6]}deg` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden border-b-[3px] border-black" style={{ background: f.palette.bg }}>
                  {f.cover && <Image src={f.cover.src} alt="" fill sizes="(max-width:768px) 45vw, 22vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                  <span className="absolute left-2 top-2 rounded-md border-2 border-black px-2 py-0.5 font-comic text-lg leading-none" style={{ background: POPS[i % POPS.length] }}>
                    #{String(i + 1).padStart(2, '0')}
                  </span>
                  {f.highlight && <span className="absolute right-2 top-2 rotate-6 rounded-md border-2 border-black bg-[#ef3e36] px-2 py-0.5 font-comic text-sm text-white">FEATURED</span>}
                </div>
                <div className="p-3">
                  <div className="truncate font-comic text-xl leading-none tracking-wide sm:text-2xl">{f.name}</div>
                  <div className="mt-1 truncate font-grotesk text-xs font-semibold opacity-70">
                    {f.count} pieces · {f.role}
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ComicExperience({ items }: { items: Experience[] }) {
  return (
    <section id="experience" className="relative overflow-hidden bg-[#2e86de] py-20 text-black sm:py-28">
      <div className="halftone absolute inset-0 text-black/10" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <StoryTitle text="THE STORY SO FAR…" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e, i) => (
            <StoryPanel key={e.slug} i={i}>
              <article className={`comic-panel relative flex h-full flex-col rounded-2xl p-5 ${e.badge ? 'bg-[#ffd23f]! shadow-[8px_8px_0_#111]' : ''}`}>
                {e.badge && (
                  <>
                    <span className="halftone pointer-events-none absolute inset-0 rounded-2xl text-[#ef3e36]/15" />
                    <span className="relative -mx-5 -mt-5 mb-4 flex items-center gap-2 rounded-t-[14px] border-b-[3px] border-black bg-[#ef3e36] px-5 py-2 font-comic text-base leading-tight tracking-wide text-white">
                      <span className="text-[#ffd23f]">★</span> {e.badge}
                    </span>
                  </>
                )}
                <div className="relative mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-md border-2 border-black px-2 py-0.5 font-comic text-sm tracking-wide" style={{ background: e.badge ? '#fff' : POPS[i % 5] }}>
                    {e.kind.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-2 font-grotesk text-xs font-bold">
                    {e.current && <span className="rounded-full border-2 border-black bg-[#19c3b1] px-2 py-0.5 font-comic text-xs tracking-wide">NOW</span>}
                    {e.period}
                  </span>
                </div>
                <h3 className={`relative font-comic leading-[1] tracking-wide ${e.badge ? 'text-[2rem]' : 'text-[1.7rem]'}`}>{e.role}</h3>
                <p className="relative mt-1 font-grotesk text-sm font-bold text-[#ef3e36]">{e.org}</p>
                <div className="relative flex-1">
                  <StoryPoints points={e.points} />
                </div>
                {e.metrics.length > 0 && (
                  <div className="relative mt-5 flex flex-wrap gap-3">
                    {e.metrics.map((m, k) => (
                      <span
                        key={m.label}
                        className="flex items-baseline gap-1.5 rounded-xl border-[3px] border-black px-3 py-1.5 shadow-[3px_3px_0_#111]"
                        style={{ background: e.badge ? (k ? '#fff' : '#2e86de') : POPS[(i + k + 1) % 5], rotate: `${k % 2 ? 2 : -2}deg` }}
                      >
                        <span className={`font-comic text-3xl leading-none ${e.badge && !k ? 'text-white' : 'text-black'}`}>{m.value}</span>
                        <span className={`font-grotesk text-[11px] font-bold uppercase tracking-wider ${e.badge && !k ? 'text-white' : 'text-black'}`}>{m.label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </StoryPanel>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ComicStats({ items }: { items: { slug: string; title: string; detail: string; stat: string }[] }) {
  return (
    <section className="relative overflow-hidden bg-[#ef3e36] py-16 text-black">
      <div className="halftone-lg absolute inset-0 text-black/10" />
      <StatBursts items={items} />
    </section>
  );
}

export function ComicContact({ p }: { p: Profile }) {
  const wa = `https://wa.me/${p.whatsapp}?text=${encodeURIComponent("Hi Sathwik! I saw your portfolio and wanted to talk about a design project.")}`;
  return (
    <section id="contact" className="relative overflow-hidden bg-[#ffd23f] py-24 text-black sm:py-32">
      <div className="halftone-lg absolute inset-0 text-[#ef3e36]/20" />
      <div className="relative mx-auto max-w-[1100px] px-4 text-center sm:px-8">
        <Reveal>
          <div className="speech mx-auto max-w-3xl p-8 shadow-[8px_8px_0_#111] sm:p-12">
            <h2 className="comic-title text-[clamp(2.6rem,7vw,5.5rem)] text-[#ef3e36]">LET&apos;S MAKE SOMETHING LOUD!</h2>
            <p className="mx-auto mt-4 max-w-xl font-grotesk text-lg font-semibold">Posters, identities, kits, invites, decks. If it needs to look good, say hi.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={wa} target="_blank" rel="noreferrer" className="comic-btn inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-5 py-3 text-2xl text-black">
                <Icon name="whatsapp" className="h-6 w-6" strokeWidth={2.2} /> WHATSAPP
              </a>
              <a href={gmailLink(p.email)} target="_blank" rel="noreferrer" className="comic-btn inline-flex items-center gap-2 rounded-xl bg-[#2e86de] px-5 py-3 text-2xl text-white">
                <Icon name="mail" className="h-6 w-6" strokeWidth={2.2} /> EMAIL
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {p.socials.map((s) => (
                <a key={s.url} href={s.url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-3 py-1.5 font-grotesk text-sm font-bold hover:bg-black hover:text-white">
                  <Icon name={s.icon} className="h-4 w-4" /> {s.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
        <p className="mt-10 font-comic text-xl tracking-wide">
          {p.phoneDisplay} · {p.location}
        </p>
      </div>
    </section>
  );
}

export function ComicFooter() {
  return (
    <footer className="bg-black py-8 text-center font-comic text-lg tracking-wide text-white">
      THE END… FOR NOW. · <Link href="/tech" className="text-[#3b82f6] underline-offset-4 hover:underline">Read the tech issue →</Link>
    </footer>
  );
}

'use client';
import { motion } from 'framer-motion';
import { useWorldNav } from '@/components/ui/Transition';

/** Link from the Tech World to the Design World's UI/UX issue (same projects, design side). */
export default function UXShortcut({ slug, label }: { slug: string; label: string }) {
  const { go } = useWorldNav();
  return (
    <motion.a
      href={`/design#${slug}`}
      onClick={(e) => {
        e.preventDefault();
        go(`/design#${slug}`, 'design');
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="ux-link group relative mb-14 block rounded-2xl p-[1.5px]"
    >
      <span className="relative flex flex-col gap-4 overflow-hidden rounded-[15px] bg-[#070812] px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-7">
        <span className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-[#a33a8d]/30 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-[#6fe0ee]/20 blur-3xl" />
        <span className="ux-shine pointer-events-none absolute inset-0" />

        <span className="relative flex shrink-0 items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#a33a8d] via-[#5d78cf] to-[#6fe0ee] font-mono text-sm font-bold text-white shadow-[0_0_30px_-4px_#a33a8d]">
            UX
          </span>
          <span className="rounded-full border border-[#6fe0ee]/50 bg-[#6fe0ee]/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[#6fe0ee]">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#6fe0ee] align-middle" />
            design side
          </span>
        </span>

        <span className="relative min-w-0 flex-1">
          <span className="block font-mono text-xs uppercase tracking-[0.2em] text-white/45">Designed before coded</span>
          <span className="mt-1 block text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">{label}</span>
          <span className="mt-1 block text-sm text-white/55">Research, flows, wireframes and prototypes behind these projects, in the Design World.</span>
        </span>

        <span className="relative inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-white px-4 py-2.5 font-mono text-sm font-semibold text-[#070812] transition group-hover:bg-[#6fe0ee] sm:self-auto">
          open the issue
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </span>
    </motion.a>
  );
}

import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#ffd23f] px-4 text-black">
      <div className="halftone-lg absolute inset-0 text-[#ef3e36]/20" />
      <div className="relative text-center">
        <h1 className="comic-title text-[clamp(5rem,22vw,14rem)] leading-none text-white">404!</h1>
        <div className="speech mx-auto mt-4 max-w-md p-5 font-comic text-2xl leading-tight shadow-[5px_5px_0_#111]">This page wandered off into another universe.</div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="comic-btn rounded-xl bg-black px-5 py-2.5 font-comic text-xl tracking-wide text-[#ffd23f]">
            ← HOME
          </Link>
          <Link href="/design" className="comic-btn rounded-xl bg-white px-5 py-2.5 font-comic text-xl tracking-wide">
            DESIGN WORLD
          </Link>
          <Link href="/tech" className="rounded-xl border-2 border-black bg-[#05060a] px-5 py-2.5 font-mono text-base text-white">
            tech_world →
          </Link>
        </div>
      </div>
    </main>
  );
}

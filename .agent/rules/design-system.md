---
trigger: glob
globs: components/**/*.tsx, app/**/*.tsx, app/globals.css
---

# Design system

## Design world (comic)
- Fonts: `font-comic` (Bangers) for headings/buttons, `font-grotesk` (Space Grotesk) for body.
- Colours: yellow `#ffd23f`, red `#ef3e36`, blue `#2e86de`, pink `#ff5fa2`, teal `#19c3b1`, ink `#111`, paper `#f7f0e1`.
- Utilities in `app/globals.css`: `.comic-panel`, `.comic-btn`, `.comic-title`, `.speech` (speech bubble), `.halftone`, `.halftone-lg`.
- Each design folder section uses `.folder[data-layout=…]` with CSS vars `--bg --ink --accent --accent2` from its palette. Theme styles for each layout live in globals.css.

## Tech world
- Wrap in `.tech`. Background `#05060a`, accent `#3b82f6`, light blue `#7cc4ff`/`#9fc6ff`, white text with `/40–/80` opacity steps.
- Fonts: `font-sans` (Geist) headings/body, `font-mono` (Geist Mono) labels, kickers, terminal UI.
- Borders `border-white/10`, hover `border-[#3b82f6]/50`. Utilities: `.tech-grid`, `.tech-dots`.

## Motion
- Use Framer Motion; entrance pattern: `components/ui/Reveal.tsx` (opacity + y, ease `[0.16,1,0.3,1]`).
- Respect `prefers-reduced-motion` (globals.css disables animations; JS loops check `matchMedia`).
- Heavy things (three.js) load client-only via `next/dynamic({ ssr:false })` and pause when off-screen.

## Layout
- Must work at 375 px wide with no horizontal scroll. Use `min-w-0` on grid/flex children and `minmax(0,1fr)` tracks.
- Images: `next/image` with real `width/height` (from `lib/content.ts` `Media.w/h`) and a sensible `sizes`.
- Accessibility: buttons have `aria-label` when icon-only; decorative layers `aria-hidden`.

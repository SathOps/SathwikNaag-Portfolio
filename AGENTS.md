# AGENTS.md: guide for AI coding agents (Antigravity, Claude, Cursor, Copilot…)

## ⚡ Fast Action: When the user says "run"
When the user simply types "run", "start", or asks to launch/preview the project:
Execute immediately in one turn without asking questions or unnecessary file exploration:
1. Navigate to the `portfolio` folder (or run commands with `cd portfolio`).
2. If `node_modules` is missing: run `npm install`.
3. If `.env.local` is missing: copy `.env.example` to `.env.local`.
4. Start the development server in the background as a daemon: `npm run dev` (`IsDaemon: true`).
5. Output the live localhost links immediately to the user:
   - Website: http://localhost:3000
   - Admin Panel (Keystatic): http://localhost:3000/keystatic
   - Design World: http://localhost:3000/design
   - Tech World: http://localhost:3000/tech

This is **Sathwik Naag's personal portfolio**. Read this file before changing anything.
Detailed step-by-step procedures live in `.agent/workflows/` (run them as `/run`, `/run-locally`, `/add-project`, …).
Topic rules live in `.agent/rules/`.

## What the site is
- `/`: split hero. Left half is the **Design world** (comic, yellow/red/pink). Right half is the **Tech world** (black/blue/white). The split is **exactly at 50%**. The name is split right after the middle letter: "SATHWI" (comic, left) | "K NAAG" (tech, right). Both halves have the same letter height (the tech half is narrowed with scale-x so the widths match too). No letter is cut by the seam. A pencil-sketch portrait of Sathwik, cut out like paper, floats over both worlds (not split). Depth behind it comes from a spotlight halo with slow orbit rings (warm left of centre, blue right) and a parallax cast shadow.
- `/design`: the Design world: issue index, one themed section per design folder, experience, resumes, contact.
- `/design/[slug]`: the full page for one design folder. It also shows sub-folders repeated here via `fullParents` (e.g. Pramana IDs inside Pramana).
- `/tech`: the Tech world, in this order: intro (name, description, contact shortcuts, stats) → tech stack → GitHub & LeetCode preview (pinned repos come from `githubRepos` in `content/profile.yaml`; the contribution grid comes from `lib/github.ts`, fetched at build and refreshed daily, with the ghchart image as a fallback) → experience → projects (live-site previews) → resumes → contact. No photo on this page.
- `/keystatic`: the **local admin panel**. It writes YAML into `content/` and files into `public/`. Disabled in production.

## Commands
| Command | What it does |
|---|---|
| `npm install` | install dependencies (Node 18.18+; 20/22 recommended) |
| `npm run dev` | dev server on http://localhost:3000 (admin at /keystatic) |
| `npm run build` | production build. **Run this to verify any change** |
| `npm run start` | serve the production build |
| `npm run add-brand -- <folder> --name "X" --layout comic` | new design folder from a folder of images/videos/PDFs |
| `npm run add-pdf -- <file.pdf> --folder <slug> --kind flipbook` | add a PDF (pages → images) to an existing design folder |
| `npm run add-resume -- <file.pdf> --side design\|tech --title "X"` | add or replace a resume (preview auto-made) |
| `npm run optimize` | shrink oversized images in public/ in place |
| `npm run keep-awake` | wake the free-hosted project apps (Streamlit etc.). Also runs every 6 h via `.github/workflows/keep-apps-awake.yml` once the repo is on GitHub |
| `npm run snap-sites` | screenshot live project URLs (needs `npm i -D playwright && npx playwright install chromium`) |
| `python scripts/make-avatar-sketch.py photo.jpg --blink closed.jpg` | rebuild the pencil-sketch avatar (needs `pip install rembg onnxruntime opencv-python pillow numpy`) |
| `python scripts/make-avatar-3d.py photo.jpg --blink closed.jpg` | optional: build the 3D avatar textures |

## Golden rules
1. **Content is data, not code.** Never hard-code projects, folders, resumes, experience, skills or bio text in components. Add/edit YAML in `content/` (or use the scripts / admin). Components read everything through `lib/content.ts`.
2. **Schema lives in `keystatic.config.ts`.** To add a new field: add it there → read it in `lib/content.ts` (types flow from the reader) → render it in a component → add a value in the YAML files that need it.
3. **Images go in `public/`** and are referenced by absolute public path (`/work/<folder>/<file>.webp`). Prefer WebP ≤1600 px, ≤700 KB. Videos: H.264 MP4, muted-friendly, ≤10 MB, plus a poster image.
4. **Privacy:** ID cards have emails/roll numbers blurred and team notes have letter text blurred: never replace those with unblurred originals. Wedding invites are shown unblurred (approved). Slides showing other people's faces have `preview: false`, so the short preview on /design never shows them; they still appear on the full folder page `/design/<slug>`.
5. **Keep both worlds visually separate:** Design = comic fonts (`font-comic` Bangers, `font-grotesk`), bold borders, halftones, pop colours. Tech = `font-sans` Geist / `font-mono`, `#05060a` background, `#3b82f6` accent, thin borders. Don't mix them.
6. **Don't move the hero split off-centre.** Halves are `w-1/2`, and the name is split right after its middle letter (logic at the top of `SplitHero.tsx`). The portrait stays whole; only its halo changes colour at the seam.
7. After changes run `npm run build`. It must pass type-checking.
8. Email links open a Gmail compose window via `gmailLink()` in `lib/links.ts` (like the WhatsApp shortcut). Don't use `mailto:`.
9. Apps on sleepy free hosts (`*.streamlit.app`, `*.onrender.com`, `*.hf.space`, `*.herokuapp.com`, see `isSleepy` in `tech/Projects.tsx`) are never auto-loaded in project cards: they show a poster/launcher and wake only when opened.

## Map of the code
```
app/
  layout.tsx              fonts, smooth scroll (Lenis), world-transition provider
  page.tsx                home → components/hero/SplitHero
  design/layout.tsx       design fonts + ink cursor + lightbox
  design/page.tsx         Design world page
  design/[slug]/page.tsx  single folder page
  tech/page.tsx           Tech world page (+ stack-name → icon ALIAS map)
  keystatic/…, api/keystatic/…   admin panel routes
components/
  hero/SplitHero.tsx      split hero (centre seam, taglines, two descriptions, CTAs)
  hero/PaperAvatar.tsx    the portrait, used only on the home page: sketch cut-out + depth backdrop (halo, rings, cast shadow; split|design|tech|none), parallax, float, blink
  hero/Avatar3D.tsx       optional three.js bust (not used by default)
  hero/Floaters.tsx       icon-only floating interests (from profile.interests)
  design/DesignHero.tsx   Design world hero: title, rotating roles, stats + a shuffling deck of folder covers (design/CoverDeck.tsx, real ratios, never cropped) and a ticker
  design/FolderSection.tsx  renders one design folder (header, groups, sub-folders)
  design/UXIssue.tsx      UI/UX issue: process steps, design ⇄ code callout, case-study panels (folder fields process/callout/caseStudies)
  design/Decor.tsx        per-layout background ornaments
  design/Extras.tsx       issue index, experience, stats, contact, footer
  groups/GroupView.tsx    grid(masonry) · row · line · carousel · flipbook · marquee · compare · stack · process · cinema · phone-frame videos
  groups/Piece.tsx        one image/video tile → lightbox
  tech/Projects.tsx       featured projects, live iframe previews, filterable cards, full-screen viewer
  tech/TechSections.tsx   stack marquee + bento, timeline, highlights, terminal contact
  tech/TechChrome.tsx     tech nav + hero
  tech/UXShortcut.tsx     link from Projects to the Design World UI/UX issue (/design#<slug>, lands on the issue after the transition)
  chat/DesignBot.tsx, chat/TechBot.tsx   the two chatbots (Doodle / multiverse portal); chat/useChat.ts shared logic; lib/chatSearch.ts in-browser BM25 retrieval; answers in content/chat/*.yaml, plus auto docs from projects/folders/experience (getChatKnowledge in lib/content.ts). No match → WhatsApp link with the question prefilled
  ui/…                    Transition (world switch: comic explosion into design, terminal boot into tech, closing doors back home), Cursor, Icons, Reveal, Resumes, SmoothScroll
lib/content.ts            ALL content loading (Keystatic reader). Image sizes via image-size
lib/icons.ts              simple-icons lookup for skill logos
content/                  YAML data (see .agent/rules/content-model.md)
public/work/<slug>/       design assets · public/resumes/<slug>/ · public/avatar/3d/ · public/me/
scripts/                  add-brand, add-pdf, add-resume, optimize-images, snap-sites, make-avatar-3d.py
```

## Adding a new display type for design groups
1. Add the option to `kind` in `keystatic.config.ts` (groups → kind).
2. Add a `case` in `components/groups/GroupView.tsx` and implement the component there.
3. Document it in README.md's "Group display types" table.

## Adding a new design theme (layout)
1. Add the option to `layout` in `keystatic.config.ts`.
2. Add `.folder[data-layout='your-theme']` styles in `app/globals.css` (title font, `.f-piece` frame, background).
3. Optionally add ornaments for it in `components/design/Decor.tsx`.

## Stack
Next.js 15 (App Router, static generation) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Lenis · three.js · Keystatic (local, git-based CMS) · sharp · pdf-to-img.

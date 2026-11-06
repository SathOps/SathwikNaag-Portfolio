# Sathwik Naag · Design × Tech portfolio

Two worlds, one site. Nothing is hard-coded: every project, design, resume, job and line of hero text comes from editable files in `content/`.

- **`/`**: home. The screen is split **exactly in half**: Design world on the left (comic), Tech world on the right (black/blue). Your name is split right after the "I" (SATHWI | K NAAG), same size on both sides. A **pencil-sketch portrait of you**, cut out like paper, floats over both worlds with a glowing halo, slow orbit rings and a cast shadow behind it for depth (warm on the design side, blue on the tech side). It sways with your cursor and blinks. Each side has its own tagline and description, and floating icons for your interests.
- **`/design`**: the Design world. Every club, fest or client is a folder with its own theme.
- **`/design/<folder>`**: the full page for one folder.
- **`/tech`**: the Tech world: projects with live website previews, tech stack, experience, resumes and contact.
- **`/keystatic`**: **your admin panel** (works only on your computer). Edit everything here with forms.

---

## Contents
1. [First-time setup](#1-first-time-setup)
2. [Everyday editing with the admin panel](#2-everyday-editing-with-the-admin-panel)
3. [Adding things with one command](#3-adding-things-with-one-command)
4. [Using Antigravity (AI) to make changes](#4-using-antigravity-ai-to-make-changes)
5. [The 3D avatar](#5-the-3d-avatar)
6. [Design folder options](#6-design-folder-options)
7. [Deploying](#7-deploying)
8. [Project map](#8-project-map)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. First-time setup

You need **Node.js 18.18 or newer** (20 or 22 recommended) from https://nodejs.org.

```bash
npm install      # once, takes a minute or two
npm run dev      # start the site
```

| Open | What |
|---|---|
| http://localhost:3000 | the site |
| http://localhost:3000/keystatic | the admin panel |

Stop the server with `Ctrl + C`.

## 2. Everyday editing with the admin panel

1. `npm run dev`, then open **http://localhost:3000/keystatic**
2. Edit, then click **Save**. Files in `content/` and `public/` are updated.
3. Commit + push from Antigravity. Vercel redeploys automatically.

| I want to… | In the admin |
|---|---|
| Add a project | **Tech projects → Add**. Tick *Featured* for a big showcase. With a *Live URL*, the site is previewed live inside the portfolio. |
| Add a design brand / club / client | **Design folders → Add**. Pick a theme and colours, then add *Groups* of *Pieces*. |
| Show one folder in two places (e.g. a kit in Merch **and** CSL) | Untick *Show as its own section*, then pick both under *Also show inside these folders*. |
| Hide a piece without deleting it | Untick *Show on site*. |
| Keep a piece out of the short preview (e.g. other people's faces) | Untick *Show in the short preview*. It still shows on the full folder page. |
| Attach a downloadable PDF to a group | Upload it in the group's *Downloadable PDF* field (adds a "PDF ↓" button). |
| Add / replace a resume | **Resumes: design** or **Resumes: tech**: upload the PDF + a page-1 image (or use `npm run add-resume`, which makes the image for you). |
| Change the hero text | **Profile** → *Hero: design side tagline / description* and *Hero: tech side tagline / description*. |
| Change floating icons | **Profile** → *Floating interests*: pick an icon and a side. The label is only a tooltip. |
| New job / role / achievement | **Experience** / **Achievements**: choose *Design*, *Tech* or *Both*. |
| Highlight a project (e.g. *Final Year Project*) | **Projects → your project → Highlight ribbon**. Highlighted cards get a gold ribbon and come first in *More projects*. |
| A warning under a project's Code button | **Projects → your project → Note shown next to the code link** (e.g. Hybrid IDS: code still in development). |
| Chatbot questions & answers | **Chatbot answers → Add**: question (shown as a chip when *featured*), world (Design / Tech / Both), answer, other ways people might ask (keywords), optional button. Projects, issues and experience are searched automatically too. |
| GitHub preview repos | **Profile → GitHub preview: pinned repos**: name, link, one-line description, language (up to 4). |
| New skill in the tech stack | **Tech stack → Add**. *Icon slug* comes from https://simpleicons.org (e.g. `python`, `react`). |

## 3. Adding things with one command

Run these in the project folder (the dev server can stay running).

| Command | Does |
|---|---|
| `npm run add-brand -- "C:\path\My Brand" --name "My Brand" --layout comic --kicker "College Club" --role "Design Lead" --period "2026"` | Creates a whole new design folder from a folder of **images, videos and PDFs**. Images become WebP, each PDF becomes a swipeable group with a download button, and the colour palette is guessed. Add `--parent merch` to nest it inside another folder. |
| `npm run keep-awake` | Wakes the Streamlit project apps so their live previews open fast. Once the repo is on GitHub, the *Keep project apps awake* action does this every 6 hours by itself (needs nothing from you). |
| `npm run add-pdf -- "C:\path\Brochure.pdf" --folder gitam-sports --title "Brochure 2027" --kind flipbook` | Adds a PDF to an existing folder: every page becomes an image (`--pages 1-6` to pick pages, `--no-download` to hide the PDF button). |
| `npm run add-resume -- "C:\path\Resume.pdf" --side tech --title "Data Scientist" --subtitle "ML · analytics"` | Adds a resume with an automatic preview image. Same title = replace. |
| `npm run optimize` | Shrinks any image in `public/` larger than 1600 px or 700 KB (run after uploading big Canva PNGs). |
| `npm run snap-sites` | Saves screenshots of every live project (one-time setup: `npm i -D playwright && npx playwright install chromium`). |

Folder slugs (for `--folder` / `--parent`) are the file names in `content/folders/`, e.g. `pramana`, `gitam-sports`, `merch`, `weddings`, `cogaan`.

## 4. Using Antigravity (AI) to make changes

This project ships with instructions for AI agents:

| File | Purpose |
|---|---|
| `AGENTS.md` (+ `GEMINI.md`) | Always-on project guide: commands, rules, code map. Antigravity reads it automatically. |
| `.agent/rules/content-model.md` | Every content file and field, loaded when the agent works on content. |
| `.agent/rules/design-system.md` | Colours, fonts and layout rules for both worlds, loaded when editing components. |
| `.agent/workflows/*.md` | Step-by-step procedures you can trigger as **slash commands** in the agent chat. |

> **Quickest start:** just type **run** (or **start**, or `/run`) in the agent chat. The agent installs the dependencies if they're missing, creates `.env.local` from `.env.example`, starts the local server in the background and replies with the links: website http://localhost:3000, admin http://localhost:3000/keystatic, Design World http://localhost:3000/design, Tech World http://localhost:3000/tech.

Workflows (type these in Antigravity's agent panel):

| Command | What the agent does |
|---|---|
| `/run` (or just type "run") | installs if needed, starts the dev server, prints the localhost links |
| `/run-locally` | installs, runs, opens the admin, verifies the build |
| `/add-project` | asks for the details (or reads a README you give it) and adds a tech project |
| `/add-design-folder` | turns a folder of designs into a new themed section |
| `/add-pdf` | adds a brochure/deck/newsletter PDF, or a resume PDF |
| `/add-resume` | adds, replaces or removes a resume |
| `/add-media` | adds single images/videos, experience, skills, hero text, new avatar photo |
| `/deploy` | builds, commits, pushes, explains the Vercel setup |

Example prompts: *"/add-project from this README: …"*, *"/add-pdf C:\Downloads\Spandan-Sept.pdf to gitam-sports as a flipbook"*, *"Make the Pramana section use more gold"*.

## 4b. The chatbots

Both worlds have a small retrieval chatbot in the bottom-right corner: **Doodle** (a comic ink-blob) in the Design World and a glitchy **multiverse portal** in the Tech World.

- Five suggested questions per world come from `content/chat/*.yaml` (edit them in the admin under **Chatbot answers**).
- Typed questions are matched against those answers **and** the site's own content (projects, issues, experience) with a small search engine that runs in the browser (`lib/chatSearch.ts`). There is no AI service, API key or cost.
- When nothing matches well enough, the bot offers a **Send on WhatsApp** button that opens WhatsApp with the question already typed, addressed to your number from the profile. The visitor taps send.
- To make a question match more phrasings, add words to its *Other ways people might ask* list.

## 5. The avatar (pencil sketch)

Files are in `public/avatar/sketch/`: `open.webp` (eyes open) and `blink.webp` (eyes closed). Both are transparent cut-outs with a white paper border. The halo, rings and cast shadow behind it are drawn in code (`components/hero/PaperAvatar.tsx`).

To make a new sketch from a new photo (Python 3.10+):

```bash
pip install rembg onnxruntime opencv-python pillow numpy     # one time
python scripts/make-avatar-sketch.py "C:\photos\front.jpg" --blink "C:\photos\eyes-closed.jpg"
```

Best photo: front-facing, shoulders visible, plain background, even light. The blink photo is optional (same spot, eyes closed). You can also upload any drawing/cut-out PNG in the admin under **Profile → Avatar**.

(An optional real-time 3D version is also included: `components/hero/Avatar3D.tsx` + `scripts/make-avatar-3d.py`.)

## 6. Design folder options

**Themes (layout):** `comic` · `newspaper` · `google` · `festival` · `sports` · `wedding` · `rack` (merch) · `cinema` · `lanyard` (ID cards) · `masonry` (clean) · `spiderverse` (UI/UX: neon city, misprint titles)

**UI/UX case-study issue:** a folder can also have *How I work* steps (`process`), a callout note (`callout`) and *UI/UX case studies* (`caseStudies`: project, role, challenge, design moves, how it was built, tools, live link, "also in Tech World"). The UI/UX Design issue uses these, so you edit it like any other folder.

**Group display types:**

| Type | Good for |
|---|---|
| Grid | posters. If the first piece is *Tall*, it becomes the hero. |
| Carousel | Instagram carousels, series |
| Flipbook | brochures, magazines, decks (pages turn as spreads) |
| Marquee | stories, stickers (auto-scrolling strip) |
| Compare | drafts → final (the **last** piece is the final; drag to compare) |
| Stack | ID cards, invites (fanned; lanyards in the *Lanyard* theme) |
| Row | a few pieces on one line at the same height (used for 2-piece groups automatically) |
| Poster line | pieces pegged to a sagging string of festival lights; a *Tall* piece hangs in the middle (Pramana's preview). |
| Process | design → print → in hand. Write captions as `Step: detail` (e.g. `Print file: back artwork`); pieces with the same step name sit together in one numbered step. |
| Cinema | a big featured poster plus a lit "Now showing" board of ticket stubs; hover a ticket to switch the poster. Captions as `Title: subtitle`. |

Vertical videos are shown in phone frames automatically. Two flipbooks in a row are shown side by side on the full folder page.

**Preview vs full page (per folder):**

| Setting | What it does |
|---|---|
| Item → *Show in the short preview* (`preview`) | off = only on the full page `/design/<slug>` |
| Group → *Show this group in* (`showIn`) | `both` (default), `preview` only (e.g. a teaser fan of ID cards), or `full` only |
| Folder → *How many groups to show in the short preview* (`previewGroups`) | default 2 (3 when highlighted) |
| Folder → *Short preview: merge the chosen pieces into one grid* (`previewMerge`) | the preview becomes one tidy row of every piece marked for preview (Pramana uses this) |
| Folder → *Short preview: show sub-folders after this many groups* (`childrenAfter`) | e.g. `1` puts GITAM Sports' Official Kit right after Headliners |
| Folder → *Merged preview style* (`previewStyle`) | `row` or `line` (poster line) for the merged preview |
| Item → *Only in the short preview* (`previewOnly`) | a piece repeated in the preview from another group (e.g. the SIP slide in GITAM Sports' Headliners) that the full page shouldn't show twice |
| Folder → *Also show on the FULL page of these folders* (`fullParents`) | repeats a sub-folder on other folders' full pages only, e.g. Pramana IDs inside the full Pramana folder |

## 7. Deploying

1. Push this repo to GitHub.
2. vercel.com → *Add New → Project* → import it → *Deploy* (no settings needed).
3. Optional: set `NEXT_PUBLIC_SITE_URL=https://your-domain` for correct share previews.

`/keystatic` is turned off on the live site on purpose. It writes files, so you edit locally and push.

## 8. Project map

```
AGENTS.md, GEMINI.md, .agent/   ← instructions for Antigravity / AI agents
content/                        ← ALL site content (YAML)
  profile.yaml                  ← name, hero taglines & descriptions, socials, interests, avatar
  folders/  projects/  skills/  experience/  achievements/  resumes-design/  resumes-tech/
public/
  work/<folder>/                ← design images, videos, PDFs
  resumes/<slug>/               ← resume PDF + preview
  avatar/sketch/                ← pencil-sketch avatar (+ blink)
app/                            ← pages: /, /design, /design/[slug], /tech, /keystatic
components/                     ← hero, design, tech, groups, ui
lib/content.ts                  ← loads content for the pages
keystatic.config.ts             ← admin panel fields (add a field here → it appears in the admin)
scripts/                        ← add-brand, add-pdf, add-resume, optimize, snap-sites, make-avatar-sketch.py
```

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| `npm` not found | Install Node.js LTS from nodejs.org and reopen the terminal. |
| Port 3000 busy | `npm run dev -- -p 3005`, then use http://localhost:3005 |
| A live project preview stays blank | That site blocks embedding. In the admin, untick *Show live site inside the portfolio* for it (or run `npm run snap-sites`). |
| New upload looks blurry or is slow | Run `npm run optimize`. Keep videos under ~10 MB (720p–1080p MP4). |
| Build fails after editing YAML by hand | Check indentation, and that every image path exists under `public/`. The error names the file. |

## Privacy notes
- Other people's faces are kept out of the short previews on /design (pieces with *Show in the short preview* unticked); the full folder pages show everything.
- ID cards: personal emails and roll numbers are blurred.
- Team thank-you notes: the letter text is blurred.

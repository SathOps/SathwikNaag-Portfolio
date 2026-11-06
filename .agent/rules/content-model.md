---
trigger: model_decision
description: Read when adding, editing or reading site content (projects, design folders, resumes, experience, skills, achievements, profile/hero text) or anything in content/ or public/.
---

# Content model

All content is YAML in `content/`, edited by the Keystatic admin (`/keystatic`) or by hand. Schema = `keystatic.config.ts`. Loader = `lib/content.ts`.

| What | File(s) | Key fields |
|---|---|---|
| Profile + hero | `content/profile.yaml` | `name`, `shortName`, `designTagline`, `techTagline`, `designBio`, `techBio` (hero left/right descriptions), `designIntro`, `techIntro`, `designRoles[]`, `techRoles[]`, `email`, `whatsapp` (digits incl. country code), `phoneDisplay`, `socials[] {label,url,icon}`, `interests[] {label,icon,side}` (floating icons; `label` is only a tooltip), `avatar3dColor/Blink/Depth` |
| Design folder | `content/folders/<slug>.yaml` | `name`, `kicker`, `role`, `period`, `description`, `layout`, `palette {bg,ink,accent,accent2}`, `order`, `topLevel`, `highlight`, `parents[]`, `fullParents[]`, `previewGroups?`, `previewMerge`, `cover`, `groups[] {title, kind, showIn, note, file?, items[] {image, video?, caption, span, show, preview}}` |
| Tech project | `content/projects/<slug>.yaml` | `title`, `tagline`, `category` (fullstack/ai/ml/frontend), `status` (live/shipped/wip), `featured`, `order`, `role`, `period`, `summary`, `highlights[]`, `metrics[] {value,label}`, `stack[]`, `liveUrl`, `repoUrl`, `extraLinks[] {label,url}`, `embed`, `preview`, `accent` |
| Skill | `content/skills/<slug>.yaml` | `name`, `group` (languages/ai/frontend/backend/tools/design), `icon` (simpleicons.org slug or ''), `level` 1–5, `order` |
| Experience | `content/experience/<slug>.yaml` | `role`, `org`, `period`, `side` (design/tech/both), `kind` (work/leadership/freelance/education), `points[]`, `link`, `order` |
| Achievement | `content/achievements/<slug>.yaml` | `title`, `detail`, `stat`, `side`, `order` |
| Chatbot answer | `content/chat/<slug>.yaml` | `question`, `world` (design/tech/both), `answer`, `keywords[]`, `featured` (chip), `linkLabel`, `linkUrl`, `order` |
| Resume | `content/resumes-design/<slug>.yaml`, `content/resumes-tech/<slug>.yaml` | `title`, `subtitle`, `file` (PDF path), `preview` (page-1 image), `order` |

## Conventions
- File name (without `.yaml`) = slug = URL id. Use lowercase-kebab-case.
- Paths are public paths starting with `/` (`/work/pramana/cover.webp`), and the file must exist under `public/`.
- `span`: normal | wide | tall | big. A first item that's `tall`/`big` becomes the hero of a grid.
- `kind`: grid | carousel | flipbook | marquee | compare (last item = final) | stack | row | line (poster line) | process (captions `Step: detail`) | cinema (captions `Title: subtitle`).
- `showIn` (group): both | preview | full. `previewGroups` (folder): how many groups the short preview shows. `previewMerge: true`: preview = one row (or `previewStyle: line`) of all `preview` pieces. Item `previewOnly: true`: shown in the short preview only. `childrenAfter: N` (folder): in the short preview, sub-folders appear after N groups.
- `fullParents: [slug]`: repeat this sub-folder on those folders' full pages only (not in their short previews).
- `layout`: comic | newspaper | google | festival | sports | wedding | rack | cinema | lanyard | masonry | spiderverse.
- UI/UX issue fields (folder, optional): `process[] {title, detail}`, `callout`, `caseStudies[] {title, role, period, challenge, design[], build, tools[], liveUrl, alsoInTech}`. Rendered by `components/design/UXIssue.tsx`. Keep case studies consistent with `content/projects/*.yaml` (same names, roles, dates).
- Sub-folder: `topLevel: false` + `parents: [parent-slug, …]` (can have several parents).
- `show: false` hides a piece without deleting it.
- `preview: false` keeps a piece out of the short preview on /design (use it for slides with other people's faces); it still shows on /design/<slug>. A group with no preview pieces is left out of the preview.
- Video piece: `image` = poster, `video` = mp4 path. Vertical videos render in phone frames.
- Lower `order` comes first.

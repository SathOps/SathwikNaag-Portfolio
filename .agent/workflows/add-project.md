---
description: Add a new tech project (with live preview, stack, links) to the Tech world
---

1. Ask the user for: title, one-line tagline, description, 3–5 highlights, tech stack, live URL (if deployed), repo URL, role, period, status (live/shipped/wip), and whether it should be featured. If they give a README, extract these from it.
2. Create `content/projects/<kebab-slug>.yaml` following an existing file (e.g. `content/projects/digalert.yaml`). Required keys: `title, tagline, category, status, featured, order, role, period, summary, highlights, metrics, stack, liveUrl, repoUrl, extraLinks, embed, preview, accent`. Use `null` for missing URLs and `[]` for empty lists.
3. `category` must be one of `fullstack | ai | ml | frontend`. Lower `order` = shown earlier. Featured projects get the big alternating layout.
4. If the stack contains a technology without an icon, add a mapping to `ALIAS` in `app/tech/page.tsx` (key = stack name, value = simpleicons.org slug, or '' for a text badge).
5. If `liveUrl` is set, keep `embed: true`. If the site refuses to load in an iframe, set `embed: false`. Optionally run `npm run snap-sites -- <slug>` to save a screenshot as `preview`.
6. Run `npm run build` and confirm it passes. Then tell the user to open /tech to check it.

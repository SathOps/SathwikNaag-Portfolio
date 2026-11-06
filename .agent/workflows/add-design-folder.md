---
description: Add a new design brand/club/client folder to the Design world from a folder of images, videos or PDFs
---

1. Ask the user for the path to the folder of exported designs, the brand name, a one-line kicker (e.g. "College Club"), their role, the period, and which theme fits: comic, newspaper, google, festival, sports, wedding, rack, cinema, lanyard or masonry.
2. Run:
   `npm run add-brand -- "<path>" --name "<Name>" --layout <theme> --kicker "<kicker>" --role "<role>" --period "<period>"`
   Add `--parent <existing-slug>` to make it a sub-folder (for example `--parent merch`).
   Images become WebP, PDFs become swipeable page groups with a download link, and videos are copied.
3. Open `content/folders/<slug>.yaml` and improve it:
   - write a 1–2 sentence `description`
   - check the auto-guessed `palette` against the brand colours
   - split `items` into meaningful `groups` (e.g. "Key visuals" as grid, "Instagram carousel" as carousel, "Stories" as marquee)
   - give the best piece `span: tall` and put it first, and write short captions
   - hide weak/duplicate pieces with `show: false` (aim for 6–12 visible)
   - set `order` (lower = earlier) and `highlight: true` if it should be featured
4. Make sure no personal data (phone numbers, emails, addresses, IDs of other people) is visible. If it is, blur it before publishing.
5. Run `npm run build`. Then check http://localhost:3000/design and /design/<slug>.

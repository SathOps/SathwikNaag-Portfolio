---
description: Add a PDF (brochure, deck, newsletter, carousel export) to an existing design folder, or a resume PDF
---

## A design PDF (brochure, deck, carousel, newsletter)
1. Find the target folder slug in `content/folders/` (file name without .yaml).
2. Pick a display kind: `flipbook` for brochures/magazines/decks, `carousel` for Instagram carousels, `grid` for a few posters.
3. Run: `npm run add-pdf -- "<file.pdf>" --folder <slug> --title "<Group title>" --kind <kind>`
   - only some pages: `--pages 1-6` or `--pages 1,3,5`
   - no download button: `--no-download`
4. Every page is rendered to WebP in `public/work/<slug>/` and a new group is appended to the folder YAML with `file:` pointing at the PDF (shows a "PDF ↓" button).
5. Reorder or caption it in `/keystatic` or in the YAML. Run `npm run build`.

## A resume PDF
1. Run: `npm run add-resume -- "<file.pdf>" --side design|tech --title "<Role title>" --subtitle "<short focus>"`
2. Running it again with the same title replaces that resume (PDF + preview).
3. To remove a resume, delete `content/resumes-<side>/<slug>.yaml` and `public/resumes/<slug>/`.

## Any other downloadable file (certificate, case study)
1. Copy it to `public/files/<name>.pdf`.
2. Link to `/files/<name>.pdf` from a field that accepts URLs (for example a project's `extraLinks`, or a group's `file`).

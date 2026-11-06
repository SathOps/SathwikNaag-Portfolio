---
description: Add, replace or remove a resume in the Design or Tech world
---

1. Ask which world it belongs to (design or tech), the card title (role name), and a short subtitle.
2. Run `npm run add-resume -- "<file.pdf>" --side <design|tech> --title "<Title>" --subtitle "<subtitle>"`.
3. Optional: set `order:` in the new `content/resumes-<side>/<slug>.yaml` (lower = first).
4. Run `npm run build`, then check the Resumes section on /design or /tech (preview + download).

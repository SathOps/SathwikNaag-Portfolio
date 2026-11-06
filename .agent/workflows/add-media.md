---
description: Add single images or videos to an existing design folder, or add experience, achievements, skills or hero text
---

## An image or video to an existing design folder
1. Optimise: images to WebP ≤1600 px (`npm run optimize` does this in place for files in public/). Videos to H.264 MP4 ≤10 MB, e.g. `ffmpeg -i in.mov -vf "scale=-2:960" -c:v libx264 -crf 28 -preset veryfast -an out.mp4`.
2. Copy into `public/work/<folder-slug>/`.
3. In `content/folders/<folder-slug>.yaml`, add an item to the right group:
   `- { image: /work/<slug>/<file>.webp, video: null, caption: "…", span: normal, show: true }`
   For a video, set `image` to a poster frame and `video` to the mp4 path.
   Or do it in `/keystatic` → Design folders → the folder → Groups → Pieces → Add.

## Experience / achievement / skill
- Create a YAML in `content/experience/`, `content/achievements/` or `content/skills/` modelled on an existing file. Set `side: design | tech | both`.

## Hero text
- Edit `content/profile.yaml`: `designTagline` and `designBio` (left half), `techTagline` and `techBio` (right half). Keep each bio ≈ 40–55 words so it fits the card.
- Floating icons: `interests[]` with `icon` from the list in `keystatic.config.ts` and `side: design | tech`. To add a new icon, add an SVG path to `components/ui/Icons.tsx` and its name to the options list.

## New avatar photo (pencil sketch)
- `pip install rembg onnxruntime opencv-python pillow numpy` (one time), then
  `python scripts/make-avatar-sketch.py "<front photo>" --blink "<same pose, eyes closed>"`.
- Or upload any transparent PNG/WebP in /keystatic → Profile → Avatar.

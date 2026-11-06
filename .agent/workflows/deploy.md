---
description: Commit and deploy the portfolio to Vercel
---

1. Run `npm run build` and make sure it passes.
2. Commit: `git add -A && git commit -m "<what changed>"` then `git push`.
3. First deploy only: on vercel.com → Add New → Project → import the GitHub repo → Deploy (framework is auto-detected, no settings needed). Optionally set env `NEXT_PUBLIC_SITE_URL` to the final domain.
4. Every later push to `main` redeploys automatically.
5. Remember: `/keystatic` is disabled in production. Edit content locally and push.

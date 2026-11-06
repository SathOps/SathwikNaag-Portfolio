---
description: Install and run the portfolio locally, open the admin panel, and verify a production build
---

1. Check Node: `node -v` must be 18.18 or newer (20 or 22 recommended). If missing, ask the user to install Node LTS from nodejs.org.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open http://localhost:3000 (site) and http://localhost:3000/keystatic (admin panel).
5. To check everything compiles before committing: stop the dev server, run `npm run build`, and fix any errors it reports.
6. Optional preview of the production build: `npm run start`, then open http://localhost:3000.

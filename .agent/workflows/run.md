---
description: Run the portfolio now. Install dependencies if needed, start the dev server, print the localhost links
---

Do this immediately, in one turn, without asking questions or exploring files.

1. Work in the `portfolio` folder (this folder; if the workspace is the parent folder, `cd portfolio` first).
2. If `node_modules` is missing, run `npm install`.
3. If `.env.local` is missing, copy `.env.example` to `.env.local`.
4. Start the dev server in the background as a daemon: `npm run dev` (`IsDaemon: true`).
5. Tell the user the links:
   - Website: http://localhost:3000
   - Admin Panel (Keystatic): http://localhost:3000/keystatic
   - Design World: http://localhost:3000/design
   - Tech World: http://localhost:3000/tech

If port 3000 is busy, Next.js picks the next free port (3001, …): read it from the dev server output and use that port in the links.

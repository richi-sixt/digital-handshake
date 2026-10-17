# Digital Handshake

A personal Portfolio website and a playground for learning and exploring React features, patterns, and concepts hands-on. Each entry is a small, self-contained project that focuses on specific React topics.

## What's Inside

| App             | Topics Covered                                                                                           | Path                |
| --------------- | -------------------------------------------------------------------------------------------------------- | ------------------- |
| **Tic Tac Toe** | `useState`, immutable state, component composition, lifting state up, multiplayer (Supabase Realtime)    | `/apps/tic-tac-toe` |
| **Memory Game** | `useState`, `useEffect`, timers, conditional rendering, flip animations, multiplayer (Supabase Realtime) | `/apps/memory-game` |
| **15 Puzzle** | `setInterval`, `useEffect`, `useRef` leak-free timer, sovalbility check, inversion counting, blank-row parity | `/apps/puzzle-slider` |
| **UNO** | Pure-function game engine, immutable state, Supabase Realtime, 2–4 player rooms, wild cards, UNO announce/challenge | `/apps/uno` |

## Learning Goals

This project exists to:

- **Learn by building** — each feature is a small, focused experiment rather than a tutorial follow-along
- **Explore React patterns** — state management, hooks, context, effects, refs, and more
- **Try things out** — a safe space to break things, refactor, and understand _why_ something works

## Adding New Content

### Adding a project

Projects (title, description, text, tech, links, category) live in the Supabase table `projects` (`supabase/migrations/0005_projects.sql`) and are edited under `/admin/projects`; they appear on `/projects` and at `/apps/<slug>/`.

For a playable game, additionally create the game component in `src/components/games/YourGame.tsx` (use `'use client'`) and a page at `src/app/apps/your-slug/play/page.tsx`, then set the project's "App-Link" to `/apps/your-slug/play/`. Playable routes live in code and take precedence over the database-driven detail page.

### Blog admin (Supabase)

Posts live in the Supabase table `posts`; `/admin` is the editor. Log in with email and password (set it once under `/admin/account`); the login page also offers a magic link as fallback.

1. Run `supabase/migrations/0002_posts.sql` in the Supabase SQL editor, then add your email to `admin_emails` (INSERT is commented in the file).
2. Supabase dashboard → Authentication: disable "Allow new users to sign up", create your user, set Site URL and add `<origin>/auth/callback` to the redirect URLs (including `http://localhost:3000/auth/callback` for local development).
3. `npm run dev` → `/admin`. Only emails in `admin_emails` get access; row level security enforces it in the database.

### Work, Education and the home page

Work and education entries live in the Supabase table `entries` (`supabase/migrations/0004_entries.sql`) and are edited under `/admin/work` and `/admin/education` with the same Markdown editor as the blog (EN/DE, drafts, logo upload). Per entry, "Auf Startseite anzeigen" decides which entries appear in the Work and Education boxes on the home page; work entries can link projects (apps) that are then listed on the entry's page.

### Deploy

The site runs as a Node.js server (`npm run build`, then `npm start`). `deploy.sh` pulls, installs and builds; restarting the process is left to your environment. `.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at build time (never the service-role key).

## Tech Stack

- **Next.js 16** (App Router, server-rendered)
- **React 19** with TypeScript
- **Tailwind CSS v4** with dark mode
- **Markdown** (react-markdown, GFM, sanitized) with syntax highlighting; all content lives in Supabase
- **Supabase** Realtime for multiplayer
- **i18n** — English & German with client-side locale switching

## Features

- **Blog** — Markdown posts in Supabase, written in the `/admin` editor (EN/DE, images, drafts)
- **Multiplayer** — real-time game rooms via Supabase Realtime with shareable room codes
- **i18n** — English/German with automatic fallback when translations are missing
- **Dark mode** — system-aware theme switching

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Resources

- [React Tutorial: Tic-Tac-Toe](https://react.dev/learn/tutorial-tic-tac-toe) — where the first experiment started
- [React Docs](https://react.dev/learn) — official learning guide
- [Next.js Docs](https://nextjs.org/docs) — framework documentation
- [Supabase](https://supabase.com) - database for managing rooms in multiplayer games

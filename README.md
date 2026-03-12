# Digital Handshake

A personal portfolio website built with Next.js, React, TypeScript, and Tailwind CSS — statically exported and powered by MDX content.

Showcase my work experience, education, skills, and personal projects — all managed as MDX files with metadata.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.8 |
| Framework | Next.js 16 (App Router, static export) |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 + @tailwindcss/typography |
| Content | MDX (@next/mdx + remark-gfm + rehype-prism) |
| UI Components | Headless UI |
| Dark Mode | next-themes |
| Code Quality | ESLint, Prettier, prettier-plugin-tailwindcss |
| Image Processing | Sharp |

---

## Features

### Portfolio sections

- Hero section with name, tagline, and social links (GitHub, LinkedIn)
- About Me with a summary of professional and hobby interests
- Skills & Tech Stack displayed as icon cards grouped by category
- Work Experience with company logos, roles, and date ranges
- Education & Certifications preview with detail pages
- Projects showcase with links to live demos and GitHub repos

### Content management

- Each content entry (project, work, education) is an MDX file with exported metadata
- Dynamic content loading at build time using `fast-glob`
- Individual detail pages per entry with rich markdown content and syntax highlighting
- Typed data models with TypeScript interfaces for all content types

### UI & design

- Dark / light theme toggle with system preference detection
- Responsive two-column grid layouts (desktop side-by-side, mobile stacked)
- Custom typography scale with Tailwind CSS v4 theme variables
- Mobile-friendly navigation with Headless UI popover menu

### Projects page

- List view layout with project start dates on the left
- Work / Personal category toggle filter
- Tech stack badges per project

---

## Setup

### Prerequisites

- Node.js 18+

### 1. Clone and install dependencies

```bash
git clone https://github.com/richi-sixt/digital-handshake.git
cd digital-handshake
npm install
```

### 2. Content setup

MDX content files (projects, work, education) are **not** included in the repository — only example data ships with the repo in `content-examples/`.

A build script (`scripts/prepare-content.mjs`) automatically copies content into `src/app/` before every `dev` and `build` run:

| Directory | Purpose | In Git? |
|---|---|---|
| `content/` | Your real content | No (gitignored) |
| `content-examples/` | Example/dummy content | Yes |
| `src/app/*/page.mdx` | Active pages (auto-generated) | No (gitignored) |

**To add your own content**, create MDX files in the `content/` directory mirroring the structure of `content-examples/`:

```
content/
├── projects/
│   └── my-project/page.mdx
├── work/
│   └── my-company/page.mdx
└── education/
    └── my-university/page.mdx
```

If `content/` is missing (e.g. fresh clone), the example data is used as a fallback automatically.

You can also force example content with:

```bash
npm run prepare-content -- --examples
```

### 3. Run the development server

```bash
npm run dev
```

The site will be available at `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
```

This generates a static export in the `out/` directory, ready to deploy to any static hosting provider.

---

## Code Quality

ESLint and Prettier enforce consistent style across the codebase.

```bash
npm run lint                    # lint with next/core-web-vitals rules
```

Prettier is configured with single quotes, no semicolons, and automatic Tailwind CSS class sorting via `prettier-plugin-tailwindcss`.

---

## Motivation

I built this project to create a personal portfolio — a place to showcase both my professional experience in the insurance industry and my hobby development projects. It also served as a hands-on playground for learning modern web technologies like Next.js App Router, React Server Components, and Tailwind CSS v4.
## What I Learned

This project was built to gain hands-on experience with modern frontend patterns and tools:

- Set up a **Next.js 16 App Router** project with static export (`output: 'export'`) for deployment to any static host
- Built a **MDX content pipeline** with `@next/mdx`, `remark-gfm`, and `rehype-prism` for rich markdown pages with syntax highlighting
- Styled the entire site with **Tailwind CSS v4**, including custom theme variables, dark mode variants, and the typography plugin
- Used **React Server Components** for data fetching and **Client Components** (`'use client'`) only where interactivity is needed (theme toggle, category filter)
- Enforced **TypeScript strict mode** with typed interfaces for all content models (projects, work, education)
- Implemented **dark mode** with `next-themes` and system preference detection
- Built a **dynamic content loader** using `fast-glob` to discover MDX files at build time without hardcoded imports
- Leveraged AI assistance to understand React patterns and maintain code quality

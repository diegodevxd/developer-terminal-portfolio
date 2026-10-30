# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Diego Mancera's single-page, bilingual (ES/EN) portfolio: a full-stack developer and Linux kernel
contributor from León, MX. Built with Vite 6 + React 19 + TypeScript (strict) + Tailwind CSS v4.
Production: https://diegomancera.vercel.app/ (Vercel project `developer-terminal-portfolio-dqg2`,
auto-deploys on every push to `main`).

The previous static HTML/CSS/JS site (cyberpunk theme, `/servicios/` Stripe funnel, Supabase edge
functions) was removed in the redesign. It lives on in the git tag `v1-legacy`; nothing in the current
tree depends on it.

## Commands

```bash
npm install
npm run dev        # Vite dev server
npm run lint       # ESLint (must be 0 errors)
npx vitest --run   # one-shot test run (`npm test` is watch mode)
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serve dist/ locally
```

Before committing: lint, tests and build must all pass.

## Architecture

```
src/
├── app/          # main.tsx, App.tsx (section order only), providers.tsx (LocaleProvider, LazyMotion)
├── content/      # types.ts + es.ts + en.ts: ALL visible text, links and project data
├── features/     # one folder per section: hero, about, open-source, experience, projects, stack, contact
├── components/
│   ├── ui/       # ascii-portrait.tsx, disc-cascade-carousel.tsx
│   └── layout/   # SiteFrame, Navbar, SocialRail, ResumeButton, Footer, Section, SectionHeading,
│                 #   CornerFrame, TerminalCard, Reveal
├── hooks/        # useLocale, useContent, useActiveSection, useMediaQuery
├── lib/          # utils.ts (cn), ascii/engine.ts (pure portrait engine)
└── styles/       # globals.css: design tokens + self-hosted fonts
```

Rules that keep it from turning into cascade code again:

- **Content is data.** No visible string lives in a component. Everything comes from `useContent()`,
  typed by `src/content/types.ts`. `es.ts` and `en.ts` must have the same shape (a test enforces it).
  To change the CV content, edit those two files only. Never publish the phone number (a test checks).
- **One-way dependencies:** `app → features → components → lib`. A feature never imports another feature.
- **Pure logic in `lib/`.** The ASCII portrait math (`lib/ascii/engine.ts`) is pure and unit-tested;
  `components/ui/ascii-portrait.tsx` only draws. It samples the photo plus a subject mask
  (`public/images/diego-portrait-mask.png`, regenerate with `python -I scripts/make-portrait-mask.py`),
  animates at ≤30 fps, pauses off-screen and respects `prefers-reduced-motion`.
- **`disc-cascade-carousel.tsx` is a vendored third-party component.** Keep edits minimal and commented
  (its only changes are i18n `labels` props and an eslint-disable for `react-hooks/refs`, which its
  spring engine uses on purpose). Projects lazy-loads it and shows a card list below 720px instead.
- **Bundle budget:** initial JS ≤ ~110 kB gzip. Heavy sections (Projects, Stack, Contact) and motion
  features are lazy-loaded; keep it that way.

## Design system

Dark only, inspired by hermes-agent.nousresearch.com. Tokens in `src/styles/globals.css`:
`--background #07081c`, `--card #0e1030`, `--border/line #23265a`, `--foreground #f2f2f2`,
`--muted-foreground #8a8db8`, `--accent #2b2bff` (electric frame and buttons), `--color-accent-text #8f8fff`
(accent-colored text; #2b2bff fails contrast as text). Fonts: Antonio (display), Inter (body),
JetBrains Mono (labels, terminal). Section headings use two tones (line 1 foreground, line 2 muted).

## Assets and SEO

- CVs: `public/cv/Diego-Mancera-CV-ES.pdf` and `-EN.pdf` (source copies live outside the repo in the
  owner's `Downloads/CVs` folder).
- Link preview: `public/og-image.jpg` (1200×630) is a real screenshot of the hero. Retake it if the hero
  changes. Meta tags, canonical, JSON-LD and preloads are in `index.html`.

## Conventions

- Prettier: single quotes, no semicolons. TypeScript strict: no `any`, no `@ts-ignore`.
- Commit messages: Conventional Commits, in Spanish. Do NOT add `Co-Authored-By` trailers; commits
  carry only the owner's authorship.
- `eslint.config.js` is protected by a local hook; fix code instead of loosening lint rules.
- Planning history of the redesign: `docs/redesign/PLAN.md` and `docs/redesign/PROMPTS.md`.
  `docs/superpowers/` holds an older, unimplemented "Frutiger Aero" proposal.

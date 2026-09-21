# guicciardi.net

Personal site of Emanuele Guicciardi, built with [Astro](https://astro.build).

## Commands

Run from the root of the project.

| Command        | Action                                   |
| :------------- | :--------------------------------------- |
| `pnpm install` | Install dependencies                     |
| `pnpm dev`     | Start the dev server at `localhost:4321` |
| `pnpm build`   | Build the production site to `./dist/`   |
| `pnpm preview` | Preview the production build locally     |

## Structure

```text
src/
  components/   Astro components (layout/ holds the header, footer and toggles)
  content/      writing/ (Markdown posts) and links.json (the linkblog)
  data/         Site copy and the list of accents
  layouts/      Base.astro
  lib/          Content helpers (sorting, reading time, date formats)
  pages/        Home, /posts, /posts/[slug] and /rss.xml
  scripts/      Client side preference handling
  styles/       global.css, with the design tokens and palettes
```

## Content

Posts are Markdown files in `src/content/writing/`. The front matter is
validated by the schema in `src/content.config.ts`: `title`, `date`, `excerpt`
are required, `category`, `tags` and `draft` are optional. Drafts show up in the
dev server only. Reading time is computed from the body.

Linkblog entries are objects in `src/content/links.json`, each with a unique
`id`.

## Preferences and theming

Theme, accent and animations are stored in `localStorage` (`gnet-theme`,
`gnet-accent`, `gnet-motion`) and applied as `data-theme`, `data-accent` and
`data-motion` on `<html>` before first paint. Every palette lives in
`src/styles/global.css` as CSS custom properties in `oklch()`.

Text colours are kept at WCAG 2.1 AA or better in every palette and theme. When
editing a palette, check the contrast of `body` and `soft` on the paper and
hovered row backgrounds, and of `pop-text` where an accent is used for small text.

## Environment variables

Copy `.env.example` to `.env` for local use. All variables are optional.

| Variable           | Purpose                                              |
| :----------------- | :--------------------------------------------------- |
| `UMAMI_SCRIPT_URL` | URL of the Umami tracker script (must be `https://`) |
| `UMAMI_WEBSITE_ID` | Umami website id                                     |

The tracking script is rendered only when both are set. They are inlined into
the HTML at build time, so define them in the environment of the build.

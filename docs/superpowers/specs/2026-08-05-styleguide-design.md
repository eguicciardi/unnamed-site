# Styleguide page: design token showcase

Date: 2026-08-05
Status: approved, ready for implementation planning

## Purpose

`src/pages/styleguide.astro` currently renders a placeholder ("Ciao"). This
spec turns it into a showcase of the design tokens already defined in
`src/styles/global.css`: the semantic colour tokens, typography, and a small
set of interactive states. It exists to let a human visually confirm the
tokens behave as intended in both themes, and to serve as a copy-paste
reference for class names when building future components.

## Explicit non-goals

- **Not a component library.** No `Button.astro`, `Card.astro`, etc. The one
  interactive element used for state demos is a bare `<button>`, not a
  reusable component.
- **No spacing or radius tokens.** These don't exist in `global.css` today;
  introducing them is a separate future spec, once real components surface
  which values actually recur.
- **No new colour tokens.** The 27 semantic colour pairs already in
  `global.css` were contrast-verified in a prior session. This page displays
  them; it does not re-derive or change them.

## Scope

Three sections on one page: **Colours**, **Typography**, **Interactive
states**.

## 1. `global.css` change: theme-scoped containers

Today `.dark` and (added in this change) `.light` only work on `<html>`,
because the dark/light overrides are keyed off classes on the root element.
The showcase needs to render a light swatch and a dark swatch side by side,
regardless of which theme the page itself is in.

Add a second selector to each existing rule, so a container class can force a
theme locally:

```css
:root.dark,
:root .theme-dark {
  /* ...existing declarations, unchanged... */
}

:root.light,
:root .theme-light {
  color-scheme: light;
}
```

Both selectors keep specificity (0,2,0), identical to the current `:root.dark`
rule — no declaration duplication, no specificity fragility. Usage: wrap a
column in `<div class="theme-dark">...</div>` to force it dark, `theme-light`
to force it light, independent of the page's actual active theme.

## 2. `global.css` change: base heading styles

`@layer base` currently styles only `body`, `::selection`, `:focus-visible`,
and `hr`. Add heading styles so every page in the site gets sane defaults,
not just the styleguide:

```css
@layer base {
  h1 { @apply text-4xl font-bold; }
  h2 { @apply text-3xl font-bold; }
  h3 { @apply text-2xl font-semibold; }
  h4 { @apply text-xl font-semibold; }
  h5 { @apply text-lg font-semibold; }
  h6 { @apply text-base font-semibold; }
}
```

Sizes are Tailwind's default scale, chosen for a reasonable visual step
between levels — not a new token system. All headings inherit `color:
var(--color-fg)` from the existing `body` rule; no explicit colour utility
needed.

## 3. New components: `src/components/styleguide/`

Four presentational components, each with a single responsibility:

- **`ColorSwatch.astro`** — one token, in one of two variants:
  - **fill** (default): a solid colour block, the Tailwind class name (e.g.
    `bg-primary`), the CSS variable name (e.g. `--color-primary`), and its
    resolved hex value.
  - **text**: for `*-fg` tokens, which exist to be text colour on their
    paired background, not a colour block on their own. Renders as a short
    line of sample text in that colour (e.g. `text-primary-fg`) on top of its
    paired background (e.g. `bg-primary`), labelled with both class names and
    the resolved hex of the text colour. Every `*-fg` token in section 4 uses
    this variant.
- **`ColorGroup.astro`** — one semantic family (e.g. "Primary"): a heading,
  then a light column and a dark column side by side, each rendering its
  `ColorSwatch` children inside a `theme-light` / `theme-dark` wrapper.
- **`TypeSample.astro`** — one typography sample: renders the given heading
  level (or paragraph) with real text, labelled with the tag/class used.
- **`StateDemo.astro`** — one bare `<button>` sample demonstrating
  default/hover/focus-visible/disabled with a token pairing (e.g.
  `bg-primary` + `hover:bg-primary-hover`), labelled with which state to look
  for since hover/focus aren't visible in a static read of the page.

`styleguide.astro` imports these four and orchestrates them by passing inline
literal arrays — no separate data/config file. Example shape for one group:

```astro
const surfaceTokens = [
  { class: "bg-canvas", variable: "--color-canvas" },
  { class: "bg-surface", variable: "--color-surface" },
  { class: "bg-surface-muted", variable: "--color-surface-muted" },
  { class: "bg-surface-sunken", variable: "--color-surface-sunken" },
];
```

### Resolved hex values are read at runtime, not hardcoded

`ColorSwatch` includes a small client-side script that reads the swatch's own
`getComputedStyle(...).backgroundColor` (**fill** variant) or `.color`
(**text** variant) after mount and writes the resolved value into the label.
This keeps the displayed hex truthful if a token's value in `global.css`
changes later, without anyone needing to remember to update the showcase by
hand.

## 4. Colour section content

One `ColorGroup` per existing semantic family, matching `global.css`
1:1 — no family invented, none skipped:

| Group | Tokens |
|---|---|
| Surfaces | canvas, surface, surface-muted, surface-sunken |
| Border | border, border-strong |
| Foreground | fg, fg-muted, fg-subtle |
| Primary | primary, primary-hover, primary-fg, primary-subtle, primary-subtle-fg |
| Accent | accent, accent-hover, accent-fg, accent-subtle, accent-subtle-fg |
| Accent-alt | accent-alt, accent-alt-fg |
| Ring | ring (rendered as a `bg-ring` swatch for display; the token is normally consumed as `outline-color` via the global `:focus-visible` rule, not as a background — the swatch's label notes this) |
| Danger | danger, danger-fg |
| Warning | warning, warning-fg |
| Success | success, success-fg |

## 5. Typography section content

One `TypeSample` per heading level h1–h6 (bare tags, no utility classes,
relying on the new `@layer base` styles) plus one body paragraph. Below that,
three short lines of real sentence text in `text-fg`, `text-fg-muted`, and
`text-fg-subtle` on `bg-surface`, each labelled with its class name, so the
muted/subtle contrast steps are visible against real prose rather than just a
swatch block.

## 6. Interactive states section content

Three `StateDemo` instances:

1. Primary button: `bg-primary text-primary-fg hover:bg-primary-hover`,
   labelled for `:hover`.
2. Accent button: `bg-accent text-accent-fg hover:bg-accent-hover`, labelled
   for `:hover`.
3. Disabled button: `bg-primary text-primary-fg disabled:opacity-50`, actually
   rendered with the `disabled` attribute set, labelled for `:disabled`.

`:focus-visible` is already global (defined in `@layer base` using
`--color-ring`), so it is demonstrated on the same three buttons via a label
telling the reader to Tab to them, rather than a fourth separate demo.

## Testing

No test suite exists for this project (no test runner configured). Validation
is manual:

1. `astro build` succeeds.
2. Visit `/styleguide` with the page's own theme set to light, then to dark
   (via the header toggle), and confirm every `ColorGroup`'s light column and
   dark column both render correctly regardless of the page's active theme —
   this is what the `theme-light`/`theme-dark` CSS change exists to prove.
3. Confirm every resolved hex label matches the corresponding value in
   `global.css` for the active theme.
4. Tab through the three state demos and confirm the focus ring appears.
5. Confirm `prettier --check` and `eslint` pass on all new files.

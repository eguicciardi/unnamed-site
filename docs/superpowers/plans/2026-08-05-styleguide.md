# Styleguide token showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `src/pages/styleguide.astro` into a showcase of the project's existing design tokens (colours, typography, interactive states), built from small reusable Astro components.

**Architecture:** Four presentational components in `src/components/styleguide/` (`ColorSwatch`, `ColorGroup`, `TypeSample`, `StateDemo`), orchestrated from `styleguide.astro` via inline literal data arrays. Two small additions to `src/styles/global.css`: theme-scoped container selectors (`.theme-light` / `.theme-dark`) so the page can force a theme on part of the DOM regardless of the page's active theme, and base heading styles (`h1`–`h6`) in `@layer base`.

**Tech Stack:** Astro 7, Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`), no test runner — verification is `astro build` + grep against the compiled output, plus a manual browser pass at the end.

## Global Constraints

- All new UI copy is in Italian, matching the rest of the site and this plan's source spec — **except** structural/technical labels that name a code concept rather than address the reader: theme-column labels ("Light"/"Dark") and colour-group titles ("Surfaces", "Border", "Primary", etc.) stay in English, matching the English token names they label (`bg-primary`, `--color-border`). Confirmed with the human partner after Task 3's review raised it.
- Every array of `SwatchDef`-shaped objects (anything passed as `ColorGroup`'s `swatches` prop, or spread directly into `<ColorSwatch {...item} />`) must be annotated `: SwatchDef[]` at its declaration, with `SwatchDef` imported as a type from `ColorGroup.astro` (which exports it). Without this annotation, TypeScript widens a literal like `variant: "border"` to plain `string`, which no longer satisfies `SwatchDef.variant`'s literal union — confirmed as a real type error during Task 3's review, before it could multiply across Task 4's larger arrays.
- `.astro` files use tab indentation, other files 2 spaces — enforced by `.prettierrc.json`; run `npx prettier --write <files>` at the end of every task rather than hand-formatting.
- No new colour tokens. Every class/variable referenced must already exist in `src/styles/global.css` (verified in a prior session, contrast-checked, do not re-derive).
- No spacing or radius tokens — out of scope per the spec, use Tailwind's default scale for layout (gap, padding, rounded-md, etc.).
- No new dependencies, no test runner introduced. Every task's verification is `astro build` + `grep` on the compiled output in `dist/`, plus `prettier --check` and `eslint`.
- Every task ends with a commit. Do not batch multiple tasks into one commit.

---

## Task 1: CSS foundation — theme-scoped containers and base headings

**Files:**
- Modify: `src/styles/global.css:184-185`, `:224-226`, `:234-237`

**Interfaces:**
- Consumes: existing `:root.dark { ... }` rule (line 184), existing `:root.light { ... }` rule (line 224), existing `@layer base { html {...} body {...} }` block (lines 234–258).
- Produces: two new CSS selectors usable anywhere in markup — `.theme-dark` and `.theme-light` — that force the dark/light token set on the element they're applied to and its descendants, independent of the page's `<html>` class. Also: global default styles for bare `<h1>`–`<h6>` elements (Tailwind's `text-{size} font-{weight}` scale), inherited by every page in the site, not just the styleguide.

- [ ] **Step 1: Add the `.theme-dark` container selector**

In `src/styles/global.css`, find:

```css
:root.dark {
  color-scheme: dark;
```

Replace with:

```css
:root.dark,
:root .theme-dark {
  color-scheme: dark;
```

- [ ] **Step 2: Add the `.theme-light` container selector**

Find:

```css
:root.light {
  color-scheme: light;
}
```

Replace with:

```css
:root.light,
:root .theme-light {
  color-scheme: light;
}
```

- [ ] **Step 3: Add base heading styles**

Find:

```css
@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
```

Replace with:

```css
@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }

  h1 {
    @apply text-4xl font-bold;
  }

  h2 {
    @apply text-3xl font-bold;
  }

  h3 {
    @apply text-2xl font-semibold;
  }

  h4 {
    @apply text-xl font-semibold;
  }

  h5 {
    @apply text-lg font-semibold;
  }

  h6 {
    @apply text-base font-semibold;
  }

  body {
```

- [ ] **Step 4: Format and build**

```bash
npx prettier --write src/styles/global.css
npx astro build
```

Expected: build completes with `2 page(s) built`, no errors.

- [ ] **Step 5: Verify the compiled CSS**

```bash
CSS=$(ls -t dist/_astro/*.css | head -1)
grep -o 'theme-dark' "$CSS" | head -1
grep -o 'theme-light' "$CSS" | head -1
grep -o 'h1{[^}]*}' "$CSS"
grep -o 'h6{[^}]*}' "$CSS"
```

Expected: `theme-dark` and `theme-light` each print once (they're plain authored CSS, not Tailwind-generated utilities, so they appear regardless of whether any page uses them yet). The `h1{...}` and `h6{...}` rules print with `font-size` and `font-weight` declarations.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add theme-scoped containers and base heading styles"
```

---

## Task 2: `ColorSwatch` component + first usage

**Files:**
- Create: `src/components/styleguide/ColorSwatch.astro`
- Modify: `src/pages/styleguide.astro` (full rewrite)

**Interfaces:**
- Consumes: Tailwind utility classes auto-generated from the `--color-*` tokens in `global.css` (e.g. `bg-canvas`, `text-fg`, `border-border`) — no new tokens, only classes that already resolve.
- Produces: `ColorSwatch.astro`, props:
  ```ts
  interface Props {
  	label: string;
  	className: string;
  	variable: string;
  	variant?: "fill" | "text" | "border";
  	pairedClassName?: string;
  	sampleText?: string;
  	note?: string;
  }
  ```
  - `variant: "fill"` (default): a solid colour block using `className` as background.
  - `variant: "border"`: a box on `bg-surface` with a thick border in `className` (for tokens whose real usage is a border colour, not a fill).
  - `variant: "text"`: sample text in `className` rendered on top of `pairedClassName`'s background (for `*-fg` tokens, which exist to be text colour, not a block of colour on their own).
  - `note`: optional one-line caption for tokens whose typical consumption isn't a utility class at all (used for the `ring` token in Task 4).
  - Every instance also renders a small client script (deduped by Astro across all instances) that reads the swatch's own resolved colour via `getComputedStyle` after mount and writes the hex value into the label, so the displayed hex can never drift from the actual token value in `global.css`.

- [ ] **Step 1: Create `ColorSwatch.astro`**

```astro
---
interface Props {
	label: string;
	className: string;
	variable: string;
	variant?: "fill" | "text" | "border";
	pairedClassName?: string;
	sampleText?: string;
	note?: string;
}

const {
	label,
	className,
	variable,
	variant = "fill",
	pairedClassName,
	sampleText = "Testo di esempio",
	note,
} = Astro.props;
---

<div class="flex flex-col gap-1" data-swatch-card>
	{
		variant === "fill" && (
			<div
				class:list={["h-16 w-full rounded-md border border-border", className]}
				data-swatch="fill"
			/>
		)
	}
	{
		variant === "border" && (
			<div
				class:list={[
					"flex h-16 w-full items-center justify-center rounded-md border-4 bg-surface",
					className,
				]}
				data-swatch="border"
			/>
		)
	}
	{
		variant === "text" && (
			<div
				class:list={[
					"flex h-16 w-full items-center justify-center rounded-md border border-border px-3",
					pairedClassName,
				]}
			>
				<span class:list={["text-sm font-medium", className]} data-swatch="text">
					{sampleText}
				</span>
			</div>
		)
	}
	<div class="text-xs leading-tight">
		<p class="font-mono text-fg">{label}</p>
		<p class="font-mono text-fg-subtle">{className}</p>
		<p class="font-mono text-fg-subtle">{variable}</p>
		<p class="font-mono text-fg-subtle" data-hex-output>risoluzione…</p>
		{note && <p class="text-fg-subtle italic">{note}</p>}
	</div>
</div>

<script>
	function toHex(rawColor) {
		const match = rawColor.match(/\d+(\.\d+)?/g);
		if (!match) return rawColor;
		const [r, g, b] = match.map((n) => Math.round(Number(n)));
		return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
	}

	document.querySelectorAll("[data-swatch-card]").forEach((card) => {
		const box = card.querySelector("[data-swatch]");
		const output = card.querySelector("[data-hex-output]");
		if (!(box instanceof HTMLElement) || !(output instanceof HTMLElement)) return;

		const mode = box.getAttribute("data-swatch");
		const raw =
			mode === "text"
				? getComputedStyle(box).color
				: mode === "border"
					? getComputedStyle(box).borderColor
					: getComputedStyle(box).backgroundColor;

		output.textContent = toHex(raw);
	});
</script>
```

- [ ] **Step 2: Wire up a first usage in `styleguide.astro`**

Replace the entire contents of `src/pages/styleguide.astro`:

```astro
---
import SiteLayout from "../layouts/SiteLayout.astro";
import ColorSwatch from "../components/styleguide/ColorSwatch.astro";

const surfaceTokens = [
	{ label: "canvas", className: "bg-canvas", variable: "--color-canvas" },
	{ label: "surface", className: "bg-surface", variable: "--color-surface" },
	{ label: "surface-muted", className: "bg-surface-muted", variable: "--color-surface-muted" },
	{ label: "surface-sunken", className: "bg-surface-sunken", variable: "--color-surface-sunken" },
];
---

<SiteLayout title="Styleguide" description="Vetrina dei design token del progetto.">
	<div class="flex flex-col gap-16">
		<header class="flex flex-col gap-2">
			<h1>Styleguide</h1>
			<p class="text-fg-muted">
				Vetrina dei design token definiti in <code class="font-mono text-sm">global.css</code>.
			</p>
		</header>

		<section class="flex flex-col gap-8">
			<h2>Colori</h2>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{surfaceTokens.map((item) => <ColorSwatch {...item} />)}
			</div>
		</section>
	</div>
</SiteLayout>
```

- [ ] **Step 3: Format, build, verify**

```bash
npx prettier --write src/components/styleguide/ColorSwatch.astro src/pages/styleguide.astro
npx astro build
grep -o 'id="theme-toggle"' dist/styleguide/index.html
grep -o 'data-swatch-card' dist/styleguide/index.html | wc -l
grep -o 'data-swatch="fill"' dist/styleguide/index.html | wc -l
```

Expected: build succeeds; `theme-toggle` present (confirms the layout/header still renders); `data-swatch-card` count is 4; `data-swatch="fill"` count is 4.

- [ ] **Step 4: Commit**

```bash
git add src/components/styleguide/ColorSwatch.astro src/pages/styleguide.astro
git commit -m "feat: add ColorSwatch component and wire up Surfaces tokens"
```

---

## Task 3: `ColorGroup` component — light/dark comparison

**Files:**
- Create: `src/components/styleguide/ColorGroup.astro`
- Modify: `src/pages/styleguide.astro` (full rewrite)

**Interfaces:**
- Consumes: `ColorSwatch.astro` (Task 2), `.theme-light` / `.theme-dark` selectors (Task 1).
- Produces: `ColorGroup.astro`, props. `SwatchDef` is exported (not just `Props`) because Task 4 and Task 5 need to import it as a type to annotate their token arrays — without that annotation, TypeScript widens literal `variant` values to plain `string` and they stop satisfying this union:
  ```ts
  export interface SwatchDef {
  	label: string;
  	className: string;
  	variable: string;
  	variant?: "fill" | "text" | "border";
  	pairedClassName?: string;
  	sampleText?: string;
  	note?: string;
  }

  interface Props {
  	title: string;
  	swatches: SwatchDef[];
  }
  ```
  Renders `title` as a group heading, then the same `swatches` twice — once inside a `.theme-light` wrapper, once inside a `.theme-dark` wrapper — so both themes are visible side by side regardless of the page's active theme.

- [ ] **Step 1: Create `ColorGroup.astro`**

```astro
---
import ColorSwatch from "./ColorSwatch.astro";

export interface SwatchDef {
	label: string;
	className: string;
	variable: string;
	variant?: "fill" | "text" | "border";
	pairedClassName?: string;
	sampleText?: string;
	note?: string;
}

interface Props {
	title: string;
	swatches: SwatchDef[];
}

const { title, swatches } = Astro.props;
---

<section class="flex flex-col gap-3">
	<h3 class="text-sm font-semibold uppercase tracking-wide text-fg-muted">{title}</h3>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<div class="theme-light flex flex-col gap-4 rounded-lg bg-surface p-4">
			<p class="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Light</p>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
				{swatches.map((swatch) => <ColorSwatch {...swatch} />)}
			</div>
		</div>
		<div class="theme-dark flex flex-col gap-4 rounded-lg bg-surface p-4">
			<p class="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Dark</p>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
				{swatches.map((swatch) => <ColorSwatch {...swatch} />)}
			</div>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Use `ColorGroup` in `styleguide.astro`, add the Border group**

The `border` variant hasn't been exercised yet — add it here so both non-default variants (`border`, and `text` later in Task 4) are proven before the full data set lands.

Replace the entire contents of `src/pages/styleguide.astro`:

```astro
---
import SiteLayout from "../layouts/SiteLayout.astro";
import ColorGroup, { type SwatchDef } from "../components/styleguide/ColorGroup.astro";

const surfaceTokens: SwatchDef[] = [
	{ label: "canvas", className: "bg-canvas", variable: "--color-canvas" },
	{ label: "surface", className: "bg-surface", variable: "--color-surface" },
	{ label: "surface-muted", className: "bg-surface-muted", variable: "--color-surface-muted" },
	{ label: "surface-sunken", className: "bg-surface-sunken", variable: "--color-surface-sunken" },
];

const borderTokens: SwatchDef[] = [
	{ label: "border", className: "border-border", variable: "--color-border", variant: "border" },
	{
		label: "border-strong",
		className: "border-border-strong",
		variable: "--color-border-strong",
		variant: "border",
	},
];
---

<SiteLayout title="Styleguide" description="Vetrina dei design token del progetto.">
	<div class="flex flex-col gap-16">
		<header class="flex flex-col gap-2">
			<h1>Styleguide</h1>
			<p class="text-fg-muted">
				Vetrina dei design token definiti in <code class="font-mono text-sm">global.css</code>.
			</p>
		</header>

		<section class="flex flex-col gap-8">
			<h2>Colori</h2>
			<ColorGroup title="Surfaces" swatches={surfaceTokens} />
			<ColorGroup title="Border" swatches={borderTokens} />
		</section>
	</div>
</SiteLayout>
```

- [ ] **Step 3: Format, build, verify**

```bash
npx prettier --write src/components/styleguide/ColorGroup.astro src/pages/styleguide.astro
npx astro build
grep -o 'theme-light' dist/styleguide/index.html | wc -l
grep -o 'theme-dark' dist/styleguide/index.html | wc -l
grep -o 'data-swatch="border"' dist/styleguide/index.html | wc -l
```

Expected: build succeeds. `theme-light` and `theme-dark` each appear twice (once per `ColorGroup` instance — there are 2 groups). `data-swatch="border"` count is 4 (2 border tokens × light + dark columns).

- [ ] **Step 4: Commit**

```bash
git add src/components/styleguide/ColorGroup.astro src/pages/styleguide.astro
git commit -m "feat: add ColorGroup component with light/dark comparison"
```

---

## Task 4: Complete the Colori section — all 10 semantic groups

**Files:**
- Modify: `src/pages/styleguide.astro` (full rewrite)

**Interfaces:**
- Consumes: `ColorGroup` (Task 3) and its exported `SwatchDef` type (Task 3's fix round added `export` to that interface — confirm it's there before starting; if not, add `export` yourself), `ColorSwatch`'s `text` variant (Task 2, not yet exercised).
- Produces: nothing consumed by later tasks — these data arrays are page-local.

This task adds the remaining 8 groups from the spec's token table (Foreground, Primary, Accent, Accent-alt, Ring, Danger, Warning, Success), completing the Colori section 1:1 against `global.css`. Every token array below is explicitly typed `: SwatchDef[]` — this is required, not stylistic: without it, TypeScript widens literal `variant` values like `"text"` to plain `string`, which fails to satisfy `SwatchDef.variant`'s literal union (confirmed as a real type error during Task 3's review).

- [ ] **Step 1: Replace `styleguide.astro` with the full Colori section**

```astro
---
import SiteLayout from "../layouts/SiteLayout.astro";
import ColorGroup, { type SwatchDef } from "../components/styleguide/ColorGroup.astro";

const surfaceTokens: SwatchDef[] = [
	{ label: "canvas", className: "bg-canvas", variable: "--color-canvas" },
	{ label: "surface", className: "bg-surface", variable: "--color-surface" },
	{ label: "surface-muted", className: "bg-surface-muted", variable: "--color-surface-muted" },
	{ label: "surface-sunken", className: "bg-surface-sunken", variable: "--color-surface-sunken" },
];

const borderTokens: SwatchDef[] = [
	{ label: "border", className: "border-border", variable: "--color-border", variant: "border" },
	{
		label: "border-strong",
		className: "border-border-strong",
		variable: "--color-border-strong",
		variant: "border",
	},
];

const foregroundTokens: SwatchDef[] = [
	{ label: "fg", className: "text-fg", variable: "--color-fg", variant: "text", pairedClassName: "bg-surface" },
	{
		label: "fg-muted",
		className: "text-fg-muted",
		variable: "--color-fg-muted",
		variant: "text",
		pairedClassName: "bg-surface",
	},
	{
		label: "fg-subtle",
		className: "text-fg-subtle",
		variable: "--color-fg-subtle",
		variant: "text",
		pairedClassName: "bg-surface",
	},
];

const primaryTokens: SwatchDef[] = [
	{ label: "primary", className: "bg-primary", variable: "--color-primary" },
	{ label: "primary-hover", className: "bg-primary-hover", variable: "--color-primary-hover" },
	{
		label: "primary-fg",
		className: "text-primary-fg",
		variable: "--color-primary-fg",
		variant: "text",
		pairedClassName: "bg-primary",
	},
	{ label: "primary-subtle", className: "bg-primary-subtle", variable: "--color-primary-subtle" },
	{
		label: "primary-subtle-fg",
		className: "text-primary-subtle-fg",
		variable: "--color-primary-subtle-fg",
		variant: "text",
		pairedClassName: "bg-primary-subtle",
	},
];

const accentTokens: SwatchDef[] = [
	{ label: "accent", className: "bg-accent", variable: "--color-accent" },
	{ label: "accent-hover", className: "bg-accent-hover", variable: "--color-accent-hover" },
	{
		label: "accent-fg",
		className: "text-accent-fg",
		variable: "--color-accent-fg",
		variant: "text",
		pairedClassName: "bg-accent",
	},
	{ label: "accent-subtle", className: "bg-accent-subtle", variable: "--color-accent-subtle" },
	{
		label: "accent-subtle-fg",
		className: "text-accent-subtle-fg",
		variable: "--color-accent-subtle-fg",
		variant: "text",
		pairedClassName: "bg-accent-subtle",
	},
];

const accentAltTokens: SwatchDef[] = [
	{ label: "accent-alt", className: "bg-accent-alt", variable: "--color-accent-alt" },
	{
		label: "accent-alt-fg",
		className: "text-accent-alt-fg",
		variable: "--color-accent-alt-fg",
		variant: "text",
		pairedClassName: "bg-accent-alt",
	},
];

const ringTokens: SwatchDef[] = [
	{
		label: "ring",
		className: "bg-ring",
		variable: "--color-ring",
		note: "Uso reale: outline-color nella regola globale :focus-visible, non applicato come classe di sfondo.",
	},
];

const dangerTokens: SwatchDef[] = [
	{ label: "danger", className: "bg-danger", variable: "--color-danger" },
	{
		label: "danger-fg",
		className: "text-danger-fg",
		variable: "--color-danger-fg",
		variant: "text",
		pairedClassName: "bg-danger",
	},
];

const warningTokens: SwatchDef[] = [
	{ label: "warning", className: "bg-warning", variable: "--color-warning" },
	{
		label: "warning-fg",
		className: "text-warning-fg",
		variable: "--color-warning-fg",
		variant: "text",
		pairedClassName: "bg-warning",
	},
];

const successTokens: SwatchDef[] = [
	{ label: "success", className: "bg-success", variable: "--color-success" },
	{
		label: "success-fg",
		className: "text-success-fg",
		variable: "--color-success-fg",
		variant: "text",
		pairedClassName: "bg-success",
	},
];
---

<SiteLayout title="Styleguide" description="Vetrina dei design token del progetto.">
	<div class="flex flex-col gap-16">
		<header class="flex flex-col gap-2">
			<h1>Styleguide</h1>
			<p class="text-fg-muted">
				Vetrina dei design token definiti in <code class="font-mono text-sm">global.css</code>.
			</p>
		</header>

		<section class="flex flex-col gap-8">
			<h2>Colori</h2>
			<ColorGroup title="Surfaces" swatches={surfaceTokens} />
			<ColorGroup title="Border" swatches={borderTokens} />
			<ColorGroup title="Foreground" swatches={foregroundTokens} />
			<ColorGroup title="Primary" swatches={primaryTokens} />
			<ColorGroup title="Accent" swatches={accentTokens} />
			<ColorGroup title="Accent-alt" swatches={accentAltTokens} />
			<ColorGroup title="Ring" swatches={ringTokens} />
			<ColorGroup title="Danger" swatches={dangerTokens} />
			<ColorGroup title="Warning" swatches={warningTokens} />
			<ColorGroup title="Success" swatches={successTokens} />
		</section>
	</div>
</SiteLayout>
```

- [ ] **Step 2: Format, build, verify**

```bash
npx prettier --write src/pages/styleguide.astro
npx astro build
grep -o '<h3[^>]*>[^<]*</h3>' dist/styleguide/index.html
grep -o 'data-swatch="text"' dist/styleguide/index.html | wc -l
grep -o 'Uso reale' dist/styleguide/index.html | wc -l
```

Expected: 10 `<h3>` group titles print (Surfaces, Border, Foreground, Primary, Accent, Accent-alt, Ring, Danger, Warning, Success). `data-swatch="text"` count is 22 (11 text-variant tokens — fg, fg-muted, fg-subtle, primary-fg, primary-subtle-fg, accent-fg, accent-subtle-fg, accent-alt-fg, danger-fg, warning-fg, success-fg — × light + dark columns). The Ring note text appears twice (light + dark columns).

- [ ] **Step 3: Commit**

```bash
git add src/pages/styleguide.astro
git commit -m "feat: complete colour token showcase (10 semantic groups)"
```

---

## Task 5: `TypeSample` component + Tipografia section

**Files:**
- Create: `src/components/styleguide/TypeSample.astro`
- Modify: `src/pages/styleguide.astro` (add section, imports, arrays only — do not touch the Colori section written in Task 4)

**Interfaces:**
- Consumes: base heading styles from Task 1; `ColorSwatch`'s `text` variant (Task 2) and its exported `SwatchDef` type (Task 3/4), reused here for the fg-on-surface prose samples instead of duplicating that rendering logic.
- Produces: `TypeSample.astro`, props (exported as `Props`, Astro's convention for component prop typing — do not rename this interface):
  ```ts
  export interface Props {
  	as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  	sample: string;
  }
  ```
  Renders `sample` inside a dynamically-chosen tag (`as`), labelled with the tag name used. The `typeSamples` array in `styleguide.astro` must be typed `: TypeSampleDef[]` (imported as `type Props as TypeSampleDef`) and `fgProseSamples` typed `: SwatchDef[]` — same literal-widening reason as Task 4's arrays.

- [ ] **Step 1: Create `TypeSample.astro`**

```astro
---
export interface Props {
	as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
	sample: string;
}

const { as: Tag, sample } = Astro.props;
---

<div class="flex flex-wrap items-baseline gap-4 border-b border-border py-3">
	<Tag>{sample}</Tag>
	<span class="font-mono text-xs text-fg-subtle">&lt;{Tag}&gt;</span>
</div>
```

- [ ] **Step 2: Add the Tipografia section to `styleguide.astro`**

In `src/pages/styleguide.astro`, add two imports after the existing `ColorGroup` import:

```astro
import TypeSample, { type Props as TypeSampleDef } from "../components/styleguide/TypeSample.astro";
import ColorSwatch from "../components/styleguide/ColorSwatch.astro";
```

Add two new arrays after the `successTokens` array (before the closing `---`). Both are explicitly typed for the same reason `SwatchDef[]` was required in Task 4 — without the annotation, TypeScript widens `as: "h1"` and `variant: "text"` to plain `string`, which fails the components' literal union types:

```js
const typeSamples: TypeSampleDef[] = [
	{ as: "h1", sample: "Titolo di primo livello" },
	{ as: "h2", sample: "Titolo di secondo livello" },
	{ as: "h3", sample: "Titolo di terzo livello" },
	{ as: "h4", sample: "Titolo di quarto livello" },
	{ as: "h5", sample: "Titolo di quinto livello" },
	{ as: "h6", sample: "Titolo di sesto livello" },
	{ as: "p", sample: "Paragrafo di testo corrente, usato per i contenuti principali della pagina." },
];

const fgProseSamples: SwatchDef[] = [
	{
		label: "fg",
		className: "text-fg",
		variable: "--color-fg",
		variant: "text",
		pairedClassName: "bg-surface",
		sampleText: "Questo testo usa text-fg per il contenuto principale.",
	},
	{
		label: "fg-muted",
		className: "text-fg-muted",
		variable: "--color-fg-muted",
		variant: "text",
		pairedClassName: "bg-surface",
		sampleText: "Questo testo usa text-fg-muted per contenuti secondari.",
	},
	{
		label: "fg-subtle",
		className: "text-fg-subtle",
		variable: "--color-fg-subtle",
		variant: "text",
		pairedClassName: "bg-surface",
		sampleText: "Questo testo usa text-fg-subtle per dettagli poco rilevanti.",
	},
];
```

Add a new `<section>` right after the Colori `</section>`, still inside the same wrapping `<div class="flex flex-col gap-16">`:

```astro
		<section class="flex flex-col gap-6">
			<h2>Tipografia</h2>
			<div class="flex flex-col">
				{typeSamples.map((item) => <TypeSample {...item} />)}
			</div>
			<div class="grid grid-cols-1 gap-4 rounded-lg bg-surface p-4 sm:grid-cols-3">
				{fgProseSamples.map((item) => <ColorSwatch {...item} />)}
			</div>
		</section>
```

- [ ] **Step 3: Format, build, verify**

```bash
npx prettier --write src/components/styleguide/TypeSample.astro src/pages/styleguide.astro
npx astro build
grep -o '<h1[^>]*>Titolo di primo livello</h1>' dist/styleguide/index.html
grep -o '<h6[^>]*>Titolo di sesto livello</h6>' dist/styleguide/index.html
grep -o 'text-fg-muted per contenuti secondari' dist/styleguide/index.html
```

Expected: all three greps print a match. Note the page now has two `<h1>` elements (the page title "Styleguide" and the sample "Titolo di primo livello") — acceptable here since this is a token showcase, not a real content page; both render with the same global base style.

- [ ] **Step 4: Commit**

```bash
git add src/components/styleguide/TypeSample.astro src/pages/styleguide.astro
git commit -m "feat: add typography showcase section"
```

---

## Task 6: `StateDemo` component + Stati interattivi section

**Files:**
- Create: `src/components/styleguide/StateDemo.astro`
- Modify: `src/pages/styleguide.astro` (add section, import, array only)

**Interfaces:**
- Consumes: the global `:focus-visible` rule already in `@layer base` (`src/styles/global.css`, untouched by this plan) for the focus-ring demonstration.
- Produces: `StateDemo.astro`, props:
  ```ts
  interface Props {
  	label: string;
  	className: string;
  	stateLabel: string;
  	disabled?: boolean;
  }
  ```
  Renders one bare `<button>` styled with `className`, labelled with `stateLabel` describing which state to look for.

- [ ] **Step 1: Create `StateDemo.astro`**

```astro
---
interface Props {
	label: string;
	className: string;
	stateLabel: string;
	disabled?: boolean;
}

const { label, className, stateLabel, disabled = false } = Astro.props;
---

<div class="flex flex-col gap-2">
	<button
		type="button"
		disabled={disabled}
		class:list={[
			"rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
			className,
		]}
	>
		{label}
	</button>
	<p class="font-mono text-xs text-fg-subtle">{stateLabel}</p>
</div>
```

- [ ] **Step 2: Add the Stati interattivi section to `styleguide.astro`**

Add one import after the `TypeSample` import:

```astro
import StateDemo from "../components/styleguide/StateDemo.astro";
```

Add one array after `fgProseSamples`:

```js
const stateDemos = [
	{
		label: "Primary",
		className: "bg-primary text-primary-fg hover:bg-primary-hover",
		stateLabel: ":hover — passa il mouse sopra per vedere bg-primary-hover",
	},
	{
		label: "Accent",
		className: "bg-accent text-accent-fg hover:bg-accent-hover",
		stateLabel: ":hover — passa il mouse sopra per vedere bg-accent-hover",
	},
	{
		label: "Disabilitato",
		className: "bg-primary text-primary-fg",
		stateLabel: ":disabled — opacità ridotta, cursore non consentito",
		disabled: true,
	},
];
```

Add a new `<section>` right after the Tipografia `</section>`:

```astro
		<section class="flex flex-col gap-6">
			<h2>Stati interattivi</h2>
			<p class="font-mono text-xs text-fg-subtle">
				Premi Tab per spostare il focus sui pulsanti e vedere l'anello di focus (--color-ring).
			</p>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				{stateDemos.map((item) => <StateDemo {...item} />)}
			</div>
		</section>
```

- [ ] **Step 3: Format, build, verify**

```bash
npx prettier --write src/components/styleguide/StateDemo.astro src/pages/styleguide.astro
npx astro build
grep -o 'hover:bg-primary-hover' dist/styleguide/index.html
grep -o 'disabled=""' dist/styleguide/index.html
grep -o "anello di focus" dist/styleguide/index.html
```

Expected: all three greps print a match. `disabled=""` confirms the third button actually carries the HTML `disabled` attribute, not just the class.

- [ ] **Step 4: Commit**

```bash
git add src/components/styleguide/StateDemo.astro src/pages/styleguide.astro
git commit -m "feat: add interactive states showcase section"
```

---

## Task 7: Full verification pass

**Files:** none (verification only, fixes only if a check below fails)

**Interfaces:**
- Consumes: everything produced in Tasks 1–6.
- Produces: nothing new; this task is the spec's own "Testing" section, executed.

- [ ] **Step 1: Lint and format check across all new/changed files**

```bash
npx prettier --check "src/**/*.{astro,css}"
npx eslint src
```

Expected: both exit 0. If `prettier --check` fails, run `npx prettier --write` on the flagged files and re-run.

- [ ] **Step 2: Full build**

```bash
npx astro build
```

Expected: `2 page(s) built` (or more, if other pages exist by now), no errors or warnings.

- [ ] **Step 3: Manual browser check — light/dark independence**

```bash
astro dev --background
```

Open `/styleguide` in a browser. Toggle the header's theme button between light and dark. Confirm:
- Every `ColorGroup`'s "Light" column stays light and its "Dark" column stays dark, regardless of which theme the toggle has set for the rest of the page.
- The resolved hex label under each swatch matches the corresponding value in `src/styles/global.css` for that swatch's forced theme (spot-check 3–4 swatches against the file, e.g. `canvas` light should read `#f2e8df`, `canvas` dark should read `#0b0b05`).

Stop the dev server when done: `astro dev stop`.

- [ ] **Step 4: Manual browser check — typography and states**

On the same page, confirm:
- Headings h1–h6 step down in size/weight and inherit the page's foreground colour.
- The three `text-fg` / `text-fg-muted` / `text-fg-subtle` prose lines are legible and visibly differ in weight from most to least prominent.
- Hovering the Primary and Accent buttons changes their background colour.
- Tabbing to any of the three buttons shows a visible focus ring.
- The disabled button is visibly dimmed and cannot be focused via Tab.

- [ ] **Step 5: Record outcome**

No commit for this task unless Step 1 required fixes (in which case commit those fixes separately: `git commit -m "chore: fix formatting/lint issues in styleguide files"`). If everything above passes, the styleguide page is complete — no further action.

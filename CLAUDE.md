# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also @AGENTS.md for full AEM Edge Delivery standards, coding conventions, and the publishing process.

## Commands

```bash
npm install       # install deps
npm start         # dev server at localhost:3000, proxying https://main--bmw-dealers--netcentric.aem.page/ (run in background)
npm run lint      # ESLint + Stylelint
npm run lint:fix  # auto-fix lint issues
```

No build step — vanilla JS/CSS served directly.

## Architecture

This is a BMW dealer site built on [AEM Boilerplate](https://github.com/adobe/aem-boilerplate/). Content is authored in a CMS and delivered as HTML by the `*.aem.live` backend; our code decorates that HTML.

### Page loading (three phases)

`scripts/scripts.js` orchestrates everything via `loadPage()`:
1. **Eager** — `decorateMain()` runs (icons, auto-blocks, sections, blocks, buttons), then the first section loads for LCP
2. **Lazy** — remaining sections, header, footer, `lazy-styles.css`, and fonts load
3. **Delayed** — `delayed.js` runs after 3 s (analytics, martech)

`scripts/aem.js` is the upstream AEM library — **never modify it**.

### Button authoring convention

Links are auto-promoted to buttons in `decorateButtons()` based on formatting:
- `**link**` → `.button.primary`
- `_link_` → `.button.secondary`
- `**_link_**` → `.button.accent` (high-impact CTA)

### Auto-blocking

`buildAutoBlocks()` in `scripts.js` handles two cases:
- Any `<a href="*/fragments/*">` not already inside a `.fragment` block is auto-loaded as a fragment
- An `<h1>` preceded by a `<picture>` (not already inside `.hero`) auto-creates a hero block

### Header block

The header loads its content from a `/nav` fragment path (overridable via `nav` page metadata). It builds a responsive nav with hamburger menu for mobile (`< 900px`) and dropdown support for desktop.

### Fonts

Custom BMW Group fonts (`BMWGroupTNTT-*`) are defined in `styles/fonts.css` and loaded lazily. CSS custom properties `--body-font-family` and `--heading-font-family` reference them with Arial fallbacks to minimise CLS.

### Design tokens

All spacing, colour, and typography values are CSS custom properties on `:root` in `styles/styles.css`. Responsive overrides at `900px` adjust font sizes downward for desktop (larger viewport = denser type scale).

## Testing locally without CMS content

Create static `.html` or `.plain.html` files under `drafts/` and start the dev server with:

```bash
npm start -- --html-folder drafts  # serve static drafts/ files instead of CMS content
```

Inspect backend-delivered markup with:
```bash
curl http://localhost:3000/path/to/page.plain.html
```

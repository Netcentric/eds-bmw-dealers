# BMW Dealers - AEM Edge Delivery Services Project

## Architecture Overview

This is an **Adobe Experience Manager (AEM) Edge Delivery Services** project built on the [AEM Boilerplate](https://github.com/adobe/aem-boilerplate). Content is authored in **Document Authoring (DA)** or **SharePoint/Google Docs**, and automatically converted to semantic HTML.

**Key Components:**
- **Blocks** (`blocks/`): Self-contained UI components that decorate semantic HTML
- **Scripts** (`scripts/`): Core utilities (`aem.js`) and project helpers (`scripts.js`)
- **Styles** (`styles/`): Global CSS with CSS custom properties for theming
- **Vanilla JavaScript**: No frameworks - pure ES6+ JavaScript

## Block Development Pattern

Blocks are the fundamental building units. Each block follows this structure:

```
blocks/
  my-block/
    my-block.js    # Default export: decorate(block) function
    my-block.css   # Block-scoped styles
```

### Critical Block Convention

Every block **must** export a default function named `decorate`:

```javascript
// Standard pattern
export default function decorate(block) {
  // Manipulate block element
  block.classList.add('my-custom-class');
  // Transform children, add event listeners, etc.
}

// Async pattern for data fetching
export default async function decorate(block) {
  const data = await fetch('/api/data');
  // render data into block
}
```

**Never** use named exports for the main decorator - AEM's block loader expects `default`.

### Block Loading Lifecycle

1. AEM parses document tables and creates `<div class="blockname">` with nested divs
2. `decorateBlocks()` in `scripts.js` finds all blocks
3. Block's CSS/JS are lazy-loaded when block enters viewport
4. `decorate()` function transforms the semantic HTML structure
5. Block becomes interactive

## Import Patterns

**From blocks to scripts** (most common):
```javascript
import { getMetadata, createOptimizedPicture } from '../../scripts/aem.js';
```

**Relative imports within blocks**:
```javascript
// If you have utility modules within a block folder
import { helperFunction } from './utils.js';
```

**Important:** Always include `.js` extension in imports.

## Styling Guidelines

### CSS Custom Properties (Design System)

The project uses **BMW branding** via CSS variables in `styles/styles.css`:

```css
:root {
  /* colors */
  --background-color: white;
  --light-color: #f8f8f8;
  --dark-color: #505050;
  --text-color: #131313;
  --link-color: #3b63fb;
  --link-hover-color: #1d3ecf;
  
  /* fonts */
  --body-font-family: bmwgrouptntt-regular, roboto-fallback, sans-serif;
  --heading-font-family: bmwgrouptntt-bold, roboto-condensed-fallback, sans-serif;
  
  /* sizes */
  --body-font-size-m: 22px;
  --body-font-size-s: 19px;
  --heading-font-size-xxl: 55px;
  --heading-font-size-xl: 44px;
  --nav-height: 64px;
}
```

**Always use CSS variables** - never hardcode colors/fonts. Reference: [styles/styles.css](styles/styles.css)

**When implementing designs:** Always consult `styles/styles.css` first and use existing CSS variables for colors, spacing, typography, etc. Prefer variables over hardcoded values to maintain design system consistency.

### Block CSS Scope

**All styles must be scoped to block class names:**

```css
/* ✅ Correct - scoped to block */
.cards ul { list-style: none; }
.cards .cards-card-image { width: 100%; }

/* ❌ Wrong - global selector */
ul { list-style: none; }
.card-image { width: 100%; }
```

### Responsive Design Pattern

Use **mobile-first** approach with min-width media queries:

```css
/* Mobile default (320px+) */
.cards { padding: 1rem; }

/* Tablet (600px+) */
@media (width >= 600px) {
  .cards { padding: 2rem; }
}

/* Desktop (900px+) */
@media (width >= 900px) {
  .cards { padding: 3rem; }
}

/* Large desktop (1200px+) */
@media (width >= 1200px) {
  .cards { padding: 4rem; }
}
```

### CSS Color Syntax

Use **modern CSS color function notation** to comply with stylelint rules:

```css
/* ✅ Correct - modern syntax */
background: rgb(0 0 0 / 30%);
background: rgb(59 99 251 / 50%);

/* ❌ Avoid - legacy syntax */
background: rgba(0, 0, 0, .3);
background: rgba(59, 99, 251, 0.5);
```

- Use `rgb()` instead of `rgba()`
- Use space-separated values (no commas)
- Use percentage for alpha values (e.g., `30%` not `.3`)
- Use slash `/` before alpha channel

## Available Blocks

Current blocks in the project:

- **cards** - Card grid layouts with images and text
- **columns** - Multi-column layouts
- **footer** - Site footer navigation and content
- **fragment** - Reusable content fragments
- **header** - Site header and navigation
- **hero** - Hero banner with image and headline
- **video-component** - Video embeds and players

Reference these blocks for patterns and styling conventions.

## Development Workflow

### Local Development
```bash
# Install dependencies
npm i

# Start local server (requires @adobe/aem-cli globally)
aem up  # Opens http://localhost:3000
```

The `aem up` command proxies AEM.live content locally with live reload.

### Linting
```bash
npm run lint        # Check JS (ESLint) and CSS (Stylelint)
npm run lint:fix    # Auto-fix issues
```

**ESLint config:** Airbnb base with ES6+ features  
**Code style:** Follow existing patterns - ESLint enforces import ordering, no-console warnings, etc.

## Image Optimization

Always use the `createOptimizedPicture` utility for images:

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';

// Replace img tags with optimized picture elements
block.querySelectorAll('img').forEach((img) => {
  const optimized = createOptimizedPicture(img.src, img.alt, false, [
    { width: '750' }
  ]);
  img.closest('picture')?.replaceWith(optimized);
});
```

This generates responsive images with WebP format and proper srcset.

## Fragment Auto-Blocking

AEM automatically converts links to `/fragments/*` into embedded fragments:

```javascript
// From scripts/scripts.js buildAutoBlocks()
const fragments = main.querySelectorAll('a[href*="/fragments/"]');
// Dynamic import loads fragment content
import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
  // Fragment replaces link
});
```

This enables content reuse without manual block authoring.

## Metadata Access

Use the `getMetadata` utility to access page metadata:

```javascript
import { getMetadata } from '../../scripts/aem.js';

const pageTitle = getMetadata('og:title');
const description = getMetadata('description');
```

Metadata is defined in document properties or meta tags.

## Common Pitfalls

1. **Missing default export** - Always `export default function decorate(block)`
2. **Hardcoded colors/fonts** - Use CSS variables from `:root`
3. **Missing .js extension** - Always include in imports: `'./utils.js'`
4. **Global CSS selectors** - Always scope to block class name
5. **Modifying aem.js** - Never modify core utilities, extend them instead
6. **Legacy CSS syntax** - Use modern `rgb()` with space-separated values
7. **Desktop-first media queries** - Use min-width, not max-width
8. **Missing image optimization** - Always use `createOptimizedPicture`

## File References

- **Block loading:** [scripts/scripts.js](scripts/scripts.js)
- **Core utilities:** [scripts/aem.js](scripts/aem.js)
- **Design tokens:** [styles/styles.css](styles/styles.css)
- **Cards example:** [blocks/cards/cards.js](blocks/cards/cards.js)

## Project Context

**Purpose:** BMW dealer locator and information portal  
**Client:** Netcentric  
**Environments:**
- Preview: https://main--bmw-dealers--netcentric.aem.page/
- Live: https://main--bmw-dealers--netcentric.aem.live/

**Documentation:** https://www.aem.live/docs/

## Vanilla JavaScript Best Practices

Since this project uses **no frameworks**, follow these patterns:

### DOM Manipulation
```javascript
// ✅ Modern DOM methods
const items = [...block.children];
items.forEach((item) => { /* ... */ });

// ✅ Template literals for HTML
const html = `<div class="item">${title}</div>`;
element.innerHTML = html;

// ❌ Avoid jQuery patterns
// NO: $(element).append()
```

### Event Handling
```javascript
// ✅ Event delegation
block.addEventListener('click', (event) => {
  if (event.target.matches('.button')) {
    // handle click
  }
});

// ❌ No inline handlers
// NO: <button onclick="handleClick()">
```

### Async Operations
```javascript
// ✅ Modern async/await
export default async function decorate(block) {
  const response = await fetch('/api/data');
  const data = await response.json();
  renderData(block, data);
}

// ✅ Error handling
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch:', error);
}
```

### ES6+ Features
```javascript
// ✅ Destructuring
const { title, description } = metadata;

// ✅ Arrow functions
const items = data.map((item) => item.name);

// ✅ Template literals
const url = `${baseUrl}/api/${endpoint}`;

// ✅ Spread operator
const newArray = [...oldArray, newItem];
```

## Code Quality Standards

- **No console.log in production** - Use console.error for critical issues only
- **Meaningful variable names** - Avoid single letters except loop counters
- **Comment complex logic** - Explain "why" not "what"
- **Keep functions small** - Single responsibility principle
- **Use semantic HTML** - Proper heading hierarchy, landmarks, ARIA labels
- **Test accessibility** - Keyboard navigation, screen reader compatibility

import { inlineSVG } from '../../scripts/scripts.js';

/**
 * Builds an accessible star rating widget for a given score.
 * @param {number} score Numeric score (e.g. 4.5)
 * @returns {Promise<HTMLSpanElement>} Span element containing the inline SVG stars
 */
async function buildStars(score) {
  const maxStars = 5;
  const fullStars = Math.round(score);
  const wrapper = document.createElement('span');
  wrapper.setAttribute('aria-label', `${score} out of ${maxStars} stars`);
  const inlinePromises = [];
  for (let i = 1; i <= maxStars; i += 1) {
    const star = document.createElement('span');
    star.className = `icon icon-starIconActive${i <= fullStars ? ' star-active' : ' star-inactive'}`;
    star.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(star);
    inlinePromises.push(inlineSVG(star));
  }
  await Promise.all(inlinePromises);
  return wrapper;
}

/**
 * Builds star ratings from list items in the reviews cell.
 * @param {HTMLElement} block The block element
 */
async function buildReviews(block) {
  const starItems = [...block.querySelectorAll(':scope > div:last-child > div:last-child li')];
  await Promise.all(starItems.map(async (li) => {
    const text = li.textContent.trim();
    const lastSpace = text.lastIndexOf(' ');
    const label = text.substring(0, lastSpace);
    const score = parseFloat(text.substring(lastSpace + 1));

    li.textContent = '';

    const labelEl = document.createElement('span');
    labelEl.textContent = label.toUpperCase();

    const scoreEl = document.createElement('span');
    scoreEl.textContent = Number.isNaN(score) ? '' : score.toFixed(1);

    li.append(labelEl, await buildStars(score), scoreEl);
  }));
}

/**
 * Extracts the background image URL from the first row, applies it as a
 * CSS custom property on the block, then removes the image row from the DOM.
 * @param {HTMLElement} block The block element
 */
function extractImage(block) {
  const imageRow = block.querySelector(':scope > div:first-child');
  if (!imageRow) return;
  const img = imageRow.querySelector('img');
  const link = imageRow.querySelector('a');
  const imageUrl = img?.src || link?.href;
  if (imageUrl) block.style.setProperty('--hero-bg-image', `url(${imageUrl})`);
  imageRow.remove();
}

/**
 * loads and decorates the bmw-hero block
 * @param {HTMLElement} block The block element
 */
export default async function decorate(block) {
  extractImage(block);

  // Normalise headings: first heading → h1, second heading → h2
  const contentCell = block.querySelector(':scope > div:last-child > div:first-child');
  if (contentCell) {
    const headings = [...contentCell.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const targetTags = ['h1', 'h2'];
    headings.slice(0, 2).forEach((heading, i) => {
      const tag = targetTags[i];
      if (heading.tagName.toLowerCase() !== tag) {
        const replacement = document.createElement(tag);
        replacement.innerHTML = heading.innerHTML;
        [...heading.attributes].forEach((attr) => replacement.setAttribute(attr.name, attr.value));
        heading.replaceWith(replacement);
      }
    });
  }

  // Consolidate CTA links into one paragraph for side-by-side layout
  if (contentCell) {
    const ctaParas = [...contentCell.querySelectorAll('p:has(> a)')];
    if (ctaParas.length > 1) {
      const [first, ...rest] = ctaParas;
      rest.forEach((p) => {
        first.appendChild(p.querySelector('a'));
        p.remove();
      });
    }
  }

  if (block.classList.contains('reviews')) {
    await buildReviews(block);
  }
}

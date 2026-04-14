import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // add title class to all titles in the footer
  footer.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((title) => {
    if (!title) return;
    title.classList.add('title');
  });

  const linkSection = footer.querySelector(':scope .block > div');
  linkSection.classList.add('link-section');

  // add a class to each section of links in the footer based on the title text
  const linkWrappers = linkSection.querySelectorAll(':scope > div');
  linkWrappers.forEach((linkWrapper) => {
    const title = linkWrapper.querySelector(':scope > .title');
    if (title) {
      // transform the title text into a className
      const className = title.textContent.toLowerCase().replace(/\s+/g, '-');
      linkWrapper.classList.add(className);
    }
  });

  // add a line over the last section of the footer
  const lastSection = footer.querySelector(':scope > div:last-child');
  if (lastSection) {
    lastSection.classList.add('last-section');
  }

  // add an element separator between the last section of links and the legal text
  const footerTerms = document.createElement('div');
  footerTerms.className = 'footer-terms';
  footer.insertBefore(footerTerms, lastSection);

  block.append(footer);
}

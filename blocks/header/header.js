import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { decorateIcons } from '../../scripts/scripts.js';

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['menu', 'brand'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) {
      section.innerHTML = section.firstElementChild.innerHTML;
      section.classList.add(`nav-${c}`);
      const menu = section.querySelector('ul');
      if (menu) {
        menu.classList.add(`nav-${c}-list`);
      }
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);

  const menuSection = nav.querySelector('.nav-menu-list');
  if (menuSection) {
    const menuItems = menuSection.querySelector('ul');
    if (menuItems) {
      menuItems.classList.add('nav-menu-list-links');
      const clonedMenuItems = menuItems.cloneNode(true);
      const divWrapper = document.createElement('div');
      divWrapper.className = 'nav-menu-list-links-wrapper';
      divWrapper.append(clonedMenuItems);
      clonedMenuItems.classList.add('nav-menu-list-links-mobile');
      navWrapper.append(divWrapper);
    }
  }

  const telephoneLink = navWrapper.querySelector('.icon-telephone');
  if (telephoneLink) {
    telephoneLink?.parentElement?.classList.add('icon-telephone-wrapper');
  }

  const brandSection = navWrapper.querySelector('.nav-brand-list ul');

  if (brandSection) {
    const links = brandSection.querySelectorAll('li a');

    if (links.length >= 2) {
      const firstHref = links[0].getAttribute('href') || '/';

      const span = document.createElement('span');

      span.innerHTML = [...links]
        .map((link) => link.textContent.trim())
        .join('<br>');

      const a = document.createElement('a');
      a.href = firstHref;
      a.appendChild(span);

      const li = document.createElement('li');
      li.appendChild(a);

      brandSection.replaceChildren(li);
    }
  }

  block.append(navWrapper);
  decorateIcons(navWrapper);
}

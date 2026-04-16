import { createElement } from '../../scripts/common.js';

const blockName = 'opening-hours';
const blockClasses = {
  container: `${blockName}__container`,
  tab: `${blockName}__tab`,
  tabActive: `${blockName}__tab--active`,
  panel: `${blockName}__panel`,
  column: `${blockName}__column`,
  address: `${blockName}__address`,
  times: `${blockName}__times`,
  phone: `${blockName}__phone`,
  title: `${blockName}__title`,
  mainTitle: `${blockName}__main-title`,
  day: `${blockName}__day`,
  hours: `${blockName}__hours`,
};

const DAY_KEYS = ['Mon–Fri', 'Sat', 'Sun'];

/**
 * Returns the last path segment of the current URL, without a trailing slash.
 * @returns {string}
 */
function getPageName() {
  const path = window.location.pathname;
  const endsWithSlash = path.endsWith('/');
  if (endsWithSlash) {
    return path.slice(0, -1).split('/').pop();
  }
  return path.split('/').pop();
}

/**
 * Creates initial panel HTML structure with static headers and day labels.
 * @returns {string} HTML for the panel structure.
 */
function createPanelStructure() {
  const daysLi = DAY_KEYS
    .map((key) => `
      <li>
        <span class="${blockClasses.day}" data-day="${key}">${key}:</span>
        <span class="${blockClasses.hours}" data-hours="${key}"></span>
      </li>`)
    .join('');

  return `
    <div class="${blockClasses.column} ${blockClasses.address}">
      <h3 class="${blockClasses.title}">Address</h3>
      <p data-address></p>
    </div>
    <div class="${blockClasses.column} ${blockClasses.times}">
      <h3 class="${blockClasses.title}">Opening Hours</h3>
      <ul>${daysLi}</ul>
    </div>
    <div class="${blockClasses.column} ${blockClasses.phone}">
      <h3 class="${blockClasses.title}">Phone</h3>
      <p data-phone></p>
    </div>
  `;
}

/**
 * Updates panel content with data from a row.
 * @param {Element} panel - The panel element to update.
 * @param {Object} row - A data row containing address, phone, and opening hours.
 * @returns {void}
 */
function updatePanelContent(panel, row) {
  // Update address
  const addressEl = panel.querySelector('[data-address]');
  if (addressEl) {
    addressEl.textContent = row.Address || '';
  }

  // Update phone
  const phoneEl = panel.querySelector('[data-phone]');
  if (phoneEl) {
    phoneEl.textContent = row.Phone || '';
  }

  // Update opening hours
  DAY_KEYS.forEach((key) => {
    const hoursEl = panel.querySelector(`[data-hours="${key}"]`);
    if (hoursEl) {
      hoursEl.textContent = row[key] || '';
    }
  });
}

/**
 * Renders opening hours into the block with all tabs in markup and first tab active.
 * @param {Element} block - The block element to render into.
 * @param {Object} data - The sheet data object containing a `data` array of dealer rows.
 * @param {Element} title - The title element to prepend.
 * @returns {void}
 */
function renderOpeningHours(block, data, title) {
  const rows = Array.isArray(data?.data) ? data.data : [];
  const tabsData = rows.length ? rows : [{ 'Tab name': 'Sales' }];
  const firstRow = tabsData[0];
  const tabsHtml = tabsData
    .map((row, index) => {
      const tabName = String(row['Tab name'] || `Tab ${index + 1}`).trim();
      const isActive = index === 0;
      return `<button class="${blockClasses.tab}${isActive ? ` ${blockClasses.tabActive}` : ''}" type="button" role="tab" aria-selected="${isActive}" data-index="${index}">${tabName}</button>`;
    })
    .join('');

  const container = createElement('div', {
    className: blockClasses.container,
    innerContent: `
      <div role="tablist">
        ${tabsHtml}
      </div>
      <div class="${blockClasses.panel}" role="tabpanel">
        ${createPanelStructure()}
      </div>
    `,
  });

  container.prepend(title);
  block.append(container);

  // Initialize panel with first row data
  const panel = container.querySelector('[role="tabpanel"]');
  updatePanelContent(panel, firstRow);

  // Add tab click listeners
  const tabs = container.querySelectorAll('[role="tab"]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const index = parseInt(tab.getAttribute('data-index'), 10);
      const selectedRow = tabsData[index];

      // Update active tab styling
      tabs.forEach((t) => {
        t.classList.remove(blockClasses.tabActive);
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add(blockClasses.tabActive);
      tab.setAttribute('aria-selected', 'true');

      // Update panel content
      updatePanelContent(panel, selectedRow);
    });
  });
}

export default async function decorate(block) {
  const title = block.querySelector('h2');
  const openingHoursLink = block.querySelector('a');
  if (!openingHoursLink) {
    console.warn('No opening hours data found in block', { block });
    return;
  }
  block.textContent = '';
  title.classList.add(blockClasses.mainTitle);
  // block.append(title);

  const openingHoursData = openingHoursLink.href;
  try {
    const response = await fetch(openingHoursData);
    if (!response.ok) {
      throw new Error(`Failed to fetch opening hours data: ${response.status} ${response.statusText}`);
    }
    const rawData = await response.json();
    if (!rawData) {
      throw new Error('No opening hours data found in response');
    }
    // 1st check if in data there is a property with the same name as the current domain
    const domain = window.location.hostname;
    const domainData = rawData[domain];
    if (domainData) {
      // render opening hours data for current domain
      renderOpeningHours(block, domainData, title);
      return;
    }

    const pageName = getPageName();
    const pageData = rawData[pageName];
    if (pageData) {
      // render opening hours data for current page
      renderOpeningHours(block, pageData, title);
      return;
    }

    if (!domainData && !pageData) {
      throw new Error(`No opening hours data found for current domain or page: ${domain}, ${pageName}`);
    }
  } catch (error) {
    console.error('Error fetching opening hours data', { error });
  }
}

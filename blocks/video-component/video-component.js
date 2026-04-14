import { createVideoBackground } from '../../scripts/common.js';

export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: video URL (authored as a link)
  const videoUrl = rows[0]?.querySelector('a')?.href || '';

  // Row 1: all content paragraphs in a single cell
  const contentCell = rows[1]?.querySelector('div');
  const paragraphs = [...(contentCell?.querySelectorAll('p') || [])];

  // Categorise paragraphs: spec lines contain '|', link lines contain <a>, rest are content
  const contentParagraphs = [];
  const specs = [];
  let ctaLink = null;

  paragraphs.forEach((p) => {
    const anchor = p.querySelector('a');
    const text = p.textContent.trim();

    if (anchor) {
      ctaLink = { href: anchor.getAttribute('href'), text: anchor.textContent.trim() };
    } else if (text.includes('|')) {
      const parts = text.split('|').map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) specs.push({ title: parts[0], value: parts[1] });
    } else if (text) {
      contentParagraphs.push(p);
    }
  });

  const carName = contentParagraphs[0]?.textContent.trim();
  const fuelType = contentParagraphs[1]?.textContent.trim();
  // Preserve inline markup (e.g. <sup>) authored in DA
  const descriptionHtml = contentParagraphs[2]?.innerHTML;

  // --- Video wrapper ---
  const videoWrapper = document.createElement('div');
  videoWrapper.className = 'video-wrapper';

  const videoEmbed = createVideoBackground(videoUrl);
  if (videoEmbed) videoWrapper.appendChild(videoEmbed);

  // --- Content holder with nested structure ---
  const contentHolder = document.createElement('div');
  contentHolder.className = 'content-holder contain';

  const socTab = document.createElement('div');
  socTab.className = 'soc-tab';
  socTab.setAttribute('role', 'tabpanel');

  const videoTabSection = document.createElement('div');
  videoTabSection.className = 'contain video-tab-section';

  const modelTab = document.createElement('div');
  modelTab.className = 'model-tab';

  // Car key info holder: heading + fuel type + description
  const carKeyInfoHolder = document.createElement('div');
  carKeyInfoHolder.className = 'car-key-info-holder';

  if (carName) {
    const h2 = document.createElement('h2');
    h2.className = 'car-name';
    // Wrap lowercase 'i' in BMW model names (iX3, i4…) for italic styling
    h2.innerHTML = carName.replace(/\bi([A-Z0-9])/g, '<span>i</span>$1');
    carKeyInfoHolder.appendChild(h2);
  }

  if (fuelType) {
    const ul = document.createElement('ul');
    ul.className = 'fuel-type';
    const li = document.createElement('li');
    li.textContent = fuelType;
    ul.appendChild(li);
    carKeyInfoHolder.appendChild(ul);
  }

  if (descriptionHtml) {
    const modelStrap = document.createElement('span');
    modelStrap.className = 'model-strap';
    modelStrap.innerHTML = descriptionHtml;
    carKeyInfoHolder.appendChild(modelStrap);
  }

  modelTab.appendChild(carKeyInfoHolder);

  // Specs list
  if (specs.length) {
    const modelExtra = document.createElement('ul');
    modelExtra.className = 'model-extra contain';

    const SPEC_TYPES = [
      { liClass: 'model-acceleration', iconClass: 'acceleration-icon' },
      { liClass: 'model-seats', iconClass: 'seats-icon' },
    ];

    specs.forEach(({ title, value }, index) => {
      const { liClass, iconClass } = SPEC_TYPES[index] ?? SPEC_TYPES[SPEC_TYPES.length - 1];
      const li = document.createElement('li');
      li.className = liClass;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'info-title';
      titleSpan.textContent = title;

      const infoSpan = document.createElement('span');
      infoSpan.className = `info-info ${iconClass}`;

      // Split "4.9 Secs" into number + unit
      const valueParts = value.split(' ');
      if (valueParts.length > 1) {
        infoSpan.innerHTML = `${valueParts[0]} <span>${valueParts.slice(1).join(' ')}</span>`;
      } else {
        infoSpan.textContent = value;
      }

      li.append(titleSpan, infoSpan);
      modelExtra.appendChild(li);
    });

    modelTab.appendChild(modelExtra);
  }

  // CTA link
  if (ctaLink) {
    const modelLinks = document.createElement('div');
    modelLinks.className = 'model-links';

    const a = document.createElement('a');
    a.className = 'arrow-link more-details';
    a.setAttribute('href', ctaLink.href);
    a.textContent = ctaLink.text;

    modelLinks.appendChild(a);
    modelTab.appendChild(modelLinks);
  }

  // Nest the elements: contentHolder > socTab > videoTabSection > modelTab
  videoTabSection.appendChild(modelTab);
  socTab.appendChild(videoTabSection);
  contentHolder.appendChild(socTab);

  block.replaceChildren(videoWrapper, contentHolder);
}

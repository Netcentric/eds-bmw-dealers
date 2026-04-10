export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: video URL (authored as a link)
  const videoUrl = rows[0]?.querySelector('a')?.href || '';

  // Row 1: all content paragraphs in a single cell
  const contentCell = rows[1]?.querySelector('div');
  const paragraphs = [...(contentCell?.querySelectorAll('p') || [])];

  // Categorise paragraphs: spec lines contain '|', link lines contain an <a>, rest are content
  const contentLines = [];
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
      contentLines.push(text);
    }
  });

  const [carName, fuelType, description] = contentLines;

  // --- Build DOM ---

  // Video wrapper
  const videoWrapper = document.createElement('div');
  videoWrapper.className = 'video-wrapper';

  const video = document.createElement('video');
  video.className = 'videoBgPlayer';
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'auto');
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');

  if (videoUrl) {
    const source = document.createElement('source');
    source.setAttribute('src', videoUrl);
    source.setAttribute('type', 'video/mp4');
    video.append(source, document.createTextNode('Your browser does not support the video tag.'));
  }

  videoWrapper.appendChild(video);

  // Content holder
  const contentHolder = document.createElement('div');
  contentHolder.className = 'contentHolder contain';

  const modelTab = document.createElement('div');
  modelTab.className = 'modelTab';

  // Car key info
  const carKeyInfoHolder = document.createElement('div');
  carKeyInfoHolder.className = 'carKeyInfoHolder';

  if (carName) {
    const h2 = document.createElement('h2');
    h2.className = 'carName';
    // Wrap the lowercase 'i' in BMW model names (e.g. iX3, i4) with a span
    h2.innerHTML = carName.replace(/\bi([A-Z0-9])/g, '<span>i</span>$1');
    carKeyInfoHolder.appendChild(h2);
  }

  if (fuelType) {
    const ul = document.createElement('ul');
    ul.className = 'fuelType';
    const li = document.createElement('li');
    li.textContent = fuelType;
    ul.appendChild(li);
    carKeyInfoHolder.appendChild(ul);
  }

  if (description) {
    const modelStrap = document.createElement('span');
    modelStrap.className = 'modelStrap';
    modelStrap.textContent = description;
    carKeyInfoHolder.appendChild(modelStrap);
  }

  modelTab.appendChild(carKeyInfoHolder);

  // Specs list
  if (specs.length) {
    const modelExtra = document.createElement('ul');
    modelExtra.className = 'modelExtra contain';

    specs.forEach(({ title, value }, index) => {
      const li = document.createElement('li');
      li.className = index === 0 ? 'modelAcceleration' : 'modelSeats';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'infoTitle';
      titleSpan.textContent = title;

      const infoSpan = document.createElement('span');
      const iconClass = index === 0 ? 'accelerationIcon' : 'seatsIcon';
      infoSpan.className = `infoInfo ${iconClass}`;

      // Split "4.9 Secs" into value + unit for acceleration
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
    modelLinks.className = 'modelLinks';

    const a = document.createElement('a');
    a.className = 'arrowLink moreDetails';
    a.setAttribute('href', ctaLink.href);
    a.textContent = ctaLink.text;

    modelLinks.appendChild(a);
    modelTab.appendChild(modelLinks);
  }

  contentHolder.appendChild(modelTab);

  // Replace block content
  block.classList.add('altBg');
  block.replaceChildren(videoWrapper, contentHolder);
}


/**
 * Creates a DOM element with specified options.
 * @param {string} tag The HTML tag name for the element. [Mandatory]
 * @param {Object} [options={}] The options for creating the element.
 * @param {string|string[]} [options.className=''] The class name(s) to add to the element.
 * Can be a single class, space-separated, comma-separated, or an array.
 * @param {Object} [options.properties={}] The properties to set on the element.
 * @param {string} [options.innerContent=''] Can be plain text or an HTML fragment.
 * @return {Element} The created DOM element.
 * @example
 * // Single class
 * const element = createElement('div', { className: 'container' });
 * // Result: <div class="container"></div>
 * @example
 * // Space-separated classes
 * const element = createElement('div', { className: 'container large' });
 * // Result: <div class="container large"></div>
 * @example
 * // Comma-separated classes
 * const element = createElement('div', { className: 'container,large,primary' });
 * // Result: <div class="container large primary"></div>
 * @example
 * // Array of classes
 * const element = createElement('div', { className: ['container', 'large', 'primary'] });
 * // Result: <div class="container large primary"></div>
 * @example
 * // With properties and text content
 * const element = createElement('div', {
 *   className: 'container large',
 *   attributes: { id: 'main' },
 *   innerContent: 'Hello World'
 * });
 * // Result: <div class="container large" id="main">Hello World</div>
 * @example
 * // With HTML fragment
 * const element = createElement('div', {
 *   className: 'container',
 *   innerContent: '<p>Nested content</p>'
 * });
 * // Result: <div class="container"><p>Nested content</p></div>
*/
export function createElement(tag, options = {}) {
  const {
    className = '', attributes = {}, innerContent = '',
  } = options;
  const element = document.createElement(tag);
  const isString = typeof className === 'string' || className instanceof String;
  if (className || (isString && className !== '') || (!isString && className.length > 0)) {
    const classes = isString ? className.split(/[\s,]+/).filter(Boolean) : className;
    element.classList.add(...classes);
  }
  if (!isString && className.length === 0) {
    element.removeAttribute('class');
  }

  if (attributes) {
    Object.keys(attributes).forEach((propName) => {
      const value = propName === attributes[propName] ? '' : attributes[propName];
      element.setAttribute(propName, value);
    });
  }

  if (innerContent) {
    const fragmentNode = document.createRange().createContextualFragment(innerContent);
    element.appendChild(fragmentNode);
  }

  return element;
}

/**
 * Detects the video platform for a given URL.
 * @param {string} url
 * @returns {'youtube'|'vimeo'|null}
 */
export function getVideoPlatform(url) {
  if (!url) return null;
  if (/youtu\.be|youtube\.com/.test(url)) return 'youtube';
  if (/vimeo\.com/.test(url)) return 'vimeo';
  return null;
}

/**
 * Extracts the YouTube video ID from a URL.
 * Supports youtu.be short links, youtube.com/watch?v=, and youtube.com/embed/ formats.
 * @param {string} url - YouTube URL
 * @returns {string|null} 11-character video ID, or null if the URL is not recognised
 */
export function getYouTubeVideoId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:.*[?&]v=|.*\/))([A-Za-z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

/**
 * Extracts the Vimeo video ID from a URL.
 * Supports vimeo.com/:id and player.vimeo.com/video/:id formats.
 * @param {string} url - Vimeo URL
 * @returns {string|null} Numeric video ID, or null if the URL is not recognised
 */
export function getVimeoVideoId(url) {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

function createVideoIframe(properties = {}) {
  const {
    src = '',
    title = 'Background Video',
    allow = 'autoplay; encrypted-media',
    frameborder = '0',
    allowfullscreen = '',
    ariaHidden = 'true',
    tabIndex = '-1',
  } = properties;
  const iframe = createElement('iframe', {
    attributes: {
      src,
      title,
      frameborder,
      allow,
      allowfullscreen,
      'aria-hidden': ariaHidden,
      tabindex: tabIndex,
    },
  });
  return iframe;
}

/**
 * Creates a YouTube iframe configured for muted, looping background autoplay.
 * Hidden from assistive technology and pointer events.
 * @param {string} videoId - YouTube video ID
 * @returns {HTMLIFrameElement}
 */
export function createYouTubeBackground(videoId) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    controls: '0',
    showinfo: '0',
    rel: '0',
    playlist: videoId,
    playsinline: '1',
    disablekb: '1',
    iv_load_policy: '3',
  });

  return createVideoIframe({
    src: `https://www.youtube-nocookie.com/embed/${videoId}?${params}`,
  });
}

/**
 * Creates a Vimeo iframe configured for muted, looping background autoplay.
 * Hidden from assistive technology and pointer events.
 * @param {string} videoId - Vimeo video ID
 * @returns {HTMLIFrameElement}
 */
export function createVimeoBackground(videoId) {
  const params = new URLSearchParams({
    autoplay: '1',
    muted: '1',
    loop: '1',
    controls: '0',
    background: '1',
    playsinline: '1',
  });

  return createVideoIframe({
    src: `https://player.vimeo.com/video/${videoId}?${params}`,
  });
}

/**
 * Creates a background video iframe for either YouTube or Vimeo, detected automatically.
 * Returns null if the URL is not a recognised video platform.
 * @param {string} url - YouTube or Vimeo URL
 * @returns {HTMLIFrameElement|null}
 */
export function createVideoBackground(url) {
  const platform = getVideoPlatform(url);
  if (platform === 'youtube') {
    const id = getYouTubeVideoId(url);
    return id ? createYouTubeBackground(id) : null;
  }
  if (platform === 'vimeo') {
    const id = getVimeoVideoId(url);
    return id ? createVimeoBackground(id) : null;
  }
  return null;
}

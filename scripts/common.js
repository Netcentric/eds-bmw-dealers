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

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
  iframe.title = 'Background video';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'autoplay; encrypted-media');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  return iframe;
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

  const iframe = document.createElement('iframe');
  iframe.src = `https://player.vimeo.com/video/${videoId}?${params}`;
  iframe.title = 'Background video';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'autoplay; encrypted-media');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  return iframe;
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

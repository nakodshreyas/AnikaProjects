/**
 * Utility functions for YouTube URL parsing, video ID validation,
 * thumbnail resolution, and embed player generation (optimized for Reel / Shorts vertical format).
 */

export const VIDEO_CATEGORIES = [
  'Project Walkthrough',
  'Construction Updates',
  'Property Tour',
  'Company Updates',
  'Architectural Design',
  'Customer Handover',
  'Structural Engineering',
] as const;

export type VideoCategory = typeof VIDEO_CATEGORIES[number] | string;

/**
 * YouTube video ID regular expression (standard 11 characters: alphanumeric, dash, underscore)
 */
const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Allowed domains for YouTube videos
 */
const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
]);

export interface YouTubeParseResult {
  isValid: boolean;
  videoId?: string;
  error?: string;
  canonicalUrl?: string;
  shortsUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Parse and validate a YouTube URL or Video ID.
 * Supports YouTube Shorts (Reels), watch URLs, youtu.be, embeds, and raw 11-char IDs.
 * Strictly rejects non-YouTube domains, script injection, iframe tags, and malformed strings.
 */
export function parseAndValidateYouTubeUrl(input: string | undefined | null): YouTubeParseResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a YouTube video / Reel URL or 11-character video ID.',
    };
  }

  const trimmed = input.trim();

  // Guard against arbitrary HTML tags, iframe strings, or malicious scripts
  if (/<[^>]*>|javascript:|data:/i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Arbitrary HTML, embed tags, or script links are strictly prohibited.',
    };
  }

  // Check if input is directly an 11-character Video ID
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return {
      isValid: true,
      videoId: trimmed,
      canonicalUrl: `https://www.youtube.com/shorts/${trimmed}`,
      shortsUrl: `https://www.youtube.com/shorts/${trimmed}`,
      thumbnailUrl: getYouTubeThumbnailUrl(trimmed),
    };
  }

  // Attempt URL parsing
  let parsedUrl: URL;
  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    parsedUrl = new URL(urlString);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format. Please provide a valid YouTube Shorts/Reel link or 11-character ID.',
    };
  }

  // Strictly enforce allowed YouTube domains
  const hostname = parsedUrl.hostname.toLowerCase();
  const isAllowedHost = Array.from(ALLOWED_HOSTS).some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );

  if (!isAllowedHost) {
    return {
      isValid: false,
      error: 'Unsupported domain. Only official YouTube links (youtube.com, youtu.be) are accepted.',
    };
  }

  let extractedId: string | null = null;

  // 1. YouTube Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
  if (parsedUrl.pathname.startsWith('/shorts/')) {
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    if (segments[1] && YOUTUBE_ID_REGEX.test(segments[1])) {
      extractedId = segments[1];
    }
  }

  // 2. Shortened URL: https://youtu.be/VIDEO_ID
  if (!extractedId && (hostname === 'youtu.be' || hostname === 'www.youtu.be')) {
    const pathPart = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0];
    if (pathPart && YOUTUBE_ID_REGEX.test(pathPart)) {
      extractedId = pathPart;
    }
  }

  // 3. Standard Watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  if (!extractedId && parsedUrl.pathname === '/watch') {
    const vParam = parsedUrl.searchParams.get('v');
    if (vParam && YOUTUBE_ID_REGEX.test(vParam)) {
      extractedId = vParam;
    }
  }

  // 4. YouTube Embed URL: https://www.youtube.com/embed/VIDEO_ID
  if (!extractedId && parsedUrl.pathname.startsWith('/embed/')) {
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    if (segments[1] && YOUTUBE_ID_REGEX.test(segments[1])) {
      extractedId = segments[1];
    }
  }

  // 5. YouTube Live URL: https://www.youtube.com/live/VIDEO_ID
  if (!extractedId && parsedUrl.pathname.startsWith('/live/')) {
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    if (segments[1] && YOUTUBE_ID_REGEX.test(segments[1])) {
      extractedId = segments[1];
    }
  }

  // 6. Generic pathname fallback if exactly 11 characters
  if (!extractedId) {
    const candidate = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0];
    if (candidate && YOUTUBE_ID_REGEX.test(candidate)) {
      extractedId = candidate;
    }
  }

  if (!extractedId || !YOUTUBE_ID_REGEX.test(extractedId)) {
    return {
      isValid: false,
      error: 'Could not extract a valid 11-character YouTube video ID from the provided link.',
    };
  }

  return {
    isValid: true,
    videoId: extractedId,
    canonicalUrl: `https://www.youtube.com/shorts/${extractedId}`,
    shortsUrl: `https://www.youtube.com/shorts/${extractedId}`,
    thumbnailUrl: getYouTubeThumbnailUrl(extractedId),
  };
}

/**
 * Return standard YouTube thumbnail URL
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'maxres' | 'hq' | 'mq' | 'default' = 'hq'): string {
  if (!videoId) return '';
  switch (quality) {
    case 'maxres':
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    case 'mq':
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    case 'default':
      return `https://img.youtube.com/vi/${videoId}/default.jpg`;
    case 'hq':
    default:
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
}

/**
 * Return direct YouTube Shorts / Reel URL
 */
export function getYouTubeShortsUrl(videoId: string): string {
  if (!videoId) return '';
  return `https://www.youtube.com/shorts/${videoId}`;
}

/**
 * Return privacy-enhanced YouTube embed player URL (optimized for seamless Reel loop playback)
 */
export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = true): string {
  if (!videoId) return '';
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    loop: '1',
    playlist: videoId,
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    controls: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

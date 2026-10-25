/**
 * Input validation and security sanitation utilities
 */

const ALLOWED_HOSTS = new Set([
  'apis.louiv.me',
  'assets.shngm.id',
  'app.shinigami.asia',
  'images.unsplash.com',
  'komiku-rest-api-one.vercel.app',
  'komiku.org',
  'thumbnail.komiku.org',
  'thumbnail.komiku.to',
  'img.komiku.org',
]);

/**
 * Validates and sanitizes a manga or chapter slug
 * Prevents SSRF, directory traversal, and injection
 */
export function validateSlug(slug: unknown): string | null {
  if (typeof slug !== 'string') return null;
  const trimmed = slug.trim();
  if (!trimmed || trimmed.length > 150) return null;
  
  // Only alphanumeric, hyphens, underscores, and dots allowed
  // Must not start or end with slash, cannot contain .. or protocol
  const slugRegex = /^[a-zA-Z0-9_\-.]+$/;
  if (!slugRegex.test(trimmed)) return null;
  if (trimmed.includes('..')) return null;

  return trimmed;
}

/**
 * Validates page number parameter
 */
export function validatePage(page: unknown): number {
  if (typeof page === 'number' && Number.isInteger(page) && page > 0) {
    return Math.min(page, 1000);
  }
  if (typeof page === 'string') {
    const parsed = parseInt(page, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return Math.min(parsed, 1000);
    }
  }
  return 1;
}

/**
 * Sanitizes search query string
 */
export function validateQuery(q: unknown): string {
  if (typeof q !== 'string') return '';
  return q.trim().slice(0, 100);
}

/**
 * Verifies that a target URL belongs to an allowed host
 */
export function isAllowedHost(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    for (const allowed of ALLOWED_HOSTS) {
      if (hostname === allowed || hostname.endsWith('.' + allowed)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Sanitizes URL and ensures it is from an allowed domain
 */
export function sanitizeUrl(urlStr: unknown): string | null {
  if (typeof urlStr !== 'string') return null;
  const trimmed = urlStr.trim();
  if (!trimmed) return null;
  
  // If it's a relative path starting with /
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) return null; // protocol-relative rejected
    return trimmed;
  }

  if (isAllowedHost(trimmed)) {
    return trimmed;
  }
  return null;
}

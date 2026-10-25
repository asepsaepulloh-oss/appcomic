/**
 * Multi-Source Manager for iComic
 * Coordinates between Louiv API and Komiku API
 */

import type { ComicSource } from '@/types/manga.ts';

const SOURCE_STORAGE_KEY = 'icomic_active_source';
export const DEFAULT_SOURCE: ComicSource = 'louiv';

export const SOURCE_METADATA: Record<
  ComicSource,
  { id: ComicSource; name: string; tag: string; description: string; badgeColor: string }
> = {
  louiv: {
    id: 'louiv',
    name: 'Louiv API',
    tag: 'Official',
    description: 'Server utama manhwa & webtoon berkualitas tinggi',
    badgeColor: 'bg-[#8B5CF6]/20 text-[#A78BFA] border-[#8B5CF6]/40',
  },
  komiku: {
    id: 'komiku',
    name: 'Komiku',
    tag: 'Indonesia',
    description: 'Koleksi komik terjemahan Indonesia lengkap (Manga, Manhwa, Manhua)',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
};

/**
 * Resolves current active source.
 * Priority:
 * 1. URL search parameter (?source=komiku or ?source=louiv)
 * 2. localStorage saved preference
 * 3. Default ('louiv')
 */
export function getCurrentSource(): ComicSource {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const querySource = params.get('source')?.toLowerCase();
      if (querySource === 'komiku' || querySource === 'louiv') {
        return querySource;
      }

      const stored = localStorage.getItem(SOURCE_STORAGE_KEY);
      if (stored === 'komiku' || stored === 'louiv') {
        return stored;
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_SOURCE;
}

/**
 * Saves active source preference and notifies subscribers
 */
export function setActiveSource(source: ComicSource): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SOURCE_STORAGE_KEY, source);
      window.dispatchEvent(new CustomEvent('icomic_source_changed', { detail: { source } }));
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Builds navigation path preserving the source parameter
 */
export function withSourceParam(path: string, source?: ComicSource): string {
  const targetSource = source || getCurrentSource();
  if (targetSource === DEFAULT_SOURCE && !path.includes('source=')) {
    return path; // Keep clean URLs for default source if desired, or attach explicitly
  }

  try {
    const [pathname, search] = path.split('?');
    const params = new URLSearchParams(search || '');
    params.set('source', targetSource);
    return `${pathname}?${params.toString()}`;
  } catch {
    return path;
  }
}

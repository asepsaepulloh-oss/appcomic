/**
 * Centralized API Service for iComic Manhwa Reader
 * Connects directly to apis.louiv.me API
 */

import type {
  MangaItem,
  MangaListResponse,
  MangaDetailRaw,
  MangaChapterRaw,
  ChapterPageRaw,
  MangaCard,
  MangaDetail,
  ChapterData,
  HomeData,
  ComicSource,
} from '@/types/manga.ts';
import {
  fetchKomikuHomeData,
  getKomikuDetail,
  getKomikuChapter,
  searchKomikuManga,
  getKomikuImageProxyUrl,
} from './komiku.ts';

export const API_BASE_URL = 'https://apis.louiv.me';

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Custom fetch wrapper with timeout and robust error parsing
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const timeoutMs = options?.timeoutMs || DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const signal = options?.signal
    ? options.signal
    : controller.signal;

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      signal,
      headers: {
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Data tidak ditemukan (404)');
      }
      if (res.status === 429) {
        throw new Error('Terlalu banyak permintaan (429), silakan coba sesaat lagi');
      }
      if (res.status >= 500) {
        throw new Error(`Server upstream mengalami kendala (${res.status})`);
      }
      throw new Error(`Permintaan gagal dengan status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || json.message || 'Respons API tidak berhasil');
    }

    return json as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Waktu permintaan habis (timeout). Silakan periksa koneksi Anda.');
    }
    throw err;
  }
}

/**
 * Image Proxy helper adhering strictly to Section 8:
 * - If already an API proxy URL, return as-is without double-proxying or re-encoding
 * - If original image URL, wrap safely using URLSearchParams to API_BASE_URL/api/manga/image?url=...
 */
export function getImageProxyUrl(imageUrl: string, source?: ComicSource): string {
  if (!imageUrl) return '/og-image.png';

  const clean = imageUrl.trim();

  // If source is komiku or domain belongs to komiku
  if (
    source === 'komiku' ||
    clean.includes('komiku.org') ||
    clean.includes('komiku.to') ||
    clean.includes('komiku-rest-api-one')
  ) {
    return getKomikuImageProxyUrl(clean);
  }

  // If already proxied via /api/manga/image
  if (
    clean.includes('/api/manga/image?url=') ||
    clean.startsWith('https://apis.louiv.me/api/manga/image')
  ) {
    return clean;
  }

  // If internal proxy
  if (clean.startsWith('/api/image-proxy')) {
    return clean;
  }

  // If original external URL, wrap with API_BASE_URL proxy
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const proxyUrl = new URL('/api/manga/image', API_BASE_URL);
      proxyUrl.searchParams.set('url', clean);
      return proxyUrl.toString();
    } catch {
      return clean;
    }
  }

  return clean;
}

/**
 * GET /api/manga/popular?page=1
 */
export async function getPopularManga(page = 1): Promise<MangaListResponse> {
  const safePage = Math.max(1, page);
  const params = new URLSearchParams({ page: String(safePage) });
  return apiFetch<MangaListResponse>(`/api/manga/popular?${params}`);
}

/**
 * GET /api/manga/latest?page=1
 */
export async function getLatestManga(page = 1): Promise<MangaListResponse> {
  const safePage = Math.max(1, page);
  const params = new URLSearchParams({ page: String(safePage) });
  return apiFetch<MangaListResponse>(`/api/manga/latest?${params}`);
}

/**
 * GET /api/manga/search?q=lookism&page=1
 */
export async function searchManga(
  query: string,
  page = 1,
  signal?: AbortSignal,
  source: ComicSource = 'louiv'
): Promise<MangaListResponse> {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return {
      success: true,
      data: { mangas: [], hasNextPage: false },
    };
  }

  if (source === 'komiku') {
    const res = await searchKomikuManga(cleanQ, page);
    return {
      success: true,
      data: {
        mangas: res.cards.map((c) => ({
          title: c.title,
          thumbnail: c.thumb,
          url: c.slug,
          mangaUrl: `/manga/${c.slug}?source=komiku`,
        })),
        hasNextPage: res.hasNextPage,
      },
    };
  }

  const safePage = Math.max(1, page);
  const params = new URLSearchParams({
    q: cleanQ,
    page: String(safePage),
  });

  return apiFetch<MangaListResponse>(`/api/manga/search?${params}`, { signal });
}

/**
 * GET /api/manga/:mangaId
 */
export async function getMangaDetail(
  mangaId: string
): Promise<{ success: boolean; data: MangaDetailRaw }> {
  if (!mangaId) throw new Error('ID Manga tidak boleh kosong');
  const encodedId = encodeURIComponent(mangaId.trim());
  return apiFetch<{ success: boolean; data: MangaDetailRaw }>(`/api/manga/${encodedId}`);
}

/**
 * GET /api/manga/:mangaId/chapters
 */
export async function getMangaChapters(
  mangaId: string
): Promise<{ success: boolean; data: MangaChapterRaw[] }> {
  if (!mangaId) throw new Error('ID Manga tidak boleh kosong');
  const encodedId = encodeURIComponent(mangaId.trim());
  return apiFetch<{ success: boolean; data: MangaChapterRaw[] }>(`/api/manga/${encodedId}/chapters`);
}

/**
 * GET /api/manga/chapter/:chapterId/pages
 */
export async function getChapterPages(
  chapterId: string
): Promise<{ success: boolean; data: ChapterPageRaw[] }> {
  if (!chapterId) throw new Error('ID Chapter tidak boleh kosong');
  const encodedId = encodeURIComponent(chapterId.trim());
  return apiFetch<{ success: boolean; data: ChapterPageRaw[] }>(
    `/api/manga/chapter/${encodedId}/pages`
  );
}

// -------------------------------------------------------------
// High-Level Data Mappers for UI Components
// -------------------------------------------------------------

export function toMangaCard(item: MangaItem, badge?: string, source: ComicSource = 'louiv'): MangaCard {
  return {
    title: item.title || 'Untitled Manhwa',
    slug: item.url, // manga ID
    thumb: getImageProxyUrl(item.thumbnail, source),
    link: item.mangaUrl,
    badge,
    source,
  };
}

/**
 * Consolidated Home Data aggregator using popular and latest endpoints
 */
export async function fetchHomeData(source: ComicSource = 'louiv'): Promise<HomeData> {
  if (source === 'komiku') {
    return fetchKomikuHomeData();
  }

  const [popularRes, latestRes] = await Promise.all([
    getPopularManga(1).catch(() => ({ success: false, data: { mangas: [], hasNextPage: false } })),
    getLatestManga(1).catch(() => ({ success: false, data: { mangas: [], hasNextPage: false } })),
  ]);

  const popularList = popularRes.data?.mangas || [];
  const latestList = latestRes.data?.mangas || [];

  // Split popular list into Featured and Trending
  const featured = popularList.slice(0, 6).map((m, idx) => toMangaCard(m, idx === 0 ? 'HOT' : undefined, 'louiv'));
  const trending = popularList.slice(0, 12).map((m) => toMangaCard(m, undefined, 'louiv'));
  const latest = latestList.slice(0, 18).map((m) => toMangaCard(m, undefined, 'louiv'));
  const popular = popularList.slice(6, 24).map((m) => toMangaCard(m, undefined, 'louiv'));

  // Common manhwa genres for filter pills
  const genres = [
    'Action',
    'Adventure',
    'Fantasy',
    'Drama',
    'School Life',
    'Martial Arts',
    'Supernatural',
    'Romance',
    'Comedy',
    'Shounen',
    'Isekai',
    'Historical',
  ];

  return {
    source: 'louiv',
    featured: featured.length > 0 ? featured : latest.slice(0, 5),
    trending,
    latest,
    popular: popular.length > 0 ? popular : trending,
    genres,
  };
}

/**
 * Full Manga Detail aggregator (combines detail + chapters)
 */
export async function fetchMangaFullDetail(
  mangaId: string,
  source: ComicSource = 'louiv'
): Promise<MangaDetail> {
  if (source === 'komiku') {
    return getKomikuDetail(mangaId);
  }

  const [detailRes, chaptersRes] = await Promise.all([
    getMangaDetail(mangaId),
    getMangaChapters(mangaId).catch(() => ({ success: true, data: [] as MangaChapterRaw[] })),
  ]);

  const raw = detailRes.data;
  const rawChapters = chaptersRes.data || [];

  // Parse genres string (e.g. "Action, School Life, Shounen, Manhwa")
  const genres = raw.genre
    ? raw.genre.split(',').map((g) => g.trim()).filter(Boolean)
    : [];

  const chapters = rawChapters.map((ch) => {
    let dateStr = '';
    if (ch.dateUpload) {
      try {
        const d = new Date(ch.dateUpload);
        if (!isNaN(d.getTime())) {
          dateStr = d.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
      } catch {
        dateStr = '';
      }
    }

    return {
      slug: ch.url, // Chapter ID
      title: ch.name || 'Chapter',
      chapterNumber: ch.name ? ch.name.replace(/[^0-9.]/g, '') : '',
      releaseDate: dateStr,
      source: 'louiv' as ComicSource,
    };
  });

  return {
    title: raw.title || 'Untitled',
    slug: mangaId,
    thumb: getImageProxyUrl(raw.thumbnail, 'louiv'),
    synopsis: raw.description || 'Sinopsis belum tersedia untuk manhwa ini.',
    genres,
    rating: '9.8',
    status: raw.status || 'Ongoing',
    author: raw.author || 'Informasi belum tersedia',
    illustrator: raw.artist || 'Informasi belum tersedia',
    type: 'Manhwa',
    totalChapter: chapters.length,
    chapters,
    source: 'louiv',
  };
}

/**
 * Full Chapter Data aggregator for Reader
 */
export async function fetchChapterFullData(
  chapterId: string,
  mangaIdHint?: string,
  source: ComicSource = 'louiv'
): Promise<ChapterData> {
  if (source === 'komiku') {
    return getKomikuChapter(mangaIdHint || chapterId, chapterId);
  }

  // 1. Fetch pages
  const pagesRes = await getChapterPages(chapterId);
  const rawPages = pagesRes.data || [];

  // Sort pages numerically by index
  const sortedPages = [...rawPages].sort((a, b) => a.index - b.index);

  // Map to proxy image URLs
  const imageUrls = sortedPages.map((p) => getImageProxyUrl(p.imageUrl));

  // Determine mangaId: check hint, or stored mapping in localStorage
  let resolvedMangaId = mangaIdHint;
  if (!resolvedMangaId && typeof window !== 'undefined') {
    resolvedMangaId =
      localStorage.getItem(`icomic_chap_manga_${chapterId}`) ||
      localStorage.getItem(`iclass_chap_manga_${chapterId}`) ||
      undefined;
  }

  let mangaTitle = 'Manhwa';
  let chapterTitle = 'Chapter';
  let coverImage = '';
  let allChapters: { slug: string; title: string; chapterNumber: string }[] = [];
  let prevChapterSlug: string | null = null;
  let nextChapterSlug: string | null = null;

  // If mangaId is known, fetch chapters to calculate exact prev/next and dropdown selector
  if (resolvedMangaId) {
    try {
      const [detailRes, chaptersRes] = await Promise.all([
        getMangaDetail(resolvedMangaId).catch(() => null),
        getMangaChapters(resolvedMangaId).catch(() => null),
      ]);

      if (detailRes?.data) {
        mangaTitle = detailRes.data.title || mangaTitle;
        coverImage = getImageProxyUrl(detailRes.data.thumbnail);
      }

      if (chaptersRes?.data && Array.isArray(chaptersRes.data)) {
        allChapters = chaptersRes.data.map((ch) => ({
          slug: ch.url,
          title: ch.name,
          chapterNumber: ch.name ? ch.name.replace(/[^0-9.]/g, '') : '',
        }));

        // Find current chapter index in list
        // Note: chapters are ordered newest first (index 0 = Chapter 629, index N = Chapter 1)
        const currentIdx = allChapters.findIndex((c) => c.slug === chapterId);
        if (currentIdx !== -1) {
          chapterTitle = allChapters[currentIdx].title;

          // Next chapter in reading sequence (newer chapter = index - 1)
          if (currentIdx > 0) {
            nextChapterSlug = allChapters[currentIdx - 1].slug;
          }
          // Previous chapter in reading sequence (older chapter = index + 1)
          if (currentIdx < allChapters.length - 1) {
            prevChapterSlug = allChapters[currentIdx + 1].slug;
          }
        }
      }
    } catch {
      // Continue with whatever info we have
    }
  }

  return {
    manga: mangaTitle,
    mangaSlug: resolvedMangaId || chapterId,
    coverImage,
    chapter: chapterTitle,
    chapterSlug: chapterId,
    totalPages: imageUrls.length,
    source: 'louiv',
    prevChapterSlug,
    nextChapterSlug,
    allChapters,
    images: imageUrls,
  };
}

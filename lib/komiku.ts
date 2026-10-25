/**
 * Centralized Komiku API Service & Normalizers
 * Integrates with https://komiku-rest-api-one.vercel.app
 */

import type {
  MangaCard,
  MangaDetail,
  ChapterData,
  HomeData,
  ChapterItem,
} from '@/types/manga.ts';
import { serverCache } from './cache.ts';

export const KOMIKU_BASE_URL = 'https://komiku-rest-api-one.vercel.app';
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Image Proxy helper for Komiku CDN
 * Protects against 403 hotlink protection on img.komiku.org / thumbnail.komiku.org
 */
export function getKomikuImageProxyUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return '/og-image.png';
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) return '/og-image.png';

  // Already a Komiku proxy URL
  if (trimmed.includes('/image-proxy?url=') || trimmed.startsWith(`${KOMIKU_BASE_URL}/image-proxy`)) {
    return trimmed;
  }

  // Already a Louiv proxy URL or local proxy
  if (trimmed.startsWith('/api/') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Proxy external images from Komiku domains
  try {
    return `${KOMIKU_BASE_URL}/image-proxy?url=${encodeURIComponent(trimmed)}`;
  } catch {
    return trimmed;
  }
}

/**
 * Helper to extract clean slug from apiDetailLink or originalLink
 * Examples:
 *   "/detail-komik/kidnapped-dragons" -> "kidnapped-dragons"
 *   "https://komiku.org/manga/kidnapped-dragons/" -> "kidnapped-dragons"
 */
export function extractKomikuSlug(urlOrPath: string | undefined | null): string {
  if (!urlOrPath) return '';
  const clean = urlOrPath.trim().replace(/\/$/, '');
  const segments = clean.split('/');
  return segments[segments.length - 1] || clean;
}

/**
 * Robust fetch wrapper with timeout and JSON validation
 */
async function fetchKomiku<T>(path: string): Promise<T> {
  const url = `${KOMIKU_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const cached = serverCache.get<T>(`komiku:${path}`);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Komik atau chapter Komiku tidak ditemukan (404).');
      }
      if (res.status === 429) {
        throw new Error('Terlalu banyak permintaan ke Komiku API. Silakan tunggu beberapa saat.');
      }
      throw new Error(`Komiku API mengembalikan status error (${res.status}).`);
    }

    const json = (await res.json()) as T;
    // Cache successful responses for 3 minutes
    serverCache.set(`komiku:${path}`, json, 180);
    return json;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Koneksi ke Komiku API timeout. Silakan periksa jaringan Anda.');
    }
    throw err;
  }
}

/**
 * Normalizes raw Komiku item to standard MangaCard
 */
export function toKomikuMangaCard(raw: any, defaultType = 'Komik'): MangaCard {
  const slug =
    raw.slug ||
    extractKomikuSlug(raw.apiDetailLink || raw.detailUrl || raw.href || raw.originalLink || raw.url);

  const thumb = getKomikuImageProxyUrl(raw.thumbnail || raw.thumb);

  return {
    title: raw.title || 'Untitled Comic',
    slug,
    thumb,
    type: raw.type || raw.jenisKomik || defaultType,
    rating: raw.rating || raw.stats?.split('•')?.[0]?.trim() || undefined,
    chapter: raw.latestChapter?.title || raw.chapter || undefined,
    source: 'komiku',
    badge: 'Komiku',
  };
}

/**
 * 1. Rekomendasi
 */
export async function getKomikuRekomendasi(): Promise<MangaCard[]> {
  const rawList = await fetchKomiku<any[]>('/rekomendasi');
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) => toKomikuMangaCard(item, 'Rekomendasi'));
}

/**
 * 2. Terbaru
 */
export async function getKomikuTerbaru(): Promise<MangaCard[]> {
  const rawList = await fetchKomiku<any[]>('/terbaru');
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item) => toKomikuMangaCard(item, 'Terbaru'));
}

/**
 * 3. Populer (Manga, Manhwa, Manhua)
 */
export async function getKomikuPopuler(): Promise<{
  all: MangaCard[];
  manga: MangaCard[];
  manhwa: MangaCard[];
  manhua: MangaCard[];
}> {
  const raw = await fetchKomiku<any>('/komik-populer');

  const mangaList = Array.isArray(raw?.manga?.items)
    ? raw.manga.items.map((it: any) => toKomikuMangaCard(it, 'Manga'))
    : [];

  const manhwaList = Array.isArray(raw?.manhwa?.items)
    ? raw.manhwa.items.map((it: any) => toKomikuMangaCard(it, 'Manhwa'))
    : [];

  const manhuaList = Array.isArray(raw?.manhua?.items)
    ? raw.manhua.items.map((it: any) => toKomikuMangaCard(it, 'Manhua'))
    : [];

  const all = [...manhwaList, ...mangaList, ...manhuaList];

  return { all, manga: mangaList, manhwa: manhwaList, manhua: manhuaList };
}

/**
 * 4. Pustaka & Berwarna
 */
export async function getKomikuPustaka(page = 1): Promise<{
  cards: MangaCard[];
  page: number;
  hasNextPage: boolean;
}> {
  const ep = page > 1 ? `/pustaka/page/${page}` : '/pustaka';
  const raw = await fetchKomiku<any>(ep);
  const items = Array.isArray(raw?.results) ? raw.results : [];
  return {
    cards: items.map((it: any) => toKomikuMangaCard(it, 'Pustaka')),
    page: raw?.page || page,
    hasNextPage: items.length >= 20,
  };
}

export async function getKomikuBerwarna(page = 1): Promise<{
  cards: MangaCard[];
  page: number;
  hasNextPage: boolean;
}> {
  const ep = page > 1 ? `/berwarna/page/${page}` : '/berwarna';
  const raw = await fetchKomiku<any>(ep);
  const items = Array.isArray(raw?.data?.results) ? raw.data.results : [];
  return {
    cards: items.map((it: any) => toKomikuMangaCard(it, 'Berwarna')),
    page: raw?.data?.page || page,
    hasNextPage: items.length >= 20,
  };
}

/**
 * 5. Search
 */
export async function searchKomikuManga(
  keyword: string,
  page = 1
): Promise<{
  cards: MangaCard[];
  total: number;
  hasNextPage: boolean;
}> {
  const trimmed = keyword.trim();
  if (!trimmed) return { cards: [], total: 0, hasNextPage: false };

  const raw = await fetchKomiku<any>(`/search?q=${encodeURIComponent(trimmed)}`);
  const items = Array.isArray(raw?.data) ? raw.data : [];
  const cards = items.map((it: any) => toKomikuMangaCard(it));

  return {
    cards,
    total: raw?.total || cards.length,
    hasNextPage: false, // Komiku search returns all matches in data array
  };
}

/**
 * 6. Genres
 */
export async function getKomikuGenres(): Promise<string[]> {
  try {
    const rawList = await fetchKomiku<any[]>('/genre-all');
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((g) => (typeof g === 'string' ? g : g.title || g.slug))
      .filter(Boolean)
      .slice(0, 30);
  } catch {
    return ['Action', 'Adventure', 'Fantasy', 'Comedy', 'Drama', 'Romance', 'School Life', 'Shounen'];
  }
}

export async function getKomikuGenreManga(
  genreSlug: string,
  page = 1
): Promise<{
  cards: MangaCard[];
  page: number;
  hasNextPage: boolean;
}> {
  const ep = page > 1 ? `/genre/${encodeURIComponent(genreSlug)}/page/${page}` : `/genre/${encodeURIComponent(genreSlug)}`;
  const raw = await fetchKomiku<any>(ep);
  const items = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  return {
    cards: items.map((it: any) => toKomikuMangaCard(it, 'Genre')),
    page: raw?.currentPage || page,
    hasNextPage: Boolean(raw?.hasNextPage),
  };
}

/**
 * 7. Detail Komik
 */
export async function getKomikuDetail(slug: string): Promise<MangaDetail> {
  const cleanSlug = extractKomikuSlug(slug);
  const raw = await fetchKomiku<any>(`/detail-komik/${encodeURIComponent(cleanSlug)}`);

  const info = raw.info || {};
  const rawChapters = Array.isArray(raw.chapters) ? raw.chapters : [];

  const chapters: ChapterItem[] = rawChapters.map((ch: any) => {
    // Extract chapter number or chapter id
    let chapNum = String(ch.chapterNumber || '').trim();
    if (!chapNum) {
      chapNum = ch.title ? ch.title.replace(/[^0-9.]/g, '') : '';
    }
    // Clean apiLink or originalLink to extract chapter identifier
    let chapSlug = chapNum;
    if (ch.apiLink) {
      const parts = ch.apiLink.split('/');
      chapSlug = parts[parts.length - 1] || chapNum;
    }

    return {
      slug: chapSlug,
      title: ch.title || `Chapter ${chapNum}`,
      chapterNumber: chapNum,
      releaseDate: ch.date || 'Terbaru',
      source: 'komiku',
    };
  });

  const genres: string[] = Array.isArray(raw.genres)
    ? raw.genres.map((g: any) => (typeof g === 'string' ? g : g.title || g.slug)).filter(Boolean)
    : [];

  return {
    title: raw.title || cleanSlug,
    slug: cleanSlug,
    altTitle: raw.alternativeTitle || info['Judul Alternatif'] || undefined,
    thumb: getKomikuImageProxyUrl(raw.thumbnail),
    synopsis: raw.description || raw.sinopsis || 'Deskripsi komik belum tersedia untuk judul ini.',
    genres,
    rating: info.Rating || 'Komiku',
    status: info.Status || 'Ongoing',
    author: info.Author || info.Pengarang || 'Komiku Studio',
    illustrator: info.Ilustrator || undefined,
    type: info.Tipe || info['Jenis Komik'] || 'Komik',
    totalChapter: chapters.length,
    chapters,
    source: 'komiku',
  };
}

/**
 * 8. Chapter Reader
 */
export async function getKomikuChapter(
  mangaSlug: string,
  chapterParam: string
): Promise<ChapterData> {
  const cleanMangaSlug = extractKomikuSlug(mangaSlug);
  // Clean chapter param: e.g. "chapter-220" -> "220", or "220"
  let cleanChap = chapterParam.trim().replace(/^.*chapter-?/i, '').replace(/\/$/, '');
  if (!cleanChap) cleanChap = chapterParam;

  const raw = await fetchKomiku<any>(
    `/baca-chapter/${encodeURIComponent(cleanMangaSlug)}/${encodeURIComponent(cleanChap)}`
  );

  const rawImages = Array.isArray(raw.images) ? raw.images : [];
  const images = rawImages
    .map((img: any) => getKomikuImageProxyUrl(img.src || img.fallbackSrc || img))
    .filter(Boolean);

  // Extract navigation
  let prevChapterSlug: string | null = null;
  let nextChapterSlug: string | null = null;

  if (raw.navigation?.prevChapter?.chapter) {
    prevChapterSlug = String(raw.navigation.prevChapter.chapter);
  }
  if (raw.navigation?.nextChapter?.chapter) {
    nextChapterSlug = String(raw.navigation.nextChapter.chapter);
  }

  // Also fetch details to build full dropdown list if needed
  let allChapters: { slug: string; title: string; chapterNumber: string }[] = [];
  try {
    const detail = await getKomikuDetail(cleanMangaSlug);
    allChapters = detail.chapters.map((c) => ({
      slug: c.slug,
      title: c.title,
      chapterNumber: c.chapterNumber,
    }));

    // If navigation didn't have prev/next, resolve from full list
    if (allChapters.length > 0 && (!prevChapterSlug || !nextChapterSlug)) {
      const idx = allChapters.findIndex((c) => c.slug === cleanChap || c.chapterNumber === cleanChap);
      if (idx !== -1) {
        if (!nextChapterSlug && idx > 0) {
          nextChapterSlug = allChapters[idx - 1].slug;
        }
        if (!prevChapterSlug && idx < allChapters.length - 1) {
          prevChapterSlug = allChapters[idx + 1].slug;
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  const mangaTitle = raw.mangaInfo?.title?.replace(/^Komik\s+/i, '') || cleanMangaSlug;

  return {
    manga: mangaTitle,
    mangaSlug: cleanMangaSlug,
    chapter: raw.title || `Chapter ${cleanChap}`,
    chapterSlug: cleanChap,
    coverImage: undefined,
    totalPages: images.length,
    images,
    prevChapterSlug,
    nextChapterSlug,
    allChapters,
    source: 'komiku',
  };
}

/**
 * 9. Aggregate Home Data for Komiku
 */
export async function fetchKomikuHomeData(): Promise<HomeData> {
  const [rekomendasi, terbaru, populer, berwarna] = await Promise.all([
    getKomikuRekomendasi().catch(() => []),
    getKomikuTerbaru().catch(() => []),
    getKomikuPopuler().catch(() => ({ all: [], manga: [], manhwa: [], manhua: [] })),
    getKomikuBerwarna(1).catch(() => ({ cards: [] })),
  ]);

  const featured = rekomendasi.slice(0, 5);
  const trending = populer.all.length > 0 ? populer.all.slice(0, 18) : rekomendasi.slice(5, 23);
  const latest = terbaru.slice(0, 18);
  const popular = populer.manhwa.length > 0 ? populer.manhwa.slice(0, 18) : rekomendasi;

  const genres = [
    'Manhwa',
    'Manga',
    'Manhua',
    'Action',
    'Adventure',
    'Fantasy',
    'Romance',
    'Comedy',
    'Drama',
    'Martial Arts',
    'School Life',
  ];

  return {
    source: 'komiku',
    featured,
    trending,
    latest,
    popular,
    genres,
    komikuSections: {
      rekomendasi,
      terbaru,
      populer: populer.all,
      populerManga: populer.manga,
      populerManhwa: populer.manhwa,
      populerManhua: populer.manhua,
      berwarna: berwarna.cards,
    },
  };
}

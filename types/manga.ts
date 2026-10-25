/**
 * TypeScript data definitions for iComic Manhwa Reader
 * Integrated with apis.louiv.me API
 */

export interface MangaItem {
  title: string;
  thumbnail: string;
  url: string; // Manga ID
  mangaUrl: string;
}

export interface MangaListResponse {
  success: boolean;
  data: {
    mangas: MangaItem[];
    hasNextPage: boolean;
  };
}

export interface MangaDetailRaw {
  title: string;
  author: string;
  artist: string;
  status: 'Ongoing' | 'Completed' | 'Unknown' | string;
  description: string;
  genre: string;
  thumbnail: string;
}

export interface MangaChapterRaw {
  name: string;
  dateUpload: number;
  url: string; // Chapter ID
  chapterUrl: string;
}

export interface ChapterPageRaw {
  index: number;
  imageUrl: string;
}

// Aliases matching prompt specification
export type MangaChapter = MangaChapterRaw;
export type ChapterPage = ChapterPageRaw;

export type ComicSource = 'louiv' | 'komiku';

export interface MangaCard {
  title: string;
  slug: string; // Manga ID or slug
  thumb: string;
  chapter?: string;
  link?: string;
  rating?: string;
  type?: string;
  badge?: string;
  source?: ComicSource;
}

export interface KomikuHomeSections {
  rekomendasi?: MangaCard[];
  terbaru?: MangaCard[];
  populer?: MangaCard[];
  populerManga?: MangaCard[];
  populerManhwa?: MangaCard[];
  populerManhua?: MangaCard[];
  berwarna?: MangaCard[];
  pustaka?: MangaCard[];
}

export interface HomeData {
  source?: ComicSource;
  featured: MangaCard[];
  trending: MangaCard[];
  latest: MangaCard[];
  popular: MangaCard[];
  genres: string[];
  komikuSections?: KomikuHomeSections;
}

export interface ChapterItem {
  slug: string; // Chapter ID or chapter number
  title: string; // Chapter Name (e.g. Chapter 629)
  chapterNumber: string;
  releaseDate?: string;
  source?: ComicSource;
}

export interface MangaDetail {
  title: string;
  slug: string; // Manga ID or slug
  altTitle?: string;
  thumb: string;
  synopsis: string;
  genres: string[];
  rating: string;
  status: string;
  author?: string;
  illustrator?: string;
  type?: string;
  totalChapter: number;
  chapters: ChapterItem[];
  source?: ComicSource;
}

export interface ChapterData {
  manga: string;
  mangaSlug: string;
  coverImage?: string;
  chapter: string;
  chapterSlug: string;
  totalPages: number;
  source?: ComicSource;
  prevChapterSlug?: string | null;
  nextChapterSlug?: string | null;
  allChapters: {
    slug: string;
    title: string;
    chapterNumber: string;
  }[];
  images: string[];
}

export interface ReadingProgress {
  mangaSlug: string;
  mangaTitle: string;
  mangaCover: string;
  chapterSlug: string;
  chapterTitle: string;
  page: number;
  totalPages: number;
  scrollPercent: number;
  genres?: string[];
  updatedAt: number;
  source?: ComicSource;
}

export interface BookmarkItem {
  slug: string;
  title: string;
  thumb: string;
  rating?: string;
  genres?: string[];
  totalChapter?: number;
  bookmarkedAt: number;
  source?: ComicSource;
}

export interface ReaderSettingsState {
  mode: 'vertical' | 'single';
  fitMode: 'width' | 'height' | 'original';
  theme: 'black' | 'dark' | 'navy';
  gap: number;
  keyboardNav: boolean;
  showHeader: boolean;
}

export interface HistoryEntry extends ReadingProgress {
  timeSpentSeconds?: number;
}

export interface ReadingStatistics {
  totalChaptersRead: number;
  totalTimeSpentMinutes: number;
  totalMangaStarted: number;
  topGenres: {
    genre: string;
    count: number;
    percentage: number;
  }[];
}

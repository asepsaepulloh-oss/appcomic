import type { ReadingProgress, BookmarkItem, ReaderSettingsState, ComicSource } from '../types/manga.ts';

const PROGRESS_STORAGE_PREFIX = 'icomic_progress_';
const OLD_PROGRESS_STORAGE_PREFIX = 'iclass_progress_';
const ALL_PROGRESS_KEY = 'icomic_all_progress';
const OLD_ALL_PROGRESS_KEY = 'iclass_all_progress';
const BOOKMARKS_KEY = 'icomic_bookmarks';
const OLD_BOOKMARKS_KEY = 'iclass_bookmarks';
const SETTINGS_KEY = 'icomic_reader_settings';
const OLD_SETTINGS_KEY = 'iclass_reader_settings';

export const DEFAULT_READER_SETTINGS: ReaderSettingsState = {
  mode: 'vertical',
  fitMode: 'width',
  theme: 'black',
  gap: 0,
  keyboardNav: true,
  showHeader: true,
};

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Save reading progress for a specific manga and chapter
 */
export function saveReadingProgress(progress: ReadingProgress): void {
  if (!isClient()) return;
  try {
    const key = `${PROGRESS_STORAGE_PREFIX}${progress.mangaSlug}`;
    localStorage.setItem(key, JSON.stringify(progress));

    // Also update recent progress list
    const all = getAllReadingProgress();
    const filtered = all.filter(p => p.mangaSlug !== progress.mangaSlug);
    filtered.unshift(progress);
    // Keep up to 20 most recent
    localStorage.setItem(ALL_PROGRESS_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch (err) {
    console.warn('Failed to save reading progress:', err);
  }
}

/**
 * Retrieve progress for a specific manga
 */
export function getReadingProgress(mangaSlug: string): ReadingProgress | null {
  if (!isClient() || !mangaSlug) return null;
  try {
    const item = localStorage.getItem(`${PROGRESS_STORAGE_PREFIX}${mangaSlug}`) ||
                 localStorage.getItem(`${OLD_PROGRESS_STORAGE_PREFIX}${mangaSlug}`);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

/**
 * Get all recent reading progress items
 */
export function getAllReadingProgress(): ReadingProgress[] {
  if (!isClient()) return [];
  try {
    const item = localStorage.getItem(ALL_PROGRESS_KEY) || localStorage.getItem(OLD_ALL_PROGRESS_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function clearReadingProgress(mangaSlug: string): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(`${PROGRESS_STORAGE_PREFIX}${mangaSlug}`);
    localStorage.removeItem(`${OLD_PROGRESS_STORAGE_PREFIX}${mangaSlug}`);
    const all = getAllReadingProgress().filter(p => p.mangaSlug !== mangaSlug);
    localStorage.setItem(ALL_PROGRESS_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Failed to clear reading progress:', err);
  }
}

const TOTAL_TIME_KEY = 'icomic_total_reading_time_sec';
const OLD_TOTAL_TIME_KEY = 'iclass_total_reading_time_sec';
const READ_CHAPTERS_SET_KEY = 'icomic_read_chapters_set';
const OLD_READ_CHAPTERS_SET_KEY = 'iclass_read_chapters_set';

/**
 * Track active reading time in seconds
 */
export function addReadingTime(seconds: number): number {
  if (!isClient() || seconds <= 0) return 0;
  try {
    const current = getTotalReadingTimeSeconds();
    const updated = current + seconds;
    localStorage.setItem(TOTAL_TIME_KEY, String(updated));
    return updated;
  } catch {
    return 0;
  }
}

export function getTotalReadingTimeSeconds(): number {
  if (!isClient()) return 0;
  try {
    const raw = localStorage.getItem(TOTAL_TIME_KEY) || localStorage.getItem(OLD_TOTAL_TIME_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Mark a chapter as read/engaged
 */
export function markChapterRead(chapterSlug: string): void {
  if (!isClient() || !chapterSlug) return;
  try {
    const raw = localStorage.getItem(READ_CHAPTERS_SET_KEY) || localStorage.getItem(OLD_READ_CHAPTERS_SET_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (!set.includes(chapterSlug)) {
      set.push(chapterSlug);
      localStorage.setItem(READ_CHAPTERS_SET_KEY, JSON.stringify(set));
    }
  } catch (err) {
    console.warn('Failed to mark chapter read:', err);
  }
}

export function getReadChaptersList(): string[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(READ_CHAPTERS_SET_KEY) || localStorage.getItem(OLD_READ_CHAPTERS_SET_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all reading history
 */
export function clearAllReadingHistory(): void {
  if (!isClient()) return;
  try {
    const all = getAllReadingProgress();
    for (const item of all) {
      localStorage.removeItem(`${PROGRESS_STORAGE_PREFIX}${item.mangaSlug}`);
      localStorage.removeItem(`${OLD_PROGRESS_STORAGE_PREFIX}${item.mangaSlug}`);
    }
    localStorage.removeItem(ALL_PROGRESS_KEY);
    localStorage.removeItem(OLD_ALL_PROGRESS_KEY);
    localStorage.removeItem(READ_CHAPTERS_SET_KEY);
    localStorage.removeItem(OLD_READ_CHAPTERS_SET_KEY);
    localStorage.removeItem(TOTAL_TIME_KEY);
    localStorage.removeItem(OLD_TOTAL_TIME_KEY);
  } catch (err) {
    console.warn('Failed to clear all reading history:', err);
  }
}

/**
 * Bookmark management
 */
export function getBookmarks(): BookmarkItem[] {
  if (!isClient()) return [];
  try {
    const item = localStorage.getItem(BOOKMARKS_KEY) || localStorage.getItem(OLD_BOOKMARKS_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(slug: string): boolean {
  if (!isClient() || !slug) return false;
  return getBookmarks().some(b => b.slug === slug);
}

export function toggleBookmark(item: { slug: string; title: string; thumb: string; rating?: string; genres?: string[]; totalChapter?: number; source?: ComicSource }): boolean {
  if (!isClient()) return false;
  try {
    const list = getBookmarks();
    const exists = list.some(b => b.slug === item.slug);
    let updated: BookmarkItem[];
    if (exists) {
      updated = list.filter(b => b.slug !== item.slug);
    } else {
      updated = [{
        ...item,
        bookmarkedAt: Date.now(),
      }, ...list];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

/**
 * Reader settings storage
 */
export function getReaderSettings(): ReaderSettingsState {
  if (!isClient()) return DEFAULT_READER_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem(OLD_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_READER_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_READER_SETTINGS;
}

export function saveReaderSettings(settings: Partial<ReaderSettingsState>): ReaderSettingsState {
  if (!isClient()) return DEFAULT_READER_SETTINGS;
  try {
    const current = getReaderSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

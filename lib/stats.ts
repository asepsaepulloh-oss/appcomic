import type { HistoryEntry, ReadingStatistics } from '@/types/manga.ts';

/**
 * Formats duration in minutes to human-readable string (e.g. "2 jam 15 mnt" or "45 mnt")
 */
export function formatReadingTime(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 mnt';
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  if (hours > 0 && mins > 0) {
    return `${hours} jam ${mins} mnt`;
  }
  if (hours > 0) {
    return `${hours} jam`;
  }
  return `${mins} mnt`;
}

/**
 * Formats timestamp into relative time string in Indonesian
 */
export function formatTimeAgo(timestamp: number, currentTimestamp = Date.now()): string {
  const elapsedSec = Math.max(0, Math.floor((currentTimestamp - timestamp) / 1000));

  if (elapsedSec < 60) return 'Baru saja';
  const elapsedMin = Math.floor(elapsedSec / 60);
  if (elapsedMin < 60) return `${elapsedMin} menit lalu`;
  const elapsedHour = Math.floor(elapsedMin / 60);
  if (elapsedHour < 24) return `${elapsedHour} jam lalu`;
  const elapsedDay = Math.floor(elapsedHour / 24);
  if (elapsedDay < 30) return `${elapsedDay} hari lalu`;
  const elapsedMonth = Math.floor(elapsedDay / 30);
  return `${elapsedMonth} bulan lalu`;
}

/**
 * Calculates top genres explored from reading history
 */
export function getGenreBreakdown(history: HistoryEntry[]): { genre: string; count: number; percentage: number }[] {
  const genreCountMap: Record<string, number> = {};
  let totalGenreHits = 0;

  for (const item of history) {
    if (Array.isArray(item.genres) && item.genres.length > 0) {
      for (const g of item.genres) {
        const cleanG = g.trim();
        if (cleanG) {
          genreCountMap[cleanG] = (genreCountMap[cleanG] || 0) + 1;
          totalGenreHits++;
        }
      }
    }
  }

  const list = Object.entries(genreCountMap).map(([genre, count]) => ({
    genre,
    count,
    percentage: totalGenreHits > 0 ? Math.round((count / totalGenreHits) * 100) : 0,
  }));

  // Sort descending by count
  list.sort((a, b) => b.count - a.count);
  return list;
}

/**
 * Computes consolidated reading statistics
 */
export function calculateReadingStats(history: HistoryEntry[], totalTimeSeconds = 0): ReadingStatistics {
  // Count unique completed or engaged chapters
  const uniqueChapters = new Set<string>();
  const uniqueManga = new Set<string>();

  for (const item of history) {
    if (item.mangaSlug) uniqueManga.add(item.mangaSlug);
    if (item.chapterSlug) uniqueChapters.add(item.chapterSlug);
  }

  const totalTimeMinutes = Math.round(totalTimeSeconds / 60);
  const topGenres = getGenreBreakdown(history);

  return {
    totalChaptersRead: uniqueChapters.size,
    totalTimeSpentMinutes: totalTimeMinutes,
    totalMangaStarted: uniqueManga.size,
    topGenres: topGenres.slice(0, 6),
  };
}

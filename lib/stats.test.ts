import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatReadingTime,
  formatTimeAgo,
  getGenreBreakdown,
  calculateReadingStats,
} from './stats.ts';
import type { HistoryEntry } from '../types/manga.ts';

test('formatReadingTime formats minutes into readable units', () => {
  assert.equal(formatReadingTime(0), '0 mnt');
  assert.equal(formatReadingTime(35), '35 mnt');
  assert.equal(formatReadingTime(60), '1 jam');
  assert.equal(formatReadingTime(125), '2 jam 5 mnt');
});

test('formatTimeAgo provides relative time descriptions', () => {
  const now = 1000000000000;
  assert.equal(formatTimeAgo(now - 30 * 1000, now), 'Baru saja');
  assert.equal(formatTimeAgo(now - 10 * 60 * 1000, now), '10 menit lalu');
  assert.equal(formatTimeAgo(now - 3 * 3600 * 1000, now), '3 jam lalu');
  assert.equal(formatTimeAgo(now - 2 * 86400 * 1000, now), '2 hari lalu');
});

test('getGenreBreakdown tallies and ranks genres by frequency', () => {
  const mockHistory: HistoryEntry[] = [
    {
      mangaSlug: 'lookism',
      mangaTitle: 'Lookism',
      mangaCover: '/cover.webp',
      chapterSlug: 'lookism-chapter-623',
      chapterTitle: 'Chapter 623',
      page: 18,
      totalPages: 18,
      scrollPercent: 100,
      genres: ['Action', 'Drama', 'School Life'],
      updatedAt: Date.now(),
    },
    {
      mangaSlug: 'reality-quest',
      mangaTitle: 'Reality Quest',
      mangaCover: '/cover2.webp',
      chapterSlug: 'reality-quest-chapter-10',
      chapterTitle: 'Chapter 10',
      page: 10,
      totalPages: 10,
      scrollPercent: 100,
      genres: ['Action', 'Supernatural'],
      updatedAt: Date.now(),
    },
  ];

  const breakdown = getGenreBreakdown(mockHistory);
  assert.equal(breakdown[0].genre, 'Action');
  assert.equal(breakdown[0].count, 2);
  assert.equal(breakdown[0].percentage, 40); // 2 out of 5 total genre tags = 40%
});

test('calculateReadingStats aggregates chapters, manga titles and time correctly', () => {
  const mockHistory: HistoryEntry[] = [
    {
      mangaSlug: 'lookism',
      mangaTitle: 'Lookism',
      mangaCover: '/cover.webp',
      chapterSlug: 'lookism-chapter-623',
      chapterTitle: 'Chapter 623',
      page: 18,
      totalPages: 18,
      scrollPercent: 100,
      genres: ['Action'],
      updatedAt: Date.now(),
    },
    {
      mangaSlug: 'lookism',
      mangaTitle: 'Lookism',
      mangaCover: '/cover.webp',
      chapterSlug: 'lookism-chapter-624',
      chapterTitle: 'Chapter 624',
      page: 5,
      totalPages: 20,
      scrollPercent: 25,
      genres: ['Action'],
      updatedAt: Date.now(),
    },
    {
      mangaSlug: 'eleceed',
      mangaTitle: 'Eleceed',
      mangaCover: '/eleceed.webp',
      chapterSlug: 'eleceed-chapter-1',
      chapterTitle: 'Chapter 1',
      page: 10,
      totalPages: 10,
      scrollPercent: 100,
      genres: ['Action', 'Fantasy'],
      updatedAt: Date.now(),
    },
  ];

  const stats = calculateReadingStats(mockHistory, 3600); // 3600 seconds = 60 mins
  assert.equal(stats.totalChaptersRead, 3);
  assert.equal(stats.totalMangaStarted, 2);
  assert.equal(stats.totalTimeSpentMinutes, 60);
  assert.ok(stats.topGenres.length > 0);
});

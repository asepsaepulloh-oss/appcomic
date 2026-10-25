/**
 * Server-side cache manager with TTL support
 * Designed for both local Node runtime and Vercel Serverless/Edge caching
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export const CACHE_TTL = {
  HOME: 300, // 300 seconds (5 min)
  CATALOG: 180, // 180 seconds (3 min)
  SEARCH: 120, // 120 seconds (2 min)
  DETAIL: 600, // 600 seconds (10 min)
  CHAPTER: 1800, // 1800 seconds (30 min)
} as const;

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxItems = 500;

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    // Evict oldest if limit exceeded
    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const serverCache = new MemoryCache();

export function makeCacheHeaders(ttlSeconds: number) {
  return {
    'Cache-Control': `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${Math.floor(ttlSeconds / 2)}`,
    'Content-Type': 'application/json',
  };
}

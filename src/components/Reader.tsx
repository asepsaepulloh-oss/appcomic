import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ReaderHeader,
} from './ReaderHeader.tsx';
import {
  SinglePageControls,
  VerticalFloatingControls,
} from './ReaderControls.tsx';
import { ReaderSettings } from './ReaderSettings.tsx';
import type { ChapterData, ReaderSettingsState, ComicSource } from '@/types/manga.ts';
import { fetchChapterFullData } from '@/lib/api.ts';
import { withSourceParam } from '@/lib/source.ts';
import {
  saveReadingProgress,
  getReadingProgress,
  getReaderSettings,
  saveReaderSettings,
  isBookmarked,
  toggleBookmark,
  addReadingTime,
  markChapterRead,
  getBookmarks,
} from '@/lib/reading-progress.ts';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ImageOff,
} from 'lucide-react';

interface ReaderProps {
  chapterSlug: string;
  mangaSlugHint?: string;
  sourceHint?: ComicSource;
  onNavigate: (path: string) => void;
}

export const Reader: React.FC<ReaderProps> = ({ chapterSlug, mangaSlugHint, sourceHint, onNavigate }) => {
  const [data, setData] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<ReaderSettingsState>(getReaderSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Single page index (1-indexed)
  const [singlePageIndex, setSinglePageIndex] = useState(1);

  // Vertical scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // Bookmarking
  const [bookmarked, setBookmarked] = useState(false);

  // Failed image indices tracking for retry
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Determine current active source
  const currentSource: ComicSource = (data?.source as ComicSource) || sourceHint || 'louiv';

  // Navigation helpers that strictly preserve the active source parameter
  const navigateToChapter = useCallback((slug: string) => {
    const mangaSlug = data?.mangaSlug || mangaSlugHint || '';
    const query = mangaSlug ? `?manga=${encodeURIComponent(mangaSlug)}` : '';
    onNavigate(withSourceParam(`/read/${slug}${query}`, currentSource));
  }, [data?.mangaSlug, mangaSlugHint, currentSource, onNavigate]);

  const navigateToManga = useCallback(() => {
    const mangaSlug = data?.mangaSlug || mangaSlugHint || '';
    if (mangaSlug) {
      onNavigate(withSourceParam(`/manga/${mangaSlug}`, currentSource));
    } else {
      onNavigate(withSourceParam('/', currentSource));
    }
  }, [data?.mangaSlug, mangaSlugHint, currentSource, onNavigate]);

  // Fetch chapter data using centralized API
  const fetchChapter = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    setFailedImages({});
    try {
      const chapterData = await fetchChapterFullData(slug, mangaSlugHint, sourceHint);
      setData(chapterData);
      markChapterRead(slug);

      // Check bookmark status
      setBookmarked(isBookmarked(chapterData.mangaSlug));

      // Restore reading progress if previously saved
      const saved = getReadingProgress(chapterData.mangaSlug);
      if (saved && saved.chapterSlug === slug) {
        if (saved.page && saved.page > 0) {
          setSinglePageIndex(Math.min(saved.page, chapterData.totalPages || 1));
        }
      } else {
        setSinglePageIndex(1);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data chapter');
    } finally {
      setIsLoading(false);
    }
  }, [mangaSlugHint, sourceHint]);

  useEffect(() => {
    fetchChapter(chapterSlug);
  }, [chapterSlug, fetchChapter]);

  // Active reading time tracking
  useEffect(() => {
    // Increment 5 seconds of active reading time every 5 seconds
    const interval = setInterval(() => {
      addReadingTime(5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update bookmark status
  const handleToggleBookmark = () => {
    if (!data) return;
    const newState = toggleBookmark({
      slug: data.mangaSlug,
      title: data.manga,
      thumb: data.coverImage || '/og-image.png',
      totalChapter: data.allChapters.length,
      source: currentSource,
    });
    setBookmarked(newState);
  };

  // Handle settings changes
  const handleSettingsChange = (updated: Partial<ReaderSettingsState>) => {
    const next = saveReaderSettings(updated);
    setSettings(next);
  };

  // Save progress helper
  const recordProgress = useCallback((page: number, percent: number) => {
    if (!data) return;
    const existing = getReadingProgress(data.mangaSlug);
    const bookmark = getBookmarks().find(b => b.slug === data.mangaSlug);
    const resolvedGenres = (existing?.genres && existing.genres.length > 0)
      ? existing.genres
      : (bookmark?.genres || []);

    saveReadingProgress({
      mangaSlug: data.mangaSlug,
      mangaTitle: data.manga,
      mangaCover: data.coverImage || '/og-image.png',
      chapterSlug: data.chapterSlug,
      chapterTitle: data.chapter,
      page,
      totalPages: data.totalPages,
      scrollPercent: percent,
      genres: resolvedGenres,
      updatedAt: Date.now(),
      source: currentSource,
    });
  }, [data, currentSource]);

  // Handle scroll in vertical mode
  useEffect(() => {
    if (settings.mode !== 'vertical') return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentScroll = window.scrollY;
      const percent = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setScrollProgress(percent);

      if (data && data.totalPages > 0) {
        const estPage = Math.min(data.totalPages, Math.max(1, Math.ceil((percent / 100) * data.totalPages)));
        recordProgress(estPage, percent);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [settings.mode, data, recordProgress]);

  // Keyboard navigation for single page mode
  useEffect(() => {
    if (!settings.keyboardNav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if typing in input, select or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
        return;
      }

      if (settings.mode === 'single' && data) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          if (singlePageIndex < data.totalPages) {
            const nextP = singlePageIndex + 1;
            setSinglePageIndex(nextP);
            recordProgress(nextP, (nextP / data.totalPages) * 100);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (data.nextChapterSlug) {
            navigateToChapter(data.nextChapterSlug);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (singlePageIndex > 1) {
            const prevP = singlePageIndex - 1;
            setSinglePageIndex(prevP);
            recordProgress(prevP, (prevP / data.totalPages) * 100);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (data.prevChapterSlug) {
            navigateToChapter(data.prevChapterSlug);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNav, settings.mode, singlePageIndex, data, navigateToChapter, recordProgress]);

  // Theme style mapping
  const bgColors = {
    black: '#000000',
    dark: '#0B0B0F',
    navy: '#15151D',
  };

  const currentBg = bgColors[settings.theme] || '#0B0B0F';

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#232330] border-t-[#8B5CF6] animate-spin" />
            <Loader2 className="w-6 h-6 text-[#8B5CF6] absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              Memuat Chapter...
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Mengambil panel resolusi tinggi dari sumber resmi
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#15151D] border border-[#232330] rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Gagal Membuka Chapter</h2>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              {error || 'Chapter tidak ditemukan atau sumber sedang mengalami gangguan.'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onNavigate(withSourceParam('/', currentSource))}
              className="flex-1 py-2.5 px-4 bg-[#0B0B0F] hover:bg-[#232330] border border-[#232330] rounded-xl text-xs font-semibold text-gray-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Ke Beranda
            </button>
            <button
              onClick={() => fetchChapter(chapterSlug)}
              className="flex-1 py-2.5 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl text-xs font-semibold text-white shadow-md shadow-[#8B5CF6]/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen transition-colors duration-300 flex flex-col"
      style={{ backgroundColor: currentBg }}
    >
      {/* Top Reading Progress Bar (Vertical Mode) */}
      {settings.mode === 'vertical' && (
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-[#232330]">
          <div
            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Reader Header */}
      <ReaderHeader
        mangaTitle={data.manga}
        mangaSlug={data.mangaSlug}
        chapterTitle={data.chapter}
        currentChapterSlug={data.chapterSlug}
        allChapters={data.allChapters}
        isBookmarked={bookmarked}
        onToggleBookmark={handleToggleBookmark}
        onBackToManga={navigateToManga}
        onSelectChapter={navigateToChapter}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isVisible={settings.showHeader}
        prevChapterSlug={data.prevChapterSlug}
        nextChapterSlug={data.nextChapterSlug}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center select-none py-2 sm:py-4">
        {/* Top Quick Chapter Navigation Bar */}
        {data.images.length > 0 && (
          <div className="w-full max-w-2xl px-2.5 sm:px-4 mb-3 sm:mb-4">
            <div className="flex items-center justify-between gap-2 bg-[#15151D]/90 backdrop-blur-md border border-[#232330] rounded-xl p-2 sm:p-2.5 shadow-md">
              <button
                onClick={() =>
                  data.prevChapterSlug &&
                  navigateToChapter(data.prevChapterSlug)
                }
                disabled={!data.prevChapterSlug}
                className="px-2.5 sm:px-3 py-1.5 bg-[#0B0B0F] hover:bg-[#232330] border border-[#232330] hover:border-[#8B5CF6]/50 rounded-lg text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                title={data.prevChapterSlug ? 'Chapter Sebelumnya' : 'Tidak ada chapter sebelumnya'}
                aria-label="Chapter Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-[#8B5CF6]" />
                <span className="hidden xs:inline">Chapter Sebelumnya</span>
                <span className="xs:hidden">Sebelumnya</span>
              </button>

              <div className="flex flex-col items-center justify-center min-w-0 px-2 text-center">
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[240px]">
                  {data.chapter}
                </span>
                <span className="text-[10px] text-gray-400">
                  {data.totalPages || data.images.length} Halaman
                </span>
              </div>

              <button
                onClick={() =>
                  data.nextChapterSlug &&
                  navigateToChapter(data.nextChapterSlug)
                }
                disabled={!data.nextChapterSlug}
                className="px-2.5 sm:px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg text-xs font-bold text-white shadow-md shadow-[#8B5CF6]/20 disabled:bg-[#15151D] disabled:border-[#232330] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                title={data.nextChapterSlug ? 'Chapter Berikutnya' : 'Sudah chapter terbaru'}
                aria-label="Chapter Berikutnya"
              >
                <span className="hidden xs:inline">Chapter Berikutnya</span>
                <span className="xs:hidden">Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {data.images.length === 0 ? (
          <div className="py-24 text-center space-y-3 px-4">
            <ImageOff className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">Panel Belum Tersedia</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Chapter ini belum memiliki gambar panel dari sumber. Coba buka chapter lain atau muat ulang.
            </p>
          </div>
        ) : settings.mode === 'vertical' ? (
          /* ================= VERTICAL SCROLL MODE ================= */
          <div
            className="w-full flex flex-col items-center"
            style={{ gap: `${settings.gap}px` }}
          >
            {data.images.map((imgUrl, idx) => {
              const pageNum = idx + 1;
              const isFailed = failedImages[idx];
              const proxiedUrl = imgUrl;

              return (
                <div
                  key={`${imgUrl}-${idx}`}
                  id={`page-${pageNum}`}
                  className={`relative w-full flex items-center justify-center transition-all ${
                    settings.fitMode === 'width' ? 'max-w-3xl sm:px-2' : 'max-w-2xl px-1'
                  }`}
                >
                  {isFailed ? (
                    <div className="w-full aspect-[3/4] bg-[#15151D] border border-red-500/30 rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                      <p className="text-xs text-gray-300 font-medium">Halaman {pageNum} gagal dimuat</p>
                      <button
                        onClick={() => {
                          setFailedImages(prev => ({ ...prev, [idx]: false }));
                        }}
                        className="px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Muat Ulang Halaman
                      </button>
                    </div>
                  ) : (
                    <img
                      src={proxiedUrl}
                      alt={`${data.manga} - ${data.chapter} - Halaman ${pageNum}`}
                      loading={idx < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                      onError={() => {
                        setFailedImages(prev => ({ ...prev, [idx]: true }));
                      }}
                      className="w-full h-auto block select-none pointer-events-none rounded-xs"
                      style={{
                        objectFit: 'contain',
                        backgroundColor: currentBg,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= SINGLE PAGE MODE ================= */
          <div className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[70vh] px-2 relative pb-20">
            {data.images[singlePageIndex - 1] ? (
              <div
                className={`relative flex items-center justify-center transition-all ${
                  settings.fitMode === 'height' ? 'max-h-[85vh] w-auto' : 'w-full max-w-2xl'
                }`}
              >
                <img
                  key={singlePageIndex}
                  src={data.images[singlePageIndex - 1]}
                  alt={`${data.manga} - Halaman ${singlePageIndex}`}
                  className={`rounded-md shadow-2xl transition-all ${
                    settings.fitMode === 'height' ? 'max-h-[85vh] w-auto object-contain' : 'w-full h-auto object-cover'
                  }`}
                  onError={() => {
                    setFailedImages(prev => ({ ...prev, [singlePageIndex - 1]: true }));
                  }}
                />

                {/* Left/Right click zones for fast paging on desktop/tablet */}
                <div
                  onClick={() => {
                    if (singlePageIndex > 1) {
                      const prevP = singlePageIndex - 1;
                      setSinglePageIndex(prevP);
                      recordProgress(prevP, (prevP / data.totalPages) * 100);
                    }
                  }}
                  className="absolute left-0 top-0 w-1/3 h-full cursor-w-resize z-10"
                  title="Klik untuk halaman sebelumnya"
                />
                <div
                  onClick={() => {
                    if (singlePageIndex < data.totalPages) {
                      const nextP = singlePageIndex + 1;
                      setSinglePageIndex(nextP);
                      recordProgress(nextP, (nextP / data.totalPages) * 100);
                    }
                  }}
                  className="absolute right-0 top-0 w-1/3 h-full cursor-e-resize z-10"
                  title="Klik untuk halaman berikutnya"
                />
              </div>
            ) : null}
          </div>
        )}

        {/* ================= CHAPTER COMPLETION FOOTER ================= */}
        {data.images.length > 0 && (
          <section className="w-full max-w-2xl mt-12 mb-20 px-4">
            <div className="bg-[#15151D] border border-[#232330] rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] mx-auto flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                  Kamu telah menyelesaikan {data.chapter}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {data.nextChapterSlug
                    ? 'Lanjutkan ke chapter berikutnya untuk mengikuti kelanjutan ceritanya.'
                    : 'Ini adalah chapter terbaru yang tersedia saat ini.'}
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    if (data.prevChapterSlug) {
                      navigateToChapter(data.prevChapterSlug);
                    }
                  }}
                  disabled={!data.prevChapterSlug}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#0B0B0F] hover:bg-[#232330] border border-[#232330] hover:border-[#8B5CF6]/50 rounded-xl text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title={data.prevChapterSlug ? 'Buka Chapter Sebelumnya' : 'Sudah di chapter awal'}
                >
                  <ChevronLeft className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Chapter Sebelumnya</span>
                </button>

                <button
                  onClick={navigateToManga}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#0B0B0F] hover:bg-[#232330] border border-[#232330] rounded-xl text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
                >
                  Daftar Chapter
                </button>

                <button
                  onClick={() => {
                    if (data.nextChapterSlug) {
                      navigateToChapter(data.nextChapterSlug);
                    }
                  }}
                  disabled={!data.nextChapterSlug}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#15151D] disabled:border-[#232330] disabled:text-gray-500 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold text-white shadow-lg shadow-[#8B5CF6]/25 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title={data.nextChapterSlug ? 'Lanjut ke Chapter Berikutnya' : 'Sudah chapter terbaru'}
                >
                  <span>{data.nextChapterSlug ? 'Lanjut Chapter Berikutnya' : 'Chapter Terbaru'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Single Page Bottom Bar */}
      {settings.mode === 'single' && (
        <SinglePageControls
          currentPage={singlePageIndex}
          totalPages={data.totalPages || data.images.length || 1}
          onPageChange={(p) => {
            setSinglePageIndex(p);
            recordProgress(p, (p / data.totalPages) * 100);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          prevChapterSlug={data.prevChapterSlug}
          nextChapterSlug={data.nextChapterSlug}
          onNavigateChapter={navigateToChapter}
        />
      )}

      {/* Vertical Mode Floating Controls */}
      {settings.mode === 'vertical' && (
        <VerticalFloatingControls
          progressPercent={scrollProgress}
          onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onOpenSettings={() => setIsSettingsOpen(true)}
          prevChapterSlug={data.prevChapterSlug}
          nextChapterSlug={data.nextChapterSlug}
          onNavigateChapter={navigateToChapter}
        />
      )}

      {/* Reader Settings Modal */}
      <ReaderSettings
        settings={settings}
        onChange={handleSettingsChange}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

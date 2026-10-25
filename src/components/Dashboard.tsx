import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Compass,
  Bookmark,
  TrendingUp,
  History,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Flame,
  AlertCircle,
  BarChart3,
  Search,
} from 'lucide-react';
import type { HistoryEntry, ReadingStatistics, BookmarkItem } from '@/types/manga.ts';
import { getImageProxyUrl } from '@/lib/api.ts';
import { withSourceParam } from '@/lib/source.ts';
import {
  getAllReadingProgress,
  clearReadingProgress,
  clearAllReadingHistory,
  getBookmarks,
  getTotalReadingTimeSeconds,
  getReadChaptersList,
} from '@/lib/reading-progress.ts';
import {
  calculateReadingStats,
  formatReadingTime,
  formatTimeAgo,
} from '@/lib/stats.ts';

interface DashboardProps {
  onNavigate: (path: string) => void;
  onOpenBookmarks: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenBookmarks }) => {
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<ReadingStatistics | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchHistory, setSearchHistory] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const loadData = () => {
    const rawProgress = getAllReadingProgress();
    const totalTimeSec = getTotalReadingTimeSeconds();
    const readChapters = getReadChaptersList();

    // Map into history entries
    const historyEntries: HistoryEntry[] = rawProgress.map((item) => ({
      ...item,
    }));

    setHistoryList(historyEntries);
    setBookmarks(getBookmarks());

    // Calculate statistics
    const calculated = calculateReadingStats(historyEntries, totalTimeSec);
    // If user read chapters through direct marks, prioritize max
    if (readChapters.length > calculated.totalChaptersRead) {
      calculated.totalChaptersRead = readChapters.length;
    }
    setStats(calculated);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteItem = (e: React.MouseEvent, mangaSlug: string) => {
    e.stopPropagation();
    clearReadingProgress(mangaSlug);
    loadData();
  };

  const handleClearAll = () => {
    clearAllReadingHistory();
    setConfirmClearAll(false);
    loadData();
  };

  const filteredHistory = historyList.filter(item =>
    item.mangaTitle.toLowerCase().includes(searchHistory.toLowerCase()) ||
    item.chapterTitle.toLowerCase().includes(searchHistory.toLowerCase())
  );

  // Genre badge color themes
  const genreColors: Record<string, { bg: string; text: string; bar: string }> = {
    Action: { bg: 'bg-red-500/15', text: 'text-red-400', bar: 'from-red-500 to-rose-600' },
    Fantasy: { bg: 'bg-purple-500/15', text: 'text-purple-400', bar: 'from-purple-500 to-indigo-600' },
    Drama: { bg: 'bg-blue-500/15', text: 'text-blue-400', bar: 'from-blue-500 to-cyan-600' },
    'Martial Arts': { bg: 'bg-amber-500/15', text: 'text-amber-400', bar: 'from-amber-500 to-orange-600' },
    'School Life': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', bar: 'from-emerald-500 to-teal-600' },
    Comedy: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', bar: 'from-yellow-500 to-amber-600' },
    Supernatural: { bg: 'bg-violet-500/15', text: 'text-violet-400', bar: 'from-violet-500 to-purple-600' },
    Romance: { bg: 'bg-pink-500/15', text: 'text-pink-400', bar: 'from-pink-500 to-rose-500' },
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#232330]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-semibold text-[#A78BFA] mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#8B5CF6]" />
            Dashboard Pembaca
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Aktivitas & Statistik Membaca
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Pantau ringkasan waktu baca, riwayat chapter, dan preferensi genre manhwa Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('/explore')}
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-[#8B5CF6]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Jelajah Manhwa</span>
          </button>

          {historyList.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="p-2 bg-[#15151D] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-[#232330] rounded-xl text-xs transition-colors cursor-pointer"
              title="Bersihkan Semua Riwayat"
              aria-label="Bersihkan Riwayat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Chapters Read */}
        <div className="bg-[#15151D] border border-[#232330] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Chapter
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {stats?.totalChaptersRead || 0}
            </span>
            <span className="text-xs text-gray-400 font-medium">selesai dibaca</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Metric 2: Reading Time Spent */}
        <div className="bg-[#15151D] border border-[#232330] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Waktu Membaca
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {formatReadingTime(stats?.totalTimeSpentMinutes || 0)}
            </span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Metric 3: Manhwa Titles Started */}
        <div className="bg-[#15151D] border border-[#232330] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Judul Dieksplorasi
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {stats?.totalMangaStarted || 0}
            </span>
            <span className="text-xs text-gray-400 font-medium">judul</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Metric 4: Bookmarks Count */}
        <div
          onClick={onOpenBookmarks}
          className="bg-[#15151D] border border-[#232330] rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all shadow-lg cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-3">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Bookmark Tersimpan
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {bookmarks.length}
            </span>
            <span className="text-xs text-[#8B5CF6] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Lihat &rarr;
            </span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Genres Explored Section */}
      <section className="bg-[#15151D] border border-[#232330] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#232330]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-base sm:text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              Genre Paling Sering Dieksplorasi
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            Dianalisis dari riwayat baca Anda
          </span>
        </div>

        {!stats?.topGenres || stats.topGenres.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            Belum ada data genre yang tercatat. Buka dan baca manhwa di iComic untuk melihat statistik genre favorit Anda!
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.topGenres.map((item, idx) => {
                const color = genreColors[item.genre] || {
                  bg: 'bg-purple-500/15',
                  text: 'text-purple-400',
                  bar: 'from-[#8B5CF6] to-[#6D28D9]',
                };

                return (
                  <div
                    key={item.genre}
                    onClick={() => onNavigate(`/explore?genre=${encodeURIComponent(item.genre)}`)}
                    className="p-3 bg-[#0B0B0F] border border-[#232330] hover:border-[#8B5CF6]/50 rounded-xl transition-all cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#15151D] text-gray-400 flex items-center justify-center font-mono font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-gray-200 group-hover:text-white transition-colors">
                          {item.genre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono">{item.count} komik</span>
                        <span className="font-bold text-[#8B5CF6] font-mono">{item.percentage}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#15151D] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${color.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(8, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {stats.topGenres[0] && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>
                  Genre utama Anda adalah <strong className="text-white font-semibold">{stats.topGenres[0].genre}</strong> ({stats.topGenres[0].percentage}% dari seluruh bacaan).
                </span>
              </p>
            )}
          </div>
        )}
      </section>

      {/* Reading History Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-[#232330]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-base sm:text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              Riwayat Membaca Terakhir
            </h2>
            <span className="text-xs bg-[#8B5CF6]/15 text-[#8B5CF6] font-semibold px-2 py-0.5 rounded-full">
              {historyList.length}
            </span>
          </div>

          {/* Quick search in history */}
          {historyList.length > 3 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari dalam riwayat..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#15151D] border border-[#232330] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          )}
        </div>

        {historyList.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#15151D]/50 border border-dashed border-[#232330] rounded-2xl p-6">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-sm sm:text-base font-bold text-gray-200">
              Belum Ada Riwayat Membaca
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Ketika Anda mulai membaca chapter di iComic, progres dan riwayat baca Anda akan otomatis tercatat di sini.
            </p>
            <button
              onClick={() => onNavigate('/explore')}
              className="mt-3 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-[#8B5CF6]/20 transition-colors cursor-pointer"
            >
              Mulai Membaca Sekarang
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400 bg-[#15151D]/50 rounded-xl border border-[#232330]">
            Tidak ada riwayat yang cocok dengan "{searchHistory}".
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredHistory.map((item) => {
              const displayThumb = getImageProxyUrl(item.mangaCover, item.source);

              const percent = item.totalPages > 0
                ? Math.round((item.page / item.totalPages) * 100)
                : Math.round(item.scrollPercent || 0);

              const readPath = withSourceParam(
                `/read/${item.chapterSlug}?manga=${encodeURIComponent(item.mangaSlug)}`,
                item.source
              );

              return (
                <div
                  key={item.mangaSlug}
                  onClick={() => onNavigate(readPath)}
                  className="group relative flex items-center justify-between p-3 bg-[#15151D] hover:bg-[#1A1A24] border border-[#232330] hover:border-[#8B5CF6]/50 rounded-2xl cursor-pointer transition-all shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-18 sm:w-16 sm:h-20 rounded-xl overflow-hidden bg-[#1E1E2A] shrink-0 border border-[#232330]">
                      <img
                        src={displayThumb}
                        alt={item.mangaTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm sm:text-base text-gray-100 group-hover:text-[#8B5CF6] transition-colors truncate">
                          {item.mangaTitle}
                        </h4>
                        {item.source && (
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded shrink-0 ${
                            item.source === 'komiku'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {item.source}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-2 truncate">
                        <span className="font-semibold text-gray-300">{item.chapterTitle}</span>
                        <span>&bull;</span>
                        <span>{formatTimeAgo(item.updatedAt)}</span>
                      </p>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2 pt-1 max-w-xs">
                        <div className="w-28 sm:w-36 h-1.5 bg-[#232330] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 font-semibold">
                          {percent}% (Hal {item.page})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteItem(e, item.mangaSlug)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-[#232330] transition-colors cursor-pointer"
                      title="Hapus riwayat komik ini"
                      aria-label={`Hapus ${item.mangaTitle} dari riwayat`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onNavigate(readPath)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6] text-[#A78BFA] hover:text-white border border-[#8B5CF6]/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>Lanjut Baca</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Confirmation Modal for Clear All */}
      {confirmClearAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setConfirmClearAll(false)}
        >
          <div
            className="w-full max-w-sm bg-[#15151D] border border-[#232330] rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-white">Hapus Semua Riwayat?</h3>
              <p className="text-xs text-gray-400">
                Tindakan ini akan menghapus seluruh riwayat bacaan dan mereset statistik waktu baca lokal Anda.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="flex-1 py-2 bg-[#0B0B0F] hover:bg-[#232330] border border-[#232330] rounded-xl text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Ya, Bersihkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

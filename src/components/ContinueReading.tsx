import React from 'react';
import { History, Play, Trash2, BookOpen } from 'lucide-react';
import type { ReadingProgress } from '@/types/manga.ts';
import { clearReadingProgress } from '@/lib/reading-progress.ts';
import { getImageProxyUrl } from '@/lib/api.ts';

interface ContinueReadingProps {
  progressList: ReadingProgress[];
  onContinue: (chapterSlug: string, mangaSlug?: string) => void;
  onRefresh: () => void;
  onViewDashboard?: () => void;
}

export const ContinueReading: React.FC<ContinueReadingProps> = ({
  progressList,
  onContinue,
  onRefresh,
  onViewDashboard,
}) => {
  if (progressList.length === 0) return null;

  const handleRemove = (e: React.MouseEvent, mangaSlug: string) => {
    e.stopPropagation();
    clearReadingProgress(mangaSlug);
    onRefresh();
  };

  return (
    <section className="w-full space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-[#232330]">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#8B5CF6]" />
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Lanjut Membaca
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {progressList.length} riwayat bacaan
          </span>
          {onViewDashboard && (
            <button
              onClick={onViewDashboard}
              className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Statistik & Semua Riwayat &rarr;</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {progressList.slice(0, 3).map((item) => {
          const percent = item.totalPages > 0
            ? Math.round((item.page / item.totalPages) * 100)
            : Math.round(item.scrollPercent || 0);

          const displayThumb = getImageProxyUrl(item.mangaCover);

          return (
            <div
              key={item.mangaSlug}
              onClick={() => onContinue(item.chapterSlug, item.mangaSlug)}
              className="group relative flex items-center gap-3.5 p-2.5 bg-[#15151D] border border-[#232330] hover:border-[#8B5CF6]/60 rounded-xl cursor-pointer transition-all hover:bg-[#1A1A24]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onContinue(item.chapterSlug, item.mangaSlug);
              }}
            >
              {/* Cover thumbnail */}
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#1E1E2A] shrink-0 border border-[#232330]">
                <img
                  src={displayThumb}
                  alt={item.mangaTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white fill-white drop-shadow-md" />
                </div>
              </div>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-semibold text-sm text-gray-100 group-hover:text-[#8B5CF6] transition-colors truncate">
                  {item.mangaTitle}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                  <span className="truncate">{item.chapterTitle}</span>
                </p>

                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="w-full h-1.5 bg-[#232330] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span>Hal {item.page}{item.totalPages ? ` / ${item.totalPages}` : ''}</span>
                    <span className="text-[#8B5CF6] font-semibold">{percent}%</span>
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => handleRemove(e, item.mangaSlug)}
                className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-red-400 rounded-md hover:bg-[#232330] transition-colors"
                title="Hapus dari riwayat baca"
                aria-label={`Hapus ${item.mangaTitle} dari riwayat`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

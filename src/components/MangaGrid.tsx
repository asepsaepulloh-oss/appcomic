import React from 'react';
import { MangaCard } from './MangaCard.tsx';
import type { MangaCard as MangaCardType } from '@/types/manga.ts';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

interface MangaGridProps {
  title?: string;
  icon?: React.ReactNode;
  manga: MangaCardType[];
  isLoading?: boolean;
  error?: string | null;
  onSelect: (slug: string) => void;
  onViewAll?: () => void;
  viewAllText?: string;
  emptyMessage?: string;
  onRetry?: () => void;
}

export const MangaGrid: React.FC<MangaGridProps> = ({
  title,
  icon,
  manga,
  isLoading = false,
  error = null,
  onSelect,
  onViewAll,
  viewAllText = 'Lihat Semua',
  emptyMessage = 'Tidak ada manhwa ditemukan',
  onRetry,
}) => {
  return (
    <section className="w-full space-y-4">
      {/* Header if title provided */}
      {title && (
        <div className="flex items-center justify-between pb-1 border-b border-[#232330]">
          <div className="flex items-center gap-2">
            {icon || <Sparkles className="w-5 h-5 text-[#8B5CF6]" />}
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              {title}
            </h2>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs sm:text-sm font-semibold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 transition-colors group cursor-pointer"
            >
              <span>{viewAllText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-[#15151D] border border-[#232330] rounded-xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[3/4.2] bg-[#1E1E2A] w-full" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-[#232330] rounded w-4/5" />
                <div className="h-3 bg-[#232330] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#15151D]/60 border border-red-500/20 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-200">Gagal Memuat Komik</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-[#8B5CF6]/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          )}
        </div>
      ) : manga.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#15151D]/40 border border-dashed border-[#232330] rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mb-3" />
          <h3 className="text-base font-semibold text-gray-200">{emptyMessage}</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Coba gunakan kata kunci pencarian lain atau muat ulang data dari server.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          )}
        </div>
      ) : (
        /* Manga Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {manga.map((item) => (
            <MangaCard key={item.slug} manga={item} onClick={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
};

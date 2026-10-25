import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  Settings,
  SkipBack,
  SkipForward,
} from 'lucide-react';

interface SinglePageControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  prevChapterSlug?: string | null;
  nextChapterSlug?: string | null;
  onNavigateChapter: (slug: string) => void;
}

export const SinglePageControls: React.FC<SinglePageControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  prevChapterSlug,
  nextChapterSlug,
  onNavigateChapter,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#15151D]/95 backdrop-blur-md border border-[#232330] rounded-2xl px-2.5 sm:px-4 py-2 shadow-2xl flex items-center gap-1.5 sm:gap-2.5 max-w-[96vw]">
      {/* Previous Chapter shortcut button */}
      <button
        onClick={() => prevChapterSlug && onNavigateChapter(prevChapterSlug)}
        disabled={!prevChapterSlug}
        className="px-2 sm:px-2.5 py-1.5 bg-[#0B0B0F] border border-[#232330] hover:border-[#8B5CF6]/60 rounded-xl text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        title={prevChapterSlug ? 'Chapter Sebelumnya' : 'Tidak ada chapter sebelumnya'}
        aria-label="Chapter Sebelumnya"
      >
        <SkipBack className="w-3.5 h-3.5 text-[#8B5CF6]" />
        <span className="hidden sm:inline">Ch Prev</span>
      </button>

      {/* First page button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        className="p-1.5 rounded-lg text-gray-300 hover:text-white disabled:opacity-25 disabled:pointer-events-none hover:bg-[#232330] transition-colors cursor-pointer"
        title="Halaman Pertama"
        aria-label="Halaman Pertama"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      {/* Prev Page */}
      <button
        onClick={() => {
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          } else if (prevChapterSlug) {
            onNavigateChapter(prevChapterSlug);
          }
        }}
        disabled={currentPage <= 1 && !prevChapterSlug}
        className="px-2.5 sm:px-3 py-1.5 bg-[#0B0B0F] border border-[#232330] hover:border-[#8B5CF6]/60 rounded-xl text-xs sm:text-sm font-semibold text-gray-200 disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1 transition-colors cursor-pointer"
        aria-label="Halaman Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4 text-[#8B5CF6]" />
        <span className="hidden xs:inline">Prev</span>
      </button>

      {/* Page indicator pill with dropdown/jump */}
      <div className="px-2.5 sm:px-3 py-1 bg-[#0B0B0F] border border-[#232330] rounded-xl text-xs sm:text-sm font-mono font-bold text-white flex items-center gap-1 shrink-0">
        <span className="text-[#8B5CF6]">{currentPage}</span>
        <span className="text-gray-500">/</span>
        <span className="text-gray-300">{totalPages || 1}</span>
      </div>

      {/* Next Page */}
      <button
        onClick={() => {
          if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
          } else if (nextChapterSlug) {
            onNavigateChapter(nextChapterSlug);
          }
        }}
        disabled={currentPage >= totalPages && !nextChapterSlug}
        className="px-2.5 sm:px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl text-xs sm:text-sm font-semibold text-white disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1 shadow-md shadow-[#8B5CF6]/20 transition-colors cursor-pointer"
        aria-label="Halaman Berikutnya"
      >
        <span className="hidden xs:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
        className="p-1.5 rounded-lg text-gray-300 hover:text-white disabled:opacity-25 disabled:pointer-events-none hover:bg-[#232330] transition-colors cursor-pointer"
        title="Halaman Terakhir"
        aria-label="Halaman Terakhir"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>

      {/* Next Chapter shortcut button */}
      <button
        onClick={() => nextChapterSlug && onNavigateChapter(nextChapterSlug)}
        disabled={!nextChapterSlug}
        className="px-2 sm:px-2.5 py-1.5 bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 hover:bg-[#8B5CF6] text-[#A78BFA] hover:text-white rounded-xl text-xs font-semibold disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        title={nextChapterSlug ? 'Chapter Berikutnya' : 'Sudah chapter terbaru'}
        aria-label="Chapter Berikutnya"
      >
        <span className="hidden sm:inline">Ch Next</span>
        <SkipForward className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface VerticalFloatingControlsProps {
  progressPercent: number;
  onScrollToTop: () => void;
  onOpenSettings: () => void;
  prevChapterSlug?: string | null;
  nextChapterSlug?: string | null;
  onNavigateChapter: (slug: string) => void;
}

export const VerticalFloatingControls: React.FC<VerticalFloatingControlsProps> = ({
  progressPercent,
  onScrollToTop,
  onOpenSettings,
  prevChapterSlug,
  nextChapterSlug,
  onNavigateChapter,
}) => {
  return (
    <div className="fixed bottom-5 right-3.5 sm:right-6 z-40 flex flex-col items-center gap-2">
      {/* Scroll to Top */}
      <button
        onClick={onScrollToTop}
        className="group relative p-2.5 sm:p-3 bg-[#15151D]/90 backdrop-blur-md border border-[#232330] hover:border-[#8B5CF6] text-gray-300 hover:text-white rounded-full shadow-xl transition-all hover:scale-105 cursor-pointer"
        title="Kembali ke Atas"
        aria-label="Kembali ke Atas"
      >
        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-[#15151D] border border-[#232330] text-white text-[11px] font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
          Ke Atas
        </span>
      </button>

      {/* Floating Previous Chapter Button (Always in the dock) */}
      <button
        onClick={() => prevChapterSlug && onNavigateChapter(prevChapterSlug)}
        disabled={!prevChapterSlug}
        className="group relative p-2.5 sm:p-3 bg-[#15151D]/90 backdrop-blur-md border border-[#232330] hover:border-[#8B5CF6] disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white rounded-full shadow-xl transition-all hover:scale-105 cursor-pointer"
        title={prevChapterSlug ? 'Chapter Sebelumnya' : 'Tidak ada chapter sebelumnya'}
        aria-label="Chapter Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6]" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-[#15151D] border border-[#232330] text-white text-[11px] font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
          {prevChapterSlug ? 'Chapter Sebelumnya' : 'Chapter Awal'}
        </span>
      </button>

      {/* Floating Next Chapter Button (High-visibility Purple CTA) */}
      <button
        onClick={() => nextChapterSlug && onNavigateChapter(nextChapterSlug)}
        disabled={!nextChapterSlug}
        className="group relative p-2.5 sm:p-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#15151D]/80 disabled:border-[#232330] disabled:text-gray-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-full shadow-xl shadow-[#8B5CF6]/30 border border-[#8B5CF6]/40 transition-all hover:scale-105 cursor-pointer flex items-center justify-center"
        title={nextChapterSlug ? 'Lanjut Chapter Berikutnya' : 'Sudah chapter terbaru'}
        aria-label="Chapter Berikutnya"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-[#8B5CF6] text-white text-[11px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
          {nextChapterSlug ? 'Next Chapter →' : 'Chapter Terbaru'}
        </span>
      </button>

      {/* Settings shortcut */}
      <button
        onClick={onOpenSettings}
        className="group relative p-2.5 sm:p-3 bg-[#15151D]/90 backdrop-blur-md border border-[#232330] hover:border-[#8B5CF6] text-[#8B5CF6] rounded-full shadow-xl transition-all hover:scale-105 cursor-pointer"
        title="Pengaturan Reader"
        aria-label="Buka Pengaturan"
      >
        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-[#15151D] border border-[#232330] text-white text-[11px] font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
          Pengaturan
        </span>
      </button>

      {/* Progress Indicator badge */}
      <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#0B0B0F]/90 backdrop-blur-md border border-[#232330] rounded-full text-[10px] sm:text-[11px] font-mono font-bold text-gray-300 shadow-lg">
        {Math.round(progressPercent)}%
      </div>
    </div>
  );
};

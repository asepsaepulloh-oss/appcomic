import React from 'react';
import { ArrowLeft, Bookmark, Settings2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReaderHeaderProps {
  mangaTitle: string;
  mangaSlug: string;
  chapterTitle: string;
  currentChapterSlug: string;
  allChapters: { slug: string; title: string; chapterNumber: string }[];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onBackToManga: () => void;
  onSelectChapter: (slug: string) => void;
  onOpenSettings: () => void;
  isVisible: boolean;
  prevChapterSlug?: string | null;
  nextChapterSlug?: string | null;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  mangaTitle,
  chapterTitle,
  currentChapterSlug,
  allChapters,
  isBookmarked,
  onToggleBookmark,
  onBackToManga,
  onSelectChapter,
  onOpenSettings,
  isVisible,
  prevChapterSlug,
  nextChapterSlug,
}) => {
  if (!isVisible) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0B0F]/95 backdrop-blur-md border-b border-[#232330] shadow-md transition-all duration-300 safe-area-top">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Back button & Titles */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 max-w-[32%] sm:max-w-[40%] md:max-w-none">
          <button
            onClick={onBackToManga}
            className="p-1.5 sm:p-2 rounded-lg bg-[#15151D] hover:bg-[#232330] text-gray-300 hover:text-white transition-colors shrink-0 cursor-pointer"
            aria-label="Kembali ke detail manhwa"
            title="Kembali ke detail manhwa"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <button
              onClick={onBackToManga}
              className="text-left text-xs sm:text-sm font-bold text-white hover:text-[#8B5CF6] transition-colors truncate cursor-pointer"
              title={mangaTitle}
            >
              {mangaTitle}
            </button>
            <span className="text-[10px] sm:text-xs text-gray-400 font-medium truncate">
              {chapterTitle}
            </span>
          </div>
        </div>

        {/* Center: Chapter Quick Selector with Prev and Next Chapter Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Previous Chapter button */}
          <button
            onClick={() => prevChapterSlug && onSelectChapter(prevChapterSlug)}
            disabled={!prevChapterSlug}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#15151D] border border-[#232330] hover:border-[#8B5CF6]/60 text-gray-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
            title={prevChapterSlug ? 'Chapter Sebelumnya' : 'Tidak ada chapter sebelumnya'}
            aria-label="Chapter Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 text-[#8B5CF6]" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          {/* Chapter Selector Dropdown */}
          {allChapters.length > 0 && (
            <div className="relative shrink-0 max-w-[100px] xs:max-w-[125px] sm:max-w-[170px]">
              <select
                value={currentChapterSlug}
                onChange={(e) => onSelectChapter(e.target.value)}
                className="w-full appearance-none pl-2 sm:pl-2.5 pr-6 sm:pr-7 py-1.5 bg-[#15151D] border border-[#232330] rounded-lg text-xs sm:text-sm text-gray-200 font-medium cursor-pointer focus:outline-none focus:border-[#8B5CF6] truncate"
                aria-label="Pilih chapter"
              >
                {allChapters.map((chap) => (
                  <option key={chap.slug} value={chap.slug} className="bg-[#15151D] text-white">
                    {chap.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Next Chapter button (distinct purple CTA) */}
          <button
            onClick={() => nextChapterSlug && onSelectChapter(nextChapterSlug)}
            disabled={!nextChapterSlug}
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#15151D] disabled:opacity-30 disabled:pointer-events-none text-white border border-[#8B5CF6]/50 disabled:border-[#232330] transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0 shadow-sm shadow-[#8B5CF6]/25"
            title={nextChapterSlug ? 'Chapter Berikutnya' : 'Sudah chapter terbaru'}
            aria-label="Chapter Berikutnya"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]'
                : 'bg-[#15151D] border-[#232330] text-gray-300 hover:text-white hover:bg-[#232330]'
            }`}
            title={isBookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
            aria-label="Bookmark chapter ini"
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-lg bg-[#15151D] border border-[#232330] text-gray-300 hover:text-white hover:bg-[#232330] transition-colors cursor-pointer"
            title="Pengaturan Reader"
            aria-label="Buka pengaturan reader"
          >
            <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6]" />
          </button>
        </div>
      </div>
    </header>
  );
};

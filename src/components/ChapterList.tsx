import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, BookOpen, CheckCircle2, Calendar } from 'lucide-react';
import type { ChapterItem } from '@/types/manga.ts';

interface ChapterListProps {
  chapters: ChapterItem[];
  mangaSlug: string;
  onSelectChapter: (chapterSlug: string) => void;
  currentReadingChapter?: string;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  onSelectChapter,
  currentReadingChapter,
}) => {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // default newest first

  const filteredChapters = useMemo(() => {
    let list = [...chapters];

    // Filter by search term
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        c => c.title.toLowerCase().includes(q) || c.chapterNumber.includes(q)
      );
    }

    // Sort
    if (sortOrder === 'asc') {
      list.reverse();
    }

    return list;
  }, [chapters, search, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Controls header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#15151D] p-3 rounded-xl border border-[#232330]">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nomor chapter (contoh: 623, 100)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0B0B0F] border border-[#232330] rounded-lg text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>

        {/* Sort button */}
        <button
          onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
          className="px-3.5 py-2 bg-[#0B0B0F] border border-[#232330] hover:border-[#8B5CF6]/50 rounded-lg text-xs sm:text-sm font-medium text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>{sortOrder === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}</span>
        </button>
      </div>

      {/* Chapters Count Info */}
      <div className="flex items-center justify-between px-1 text-xs text-gray-400">
        <span>Menampilkan {filteredChapters.length} dari {chapters.length} chapter</span>
      </div>

      {/* Chapters list grid */}
      {filteredChapters.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-[#15151D]/50 rounded-xl border border-[#232330]">
          Tidak ada chapter yang cocok dengan pencarian "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredChapters.map((chap) => {
            const isCurrent = currentReadingChapter === chap.slug;

            return (
              <button
                key={chap.slug}
                onClick={() => onSelectChapter(chap.slug)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all group cursor-pointer ${
                  isCurrent
                    ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-white shadow-sm'
                    : 'bg-[#15151D] border-[#232330] text-gray-200 hover:border-[#8B5CF6]/50 hover:bg-[#1A1A24]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-[#8B5CF6] text-white' : 'bg-[#0B0B0F] text-gray-400 group-hover:text-[#8B5CF6]'
                  }`}>
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-sm truncate group-hover:text-[#8B5CF6] transition-colors">
                      {chap.title}
                    </p>
                    {chap.releaseDate && (
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span>{chap.releaseDate}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] text-[#A78BFA] font-medium bg-[#8B5CF6]/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-[#8B5CF6]" />
                      Dibaca
                    </span>
                  )}
                  <span className="text-xs text-gray-400 group-hover:text-white font-medium">
                    Baca &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

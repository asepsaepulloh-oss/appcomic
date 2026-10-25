import React from 'react';
import { X, Bookmark, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import type { BookmarkItem, ComicSource } from '@/types/manga.ts';
import { toggleBookmark } from '@/lib/reading-progress.ts';
import { getImageProxyUrl } from '@/lib/api.ts';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  onSelectManga: (slug: string, source?: ComicSource) => void;
  onRefresh: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onSelectManga,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const handleRemove = (e: React.MouseEvent, item: BookmarkItem) => {
    e.stopPropagation();
    toggleBookmark(item);
    onRefresh();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#15151D] border border-[#232330] rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232330] shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#8B5CF6] fill-current" />
            <h3 className="font-bold text-base sm:text-lg text-white">Manhwa Tersimpan</h3>
            <span className="text-xs bg-[#8B5CF6]/20 text-[#8B5CF6] font-semibold px-2 py-0.5 rounded-full">
              {bookmarks.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#232330] transition-colors cursor-pointer"
            aria-label="Tutup modal bookmark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bookmark className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-sm font-medium text-gray-300">Belum ada manhwa tersimpan</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Buka halaman manhwa yang kamu sukai lalu klik tombol Bookmark untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            bookmarks.map((b) => {
              const displayThumb = getImageProxyUrl(b.thumb, b.source);

              return (
                <div
                  key={b.slug}
                  onClick={() => {
                    onSelectManga(b.slug, b.source);
                    onClose();
                  }}
                  className="group flex items-center justify-between p-2.5 bg-[#0B0B0F] hover:bg-[#1A1A24] border border-[#232330] hover:border-[#8B5CF6]/50 rounded-xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={displayThumb}
                      alt={b.title}
                      className="w-12 h-16 rounded-md object-cover bg-[#1E1E2A] shrink-0 border border-[#232330]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&fit=crop';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-sm text-gray-100 group-hover:text-[#8B5CF6] transition-colors truncate">
                          {b.title}
                        </h4>
                        {b.source && (
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded shrink-0 ${
                            b.source === 'komiku'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {b.source}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        {b.rating && <span className="text-amber-400 font-semibold">★ {b.rating}</span>}
                        {b.totalChapter ? (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-gray-500" />
                            {b.totalChapter} Ch
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleRemove(e, b)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#232330] transition-colors"
                      title="Hapus bookmark"
                      aria-label={`Hapus bookmark ${b.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#8B5CF6] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

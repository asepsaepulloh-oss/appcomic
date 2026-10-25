import React, { useState, useEffect, useCallback } from 'react';
import { ChapterList } from '../components/ChapterList.tsx';
import type { MangaDetail, ReadingProgress, ComicSource } from '@/types/manga.ts';
import { fetchMangaFullDetail, getImageProxyUrl } from '@/lib/api.ts';
import {
  getReadingProgress,
  saveReadingProgress,
  isBookmarked,
  toggleBookmark,
} from '@/lib/reading-progress.ts';
import { withSourceParam, getCurrentSource } from '@/lib/source.ts';
import {
  Star,
  BookOpen,
  Bookmark,
  Play,
  RotateCcw,
  Layers,
  Info,
  Calendar,
  User,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Tag,
  Zap,
} from 'lucide-react';

interface DetailPageProps {
  slug: string;
  sourceHint?: ComicSource;
  onNavigate: (path: string) => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({ slug, sourceHint, onNavigate }) => {
  const activeSource = sourceHint || getCurrentSource();
  const [data, setData] = useState<MangaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  const fetchDetail = useCallback(async (mangaSlug: string, src: ComicSource) => {
    setIsLoading(true);
    setError(null);
    try {
      const detail = await fetchMangaFullDetail(mangaSlug, src);
      setData(detail);
      setBookmarked(isBookmarked(detail.slug));
      setProgress(getReadingProgress(detail.slug));
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungi server untuk memuat detail komik');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetail(slug, activeSource);
  }, [slug, activeSource, fetchDetail]);

  const handleToggleBookmark = () => {
    if (!data) return;
    const newState = toggleBookmark({
      slug: data.slug,
      title: data.title,
      thumb: data.thumb,
      rating: data.rating,
      genres: data.genres,
      totalChapter: data.totalChapter,
      source: data.source || activeSource,
    });
    setBookmarked(newState);
  };

  // Find first chapter (oldest) for "Start Reading"
  const firstChapter =
    data?.chapters && data.chapters.length > 0
      ? data.chapters[data.chapters.length - 1] // usually last in desc list is ch 1
      : null;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        <p className="text-sm font-medium text-gray-300">
          Memuat detail dari {activeSource === 'komiku' ? 'Komiku' : 'Louiv API'}...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4 bg-[#15151D] border border-[#232330] rounded-2xl p-6 shadow-xl">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Detail Komik Tidak Ditemukan</h2>
        <p className="text-xs text-gray-400">{error || 'Data komik tidak dapat dimuat.'}</p>
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={() => onNavigate(withSourceParam('/', activeSource))}
            className="px-4 py-2 bg-[#0B0B0F] hover:bg-[#232330] border border-[#232330] rounded-xl text-xs font-semibold text-gray-300 cursor-pointer"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={() => fetchDetail(slug, activeSource)}
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#8B5CF6]/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const comicSrc = data.source || activeSource;
  const displayThumb = getImageProxyUrl(data.thumb, comicSrc);

  const handleSelectChapter = (chapSlug: string) => {
    if (data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`icomic_chap_manga_${chapSlug}`, data.slug);
        localStorage.setItem(`iclass_chap_manga_${chapSlug}`, data.slug);
      }
      const existing = getReadingProgress(data.slug);
      saveReadingProgress({
        mangaSlug: data.slug,
        mangaTitle: data.title,
        mangaCover: data.thumb,
        chapterSlug: chapSlug,
        chapterTitle: data.chapters.find((c) => c.slug === chapSlug)?.title || chapSlug,
        page: existing?.chapterSlug === chapSlug ? existing.page : 1,
        totalPages: existing?.chapterSlug === chapSlug ? existing.totalPages : 0,
        scrollPercent: existing?.chapterSlug === chapSlug ? existing.scrollPercent : 0,
        genres: data.genres || [],
        updatedAt: Date.now(),
        source: comicSrc,
      });
    }
    onNavigate(
      withSourceParam(`/read/${chapSlug}?manga=${encodeURIComponent(data.slug)}`, comicSrc)
    );
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Back button & Breadcrumb */}
      <div className="pt-2 flex items-center justify-between">
        <button
          onClick={() => onNavigate(withSourceParam('/', comicSrc))}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#8B5CF6]" />
          <span>Kembali ke Beranda</span>
        </button>

        {/* Source Badge Tag */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400 hidden xs:inline">Sumber:</span>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
              comicSrc === 'komiku'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
            }`}
          >
            {comicSrc === 'komiku' ? <BookOpen className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{comicSrc === 'komiku' ? 'Komiku Indonesia' : 'Louiv API'}</span>
          </span>
        </div>
      </div>

      {/* Main Manga Header / Hero Area */}
      <section className="relative rounded-2xl overflow-hidden bg-[#15151D] border border-[#232330] shadow-2xl p-5 sm:p-8">
        {/* Subtle blurred backdrop banner */}
        <div className="absolute inset-0 opacity-15 overflow-hidden pointer-events-none">
          <img
            src={displayThumb}
            alt=""
            className="w-full h-full object-cover filter blur-xl scale-125"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          {/* Cover Poster */}
          <div className="w-44 sm:w-56 aspect-[3/4.2] rounded-xl overflow-hidden bg-[#1E1E2A] shadow-2xl shrink-0 border border-[#232330] mx-auto md:mx-0">
            <img
              src={displayThumb}
              alt={data.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&fit=crop';
              }}
            />
          </div>

          {/* Info Details */}
          <div className="flex-1 space-y-4">
            {/* Title & Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30 uppercase tracking-wider">
                  {data.status || 'Ongoing'}
                </span>
                {data.type && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#0B0B0F] text-gray-300 border border-[#232330]">
                    {data.type}
                  </span>
                )}
                {data.rating && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    {data.rating}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0B0B0F] text-gray-300 border border-[#232330] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  {data.totalChapter} Chapter
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-['Plus_Jakarta_Sans']">
                {data.title}
              </h1>

              {data.altTitle && (
                <p className="text-xs text-gray-400 font-medium">
                  {data.altTitle}
                </p>
              )}
            </div>

            {/* Action Buttons: Continue reading, Start reading, Bookmark */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {progress ? (
                <button
                  onClick={() => handleSelectChapter(progress.chapterSlug)}
                  className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#8B5CF6]/30 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Lanjut {progress.chapterTitle}</span>
                </button>
              ) : firstChapter ? (
                <button
                  onClick={() => handleSelectChapter(firstChapter.slug)}
                  className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#8B5CF6]/30 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mulai Baca (Ch. 1)</span>
                </button>
              ) : null}

              <button
                onClick={handleToggleBookmark}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                  bookmarked
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                    : 'bg-[#0B0B0F] border-[#232330] text-gray-300 hover:text-white hover:bg-[#1E1E2A]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current text-[#8B5CF6]' : ''}`} />
                <span>{bookmarked ? 'Tersimpan di Bookmark' : 'Tambah ke Bookmark'}</span>
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#232330]/80 text-xs">
              <div>
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Penulis / Author
                </span>
                <p className="text-gray-200 font-semibold mt-0.5 truncate">
                  {data.author || 'Informasi belum tersedia'}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Ilustrator / Studio
                </span>
                <p className="text-gray-200 font-semibold mt-0.5 truncate">
                  {data.illustrator || data.author || 'Informasi belum tersedia'}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Tipe / Format
                </span>
                <p className="text-gray-200 font-semibold mt-0.5 truncate">
                  {data.type || 'Webtoon Manhwa'}
                </p>
              </div>
            </div>

            {/* Genres */}
            {data.genres && data.genres.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Genre:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() =>
                        onNavigate(
                          withSourceParam(`/explore?genre=${encodeURIComponent(genre)}`, comicSrc)
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#0B0B0F] hover:bg-[#8B5CF6] border border-[#232330] hover:border-[#8B5CF6] text-[11px] font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Synopsis Area */}
        <div className="mt-6 pt-5 border-t border-[#232330] space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Sinopsis Cerita
          </h3>
          <p
            className={`text-xs sm:text-sm text-gray-300 leading-relaxed ${
              isSynopsisExpanded ? '' : 'line-clamp-3 sm:line-clamp-4'
            }`}
          >
            {data.synopsis}
          </p>
          {data.synopsis && data.synopsis.length > 200 && (
            <button
              onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
              className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{isSynopsisExpanded ? 'Sembunyikan sinopsis' : 'Baca selengkapnya'}</span>
              {isSynopsisExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </section>

      {/* Chapters Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-[#232330]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              Daftar Chapter
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-mono font-semibold">
            {data.chapters.length} chapter tersedia
          </span>
        </div>

        <ChapterList
          chapters={data.chapters}
          mangaSlug={data.slug}
          onSelectChapter={handleSelectChapter}
          currentReadingChapter={progress?.chapterSlug}
        />
      </section>
    </div>
  );
};

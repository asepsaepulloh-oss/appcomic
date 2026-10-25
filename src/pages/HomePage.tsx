import React, { useState, useEffect, useCallback } from 'react';
import { MangaGrid } from '../components/MangaGrid.tsx';
import { ContinueReading } from '../components/ContinueReading.tsx';
import { SourceSelector } from '../components/SourceSelector.tsx';
import type { HomeData, ReadingProgress, ComicSource, MangaCard } from '@/types/manga.ts';
import { fetchHomeData, getImageProxyUrl } from '@/lib/api.ts';
import { getAllReadingProgress } from '@/lib/reading-progress.ts';
import { withSourceParam } from '@/lib/source.ts';
import {
  Flame,
  Clock,
  Trophy,
  BookOpen,
  Star,
  Sparkles,
  Layers,
  Palette,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface HomePageProps {
  currentSource: ComicSource;
  onSelectSource: (source: ComicSource) => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentSource,
  onSelectSource,
  onNavigate,
}) => {
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingList, setReadingList] = useState<ReadingProgress[]>([]);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [populerFilter, setPopulerFilter] = useState<'semua' | 'manhwa' | 'manga' | 'manhua'>('semua');

  const loadHome = useCallback(async (src: ComicSource) => {
    setIsLoading(true);
    setError(null);
    try {
      const homeData = await fetchHomeData(src);
      setData(homeData);
      setActiveHeroIdx(0);
    } catch (err: any) {
      setError(err.message || 'Koneksi ke server API gagal');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHome(currentSource);
    setReadingList(getAllReadingProgress());
  }, [currentSource, loadHome]);

  // Cycle hero banner every 7s if multiple featured
  useEffect(() => {
    if (!data?.featured || data.featured.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % data.featured.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [data?.featured]);

  const heroItem = data?.featured?.[activeHeroIdx] || data?.trending?.[0];

  const handleSelectComic = (slug: string) => {
    onNavigate(withSourceParam(`/manga/${slug}`, currentSource));
  };

  // Filtered popular list for Komiku
  const getFilteredKomikuPopuler = (): MangaCard[] => {
    if (!data?.komikuSections) return data?.popular || [];
    const sec = data.komikuSections;
    if (populerFilter === 'manga') return sec.populerManga || [];
    if (populerFilter === 'manhwa') return sec.populerManhwa || [];
    if (populerFilter === 'manhua') return sec.populerManhua || [];
    return sec.populer || data.popular || [];
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Source Selection Header Card */}
      <section className="pt-1">
        <SourceSelector
          currentSource={currentSource}
          onSelectSource={onSelectSource}
          variant="full"
        />
      </section>

      {/* Error State Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Gagal Memuat Sumber {currentSource === 'komiku' ? 'Komiku' : 'Louiv API'}</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => loadHome(currentSource)}
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 shadow-md shadow-[#8B5CF6]/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Hero Banner Section */}
      {heroItem ? (
        <section className="relative w-full rounded-2xl overflow-hidden bg-[#15151D] border border-[#232330] shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-end">
          {/* Background Poster Image */}
          <div className="absolute inset-0">
            <img
              src={getImageProxyUrl(heroItem.thumb, currentSource)}
              alt={heroItem.title}
              className="w-full h-full object-cover object-top opacity-35 filter blur-[1px] scale-105 transition-all duration-700"
            />
            {/* Rich multi-layer gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F] via-[#0B0B0F]/60 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-5 sm:p-8 lg:p-10 max-w-2xl space-y-3.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md ${
                  currentSource === 'komiku' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-[#8B5CF6] shadow-[#8B5CF6]/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {currentSource === 'komiku' ? 'Rekomendasi Komiku' : 'Manhwa Unggulan'}
              </span>
              {heroItem.type && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-black/60 text-gray-200 border border-white/20">
                  {heroItem.type}
                </span>
              )}
              {heroItem.rating && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black/60 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                  {heroItem.rating}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-['Plus_Jakarta_Sans']">
              {heroItem.title}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed">
              Jelajahi kisah epik {heroItem.title}. Baca chapter terbaru dengan kualitas visual definisi tinggi dan pengalaman reader tanpa jeda di iComic ({currentSource === 'komiku' ? 'Komiku Indonesia' : 'Louiv API'}).
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleSelectComic(heroItem.slug)}
                className={`px-5 py-2.5 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer ${
                  currentSource === 'komiku'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'
                    : 'bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[#8B5CF6]/30'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Baca Sekarang</span>
              </button>

              <button
                onClick={() => onNavigate(withSourceParam('/explore', currentSource))}
                className="px-4 py-2.5 bg-[#15151D]/80 hover:bg-[#232330] border border-[#232330] text-gray-200 text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-sm transition-colors cursor-pointer"
              >
                Katalog Lengkap
              </button>
            </div>
          </div>

          {/* Dots Indicator for multiple featured */}
          {data?.featured && data.featured.length > 1 && (
            <div className="absolute bottom-4 right-5 z-20 hidden sm:flex items-center gap-1.5">
              {data.featured.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHeroIdx(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeHeroIdx === idx
                      ? currentSource === 'komiku' ? 'w-6 bg-emerald-500' : 'w-6 bg-[#8B5CF6]'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Continue Reading Shelf */}
      <ContinueReading
        progressList={readingList}
        onContinue={(chapSlug, mangaSlug) =>
          onNavigate(withSourceParam(`/read/${chapSlug}?manga=${encodeURIComponent(mangaSlug || '')}`, currentSource))
        }
        onRefresh={() => setReadingList(getAllReadingProgress())}
        onViewDashboard={() => onNavigate('/dashboard')}
      />

      {/* Genre Explorer Pills */}
      {data?.genres && data.genres.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#232330]">
            <Layers className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
              Kategori & Genre
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.genres.map((genre) => (
              <button
                key={genre}
                onClick={() => onNavigate(withSourceParam(`/explore?genre=${encodeURIComponent(genre)}`, currentSource))}
                className="px-3.5 py-1.5 rounded-xl bg-[#15151D] hover:bg-[#8B5CF6] text-xs font-medium text-gray-300 hover:text-white border border-[#232330] hover:border-[#8B5CF6] transition-all cursor-pointer shadow-xs"
              >
                {genre}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ================= KOMIKU SPECIFIC CATALOG GRIDS ================= */}
      {currentSource === 'komiku' ? (
        <>
          {/* Komiku: Populer with Filter Pills (Semua, Manga, Manhwa, Manhua) */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#232330]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Komik Populer (Komiku)
                </h2>
              </div>

              {/* Sub-filters for Populer */}
              <div className="flex items-center gap-1.5 p-1 bg-[#15151D] border border-[#232330] rounded-xl self-start sm:self-auto">
                {(['semua', 'manhwa', 'manga', 'manhua'] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setPopulerFilter(sub)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      populerFilter === sub
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-[#1E1E2A]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <MangaGrid
              title=""
              manga={getFilteredKomikuPopuler()}
              isLoading={isLoading}
              onSelect={handleSelectComic}
              onViewAll={() => onNavigate(withSourceParam('/explore', 'komiku'))}
              onRetry={() => loadHome('komiku')}
            />
          </section>

          {/* Komiku: Rekomendasi Grid */}
          <MangaGrid
            title="Rekomendasi Komiku"
            icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
            manga={data?.komikuSections?.rekomendasi || []}
            isLoading={isLoading}
            onSelect={handleSelectComic}
            onViewAll={() => onNavigate(withSourceParam('/explore', 'komiku'))}
            onRetry={() => loadHome('komiku')}
          />

          {/* Komiku: Update Terbaru */}
          <MangaGrid
            title="Update Terbaru (Komiku)"
            icon={<Clock className="w-5 h-5 text-emerald-400" />}
            manga={data?.latest || []}
            isLoading={isLoading}
            onSelect={handleSelectComic}
            onViewAll={() => onNavigate(withSourceParam('/explore', 'komiku'))}
            onRetry={() => loadHome('komiku')}
          />

          {/* Komiku: Komik Berwarna */}
          {data?.komikuSections?.berwarna && data.komikuSections.berwarna.length > 0 && (
            <MangaGrid
              title="Komik Berwarna (Full Color)"
              icon={<Palette className="w-5 h-5 text-pink-400" />}
              manga={data.komikuSections.berwarna}
              isLoading={isLoading}
              onSelect={handleSelectComic}
              onViewAll={() => onNavigate(withSourceParam('/explore', 'komiku'))}
              onRetry={() => loadHome('komiku')}
            />
          )}
        </>
      ) : (
        /* ================= LOUIV API CATALOG GRIDS ================= */
        <>
          {/* Trending Manhwa */}
          <MangaGrid
            title="Trending Manhwa (Louiv API)"
            icon={<Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />}
            manga={data?.trending || []}
            isLoading={isLoading}
            onSelect={handleSelectComic}
            onViewAll={() => onNavigate(withSourceParam('/explore', 'louiv'))}
            onRetry={() => loadHome('louiv')}
          />

          {/* Latest Updates */}
          <MangaGrid
            title="Update Terbaru"
            icon={<Clock className="w-5 h-5 text-[#8B5CF6]" />}
            manga={data?.latest || []}
            isLoading={isLoading}
            onSelect={handleSelectComic}
            onViewAll={() => onNavigate(withSourceParam('/explore', 'louiv'))}
            onRetry={() => loadHome('louiv')}
          />

          {/* Popular Manhwa */}
          <MangaGrid
            title="Populer Sepanjang Masa"
            icon={<Trophy className="w-5 h-5 text-yellow-400" />}
            manga={data?.popular || []}
            isLoading={isLoading}
            onSelect={handleSelectComic}
            onViewAll={() => onNavigate(withSourceParam('/explore', 'louiv'))}
            onRetry={() => loadHome('louiv')}
          />
        </>
      )}
    </div>
  );
};

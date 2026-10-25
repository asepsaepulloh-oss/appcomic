import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchBar } from '../components/SearchBar.tsx';
import { MangaGrid } from '../components/MangaGrid.tsx';
import { SourceSelector } from '../components/SourceSelector.tsx';
import type { MangaCard, ComicSource } from '@/types/manga.ts';
import { searchManga, getLatestManga, toMangaCard } from '@/lib/api.ts';
import {
  searchKomikuManga,
  getKomikuPustaka,
  getKomikuGenreManga,
} from '@/lib/komiku.ts';
import { withSourceParam } from '@/lib/source.ts';
import { Compass, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface ExplorePageProps {
  initialQuery?: string;
  initialGenre?: string;
  currentSource: ComicSource;
  onSelectSource: (source: ComicSource) => void;
  onNavigate: (path: string) => void;
}

const GENRES = [
  'Semua',
  'Action',
  'Fantasy',
  'Drama',
  'Martial Arts',
  'School Life',
  'Comedy',
  'Supernatural',
  'Romance',
  'Adventure',
  'Mystery',
  'Shounen',
  'Isekai',
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  initialQuery = '',
  initialGenre = '',
  currentSource,
  onSelectSource,
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre || 'Semua');
  const [page, setPage] = useState(1);
  const [mangaList, setMangaList] = useState<MangaCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCatalog = useCallback(
    async (searchQuery: string, pageNum: number, genre: string, src: ComicSource) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const cleanQ = searchQuery.trim();

        if (src === 'komiku') {
          if (cleanQ) {
            const res = await searchKomikuManga(cleanQ, pageNum);
            setMangaList(res.cards);
            setHasNextPage(res.hasNextPage);
          } else if (genre && genre !== 'Semua') {
            const res = await getKomikuGenreManga(genre.toLowerCase(), pageNum);
            setMangaList(res.cards);
            setHasNextPage(res.hasNextPage);
          } else {
            const res = await getKomikuPustaka(pageNum);
            setMangaList(res.cards);
            setHasNextPage(res.hasNextPage);
          }
        } else {
          // Louiv API source
          let res;
          if (cleanQ) {
            res = await searchManga(cleanQ, pageNum, controller.signal, 'louiv');
          } else if (genre && genre !== 'Semua') {
            res = await searchManga(genre, pageNum, controller.signal, 'louiv');
          } else {
            res = await getLatestManga(pageNum);
          }

          const mangas = (res.data?.mangas || []).map((m) => toMangaCard(m, undefined, 'louiv'));
          setMangaList(mangas);
          setHasNextPage(Boolean(res.data?.hasNextPage));
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Gagal mengambil data katalog');
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Trigger search on query/page/genre/source change
  useEffect(() => {
    fetchCatalog(query, page, selectedGenre, currentSource);
  }, [query, page, selectedGenre, currentSource, fetchCatalog]);

  const handleSearch = (newQ: string) => {
    setQuery(newQ);
    setPage(1);
    if (newQ) setSelectedGenre('Semua');
  };

  const handleGenreSelect = (g: string) => {
    setSelectedGenre(g);
    setPage(1);
    setQuery('');
  };

  const handleSelectComic = (slug: string) => {
    onNavigate(withSourceParam(`/manga/${slug}`, currentSource));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Source Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#232330]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <Compass className="w-7 h-7 text-[#8B5CF6]" />
            Jelajah Katalog Komik
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Cari dan filter ratusan judul komik favorit dari sumber{' '}
            <strong className={currentSource === 'komiku' ? 'text-emerald-400' : 'text-[#A78BFA]'}>
              {currentSource === 'komiku' ? 'Komiku Indonesia' : 'Louiv API'}
            </strong>
            .
          </p>
        </div>

        {/* Source Switcher Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <SourceSelector
            currentSource={currentSource}
            onSelectSource={onSelectSource}
            variant="compact"
          />
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-xl">
        <SearchBar
          initialValue={query}
          onSearch={handleSearch}
          placeholder={
            currentSource === 'komiku'
              ? 'Cari di Komiku (e.g. Reality Quest, Solo Swordmaster)...'
              : 'Cari di Louiv API (e.g. Lookism, Solo Leveling)...'
          }
        />
      </div>

      {/* Genre Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Filter className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Filter Genre:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreSelect(genre)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedGenre === genre
                  ? currentSource === 'komiku'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 border border-emerald-500'
                    : 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/25 border border-[#8B5CF6]'
                  : 'bg-[#15151D] text-gray-300 hover:text-white border border-[#232330] hover:border-[#8B5CF6]/50'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <MangaGrid
        title={
          query
            ? `Hasil pencarian "${query}" (${mangaList.length} judul)`
            : selectedGenre !== 'Semua'
              ? `Kategori Genre: ${selectedGenre}`
              : currentSource === 'komiku'
                ? 'Daftar Pustaka Komik'
                : 'Katalog Manga Terbaru'
        }
        manga={mangaList}
        isLoading={isLoading}
        error={error}
        onSelect={handleSelectComic}
        onRetry={() => fetchCatalog(query, page, selectedGenre, currentSource)}
      />

      {/* Pagination Controls */}
      {mangaList.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#232330]">
          <button
            onClick={() => {
              setPage((prev) => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page <= 1 || isLoading}
            className="px-4 py-2 bg-[#15151D] hover:bg-[#232330] border border-[#232330] rounded-xl text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 text-[#8B5CF6]" />
            <span>Halaman Sebelumnya</span>
          </button>

          <span className="px-3.5 py-1.5 bg-[#0B0B0F] border border-[#232330] rounded-xl text-xs font-mono font-bold text-gray-200">
            Halaman {page}
          </span>

          <button
            onClick={() => {
              setPage((prev) => prev + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={!hasNextPage || isLoading}
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#15151D] disabled:opacity-30 disabled:pointer-events-none rounded-xl text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#8B5CF6]/20"
          >
            <span>Halaman Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

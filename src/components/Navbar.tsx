import React, { useState } from 'react';
import { BookOpen, Compass, Bookmark, Search, Menu, X, ChevronRight, BarChart3 } from 'lucide-react';
import type { ComicSource } from '@/types/manga.ts';
import { SourceSelector } from './SourceSelector.tsx';

interface NavbarProps {
  currentPath: string;
  currentSource: ComicSource;
  onSelectSource: (source: ComicSource) => void;
  onNavigate: (path: string) => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  currentSource,
  onSelectSource,
  onNavigate,
  onOpenBookmarks,
  bookmarksCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onNavigate(`/explore?q=${encodeURIComponent(searchVal.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0F]/90 backdrop-blur-md border-b border-[#232330] transition-colors safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          aria-label="iComic Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1 font-['Plus_Jakarta_Sans']">
              i<span className="text-[#8B5CF6]">Comic</span>
            </span>
            <span className="text-[10px] text-gray-400 -mt-1 hidden sm:inline tracking-wider uppercase font-semibold">
              Manhwa Reader
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('/')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPath === '/'
                ? 'bg-[#15151D] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#15151D]/60'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onNavigate('/explore')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentPath.startsWith('/explore')
                ? 'bg-[#15151D] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#15151D]/60'
            }`}
          >
            <Compass className="w-4 h-4 text-[#8B5CF6]" />
            Explore
          </button>
          <button
            onClick={() => onNavigate('/dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentPath === '/dashboard'
                ? 'bg-[#15151D] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#15151D]/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
            Dashboard
          </button>
          <button
            onClick={onOpenBookmarks}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#15151D]/60 transition-colors flex items-center gap-1.5 relative"
            aria-label="Buka Bookmarks"
          >
            <Bookmark className="w-4 h-4 text-[#8B5CF6]" />
            Bookmark
            {bookmarksCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-[#8B5CF6] text-white rounded-full">
                {bookmarksCount}
              </span>
            )}
          </button>
        </nav>

        {/* Search Bar, Source Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Source Selector */}
          <div className="hidden lg:flex items-center">
            <SourceSelector
              currentSource={currentSource}
              onSelectSource={onSelectSource}
              variant="compact"
            />
          </div>

          <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={currentSource === 'komiku' ? 'Cari di Komiku...' : 'Cari di Louiv API...'}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-44 lg:w-56 pl-9 pr-4 py-1.5 bg-[#15151D] border border-[#232330] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            />
          </form>

          {/* Compact Source Selector for Medium Screens */}
          <div className="hidden sm:flex lg:hidden items-center">
            <SourceSelector
              currentSource={currentSource}
              onSelectSource={onSelectSource}
              variant="compact"
            />
          </div>

          {/* Mobile Source Switcher Pill */}
          <div className="sm:hidden flex items-center">
            <SourceSelector
              currentSource={currentSource}
              onSelectSource={onSelectSource}
              variant="compact"
            />
          </div>

          {/* Quick Explore Icon on mobile */}
          <button
            onClick={() => onNavigate('/explore')}
            className="p-2 sm:hidden rounded-lg bg-[#15151D] text-gray-300 hover:text-white border border-[#232330]"
            aria-label="Cari dan Jelajah"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Bookmarks Icon on Mobile */}
          <button
            onClick={onOpenBookmarks}
            className="p-2 sm:hidden rounded-lg bg-[#15151D] text-gray-300 hover:text-white border border-[#232330] relative"
            aria-label="Bookmarks Mobile"
          >
            <Bookmark className="w-4 h-4 text-[#8B5CF6]" />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-[#8B5CF6] text-white rounded-full flex items-center justify-center font-bold">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden rounded-lg bg-[#15151D] text-gray-300 hover:text-white border border-[#232330]"
            aria-label="Menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#232330] bg-[#0E0E14] px-4 py-4 space-y-3 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari judul manhwa..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#15151D] border border-[#232330] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </form>

          {/* Mobile Source Selector Section */}
          <div className="pt-1 pb-2">
            <SourceSelector
              currentSource={currentSource}
              onSelectSource={(src) => {
                onSelectSource(src);
                setMobileMenuOpen(false);
              }}
              variant="full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                onNavigate('/');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#15151D]"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8B5CF6]" />
                Beranda
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            <button
              onClick={() => {
                onNavigate('/explore');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#15151D]"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#8B5CF6]" />
                Jelajah Katalog (Explore)
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            <button
              onClick={() => {
                onNavigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#15151D]"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
                Dashboard & Statistik
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            <button
              onClick={() => {
                onOpenBookmarks();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#15151D]"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#8B5CF6]" />
                Tersimpan (Bookmarks)
              </span>
              <span className="text-xs bg-[#8B5CF6] text-white px-2 py-0.5 rounded-full font-bold">
                {bookmarksCount}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

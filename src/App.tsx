import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ExplorePage } from './pages/ExplorePage.tsx';
import { DetailPage } from './pages/DetailPage.tsx';
import { Reader } from './components/Reader.tsx';
import { BookmarksModal } from './components/BookmarksModal.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { getBookmarks } from '@/lib/reading-progress.ts';
import { getCurrentSource, setActiveSource, withSourceParam } from '@/lib/source.ts';
import type { BookmarkItem, ComicSource } from '@/types/manga.ts';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
  );
  const [bookmarksModalOpen, setBookmarksModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Route matching
  const pathname = currentPath.split('?')[0];
  const searchParams = new URLSearchParams(currentPath.includes('?') ? currentPath.split('?')[1] : '');
  const urlSource = (searchParams.get('source') as ComicSource | null);

  // Source state initialized from URL or localStorage
  const [currentSource, setCurrentSource] = useState<ComicSource>(() => {
    if (urlSource === 'louiv' || urlSource === 'komiku') {
      return urlSource;
    }
    return getCurrentSource();
  });

  // Sync state if URL changes with a specific source parameter
  useEffect(() => {
    if (urlSource && (urlSource === 'louiv' || urlSource === 'komiku') && urlSource !== currentSource) {
      setActiveSource(urlSource);
      setCurrentSource(urlSource);
    }
  }, [urlSource, currentSource]);

  // Sync bookmarks from storage
  const refreshBookmarks = () => {
    setBookmarks(getBookmarks());
  };

  useEffect(() => {
    refreshBookmarks();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
      refreshBookmarks();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo({ top: 0, behavior: 'instant' });
      refreshBookmarks();
    }
  };

  const handleSelectSource = (newSource: ComicSource) => {
    setActiveSource(newSource);
    setCurrentSource(newSource);

    // If on home, explore, or detail, preserve route but update source parameter
    if (pathname === '/' || pathname === '/explore') {
      const sp = new URLSearchParams(searchParams);
      sp.set('source', newSource);
      navigate(`${pathname}?${sp.toString()}`);
    } else {
      // If switching source from reader, detail, or dashboard, navigate to home with the newly selected source
      navigate(`/?source=${newSource}`);
    }
  };

  // Detect route type
  const isReaderRoute = pathname.startsWith('/read/');
  const chapterSlug = isReaderRoute ? pathname.replace('/read/', '') : null;

  const isMangaRoute = pathname.startsWith('/manga/');
  const mangaSlug = isMangaRoute ? pathname.replace('/manga/', '') : null;

  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard');
  const isExploreRoute = pathname === '/explore' || pathname.startsWith('/explore');

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#F3F4F6] flex flex-col font-['Plus_Jakarta_Sans'] antialiased">
      {/* Show standard Navbar only when not in full-screen reader */}
      {!isReaderRoute && (
        <Navbar
          currentPath={pathname}
          currentSource={currentSource}
          onSelectSource={handleSelectSource}
          onNavigate={navigate}
          onOpenBookmarks={() => setBookmarksModalOpen(true)}
          bookmarksCount={bookmarks.length}
        />
      )}

      {/* Main Page View Container */}
      <div className={`flex-1 ${!isReaderRoute ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6' : 'w-full'}`}>
        {isReaderRoute && chapterSlug ? (
          <Reader
            chapterSlug={chapterSlug}
            mangaSlugHint={searchParams.get('manga') || undefined}
            sourceHint={urlSource || currentSource}
            onNavigate={navigate}
          />
        ) : isMangaRoute && mangaSlug ? (
          <DetailPage
            slug={mangaSlug}
            sourceHint={urlSource || currentSource}
            onNavigate={navigate}
          />
        ) : isDashboardRoute ? (
          <Dashboard onNavigate={navigate} onOpenBookmarks={() => setBookmarksModalOpen(true)} />
        ) : isExploreRoute ? (
          <ExplorePage
            initialQuery={searchParams.get('q') || ''}
            initialGenre={searchParams.get('genre') || ''}
            currentSource={currentSource}
            onSelectSource={handleSelectSource}
            onNavigate={navigate}
          />
        ) : (
          <HomePage
            currentSource={currentSource}
            onSelectSource={handleSelectSource}
            onNavigate={navigate}
          />
        )}
      </div>

      {/* Show standard Footer only when not in reader */}
      {!isReaderRoute && <Footer onNavigate={navigate} />}

      {/* Global Bookmarks Modal */}
      <BookmarksModal
        isOpen={bookmarksModalOpen}
        onClose={() => setBookmarksModalOpen(false)}
        bookmarks={bookmarks}
        onSelectManga={(slug, source) => navigate(withSourceParam(`/manga/${slug}`, source || currentSource))}
        onRefresh={refreshBookmarks}
      />
    </div>
  );
}

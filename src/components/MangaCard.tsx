import React, { useState } from 'react';
import { Star, BookOpen, Flame } from 'lucide-react';
import type { MangaCard as MangaCardType } from '@/types/manga.ts';
import { getImageProxyUrl } from '@/lib/api.ts';

interface MangaCardProps {
  manga: MangaCardType;
  onClick: (slug: string) => void;
}

export const MangaCard: React.FC<MangaCardProps> = ({ manga, onClick }) => {
  const [imgError, setImgError] = useState(false);

  // Use image proxy if source is protected, or fallback to placeholder
  const rawThumb = manga.thumb || '/og-image.png';
  const displayThumb = imgError || !rawThumb
    ? `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`
    : getImageProxyUrl(rawThumb, manga.source);

  return (
    <article
      onClick={() => onClick(manga.slug)}
      className="group relative flex flex-col bg-[#15151D] rounded-xl overflow-hidden border border-[#232330] hover:border-[#8B5CF6]/60 transition-all duration-300 hover:shadow-xl hover:shadow-[#8B5CF6]/10 cursor-pointer transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-[#8B5CF6]"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(manga.slug);
        }
      }}
      aria-label={`Buka detail manhwa ${manga.title}`}
    >
      {/* Aspect Ratio 3:4 Manga Poster */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-[#1E1E2A]">
        <img
          src={displayThumb}
          alt={`Sampul ${manga.title}`}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay for bottom text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#15151D] via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none gap-1">
          <div className="flex items-center gap-1">
            {manga.source === 'komiku' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/80 text-white shadow-sm backdrop-blur-sm">
                Komiku
              </span>
            ) : null}
            {manga.badge === 'HOT' ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600/90 text-white shadow-md backdrop-blur-sm">
                <Flame className="w-3 h-3 fill-current text-white" />
                HOT
              </span>
            ) : manga.type ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0B0B0F]/80 text-[#8B5CF6] border border-[#8B5CF6]/30 backdrop-blur-sm">
                {manga.type}
              </span>
            ) : null}
          </div>

          {manga.rating && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-black/75 text-amber-300 backdrop-blur-sm border border-amber-500/20">
              <Star className="w-3 h-3 fill-current text-amber-400" />
              {manga.rating}
            </span>
          )}
        </div>

        {/* Latest Chapter Chip at Bottom of Poster */}
        {manga.chapter && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-[#0B0B0F]/85 text-gray-200 border border-white/10 backdrop-blur-md truncate max-w-full">
              <BookOpen className="w-3 h-3 text-[#8B5CF6] shrink-0" />
              <span className="truncate">{manga.chapter}</span>
            </span>
          </div>
        )}
      </div>

      {/* Title & Metadata */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-1">
        <h3
          title={manga.title}
          className="font-semibold text-sm text-gray-100 group-hover:text-[#8B5CF6] transition-colors line-clamp-2 leading-snug"
        >
          {manga.title}
        </h3>
        <p className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
          <span className={manga.source === 'komiku' ? 'text-emerald-400 font-medium' : 'text-gray-400'}>
            {manga.source === 'komiku' ? 'Komiku' : 'Louiv API'}
          </span>
          <span className="text-[#8B5CF6] font-medium group-hover:translate-x-0.5 transition-transform">
            Baca &rarr;
          </span>
        </p>
      </div>
    </article>
  );
};

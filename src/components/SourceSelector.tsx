import React from 'react';
import { Zap, BookOpen, Layers } from 'lucide-react';
import type { ComicSource } from '@/types/manga.ts';
import { SOURCE_METADATA } from '@/lib/source.ts';

interface SourceSelectorProps {
  currentSource: ComicSource;
  onSelectSource: (source: ComicSource) => void;
  variant?: 'compact' | 'full';
  className?: string;
}

export const SourceSelector: React.FC<SourceSelectorProps> = ({
  currentSource,
  onSelectSource,
  variant = 'compact',
  className = '',
}) => {
  const sources: ComicSource[] = ['louiv', 'komiku'];

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center p-1 bg-[#15151D] border border-[#232330] rounded-xl shadow-inner ${className}`}
        role="group"
        aria-label="Pilih Sumber Komik"
      >
        {sources.map((src) => {
          const isActive = currentSource === src;
          const meta = SOURCE_METADATA[src];

          return (
            <button
              key={src}
              type="button"
              onClick={() => onSelectSource(src)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? src === 'komiku'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-[#8B5CF6]/25'
                  : 'text-gray-400 hover:text-white hover:bg-[#1E1E2A]'
              }`}
              title={meta.description}
              aria-pressed={isActive}
            >
              {src === 'louiv' ? (
                <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300 fill-current' : 'text-gray-400'}`} />
              ) : (
                <BookOpen className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
              )}
              <span>{meta.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Full / Expanded Banner Card variant
  return (
    <div className={`w-full bg-[#15151D] border border-[#232330] rounded-2xl p-3 sm:p-4 shadow-xl ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#232330]/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8B5CF6]" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Pilih Sumber Komik (Source API)
          </span>
        </div>
        <span className="text-[11px] text-gray-500">
          Aktif: <strong className={currentSource === 'komiku' ? 'text-emerald-400' : 'text-[#A78BFA]'}>{SOURCE_METADATA[currentSource].name}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sources.map((src) => {
          const isActive = currentSource === src;
          const meta = SOURCE_METADATA[src];

          return (
            <button
              key={src}
              type="button"
              onClick={() => onSelectSource(src)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                isActive
                  ? src === 'komiku'
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/60 shadow-lg shadow-[#8B5CF6]/10'
                  : 'bg-[#0B0B0F]/70 border-[#232330] hover:border-gray-600 hover:bg-[#1A1A24]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-md ${
                  isActive
                    ? src === 'komiku'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#8B5CF6] text-white'
                    : 'bg-[#1E1E2A] text-gray-400'
                }`}
              >
                {src === 'louiv' ? <Zap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                    {meta.name}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      src === 'komiku'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-[#8B5CF6]/20 text-[#C4B5FD] border-[#8B5CF6]/30'
                    }`}
                  >
                    {meta.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 leading-snug">
                  {meta.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

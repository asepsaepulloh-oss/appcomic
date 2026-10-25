import React from 'react';
import { X, Maximize2, Minimize2, Eye, EyeOff, Keyboard, Layout, Sliders } from 'lucide-react';
import type { ReaderSettingsState } from '@/types/manga.ts';

interface ReaderSettingsProps {
  settings: ReaderSettingsState;
  onChange: (updated: Partial<ReaderSettingsState>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  settings,
  onChange,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const isFullscreen = typeof document !== 'undefined' && !!document.fullscreenElement;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#15151D] border border-[#232330] rounded-2xl p-5 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232330]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#8B5CF6]" />
            <h3 className="font-bold text-base text-white">Pengaturan Reader</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#232330] transition-colors"
            aria-label="Tutup pengaturan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Membaca */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-[#8B5CF6]" />
            Mode Membaca
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({ mode: 'vertical' })}
              className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                settings.mode === 'vertical'
                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/20'
                  : 'bg-[#0B0B0F] border-[#232330] text-gray-300 hover:border-[#8B5CF6]/50'
              }`}
            >
              Vertical Scroll (Webtoon)
            </button>
            <button
              onClick={() => onChange({ mode: 'single' })}
              className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                settings.mode === 'single'
                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/20'
                  : 'bg-[#0B0B0F] border-[#232330] text-gray-300 hover:border-[#8B5CF6]/50'
              }`}
            >
              Single Page (Per Halaman)
            </button>
          </div>
        </div>

        {/* Ukuran Gambar / Fit Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Ukuran Gambar
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({ fitMode: 'width' })}
              className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                settings.fitMode === 'width'
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                  : 'bg-[#0B0B0F] border-[#232330] text-gray-400 hover:text-white'
              }`}
            >
              Fit Width (Sesuai Lebar)
            </button>
            <button
              onClick={() => onChange({ fitMode: 'height' })}
              className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                settings.fitMode === 'height'
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white'
                  : 'bg-[#0B0B0F] border-[#232330] text-gray-400 hover:text-white'
              }`}
            >
              Fit Height (Sesuai Tinggi)
            </button>
          </div>
        </div>

        {/* Background Reader */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Warna Latar Reader
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'black', label: 'Hitam Pekat', hex: '#000000' },
              { id: 'dark', label: 'Dark Navy', hex: '#0B0B0F' },
              { id: 'navy', label: 'Charcoal', hex: '#15151D' },
            ].map(theme => (
              <button
                key={theme.id}
                onClick={() => onChange({ theme: theme.id as any })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === theme.id
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-white'
                    : 'border-[#232330] bg-[#0B0B0F] text-gray-400 hover:text-white'
                }`}
              >
                <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: theme.hex }} />
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gap Antargambar (in vertical mode) */}
        {settings.mode === 'vertical' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-400 uppercase tracking-wider">
                Jarak Antar Panel (Gap)
              </span>
              <span className="text-[#8B5CF6] font-mono font-bold">{settings.gap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="4"
              value={settings.gap}
              onChange={(e) => onChange({ gap: parseInt(e.target.value, 10) })}
              className="w-full accent-[#8B5CF6] cursor-pointer"
            />
          </div>
        )}

        {/* Toggles */}
        <div className="pt-2 border-t border-[#232330] space-y-2.5">
          {/* Keyboard shortcut toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Keyboard className="w-4 h-4 text-[#8B5CF6]" />
              <span>Navigasi Keyboard (Panah &larr; &rarr;)</span>
            </div>
            <button
              onClick={() => onChange({ keyboardNav: !settings.keyboardNav })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.keyboardNav ? 'bg-[#8B5CF6]' : 'bg-[#232330]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.keyboardNav ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Header visibility toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {settings.showHeader ? <Eye className="w-4 h-4 text-[#8B5CF6]" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
              <span>Tampilkan Header Reader</span>
            </div>
            <button
              onClick={() => onChange({ showHeader: !settings.showHeader })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.showHeader ? 'bg-[#8B5CF6]' : 'bg-[#232330]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.showHeader ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-full mt-2 py-2 px-3 bg-[#0B0B0F] hover:bg-[#1E1E2A] border border-[#232330] rounded-xl text-xs font-semibold text-gray-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#8B5CF6]" /> : <Maximize2 className="w-4 h-4 text-[#8B5CF6]" />}
            <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Fullscreen)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

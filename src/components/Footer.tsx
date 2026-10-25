import React from 'react';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#0E0E14] border-t border-[#232330] mt-16 text-gray-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand */}
        <div className="space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-md shadow-[#8B5CF6]/20">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white font-['Plus_Jakarta_Sans']">
              i<span className="text-[#8B5CF6]">Comic</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 max-w-sm">
            Your World of Stories — Platform manhwa reader modern dengan katalog lengkap, pembacaan cepat, dan tampilan elegan.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-400">
          <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer">
            Beranda
          </button>
          <button onClick={() => onNavigate('/explore')} className="hover:text-white transition-colors cursor-pointer">
            Jelajah Manhwa
          </button>
          <button onClick={() => onNavigate('/explore?genre=Action')} className="hover:text-white transition-colors cursor-pointer">
            Aksi
          </button>
          <button onClick={() => onNavigate('/explore?genre=Fantasy')} className="hover:text-white transition-colors cursor-pointer">
            Fantasi
          </button>
        </div>

        {/* Disclaimer / Attribution */}
        <div className="text-xs text-gray-400 space-y-1">
          <p className="flex items-center justify-center md:justify-end gap-1 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Dibangun dengan cinta untuk komunitas pembaca</span>
            <Heart className="w-3 h-3 text-red-500 fill-current inline" />
          </p>
          <p className="text-[11px] text-gray-400">
            &copy; {new Date().getFullYear()} iComic Reader. Sumber data publik.
          </p>
        </div>
      </div>
    </footer>
  );
};

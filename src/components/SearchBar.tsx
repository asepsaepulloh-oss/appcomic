import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSearch: (value: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  placeholder = 'Cari berdasarkan judul (contoh: Lookism, Reality Quest, Nano Machine)...',
  onSearch,
  isLoading = false,
}) => {
  const [val, setVal] = useState(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  // Debounce typing search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (val !== initialValue) {
        onSearch(val.trim());
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [val, initialValue, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(val.trim());
  };

  const handleClear = () => {
    setVal('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={val}
          onChange={(e) => {
            const nextVal = e.target.value;
            setVal(nextVal);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-3.5 bg-[#15151D] border border-[#232330] rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 shadow-lg shadow-black/20 transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {isLoading ? (
            <div className="p-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6]" />
            </div>
          ) : val ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#232330] transition-colors"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
          >
            Cari
          </button>
        </div>
      </div>
    </form>
  );
};

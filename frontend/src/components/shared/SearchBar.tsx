"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  placeholder?: string;
  placeholderClass?: string;
  bgClass?: string;
  borderClass?: string;
  buttonBgClass?: string;
  buttonTextClass?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "¿Qué deseas buscar?",
  placeholderClass = "placeholder-zinc-500",
  bgClass = "bg-zinc-900/80 backdrop-blur-md",
  borderClass = "border-white/10 hover:border-white/20 focus-within:border-white/30",
  buttonBgClass = "bg-[#CCDD99] hover:bg-[#b8cc80]",
  buttonTextClass = "text-zinc-950 font-bold",
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={`w-full sm:w-96 h-11 flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-xl border transition-all duration-200 shadow-xs ${bgClass} ${borderClass} ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-transparent border-none outline-none text-xs sm:text-sm text-zinc-100 w-full pr-3 font-medium ${placeholderClass}`}
      />
      <button
        onClick={onSearch}
        type="button"
        className={`h-8 rounded-lg cursor-pointer flex items-center justify-center gap-2 px-3.5 transition-all active:scale-95 shrink-0 ${buttonBgClass} ${buttonTextClass}`}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs tracking-wide">Buscar</span>
      </button>
    </div>
  );
}
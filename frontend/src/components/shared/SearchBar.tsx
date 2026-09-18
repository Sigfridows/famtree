"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  placeholder?: string;
  placeholderClass?: string; // ej: "placeholder-zinc-300"
  bgClass?: string;          // ej: "bg-white/5 backdrop-blur-md"
  borderClass?: string;      // ej: "border-white/50"
  buttonBgClass?: string;    // ej: "bg-[#161616] hover:bg-[#CCD999]"
  buttonTextClass?: string;  // ej: "text-white hover:text-zinc-950"
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "¿Qué quieres encontrar?",
  placeholderClass = "placeholder-zinc-300",
  bgClass = "bg-white/5 backdrop-blur-md",
  borderClass = "border-white/50",
  buttonBgClass = "bg-[#161616] hover:bg-[#CCD999]",
  buttonTextClass = "text-white hover:text-zinc-950",
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={`w-full sm:w-110 h-11 flex items-center justify-between px-4 py-2 shadow-[#AEAEC0]/50 rounded-xl border ${bgClass} ${borderClass} ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-transparent border-none outline-none text-sm w-full pr-2 font-montserrat ${placeholderClass}`}
      />
      <button
        onClick={onSearch}
        type="button"
        className={`w-28 h-8 rounded-lg cursor-pointer flex items-center justify-center gap-2 px-3 transition-colors shrink-0 ${buttonBgClass} ${buttonTextClass}`}
      >
        <Search className="w-4 h-4" />
        <span className="text-xs font-montserrat font-bold">Buscar</span>
      </button>
    </div>
  );
}
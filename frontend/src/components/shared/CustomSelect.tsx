'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierra el menú flotante si el usuario hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Botón gatillo del selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-black rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 shadow-xs hover:bg-zinc-50 transition-all outline-none"
      >
        <span>{value || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-800 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* Menú flotante desplegable */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((option) => {
            const isSelected = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-left transition-colors ${
                  isSelected
                    ? 'bg-[#CCDD99]/40 text-zinc-950 font-bold'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <span>{option}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
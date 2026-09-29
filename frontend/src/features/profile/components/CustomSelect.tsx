"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface CustomSelectProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

export function CustomSelect({
  label,
  icon,
  value,
  options,
  onChange,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="space-y-1.5 relative font-montserrat">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
        {icon}
        <span>{label}</span>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white flex items-center justify-between shadow-inner hover:border-white/20 focus:border-[#CCD999] transition-all cursor-pointer text-left"
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-40 py-1.5 overflow-hidden backdrop-blur-xl"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-xs text-left font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                  value === opt
                    ? "bg-[#CCD999] text-zinc-950 font-bold"
                    : "text-zinc-300 hover:bg-white/10"
                }`}
              >
                <span>{opt}</span>
                {value === opt && <Check className="w-3.5 h-3.5 text-zinc-950" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
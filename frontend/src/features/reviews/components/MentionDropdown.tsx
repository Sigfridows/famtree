"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export interface Asilo {
  id: string;
  name: string;
  colorIndex: number;
}

interface MentionDropdownProps {
  asilos: Asilo[];
  badgePalette: string[];
  onSelectAsilo: (asilo: Asilo) => void;
}

const MentionDropdown = forwardRef<HTMLDivElement, MentionDropdownProps>(
  ({ asilos, badgePalette, onSelectAsilo }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        className="absolute bottom-full left-0 mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-zinc-200/80 p-2 z-50 space-y-1 overflow-hidden"
      >
        <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          <span>Seleccionar Asilo</span>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {asilos.map((asilo) => (
            <button
              key={asilo.id}
              onClick={() => onSelectAsilo(asilo)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <span>{asilo.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                  badgePalette[asilo.colorIndex]
                }`}
              >
                @{asilo.name}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }
);

MentionDropdown.displayName = "MentionDropdown";
export default MentionDropdown;
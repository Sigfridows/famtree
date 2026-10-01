"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

export interface Asilo {
  id: string;
  name: string;
}

interface MentionDropdownProps {
  asilos: Asilo[];
  onSelectAsilo: (asilo: Asilo) => void;
}

const MentionDropdown = forwardRef<HTMLDivElement, MentionDropdownProps>(
  ({ asilos, onSelectAsilo }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.12 }}
        className="absolute bottom-full left-0 mb-3 w-72 bg-[#181a1d]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-2 z-50 shadow-2xl space-y-1 overflow-hidden"
      >
        <div className="px-3 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider border-b border-white/5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCD999]" />
          <span>Residencias</span>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          {asilos.map((asilo) => (
            <button
              key={asilo.id}
              onClick={() => onSelectAsilo(asilo)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-normal text-zinc-200 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left group"
            >
              <span className="truncate">{asilo.name}</span>
              <span className="ml-2 text-[10px] text-zinc-500 group-hover:text-[#CCD999] transition-colors font-mono">
                @{asilo.name.split(" ")[0]}
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
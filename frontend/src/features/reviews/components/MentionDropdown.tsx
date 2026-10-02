"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

export interface Asilo {
  id: string;
  name: string;
}

export const ASILO_MENTION_COLORS = [
  { text: "text-sky-300", activeText: "text-sky-200", background: "bg-sky-400/10", border: "border-sky-400/30", dot: "bg-sky-300" },
  { text: "text-violet-300", activeText: "text-violet-200", background: "bg-violet-400/10", border: "border-violet-400/30", dot: "bg-violet-300" },
  { text: "text-rose-300", activeText: "text-rose-200", background: "bg-rose-400/10", border: "border-rose-400/30", dot: "bg-rose-300" },
  { text: "text-amber-300", activeText: "text-amber-200", background: "bg-amber-400/10", border: "border-amber-400/30", dot: "bg-amber-300" },
  { text: "text-emerald-300", activeText: "text-emerald-200", background: "bg-emerald-400/10", border: "border-emerald-400/30", dot: "bg-emerald-300" },
];

export function asiloMentionColor(asilo: Asilo, position = 0) {
  const stableValue = String(asilo.id || asilo.name)
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), position);
  return ASILO_MENTION_COLORS[stableValue % ASILO_MENTION_COLORS.length];
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
          {asilos.map((asilo, index) => {
            const color = asiloMentionColor(asilo, index);
            return (
            <button
              key={asilo.id}
              onClick={() => onSelectAsilo(asilo)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-normal ${color.text} hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left group`}
            >
              <span className="flex min-w-0 items-center gap-2 truncate">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color.dot}`} />
                <span className="truncate">{asilo.name}</span>
              </span>
              <span className={`ml-2 text-[10px] ${color.text} transition-colors font-mono`}>
                @{asilo.name.split(" ")[0]}
              </span>
            </button>
            );
          })}
        </div>
      </motion.div>
    );
  }
);

MentionDropdown.displayName = "MentionDropdown";
export default MentionDropdown;

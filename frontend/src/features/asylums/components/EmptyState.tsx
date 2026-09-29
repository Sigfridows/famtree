"use client";

import { LucideIcon, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export default function EmptyState({
  title = "No hay resultados disponibles",
  description = "No encontramos información registrada por el momento. Por favor, intenta de nuevo más tarde.",
  actionLabel,
  onAction,
  icon: Icon = Building2,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center p-10 max-w-md mx-auto my-12 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl shadow-xl"
    >
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-[#CCDD99] flex items-center justify-center shadow-md transform -rotate-3 hover:rotate-0 transition-transform duration-300 border border-zinc-800">
          <Icon className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#CCDD99] border-2 border-zinc-900 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
        </div>
      </div>

      <h3 className="text-base font-bold text-white tracking-tight font-montserrat mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-zinc-400 font-medium leading-relaxed font-montserrat max-w-xs mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="bg-[#CCDD99] text-zinc-950 hover:bg-[#b8cb83] text-xs font-bold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-sm active:scale-95 cursor-pointer font-montserrat"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
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
      className="flex flex-col items-center justify-center text-center p-10 max-w-md mx-auto my-12 bg-white/70 backdrop-blur-2xl border border-zinc-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
    >
      {/* Insignia de Icono Minimalista */}
      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[#161616] text-[#CCDD99] flex items-center justify-center shadow-md transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          <Icon className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#CCDD99] border-2 border-white flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
        </div>
      </div>

      {/* Contenido Textual */}
      <h3 className="text-base font-bold text-zinc-900 tracking-tight font-montserrat mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 font-medium leading-relaxed font-montserrat max-w-xs mb-6">
        {description}
      </p>

      {/* Botón opcional */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="bg-[#161616] text-white hover:bg-[#CCDD99] hover:text-zinc-950 text-xs font-bold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-sm active:scale-95 cursor-pointer font-montserrat"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
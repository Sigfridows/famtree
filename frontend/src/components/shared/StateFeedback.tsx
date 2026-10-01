"use client";

import { motion } from "framer-motion";
import { FolderSearch, AlertTriangle, RefreshCcw } from "lucide-react";

interface StateFeedbackProps {
  type: "empty" | "error";
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function StateFeedback({
  type,
  title,
  message,
  onRetry,
}: StateFeedbackProps) {
  const isError = type === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full flex flex-col items-center justify-center py-16 px-6 text-center my-6 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md"
    >
      {/* Icon Wrapper con brillo sutil */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border shadow-inner transition-colors ${
          isError
            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
            : "bg-zinc-800/60 text-zinc-400 border-white/10"
        }`}
      >
        {isError ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <FolderSearch className="w-5 h-5" />
        )}
      </div>

      <h3 className="font-semibold text-sm text-zinc-100 mb-1 tracking-tight">
        {title || (isError ? "Error de conexión" : "No hay elementos encontrados")}
      </h3>

      <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-normal mb-5">
        {message}
      </p>

      {isError && onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 bg-[#CCDD99] text-zinc-950 hover:bg-[#b8cc80] active:scale-95 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Intentar de nuevo</span>
        </button>
      )}
    </motion.div>
  );
}
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col items-center justify-center py-20 px-4 text-center my-6"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm border ${
          isError
            ? "bg-rose-50 text-rose-600 border-rose-200"
            : "bg-zinc-100 text-zinc-500 border-zinc-200"
        }`}
      >
        {isError ? (
          <AlertTriangle className="w-7 h-7" />
        ) : (
          <FolderSearch className="w-7 h-7" />
        )}
      </div>

      <h3 className="font-extrabold text-sm text-zinc-800 mb-1">
        {title || (isError ? "Error de conexión" : "No hay elementos")}
      </h3>

      <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-medium mb-5">
        {message}
      </p>

      {isError && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-[#161616] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all cursor-pointer shadow-md"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Intentar de nuevo</span>
        </button>
      )}
    </motion.div>
  );
}
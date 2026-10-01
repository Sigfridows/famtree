"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ThumbsUp,
  MoreHorizontal,
  Edit,
  AlertCircle,
  Calendar,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  likes: number;
  isLiked?: boolean;
  asiloId?: string;
  asiloName?: string;
}

interface ReviewCardProps {
  likePending?: boolean;
  review: Review;
  idx: number;
  activeMenuId: string | null;
  onToggleLike: (id: string) => void;
  onBadgeClick: (asiloId: string, e: React.MouseEvent) => void;
  onToggleMenu: (id: string) => void;
  onEdit?: (id: string) => void;
  onReport?: (id: string) => void;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "Reciente";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function ReviewCard({
  review,
  activeMenuId,
  onToggleLike,
  likePending = false,
  onBadgeClick,
  onToggleMenu,
  onEdit,
  onReport,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = review.text.length > 140;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative w-full bg-[#141517] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between space-y-4 group"
    >
      {/* Header: Autor, Fecha y Estrellas Desplegadas */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image
            src={review.avatar || "/placeholder-avatar.png"}
            alt={review.author}
            width={38}
            height={38}
            unoptimized
            className="w-9 h-9 rounded-full object-cover border border-white/10 bg-zinc-800 shrink-0"
          />
          <div>
            <h4 className="font-semibold text-xs text-zinc-100 leading-tight">
              {review.author}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-normal mt-0.5">
              <Calendar className="w-3 h-3 text-zinc-600" />
              <span>{formatDate(review.date)}</span>
            </div>
          </div>
        </div>

        {/* Estrellas Desplegadas */}
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(review.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-zinc-800 text-zinc-700"
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-xs text-zinc-200 ml-0.5">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Cuerpo del Comentario con Animación de Expansión */}
      <motion.div layout className="space-y-1.5 overflow-hidden">
        <motion.p
          layout
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`text-xs text-zinc-300 leading-relaxed font-normal ${
            !isExpanded ? "line-clamp-4" : ""
          }`}
        >
          {review.text}
        </motion.p>

        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-medium text-[#CCD999] hover:text-[#b8cb83] cursor-pointer flex items-center gap-1 transition-colors pt-0.5"
          >
            <span>{isExpanded ? "Ver menos" : "Ver más"}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeIn" }}
            >
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          </button>
        )}
      </motion.div>

      {/* Footer: Like, Badge y Opciones */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón de Like */}
          <button
            disabled={likePending}
            onClick={() => onToggleLike(review.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/3 hover:bg-white/5 border border-white/5 text-xs cursor-pointer transition-colors"
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 transition-colors ${
                review.isLiked
                  ? "fill-[#CCD999] text-[#CCD999]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            />
            <span
              className={
                review.isLiked
                  ? "text-[#CCD999] font-semibold"
                  : "text-zinc-400 font-normal"
              }
            >
              {review.likes}
            </span>
          </button>

          {/* Badge Minimalista de Asilo */}
          {review.asiloName && review.asiloId && (
            <button
              onClick={(e) => onBadgeClick(review.asiloId!, e)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-[#CCD999] text-[11px] font-medium transition-colors cursor-pointer group/btn"
            >
              <span>{review.asiloName}</span>
              <ArrowUpRight className="w-3 h-3 opacity-40 group-hover/btn:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Menú de Opciones */}
        <div className="relative">
          <button
            onClick={() => onToggleMenu(review.id)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {activeMenuId === review.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 bottom-full mb-2 w-32 bg-[#1b1d20] rounded-xl shadow-2xl border border-white/10 p-1 z-30 space-y-0.5"
              >
                {onEdit && (
                  <button
                    onClick={() => onEdit(review.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Editar</span>
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={() => onReport(review.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Reportar</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
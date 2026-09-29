"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, MoreHorizontal, Edit, AlertCircle, Calendar, ChevronDown, ChevronUp } from "lucide-react";

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
  colorIndex?: number;
}

interface ReviewCardProps {
  review: Review;
  idx: number;
  activeMenuId: string | null;
  badgePalette: string[];
  onToggleLike: (id: string) => void;
  onBadgeClick: (asiloId: string, e: React.MouseEvent) => void;
  onToggleMenu: (id: string) => void;
  onEdit?: (id: string) => void;
  onReport?: (id: string) => void;
}

export default function ReviewCard({
  review,
  idx,
  activeMenuId,
  badgePalette,
  onToggleLike,
  onBadgeClick,
  onToggleMenu,
  onEdit,
  onReport,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Consideramos texto largo si supera los ~140 caracteres
  const isLongText = review.text.length > 140;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.3, delay: idx * 0.05 },
        y: { duration: 0.3, delay: idx * 0.05 },
        layout: { duration: 0.25, ease: "easeInOut" }, // Transición suave sin resorte/rebote
      }}
      className="relative w-full bg-[#141414] rounded-2xl p-5 shadow-2xl border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between space-y-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Image
            src={review.avatar}
            alt={review.author}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-full object-cover shadow-md border border-white/10"
          />
          <h4 className="font-extrabold text-xs text-white leading-tight">
            {review.author}
          </h4>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
          {/* Badge de Calificación Suavizado */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(review.rating)
                      ? "fill-amber-300 text-amber-300"
                      : "text-zinc-700 fill-zinc-800"
                  }`}
                />
              ))}
            </div>
            <span className="font-extrabold text-[11px] text-amber-300">
              {review.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
            <Calendar className="w-3 h-3 text-zinc-500" />
            <span>{review.date}</span>
          </div>
        </div>
      </div>

      {/* Bloque de Texto con límite limpio y sin solapamiento */}
      <div className="space-y-1.5 overflow-hidden">
        <p
          className={`text-[11px] text-zinc-300 leading-relaxed font-medium italic transition-all duration-200 ${
            !isExpanded ? "line-clamp-3" : ""
          }`}
        >
          {review.text}
        </p>

        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-bold text-[#CCD999] hover:text-[#b8cb83] cursor-pointer flex items-center gap-1 transition-colors pt-0.5"
          >
            <span>{isExpanded ? "Ver menos" : "Ver más"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onToggleLike(review.id)}
            whileTap={{ scale: 0.85 }}
            className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <motion.div
              animate={{ scale: review.isLiked ? [1, 1.35, 1] : 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ThumbsUp
                className={`w-4 h-4 transition-colors ${
                  review.isLiked
                    ? "fill-[#CCD999] text-[#CCD999]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              />
            </motion.div>
            <span className={review.isLiked ? "text-[#CCD999] font-extrabold" : "text-zinc-400"}>
              {review.likes}
            </span>
          </motion.button>

          {review.asiloName && review.asiloId && (
            <button
              onClick={(e) => onBadgeClick(review.asiloId!, e)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                badgePalette[review.colorIndex ?? 0]
              }`}
            >
              @{review.asiloName}
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => onToggleMenu(review.id)}
            className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {activeMenuId === review.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 bottom-full mb-2 w-32 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 p-1.5 z-30 space-y-1"
              >
                <button
                  onClick={() => onEdit?.(review.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => onReport?.(review.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Reportar</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
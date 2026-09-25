"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, MoreHorizontal, Reply, AlertCircle, Calendar } from "lucide-react";

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
  onReply?: (id: string) => void;
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
  onReply,
  onReport,
}: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
      className="relative w-full bg-white rounded-xl p-5 shadow-md border border-zinc-200/60 flex flex-col justify-between space-y-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Image
            src={review.avatar}
            alt={review.author}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-full object-cover shadow-sm border border-zinc-100"
          />
          <h4 className="font-extrabold text-xs text-zinc-900 leading-tight">
            {review.author}
          </h4>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(review.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-200 fill-zinc-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-extrabold text-xs text-zinc-800 ml-1">
              {review.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1 justify-end text-[10px] text-zinc-400 mt-1 font-medium">
            <Calendar className="w-3 h-3 text-zinc-400" />
            <span>{review.date}</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-zinc-500 leading-relaxed font-medium italic line-clamp-4 text-ellipsis overflow-hidden">
        {review.text}
      </p>

      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
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
                    ? "fill-[#161616] text-[#161616]"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              />
            </motion.div>
            <span className={review.isLiked ? "text-zinc-900 font-extrabold" : "text-zinc-400"}>
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
            className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {activeMenuId === review.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 bottom-full mb-2 w-32 bg-white rounded-xl shadow-2xl border border-zinc-100 p-1.5 z-30 space-y-1"
              >
                <button
                  onClick={() => onReply?.(review.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  <Reply className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Responder</span>
                </button>
                <button
                  onClick={() => onReport?.(review.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
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
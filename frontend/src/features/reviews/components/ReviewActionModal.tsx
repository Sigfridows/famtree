"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  AlertCircle,
  X,
  Star,
  Loader2,
  Check,
  ChevronDown,
} from "lucide-react";
import { reviewService } from "@/services/reviewService";

export type ReportReason =
  | "SPAM"
  | "OFFENSIVE_LANGUAGE"
  | "FALSE_INFO"
  | "CONFLICT_OF_INTEREST"
  | "OTHER";

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface ActionState {
  mode: "edit" | "report";
  id: string;
  rating: number;
  comment: string;
}

interface ReviewActionModalProps {
  action: ActionState | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  onError?: (errorMessage: string) => void;
}

const REPORT_REASONS: Record<ReportReason, string> = {
  SPAM: "Spam o contenido publicitario",
  OFFENSIVE_LANGUAGE: "Lenguaje ofensivo o inapropiado",
  FALSE_INFO: "Información falsa o engañosa",
  CONFLICT_OF_INTEREST: "Conflicto de interés",
  OTHER: "Otro motivo",
};

export default function ReviewActionModal({
  action,
  onClose,
  onSuccess,
  onError,
}: ReviewActionModalProps) {
  const [rating, setRating] = useState<Rating>(5);
  const [comment, setComment] = useState<string>("");
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [detail, setDetail] = useState<string>("");
  const [isBusy, setIsBusy] = useState<boolean>(false);

  useEffect(() => {
  if (action) {
    queueMicrotask(() => {
      const validRating = Math.min(
        Math.max(Number(action.rating) || 5, 1),
        5
      ) as Rating;

      setRating(validRating);
      setComment(action.comment || "");
      setReason("SPAM");
      setDetail("");
    });
  }
}, [action]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!action) return;

    setIsBusy(true);
    try {
      if (action.mode === "edit") {
        await reviewService.updateReview(Number(action.id), {
          rating,
          comment,
        });
      } else {
        await reviewService.reportReview({
          reviewId: Number(action.id),
          reason,
          detail: detail || undefined,
        });
      }
      onClose();
      await onSuccess();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "No se pudo procesar la solicitud.";
      if (onError) onError(errorMsg);
    } finally {
      setIsBusy(false);
    }
  };

  const isEdit = action?.mode === "edit";

  return (
    <AnimatePresence>
      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          {/* Fondo oscuro para cerrar al hacer clic afuera */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#131417]/90 border border-white/10 rounded-2xl p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden"
          >
            {/* Resplandor superior sutil */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r ${
                isEdit
                  ? "from-transparent via-[#CCD999]/40 to-transparent"
                  : "from-transparent via-amber-400/40 to-transparent"
              }`}
            />

            {/* Encabezado */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    isEdit
                      ? "bg-[#CCD999]/10 border-[#CCD999]/20 text-[#CCD999]"
                      : "bg-amber-400/10 border-amber-400/20 text-amber-400"
                  }`}
                >
                  {isEdit ? (
                    <Edit3 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-100 tracking-wide">
                    {isEdit ? "Editar Reseña" : "Reportar Reseña"}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-normal">
                    {isEdit
                      ? "Modifica tu calificación y comentario"
                      : "Notifica a los moderadores sobre este contenido"}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Formulario */}
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              {isEdit ? (
                <>
                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Calificación
                    </label>
                    <div className="flex items-center gap-1.5 bg-zinc-900/60 p-2 rounded-xl border border-white/5 w-fit">
                      {([1, 2, 3, 4, 5] as const).map((star) => (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="cursor-pointer p-0.5 focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-all duration-200 ${
                              star <= rating
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                                : "fill-transparent text-zinc-700 hover:text-zinc-500"
                            }`}
                          />
                        </motion.button>
                      ))}
                      <span className="text-xs font-mono font-bold text-zinc-300 ml-2 pr-1">
                        {rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Textarea Comentario */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        Comentario
                      </label>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {comment.length}/500
                      </span>
                    </div>
                    <textarea
                      required
                      minLength={10}
                      maxLength={500}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="Escribe tu reseña aquí..."
                      className="w-full bg-zinc-900/60 border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#CCD999]/40 focus:border-[#CCD999]/40 transition-all resize-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Select Motivo */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Motivo del reporte
                    </label>
                    <div className="relative">
                      <select
                        value={reason}
                        onChange={(e) =>
                          setReason(e.target.value as ReportReason)
                        }
                        className="w-full appearance-none bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all cursor-pointer pr-9"
                      >
                        {Object.entries(REPORT_REASONS).map(([value, label]) => (
                          <option
                            key={value}
                            value={value}
                            className="bg-[#141517] text-zinc-200"
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Textarea Detalle Adicional */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        Detalles adicionales
                      </label>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {detail.length}/250
                      </span>
                    </div>
                    <textarea
                      maxLength={250}
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Añade contexto adicional sobre esta infracción..."
                      rows={3}
                      className="w-full bg-zinc-900/60 border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all resize-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
                    />
                  </div>
                </>
              )}

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isBusy}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 ${
                    isEdit
                      ? "bg-[#CCD999] hover:bg-[#b8cb83] text-zinc-950 shadow-[0_0_15px_rgba(204,217,153,0.15)]"
                      : "bg-amber-400 hover:bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                  }`}
                >
                  {isBusy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>{isEdit ? "Guardar cambios" : "Enviar reporte"}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Bold, Italic, Underline, AtSign, AlertCircle, X, Loader2, Building2 } from "lucide-react";
import ReviewText, { formatSelection, type ReviewFormat } from "./ReviewText";
import MentionDropdown, { Asilo, asiloMentionColor } from "./MentionDropdown";

const RATING_SUGGESTIONS: Record<number, string[]> = {
  1: ["Mala experiencia.", "No cumplió con mis expectativas.", "Necesita mejorar su atención."],
  2: ["Experiencia regular.", "La atención puede mejorar.", "Encontré varios aspectos por mejorar."],
  3: ["Experiencia aceptable.", "El servicio fue correcto.", "Tiene puntos buenos y otros por mejorar."],
  4: ["Muy buena experiencia.", "Recibí una atención de calidad.", "Estoy satisfecho con el servicio."],
  5: ["Excelente experiencia.", "Recibí una atención excepcional.", "Recomiendo esta residencia."],
};

interface ReviewComposerProps {
  asilos: Asilo[];
  userReviewedAsylumIds?: string[];
  initialAsilo?: Asilo | null; // 👈 Prop para recibir el asilo preseleccionado
  onSubmit: (
    text: string,
    rating: number,
    asilo: Asilo | null
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function ReviewComposer({
  asilos,
  userReviewedAsylumIds = [],
  initialAsilo = null, // 👈 Valor por defecto
  onSubmit,
}: ReviewComposerProps) {
  const [commentText, setCommentText] = useState("");
  // 👈 Inicializamos el estado con initialAsilo
  const [selectedAsilo, setSelectedAsilo] = useState<Asilo | null>(initialAsilo);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (initialAsilo) {
    queueMicrotask(() => {
      setSelectedAsilo(initialAsilo);
      if (userReviewedAsylumIds.includes(String(initialAsilo.id))) {
        setWarningMessage(
          `Ya has publicado una reseña para "${initialAsilo.name}". Solo se permite 1 reseña por residencia.`
        );
      }
    });
  }
}, [initialAsilo, userReviewedAsylumIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMentionDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyFormat = (format: ReviewFormat) => {
    const input = textareaRef.current;
    if (!input || isSubmitting) return;
    const { selectionStart, selectionEnd } = input;
    if (selectionStart === selectionEnd) {
      setWarningMessage("Selecciona la parte del texto que quieres formatear.");
      input.focus();
      return;
    }
    const next = formatSelection(commentText, selectionStart, selectionEnd, format);
    if (next.length > 500) {
      setWarningMessage("El texto y sus marcas de formato no pueden superar 500 caracteres.");
      return;
    }
    setCommentText(next);
    setWarningMessage(null);
    input.focus();
    const shift = (next.length - commentText.length) / 2;
    requestAnimationFrame(() => input.setSelectionRange(selectionStart + shift, selectionEnd + shift));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);

    if (warningMessage) setWarningMessage(null);
    setSelectedSuggestion(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    const lastWord = val.split(" ").pop() || "";
    setShowMentionDropdown(lastWord.startsWith("@"));
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    if (!commentText.trim() || selectedSuggestion === commentText) {
      setCommentText(RATING_SUGGESTIONS[rating][0]);
      setSelectedSuggestion(RATING_SUGGESTIONS[rating][0]);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setCommentText(suggestion);
    setSelectedSuggestion(suggestion);
    setWarningMessage(null);
  };

  const handleSelectAsilo = (asilo: Asilo) => {
    const asiloIdStr = String(asilo.id);

    if (userReviewedAsylumIds.includes(asiloIdStr)) {
      setWarningMessage(`Ya has publicado una reseña para "${asilo.name}". Solo se permite 1 reseña por residencia.`);
    } else if (warningMessage) {
      setWarningMessage(null);
    }

    setSelectedAsilo(asilo);
    setShowMentionDropdown(false);

    const words = commentText.split(" ");
    if (words[words.length - 1].startsWith("@")) {
      words.pop();
    }
    setCommentText(words.join(" "));
  };

  const handleSend = async () => {
    if (selectedRating === null) {
      setWarningMessage("Selecciona una calificación con estrellas para continuar.");
      return;
    }
    const reviewText = commentText.trim() || RATING_SUGGESTIONS[selectedRating][0];

    if (reviewText.length < 10) {
      setWarningMessage("La reseña debe tener al menos 10 caracteres.");
      return;
    }

    if (reviewText.length > 500) {
      setWarningMessage(
        `La reseña no puede superar 500 caracteres. Actualmente tiene ${reviewText.length}.`,
      );
      return;
    }

    if (!selectedAsilo) {
      setWarningMessage("Debes etiquetar o seleccionar una residencia usando '@' para publicar.");
      return;
    }

    if (userReviewedAsylumIds.includes(String(selectedAsilo.id))) {
      setWarningMessage(`Ya existe una reseña tuya para "${selectedAsilo.name}". Puedes editar la existente.`);
      return;
    }

    setWarningMessage(null);
    setIsSubmitting(true);

    try {
      const response = await onSubmit(reviewText, selectedRating, selectedAsilo);
      if (!response.success && response.error) {
        setWarningMessage(response.error);
      } else if (response.success) {
        setCommentText("");
        setSelectedRating(null);
        setSelectedSuggestion(null);
        setSelectedAsilo(null);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } catch {
      setWarningMessage("Ocurrió un error inesperado al procesar tu solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40">
      <div className="relative bg-[#16181b]/90 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/10 space-y-3">
        <AnimatePresence>
          {showMentionDropdown && (
            <MentionDropdown
              ref={mentionDropdownRef}
              asilos={asilos}
              onSelectAsilo={handleSelectAsilo}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {warningMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{warningMessage}</span>
              </div>
              <button
                onClick={() => setWarningMessage(null)}
                className="p-1 hover:bg-amber-500/20 rounded-lg text-amber-400 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedAsilo && (
          <div className="flex items-center gap-2 pb-1">
            <span className="text-[10px] text-zinc-400 font-medium">Etiquetado:</span>
            {(() => {
              const color = asiloMentionColor(selectedAsilo);
              return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg ${color.background} ${color.text} border ${color.border} text-[11px] font-semibold`}>
              <Building2 className={`w-3 h-3 ${color.text}`} />
              <span>{selectedAsilo.name}</span>
              <button
                onClick={() => {
                  setSelectedAsilo(null);
                  if (warningMessage) setWarningMessage(null);
                }}
                className="hover:text-white ml-1 font-bold cursor-pointer text-zinc-400"
              >
                ×
              </button>
            </span>;
            })()}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={commentText}
          onChange={handleTextChange}
          rows={1}
          disabled={isSubmitting}
          className="w-full text-xs text-zinc-100 bg-transparent resize-none focus:outline-none placeholder:text-zinc-500 leading-relaxed min-h-8 max-h-32 overflow-y-auto"
          placeholder="Escribe tu experiencia... Usa '@' para etiquetar un asilo"
        />
        {commentText && <div aria-label="Vista previa de la reseña" className="text-xs text-zinc-200 border-t border-white/5 pt-2"><ReviewText text={commentText} /></div>}
        <p className="text-[10px] text-zinc-500">Selecciona texto para aplicar formato. El límite incluye las marcas de formato.</p>
        <div className={`text-right text-[10px] ${commentText.length > 500 ? "text-rose-300" : "text-zinc-500"}`}>
          {commentText.length}/500 caracteres
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1 text-zinc-400">
            <button
              aria-label="Negrita"
              title="Selecciona texto para aplicar negrita"
              disabled={isSubmitting}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyFormat("bold")}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              aria-label="Cursiva"
              title="Selecciona texto para aplicar cursiva"
              disabled={isSubmitting}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyFormat("italic")}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              aria-label="Subrayado"
              title="Selecciona texto para aplicar subrayado"
              disabled={isSubmitting}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyFormat("underline")}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-0.5 ml-3 pl-3 border-l border-white/5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  aria-label={`${star} estrellas`}
                  onClick={() => handleRatingChange(star)}
                  className="cursor-pointer p-0.5"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      selectedRating !== null && star <= selectedRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {selectedRating !== null && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2">
              <span className="mr-1 text-[10px] text-zinc-500">Opiniones rápidas:</span>
              {RATING_SUGGESTIONS[selectedRating].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className={`rounded-lg border px-2 py-1 text-[10px] transition-colors ${selectedSuggestion === suggestion ? "border-[#CCD999]/60 bg-[#CCD999]/15 text-[#CCD999]" : "border-white/10 text-zinc-400 hover:border-[#CCD999]/40 hover:text-[#CCD999]"}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMentionDropdown(!showMentionDropdown)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showMentionDropdown
                  ? "text-zinc-950 bg-[#CCD999]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <AtSign className="w-4 h-4" />
            </button>

            <button
              onClick={handleSend}
              disabled={isSubmitting}
              className="bg-[#CCD999] hover:bg-[#b8cb83] text-zinc-950 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(204,217,153,0.25)] flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Publicar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Star, Bold, Italic, Underline, AtSign } from "lucide-react";
import MentionDropdown, { Asilo } from "./MentionDropdown";

interface ReviewComposerProps {
  asilos: Asilo[];
  badgePalette: string[];
  onSubmit: (text: string, rating: number, asilo: Asilo | null) => void;
}

export default function ReviewComposer({
  asilos,
  badgePalette,
  onSubmit,
}: ReviewComposerProps) {
  const [commentText, setCommentText] = useState("");
  const [selectedAsilo, setSelectedAsilo] = useState<Asilo | null>(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    const lastWord = val.split(" ").pop() || "";
    setShowMentionDropdown(lastWord.startsWith("@"));
  };

  const handleSelectAsilo = (asilo: Asilo) => {
    setSelectedAsilo(asilo);
    setShowMentionDropdown(false);

    const words = commentText.split(" ");
    if (words[words.length - 1].startsWith("@")) {
      words.pop();
    }
    setCommentText(words.join(" "));
  };

  const handleSend = () => {
    if (!commentText.trim()) return;
    onSubmit(commentText, selectedRating, selectedAsilo);
    setCommentText("");
    setSelectedAsilo(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40">
      <div className="relative bg-white rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-zinc-200/80 space-y-3">
        <AnimatePresence>
          {showMentionDropdown && (
            <MentionDropdown
              ref={mentionDropdownRef}
              asilos={asilos}
              badgePalette={badgePalette}
              onSelectAsilo={handleSelectAsilo}
            />
          )}
        </AnimatePresence>

        {selectedAsilo && (
          <div className="flex items-center gap-2 pb-1">
            <span className="text-[10px] text-zinc-400 font-bold">Reseñando a:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                badgePalette[selectedAsilo.colorIndex]
              }`}
            >
              @{selectedAsilo.name}
              <button
                onClick={() => setSelectedAsilo(null)}
                className="hover:text-zinc-900 ml-1 font-bold"
              >
                ×
              </button>
            </span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={commentText}
          onChange={handleTextChange}
          rows={1}
          className={`w-full text-xs text-zinc-700 bg-transparent resize-none focus:outline-none leading-relaxed min-h-8 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-200 [&::-webkit-scrollbar-thumb]:rounded-full ${
            isBold ? "font-bold" : "font-normal"
          } ${isItalic ? "italic" : ""} ${isUnderline ? "underline" : ""}`}
          placeholder="Escribe tu comentario... Usa '@' para etiquetar una residencia"
        />

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`p-1.5 rounded-md hover:bg-zinc-100 cursor-pointer ${
                isBold ? "text-zinc-900 bg-zinc-100" : ""
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`p-1.5 rounded-md hover:bg-zinc-100 cursor-pointer ${
                isItalic ? "text-zinc-900 bg-zinc-100" : ""
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              className={`p-1.5 rounded-md hover:bg-zinc-100 cursor-pointer ${
                isUnderline ? "text-zinc-900 bg-zinc-100" : ""
              }`}
            >
              <Underline className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-0.5 ml-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="cursor-pointer p-0.5"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= selectedRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMentionDropdown(!showMentionDropdown)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                showMentionDropdown
                  ? "text-zinc-900 bg-zinc-200"
                  : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <AtSign className="w-4 h-4" />
            </button>

            <button
              onClick={handleSend}
              className="bg-[#161616] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all cursor-pointer shadow-md"
            >
              <span>Enviar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
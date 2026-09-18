"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ThumbsUp,
  MoreHorizontal,
  Reply,
  AlertCircle,
  Calendar,
  MessageSquareText,
  Bold,
  Italic,
  Underline,
  AtSign,
  Building2,
} from "lucide-react";
import HeaderDesign from "@/components/shared/HeaderDesing";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";

const BADGE_COLOR_PALETTE = [
  "bg-sky-100 text-sky-600 border-sky-200 hover:bg-sky-200",
  "bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200",
  "bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-200",
  "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200",
  "bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200",
  "bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-200",
];

const MOCK_ASILOS = [
  { id: "1", name: "Fuente de Luz", colorIndex: 0 },
  { id: "2", name: "Senda Verde", colorIndex: 1 },
  { id: "3", name: "Vida Plena", colorIndex: 2 },
  { id: "4", name: "Hogar Dorado", colorIndex: 3 },
  { id: "5", name: "Villa Senior Care", colorIndex: 4 },
  { id: "6", name: "Eterna Juventud", colorIndex: 5 },
];

interface Review {
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

const INITIAL_REVIEWS: Review[] = [
  {
    id: "1",
    author: "Antonio Hidalgo Mercedez",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5.0,
    date: "08 de octubre, 2026",
    text: '"Desde que ingresamos a mi abuelo en esta residencia, la tranquilidad de la familia ha sido total. El personal no solo es profesional, sino genuinamente empático y paciente. Las instalaciones están impecables, la comida es variada y adaptada a sus necesidades médicas."',
    likes: 203,
    isLiked: false,
    asiloId: "1",
    asiloName: "Fuente de Luz",
    colorIndex: 0,
  },
  {
    id: "2",
    author: "Rosa Altagracia del Carmen",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 3.0,
    date: "08 de octubre, 2026",
    text: '"La experiencia ha sido muy decepcionante. Hay una falta evidente de personal; los timbres de emergencia tardan demasiado en ser atendidos y en varias ocasiones encontramos a nuestro familiar sin la higiene adecuada."',
    likes: 59,
    isLiked: false,
    asiloId: "2",
    asiloName: "Senda Verde",
    colorIndex: 1,
  },
  {
    id: "3",
    author: "Antonio Hidalgo Mercedez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5.0,
    date: "08 de octubre, 2026",
    text: '"Instalaciones impecables y una excelente atención personalizada por parte del equipo médico y de asistencia."',
    likes: 120,
    isLiked: false,
    asiloId: "3",
    asiloName: "Vida Plena",
    colorIndex: 2,
  },
  {
    id: "4",
    author: "Carlos Manuel Reyes",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 4.5,
    date: "08 de octubre, 2026",
    text: '"Muy satisfecho con las áreas de recreación y la calidez del personal. Mi madre disfruta mucho los talleres de pintura diarios y el patio central está muy bien mantenido."',
    likes: 87,
    isLiked: false,
    asiloId: "4",
    asiloName: "Hogar Dorado",
    colorIndex: 3,
  },
  {
    id: "5",
    author: "Elena María Contreras",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 2.5,
    date: "07 de octubre, 2026",
    text: '"El lugar es amplio y limpio, pero los horarios de visita son demasiado restrictivos y la atención telefónica para dar seguimiento médico a veces toma demasiado tiempo."',
    likes: 34,
    isLiked: false,
    asiloId: "5",
    asiloName: "Villa Senior Care",
    colorIndex: 4,
  },
  {
    id: "6",
    author: "Fernando Miguel Santana",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    rating: 5.0,
    date: "06 de octubre, 2026",
    text: '"Excelente seguimiento farmacológico y el equipo de enfermería es impecable. Siempre nos mantienen informados de cualquier novedad con la salud de mi tío."',
    likes: 145,
    isLiked: false,
    asiloId: "6",
    asiloName: "Eterna Juventud",
    colorIndex: 5,
  },
];

export default function ResenasPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [onlyMine, setOnlyMine] = useState(false);

  // Estados editor
  const [commentText, setCommentText] = useState("");
  const [selectedAsilo, setSelectedAsilo] = useState<typeof MOCK_ASILOS[0] | null>(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Referencias para auto-height y cierres externos
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

  const handleToggleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const currentlyLiked = item.isLiked;
          return {
            ...item,
            isLiked: !currentlyLiked,
            likes: currentlyLiked ? item.likes - 1 : item.likes + 1,
          };
        }
        return item;
      })
    );
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    const lastWord = val.split(" ").pop() || "";
    if (lastWord.startsWith("@")) {
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleSelectAsilo = (asilo: typeof MOCK_ASILOS[0]) => {
    setSelectedAsilo(asilo);
    setShowMentionDropdown(false);

    const words = commentText.split(" ");
    if (words[words.length - 1].startsWith("@")) {
      words.pop();
    }
    setCommentText(words.join(" "));
  };

  const handleBadgeClick = (asiloId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/catalogo?asiloId=${asiloId}`);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      author: "Wilson Segura",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      rating: selectedRating,
      date: "Hace un momento",
      text: `"${commentText}"`,
      likes: 0,
      isLiked: false,
      asiloId: selectedAsilo?.id,
      asiloName: selectedAsilo?.name,
      colorIndex: selectedAsilo?.colorIndex,
    };

    setReviews([newReview, ...reviews]);
    setCommentText("");
    setSelectedAsilo(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F3F3F3] text-[#161616] font-montserrat pl-20 pr-6 pt-0 pb-36">
      <header className="pt-0 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="w-full lg:flex-1">
          <HeaderDesign
            title="Sección de Comentarios"
            subtitle="Asilos cercanos"
            className="w-full lg:pr-32 shadow-md"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 lg:-ml-24 relative z-30 pt-4 lg:pt-0 pr-6">
          <HeaderControls
            logoSrc={logoFamTree}
            placeholder="¿Qué quieres encontrar?"
            bgClass="bg-white shadow-md"
            borderClass="border-[#A4A4A4]"
            placeholderClass="placeholder-zinc-400 text-[#161616]"
            buttonBgClass="bg-[#161616] hover:bg-[#b0c872]"
            buttonTextClass="text-white hover:text-[#161616]"
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={() => console.log("Buscando...", searchQuery)}
          />
        </div>
      </header>

      <div className="mt-6 flex justify-end items-center px-2">
        <button
          onClick={() => setOnlyMine(!onlyMine)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${
            onlyMine
              ? "bg-[#161616] text-white border-[#161616]"
              : "bg-white text-zinc-700 border-zinc-200/80 hover:bg-zinc-50"
          }`}
        >
          <span>Mis comentarios</span>
          <MessageSquareText className="w-4 h-4" />
        </button>
      </div>

      <main className="max-w-6xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
        {reviews.map((review, idx) => (
          <motion.div
            key={review.id}
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
                  onClick={() => handleToggleLike(review.id)}
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
                  <span
                    className={
                      review.isLiked ? "text-zinc-900 font-extrabold" : "text-zinc-400"
                    }
                  >
                    {review.likes}
                  </span>
                </motion.button>

                {review.asiloName && review.asiloId && (
                  <button
                    onClick={(e) => handleBadgeClick(review.asiloId!, e)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      BADGE_COLOR_PALETTE[review.colorIndex ?? 0]
                    }`}
                  >
                    @{review.asiloName}
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setActiveMenuId((prev) => (prev === review.id ? null : review.id))
                  }
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
                        onClick={() => setActiveMenuId(null)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold text-zinc-700 hover:bg-zinc-100 rounded-lg cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Responder</span>
                      </button>
                      <button
                        onClick={() => setActiveMenuId(null)}
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
        ))}
      </main>

      {/* Editor inferior flotante */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40">
        <div className="relative bg-white rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-zinc-200/80 space-y-3">
          <AnimatePresence>
            {showMentionDropdown && (
              <motion.div
                ref={mentionDropdownRef}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute bottom-full left-0 mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-zinc-200/80 p-2 z-50 space-y-1 overflow-hidden"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Seleccionar Asilo</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                  {MOCK_ASILOS.map((asilo) => (
                    <button
                      key={asilo.id}
                      onClick={() => handleSelectAsilo(asilo)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer text-left"
                    >
                      <span>{asilo.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          BADGE_COLOR_PALETTE[asilo.colorIndex]
                        }`}
                      >
                        @{asilo.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedAsilo && (
            <div className="flex items-center gap-2 pb-1">
              <span className="text-[10px] text-zinc-400 font-bold">Reseñando a:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                  BADGE_COLOR_PALETTE[selectedAsilo.colorIndex]
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
                onClick={handleSendComment}
                className="bg-[#161616] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all cursor-pointer shadow-md"
              >
                <span>Enviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
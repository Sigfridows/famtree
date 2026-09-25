"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Loader2 } from "lucide-react";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import ReviewCard, { Review } from "@/features/reviews/components/ReviewCard";
import ReviewComposer from "@/features/reviews/components/ReviewComposer";
import StateFeedback from "@/components/shared/StateFeedback";
import { Asilo } from "@/features/reviews/components/MentionDropdown";
import logoFamTree from "@/assets/logo-famtree.png";
import { apiClient } from "@/lib/apiClient";

const BADGE_COLOR_PALETTE = [
  "bg-sky-100 text-sky-600 border-sky-200 hover:bg-sky-200",
  "bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200",
  "bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-200",
  "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200",
  "bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200",
  "bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-200",
];

export default function ResenasPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [asilos, setAsilos] = useState<Asilo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reviewsRes, asilosRes] = await Promise.all([
        apiClient.get<unknown>("/reviews"),
        apiClient.get<unknown>("/asilos")
      ]);

      const reviewsData = Array.isArray(reviewsRes) 
        ? reviewsRes 
        : ((reviewsRes as { data?: Review[] })?.data || []);
        
      const asilosData = Array.isArray(asilosRes) 
        ? asilosRes 
        : ((asilosRes as { data?: Asilo[] })?.data || []);

      setReviews(reviewsData);
      setAsilos(asilosData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al cargar la información.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const handleToggleLike = async (id: string) => {
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

    try {
      await apiClient.post(`/reviews/${id}/like`);
    } catch (err) {
      console.error("Error al sincronizar el like", err);
    }
  };

  const handleBadgeClick = (asiloId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/catalog?asiloId=${asiloId}`);
  };

  const handleCreateReview = async (text: string, rating: number, selectedAsilo: Asilo | null) => {
    try {
      const response = await apiClient.post<unknown>("/reviews", {
        text,
        rating,
        asiloId: selectedAsilo?.id || null,
      });

      const newReviewFromServer = (response as { data?: Review })?.data || (response as unknown as Review);
      setReviews((prev) => [newReviewFromServer, ...prev]);
    } catch (err) {
      console.error("Error al crear la reseña:", err);
      alert("Hubo un error al publicar tu reseña. Inténtalo de nuevo.");
    }
  };

  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch = 
      rev.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.asiloName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMine = onlyMine ? rev.author === "Wilson Segura" : true;
    return matchesSearch && matchesMine;
  });

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
            onSearch={() => {}}
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
          <span>Mis Reseñas</span>
          <MessageSquareText className="w-4 h-4" />
        </button>
      </div>

      <main className="max-w-6xl mx-auto mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-800" />
            <p className="text-xs font-bold text-zinc-500">Cargando comentarios desde la base de datos...</p>
          </div>
        ) : error ? (
          <StateFeedback
            type="error"
            message={error}
            onRetry={fetchData}
          />
        ) : filteredReviews.length === 0 ? (
          <StateFeedback
            type="empty"
            title="No se encontraron reseñas"
            message={
              searchQuery || onlyMine
                ? "Intenta ajustando los filtros de búsqueda o desactivando el filtro de 'Mis Reseñas'."
                : "Aún no hay comentarios registrados en la base de datos. ¡Sé el primero en escribir uno!"
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
            {filteredReviews.map((review, idx) => (
              <ReviewCard
                key={review.id}
                review={review}
                idx={idx}
                activeMenuId={activeMenuId}
                badgePalette={BADGE_COLOR_PALETTE}
                onToggleLike={handleToggleLike}
                onBadgeClick={handleBadgeClick}
                onToggleMenu={(id) => setActiveMenuId((prev) => (prev === id ? null : id))}
                onReply={() => setActiveMenuId(null)}
                onReport={() => setActiveMenuId(null)}
              />
            ))}
          </div>
        )}
      </main>

      <ReviewComposer
        asilos={asilos}
        badgePalette={BADGE_COLOR_PALETTE}
        onSubmit={handleCreateReview}
      />
    </div>
  );
}
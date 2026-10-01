"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 👈 Importar useSearchParams
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText,
  Loader2,
  LogIn,
  X,
  AlertCircle,
} from "lucide-react";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import ReviewCard, { Review } from "@/features/reviews/components/ReviewCard";
import ReviewComposer from "@/features/reviews/components/ReviewComposer";
import StateFeedback from "@/components/shared/StateFeedback";
import { Asilo } from "@/features/reviews/components/MentionDropdown";
import logoFamTree from "@/assets/famtree.png";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import ReviewActionModal from "@/features/reviews/components/ReviewActionModal";

interface RawReviewAuthor {
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

interface RawReviewUser {
  userId?: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  picture?: string;
}

interface RawReview {
  id?: string | number;
  codigo_reseña?: string | number;
  reviewId?: string | number;
  asylumId?: string | number;
  asiloId?: string | number;
  codigo_asilo?: string | number;
  userId?: string | number;
  author?: string | RawReviewAuthor;
  user?: RawReviewUser;
  rating?: number;
  calificacion?: number;
  date?: string;
  createdAt?: string;
  fecha_creacion?: string;
  comment?: string;
  text?: string;
  comentario?: string;
  likes?: number;
  isLiked?: boolean;
  asylumName?: string;
  asiloName?: string;
  avatar?: string;
}

interface RawAsylum {
  id?: string | number;
  codigo_asilo?: string | number;
  name?: string;
}

export default function ResenasPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 Obtener los Query Params de la URL
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const {
    reviews,
    asylums,
    loading,
    error,
    submitReview,
    refetch,
    toggleLike,
    pendingLikes,
  } = useReviews();

  // 👈 Construir initialAsilo desde la URL o el catálogo cargado
  const initialAsilo = useMemo(() => {
    const asylumId = searchParams.get("asylumId");
    const asylumName = searchParams.get("asylumName");

    if (!asylumId) return null;

    // Buscar coincidencia en la lista de asilos cargados de la API
    const matched = (asylums as unknown as Asilo[])?.find(
      (a) => String(a.id) === String(asylumId)
    );

    if (matched) return matched;

    // Si aún no ha cargado el catálogo, construir objeto preliminar desde Query Params
    if (asylumName) {
      return {
        id: asylumId,
        name: asylumName,
      } as Asilo;
    }

    return null;
  }, [searchParams, asylums]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);

  // Estado para el modal de Edición / Reporte
  const [action, setAction] = useState<{
    id: string;
    mode: "edit" | "report";
    comment: string;
    rating: number;
  } | null>(null);

  const [likeError, setLikeError] = useState<string | null>(null);

  const handleToggleLike = async (id: string) => {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/review");
      return;
    }
    setLikeError(null);
    try {
      await toggleLike(id);
    } catch (err) {
      setLikeError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el me gusta. Intenta nuevamente."
      );
    }
  };

  const handleBadgeClick = (asiloId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/catalog?asiloId=${asiloId}`);
  };

  const currentUserName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "";

  const userReviewedAsylumIds = (reviews || [])
    .filter((rev: RawReview) => {
      const revAuthor =
        typeof rev.author === "string"
          ? rev.author
          : `${rev.user?.firstName || rev.author?.firstName || ""} ${
              rev.user?.lastName || rev.author?.lastName || ""
            }`.trim();

      return (
        (user?.userId &&
          (rev.userId === user.userId || rev.user?.userId === user.userId)) ||
        (currentUserName && revAuthor === currentUserName)
      );
    })
    .map((rev: RawReview) =>
      String(rev.asylumId || rev.asiloId || rev.codigo_asilo || "")
    );

  const handleCreateReview = async (
    text: string,
    rating: number,
    selectedAsilo: Asilo | null
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/review");
      return {
        success: false,
        error: "Debes iniciar sesión para publicar una reseña.",
      };
    }

    if (!selectedAsilo) {
      return { success: false, error: "Debes seleccionar una residencia." };
    }

    try {
      await submitReview({
        asylumId: selectedAsilo.id,
        rating,
        comment: text,
      });

      await refetch();
      return { success: true };
    } catch (err: unknown) {
      const errorObj = err as {
        status?: number;
        statusCode?: number;
        message?: string;
      };

      const isConflict =
        errorObj?.status === 409 ||
        errorObj?.statusCode === 409 ||
        errorObj?.message?.includes("conflicto") ||
        errorObj?.message?.includes("409");

      if (isConflict) {
        return {
          success: false,
          error: `Ya has publicado una reseña para "${selectedAsilo.name}". Solo se permite 1 reseña por residencia.`,
        };
      }

      return {
        success: false,
        error:
          errorObj?.message ||
          "Ocurrió un error al intentar publicar tu reseña.",
      };
    }
  };

  const normalizedReviews: Review[] = (reviews || []).map(
    (rev: RawReview, index: number) => {
      const realId = String(
        rev.id ?? rev.codigo_reseña ?? rev.reviewId ?? `rev-${index}`
      );
      const realAsylumId = String(
        rev.asylumId ?? rev.asiloId ?? rev.codigo_asilo ?? ""
      );

      const matchedAsylum = (asylums || []).find(
        (a: RawAsylum) =>
          String(a.id) === realAsylumId ||
          String(a.codigo_asilo) === realAsylumId
      );

      let authorName = "Usuario Anónimo";
      if (typeof rev.author === "string") {
        authorName = rev.author;
      } else if (rev.author && typeof rev.author === "object") {
        authorName =
          rev.author.name ||
          `${rev.author.firstName || ""} ${rev.author.lastName || ""}`.trim() ||
          "Usuario";
      } else if (rev.user && typeof rev.user === "object") {
        authorName =
          `${rev.user.firstName || ""} ${rev.user.lastName || ""}`.trim() ||
          rev.user.name ||
          "Usuario";
      }

      const avatar =
        (typeof rev.author === "object" ? rev.author?.picture : undefined) ||
        rev.user?.picture ||
        rev.avatar;

      return {
        id: realId,
        author: authorName,
        avatar: avatar || "/placeholder-avatar.png",
        rating: Number(rev.rating || rev.calificacion || 5),
        date: rev.date || rev.createdAt || rev.fecha_creacion || "Reciente",
        text: rev.comment || rev.text || rev.comentario || "",
        likes: Number(rev.likes || 0),
        isLiked: Boolean(rev.isLiked),
        asiloId: realAsylumId,
        asiloName:
          matchedAsylum?.name || rev.asylumName || rev.asiloName || "Asilo",
      };
    }
  );

  const filteredReviews = normalizedReviews.filter((rev) => {
    const matchesSearch =
      rev.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.asiloName &&
        rev.asiloName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMine = onlyMine ? rev.author === currentUserName : true;

    return matchesSearch && matchesMine;
  });

  return (
    <div className="relative min-h-screen bg-[#121315] text-white font-montserrat pl-20 pr-6 pt-6 pb-36 selection:bg-[#CCD999] selection:text-black">
      {/* Resplandores ambientales de fondo */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-[#CCDD99]/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-20 w-100 h-100 bg-[#CCDD99]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.03] pointer-events-none z-0" />

      {/* Scrollbar minimalista */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #0e0e0e;
        }
        ::-webkit-scrollbar-thumb {
          background: #222222;
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ccd999;
        }
      `}</style>
      
      {/* Alerta flotante si ocurre un error con el Like */}
      <AnimatePresence>
        {likeError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-xl shadow-xl"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{likeError}</span>
            <button
              onClick={() => setLikeError(null)}
              className="ml-2 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encabezado */}
      <header className="pt-0 flex flex-col lg:flex-row items-center justify-between gap-4 max-w-7xl mx-auto relative z-10">
        <div className="w-full lg:flex-1">
          <HeaderDesign
            title="Sección de Comentarios"
            subtitle="Asilos cercanos"
            className="w-full lg:pr-32 shadow-2xl border border-white/10 bg-[#141414]"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 lg:-ml-24 relative z-30 pt-4 lg:pt-0 pr-2">
          <HeaderControls
            logoSrc={logoFamTree}
            placeholder="Que quieres encontrar?"
            bgClass="bg-[#1A1C1E]/80 backdrop-blur-md"
            borderClass="border-white/10"
            placeholderClass="placeholder-zinc-500 text-white/90 font-light"
            buttonBgClass="bg-[#CCDD99] hover:bg-[#b8cb83]"
            buttonTextClass="text-zinc-950 font-medium"
            className="shrink-0 lg:-ml-24 relative z-20 pt-4 lg:pt-0"
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={() => {}}
          />
        </div>
      </header>

      {/* Filtro Mis Reseñas */}
      {isAuthenticated && (
        <div className="mt-6 flex justify-end items-center max-w-7xl mx-auto px-2 relative z-10">
          <button
            onClick={() => setOnlyMine(!onlyMine)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-md cursor-pointer ${
              onlyMine
                ? "bg-[#CCD999] text-zinc-950 border-[#CCD999]"
                : "bg-[#141414] text-zinc-300 border-white/10 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>Mis Reseñas</span>
            <MessageSquareText className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lista de Reseñas */}
      <main className="max-w-7xl mx-auto mt-6 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#CCD999]" />
            <p className="text-xs font-bold text-zinc-400">
              Cargando comentarios...
            </p>
          </div>
        ) : error ? (
          <StateFeedback type="error" message={error} onRetry={refetch} />
        ) : filteredReviews.length === 0 ? (
          <StateFeedback
            type="empty"
            title="No se encontraron reseñas"
            message={
              searchQuery || onlyMine
                ? "Intenta ajustando los filtros de búsqueda o desactivando el filtro de 'Mis Reseñas'."
                : "Aún no hay comentarios registrados. ¡Sé el primero en escribir uno!"
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {filteredReviews.map((review, idx) => (
              <ReviewCard
                key={review.id}
                review={review}
                idx={idx}
                activeMenuId={activeMenuId}
                onToggleLike={handleToggleLike}
                likePending={pendingLikes.includes(review.id)}
                onBadgeClick={handleBadgeClick}
                onToggleMenu={(id) =>
                  setActiveMenuId((prev) => (prev === id ? null : id))
                }
                onEdit={
                  reviews.some(
                    (item) =>
                      String(item.reviewId ?? item.id) === review.id &&
                      String(item.userId) === String(user?.userId)
                  )
                    ? () => {
                        setActiveMenuId(null);
                        setLikeError(null);
                        setAction({
                          id: review.id,
                          mode: "edit",
                          comment: review.text,
                          rating: review.rating,
                        });
                      }
                    : undefined
                }
                onReport={
                  user?.role === "REGISTERED_USER" &&
                  !reviews.some(
                    (item) =>
                      String(item.reviewId ?? item.id) === review.id &&
                      String(item.userId) === String(user.userId)
                  )
                    ? () => {
                        setActiveMenuId(null);
                        setLikeError(null);
                        setAction({
                          id: review.id,
                          mode: "report",
                          comment: "",
                          rating: 1,
                        });
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal Modularizado */}
      <ReviewActionModal
        action={action}
        onClose={() => setAction(null)}
        onSuccess={async () => {
          setLikeError(null);
          await refetch();
        }}
        onError={(err) => setLikeError(err)}
      />

      {/* Redactor de Reseñas / Barra inferior según estado de usuario */}
      {user?.role === "REGISTERED_USER" ? (
        <ReviewComposer
          asilos={asylums as unknown as Asilo[]}
          userReviewedAsylumIds={userReviewedAsylumIds}
          initialAsilo={initialAsilo} // 👈 Pasamos el asilo pre-seleccionado
          onSubmit={handleCreateReview}
        />
      ) : (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl bg-[#141414]/90 backdrop-blur-xl text-white p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between gap-4">
          <div className="text-xs">
            <p className="font-bold text-white">¿Quieres publicar una reseña?</p>
            <p className="text-zinc-400">
              Inicia sesión o regístrate para dejar tu opinión.
            </p>
          </div>
          <Link
            href="/login?callbackUrl=/review"
            className="flex items-center gap-2 bg-[#CCD999] text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-[#b8cb83] transition-colors shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </Link>
        </div>
      )}
    </div>
  );
}
"use client";

import { reviewService } from "@/features/reviews/api/reviewService";
import type { ReportReason } from "@/features/reviews/types/reviews.types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquareText, Loader2, LogIn } from "lucide-react";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import ReviewCard, { Review } from "@/features/reviews/components/ReviewCard";
import ReviewComposer from "@/features/reviews/components/ReviewComposer";
import StateFeedback from "@/components/shared/StateFeedback";
import { Asilo } from "@/features/reviews/components/MentionDropdown";
import logoFamTree from "@/assets/logo-famtree.png";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useReviews } from "@/features/reviews/hooks/useReviews";

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
  colorIndex?: number;
}

// Paleta de Badges optimizada para el tema oscuro (efecto neón translúcido)
const BADGE_COLOR_PALETTE = [
  "bg-[#0284c7]/20 text-[#38bdf8] border-[#0284c7]/40 hover:bg-[#0284c7]/30",
  "bg-[#9333ea]/20 text-[#c084fc] border-[#9333ea]/40 hover:bg-[#9333ea]/30",
  "bg-[#059669]/20 text-[#34d399] border-[#059669]/40 hover:bg-[#059669]/30",
  "bg-[#d97706]/20 text-[#fbbf24] border-[#d97706]/40 hover:bg-[#d97706]/30",
  "bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40 hover:bg-[#e11d48]/30",
  "bg-[#4f46e5]/20 text-[#818cf8] border-[#4f46e5]/40 hover:bg-[#4f46e5]/30",
];

export default function ResenasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const { reviews, asylums, loading, error, submitReview, refetch, toggleLike, pendingLikes } =
    useReviews();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);

  const [action, setAction] = useState<{id: string; mode: "edit" | "report"; comment: string; rating: number} | null>(null);
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [detail, setDetail] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const handleToggleLike = async (id: string) => {
    if (!isAuthenticated) { router.push("/login?callbackUrl=/review"); return; }
    setLikeError(null);
    try { await toggleLike(id); }
    catch (err) { setLikeError(err instanceof Error ? err.message : "No se pudo guardar el like. Recarga antes de reintentar."); }
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

      const isMatch =
        (user?.userId &&
          (rev.userId === user.userId || rev.user?.userId === user.userId)) ||
        (currentUserName && revAuthor === currentUserName);

      return isMatch;
    })
    .map((rev: RawReview) =>
      String(rev.asylumId || rev.asiloId || rev.codigo_asilo || ""),
    );

  const handleCreateReview = async (
    text: string,
    rating: number,
    selectedAsilo: Asilo | null,
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
          errorObj?.message || "Ocurrió un error al intentar publicar tu reseña.",
      };
    }
  };

  const normalizedReviews: Review[] = (reviews || []).map(
    (rev: RawReview, index: number) => {
      const realId = String(
        rev.id ?? rev.codigo_reseña ?? rev.reviewId ?? `rev-${index}`,
      );
      const realAsylumId = String(
        rev.asylumId ?? rev.asiloId ?? rev.codigo_asilo ?? "",
      );

      const matchedAsylum = (asylums || []).find(
        (a: RawAsylum) =>
          String(a.id) === realAsylumId ||
          String(a.codigo_asilo) === realAsylumId,
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

      const baseLikes = Number(rev.likes || 0);
      const baseIsLiked = Boolean(rev.isLiked);



      return {
        id: realId,
        author: authorName,
        avatar: avatar,
        rating: Number(rev.rating || rev.calificacion || 5),
        date: rev.date || rev.createdAt || rev.fecha_creacion || "Reciente",
        text: rev.comment || rev.text || rev.comentario || "",
        likes: baseLikes,
        isLiked: baseIsLiked,
        asiloId: realAsylumId,
        asiloName:
          matchedAsylum?.name || rev.asylumName || rev.asiloName || "Asilo",
        colorIndex:
          matchedAsylum?.colorIndex ?? index % BADGE_COLOR_PALETTE.length,
      };
    },
  );

  const filteredReviews = normalizedReviews.filter((rev) => {
    const matchesSearch =
      rev.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rev.asiloName &&
        rev.asiloName.toLowerCase().includes(searchQuery.toLowerCase()));

    const currentUserName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : "";
    const matchesMine = onlyMine ? rev.author === currentUserName : true;

    return matchesSearch && matchesMine;
  });

  return (
    <div className="relative min-h-screen bg-[#121315] text-white font-montserrat pl-20 pr-6 pt-6 pb-36 selection:bg-[#CCD999] selection:text-black">
      {likeError && <p role="alert" className="text-red-400">{likeError}</p>}
      {/* Glow ambiental de fondo */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-[#CCD999]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <header className="pt-0 flex flex-col lg:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
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
            placeholder="¿Qué quieres encontrar?"
            bgClass="bg-[#141414] backdrop-blur-xl shadow-2xl"
            borderClass="border-white/10"
            placeholderClass="placeholder-zinc-400 text-white"
            buttonBgClass="bg-[#CCD999] hover:bg-[#b8cb83]"
            buttonTextClass="text-zinc-950 font-bold"
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={() => {}}
          />
        </div>
      </header>

      {isAuthenticated && (
        <div className="mt-6 flex justify-end items-center max-w-7xl mx-auto px-2">
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

      <main className="max-w-7xl mx-auto mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#CCD999]" />
            <p className="text-xs font-bold text-zinc-400">
              Cargando comentarios desde la base de datos...
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
                : "Aún no hay comentarios registrados en la base de datos. ¡Sé el primero en escribir uno!"
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
                badgePalette={BADGE_COLOR_PALETTE}
                onToggleLike={handleToggleLike}
                likePending={pendingLikes.includes(review.id)}
                onBadgeClick={handleBadgeClick}
                onToggleMenu={(id) =>
                  setActiveMenuId((prev) => (prev === id ? null : id))
                }
                onEdit={reviews.some(item => String(item.reviewId ?? item.id) === review.id && String(item.userId) === String(user?.userId)) ? () => {setActiveMenuId(null); setLikeError(null); setAction({id: review.id, mode: "edit", comment: review.text, rating: review.rating});} : undefined}
                onReport={user?.role === "REGISTERED_USER" && !reviews.some(item => String(item.reviewId ?? item.id) === review.id && String(item.userId) === String(user.userId)) ? () => {setActiveMenuId(null); setLikeError(null); setDetail(""); setAction({id: review.id, mode: "report", comment: "", rating: 1});} : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {action && <div role="dialog" aria-modal="true" aria-label={action.mode === "edit" ? "Editar reseña" : "Reportar reseña"} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
        <form className="w-full max-w-lg space-y-4 rounded-2xl bg-zinc-900 p-6" onSubmit={async e => {
          e.preventDefault(); setActionBusy(true); setLikeError(null);
          try {
            if (action.mode === "edit") await reviewService.updateReview(action.id, {rating: action.rating, comment: action.comment});
            else await reviewService.reportReview(Number(action.id), reason, detail || undefined);
            setAction(null); await refetch();
          } catch (err) { setLikeError(err instanceof Error ? err.message : "No se pudo guardar"); }
          finally {setActionBusy(false);}
        }}>
          <h2>{action.mode === "edit" ? "Editar reseña" : "Reportar reseña"}</h2>
          {action.mode === "edit" ? <><label>Calificación<input className="block border p-2" required type="number" min="1" max="5" value={action.rating} onChange={e => setAction({...action, rating: Number(e.target.value)})} /></label><label>Comentario<textarea className="block w-full border p-2" required minLength={10} maxLength={500} value={action.comment} onChange={e => setAction({...action, comment: e.target.value})} /></label></> : <><label>Motivo<select className="block w-full bg-zinc-900 p-2" value={reason} onChange={e => setReason(e.target.value as ReportReason)}>{Object.entries({SPAM: "Spam", OFFENSIVE_LANGUAGE: "Lenguaje ofensivo", FALSE_INFO: "Información falsa", CONFLICT_OF_INTEREST: "Conflicto de interés", OTHER: "Otro"}).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Detalle opcional<textarea className="block w-full border p-2" maxLength={250} value={detail} onChange={e => setDetail(e.target.value)} /></label></>}
          {likeError && <p role="alert">{likeError}</p>}
          <button disabled={actionBusy} className="mr-6 rounded bg-emerald-800 p-2">Guardar</button><button type="button" disabled={actionBusy} onClick={() => setAction(null)}>Cancelar</button>
        </form>
      </div>}
      {user?.role === "REGISTERED_USER" ? (
        <ReviewComposer
          asilos={asylums as unknown as Asilo[]}
          badgePalette={BADGE_COLOR_PALETTE}
          userReviewedAsylumIds={userReviewedAsylumIds}
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
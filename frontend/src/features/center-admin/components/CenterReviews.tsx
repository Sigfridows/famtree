"use client";
import { useEffect, useState } from "react";
import { centerAdminService } from "../api/centerAdminService";
import type { CenterReputation } from "../types/centerAdmin.types";
import { Bars } from "@/features/admin/components/AdminUI";
import { MessageSquare, Search, Star, ThumbsUp } from "lucide-react";

export default function CenterReviews() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [rating, setRating] = useState<number | undefined>();
  const [sort, setSort] = useState("newest");
  const [data, setData] = useState<CenterReputation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    centerAdminService
      .getReviews(page, q, rating, sort)
      .then((value) => {
        if (alive) {
          setData(value);
          setError("");
        }
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, q, rating, sort]);

  return (
    <section className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Reputación</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reseñas del Asilo</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comentarios y opiniones de los familiares y allegados.
          </p>
        </div>
        {data && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-emerald-900">
              {data.summary.average} / 5 · <span className="font-normal text-emerald-700">{data.summary.count} reseñas</span>
            </span>
          </div>
        )}
      </div>

      {data && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <Bars
            title="Distribución de calificaciones"
            values={Object.fromEntries(
              Object.entries(data.summary.distribution).map(([stars, count]) => [
                `${stars} estrellas`,
                count,
              ]),
            )}
          />
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <form
        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (page !== 1 || q !== search) setLoading(true);
          setPage(1);
          setQ(search);
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            aria-label="Buscar reseñas"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-700 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o comentario..."
          />
        </div>

        <select
          aria-label="Calificación"
          className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:outline-none"
          value={rating ?? ""}
          onChange={(e) => {
            setLoading(true);
            setPage(1);
            setRating(e.target.value ? Number(e.target.value) : undefined);
          }}
        >
          <option value="">Todas las estrellas</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} estrellas
            </option>
          ))}
        </select>

        <select
          aria-label="Ordenar reseñas"
          className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:outline-none"
          value={sort}
          onChange={(e) => {
            setLoading(true);
            setPage(1);
            setSort(e.target.value);
          }}
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguas</option>
          <option value="rating_desc">Mayor calificación</option>
          <option value="rating_asc">Menor calificación</option>
        </select>

        <button className="px-5 py-2.5 bg-[#062319] hover:bg-[#0a3526] text-white font-bold rounded-xl text-xs transition-all shadow-sm">
          Filtrar
        </button>
      </form>

      {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</p>}
      {loading && <p role="status" className="text-xs text-slate-500 px-1">Cargando reseñas…</p>}
      
      {!loading && data?.items.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
          No hay reseñas que coincidan con los filtros seleccionados.
        </div>
      )}

      <div className="space-y-3">
        {!loading &&
          data?.items.map((review) => (
            <article
              key={review.reviewId}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {review.author?.name ? review.author.name.substring(0, 2).toUpperCase() : "US"}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-sm">
                      {review.author?.name ?? "Usuario Anónimo"}
                    </h2>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                      <span className="text-slate-500 font-mono text-[11px] ml-1">({review.rating}/5)</span>
                    </div>
                  </div>
                </div>
                <time className="text-xs text-slate-400 font-mono">
                  {new Date(review.createdAt).toLocaleDateString("es-DO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed pl-1">
                &quot;{review.comment}&quot;
              </p>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1 border-t border-slate-100">
                <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-600">{review.likes}</span> likes
              </div>
            </article>
          ))}
      </div>

      {data && (
        <nav className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-xs" aria-label="Paginación">
          <button
            disabled={loading || page <= 1}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 disabled:opacity-40 transition-all"
            onClick={() => {
              setLoading(true);
              setPage(page - 1);
            }}
          >
            Anterior
          </button>
          <span className="font-bold text-slate-700">Página {page}</span>
          <button
            disabled={loading || page * data.pageSize >= data.total}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 disabled:opacity-40 transition-all"
            onClick={() => {
              setLoading(true);
              setPage(page + 1);
            }}
          >
            Siguiente
          </button>
        </nav>
      )}
    </section>
  );
}
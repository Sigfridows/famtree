"use client";
import { useEffect, useState } from "react";
import { centerAdminService } from "../api/centerAdminService";
import type { CenterReputation } from "../types/centerAdmin.types";
import { Bars } from "@/features/admin/components/AdminUI";
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
      <h1 className="text-2xl font-bold">Reseñas del asilo</h1>
      {data && (
        <p className="rounded-xl bg-white p-5">
          Calificación media: <strong>{data.summary.average}</strong> / 5 ·{" "}
          {data.summary.count} reseñas publicadas
        </p>
      )}
      {data && (
        <Bars
          title="Distribución de calificaciones"
          values={Object.fromEntries(
            Object.entries(data.summary.distribution).map(([stars, count]) => [
              `${stars} estrellas`,
              count,
            ]),
          )}
        />
      )}
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (page !== 1 || q !== search) setLoading(true);
          setPage(1);
          setQ(search);
        }}
      >
        <input
          aria-label="Buscar reseñas"
          className="rounded-lg border p-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nombre o comentario"
        />
        <button>Buscar</button>
        <select
          aria-label="Calificación"
          value={rating ?? ""}
          onChange={(e) => {
            setLoading(true);
            setPage(1);
            setRating(e.target.value ? Number(e.target.value) : undefined);
          }}
        >
          <option value="">Todas</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} estrellas
            </option>
          ))}
        </select>
        <select
          aria-label="Ordenar reseñas"
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
      </form>
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Cargando reseñas…</p>}
      {!loading && data?.items.length === 0 && (
        <p>No hay reseñas que coincidan.</p>
      )}
      {!loading &&
        data?.items.map((review) => (
          <article
            key={review.reviewId}
            className="rounded-xl bg-white p-5 space-y-2"
          >
            <h2 className="font-semibold">
              {review.author?.name ?? "Usuario"} · {review.rating} / 5
            </h2>
            <time>
              {new Date(review.createdAt).toLocaleDateString("es-DO")}
            </time>
            <p>{review.comment}</p>
            <p className="text-sm text-slate-500">{review.likes} likes</p>
          </article>
        ))}
      {data && (
        <nav className="flex gap-5" aria-label="Paginación">
          <button
            disabled={loading || page <= 1}
            onClick={() => {
              setLoading(true);
              setPage(page - 1);
            }}
          >
            Anterior
          </button>
          <span>Página {page}</span>
          <button
            disabled={loading || page * data.pageSize >= data.total}
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

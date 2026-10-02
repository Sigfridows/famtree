"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, adminError } from "../api";
import type { Metrics, Catalogs } from "../types";
import { Bars, Notice } from "./AdminUI";

export default function Dashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const [query, setQuery] = useState({ startDate: "", endDate: "" });
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    let alive = true;
    Promise.all([adminApi.metrics(query), adminApi.catalogs()])
      .then(([value, options]) => {
        if (alive) {
          setData(value);
          setCatalogs(options);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(adminError(e));
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [query, refresh]);
  return (
    <>
      <header className="admin-heading">
        <div>
          <h1>Resumen del sistema</h1>
          <p className="admin-subtitle">
            La actividad de FamTree, en un solo lugar.
          </p>
        </div>
        <button
          className="admin-primary"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            setRefresh(refresh + 1);
          }}
        >
          Actualizar datos
        </button>
      </header>
      <form
        className="admin-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setQuery({ ...range });
        }}
      >
        <label>
          Desde
          <input aria-label="Desde"
            type="date"
            value={range.startDate}
            max={range.endDate || undefined}
            onChange={(e) => setRange({ ...range, startDate: e.target.value })}
          />
        </label>
        <label>
          Hasta
          <input aria-label="Hasta"
            type="date"
            min={range.startDate || undefined}
            value={range.endDate}
            onChange={(e) => setRange({ ...range, endDate: e.target.value })}
          />
        </label>
        <button className="admin-primary" disabled={busy}>
          Aplicar período
        </button>
        <button
          type="button"
          className="admin-secondary"
          onClick={() => {
            setRange({ startDate: "", endDate: "" });
            setQuery({ startDate: "", endDate: "" });
            setBusy(true);
          }}
        >
          Todo el historial
        </button>
      </form>
      <div className="admin-actions mb-5">
        {[
          [7, "Últimos 7 días"],
          [30, "Último mes"],
          [365, "Último año"],
        ].map(([days, label]) => (
          <button
            key={days}
            className="admin-secondary"
            disabled={busy}
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - Number(days) + 1);
              const dates = {
                startDate: start.toLocaleDateString("en-CA"),
                endDate: end.toLocaleDateString("en-CA"),
              };
              setRange(dates);
              setQuery(dates);
              setBusy(true);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <Notice error={error} />
      {busy && <p role="status">Consultando estadísticas…</p>}
      {data && (
        <>
          <div className="admin-stats">
            <Link href="/system-admin/asylums" className="admin-stat">
              <span>Asilos activos</span>
              <strong>{data.activeCenters}</strong>
              <small>
                {data.inactiveCenters} inactivos · {data.centers} en total
              </small>
            </Link>
            <Link href="/system-admin/users" className="admin-stat">
              <span>Usuarios registrados</span>
              <strong>{data.registeredUsers}</strong>
              <small>
                {data.activeUsers} activos · {data.blockedUsers} bloqueados
              </small>
            </Link>
            <Link href="/system-admin/moderation" className="admin-stat">
              <span>Reportes pendientes</span>
              <strong>{data.pendingReports}</strong>
              <small>Revisar y resolver</small>
            </Link>
            <div className="admin-stat">
              <span>Calificación media</span>
              <strong>
                {data.averageRating === null
                  ? "—"
                  : data.averageRating.toFixed(1)}
              </strong>
              <small>{data.publishedReviews} reseñas publicadas</small>
            </div>
          </div>
          <div className="admin-panel admin-actions">
            <span>
              <b>{data.centerAdministrators}</b> administradores de asilo
            </span>
            <span>
              · <b>{data.totalCapacity}</b> capacidad total
            </span>
            <span>
              · <b>{data.favorites}</b> favoritos guardados
            </span>
          </div>
          <div className="admin-grid">
            <Bars
              title="Asilos por provincia"
              values={Object.fromEntries(
                Object.entries(data.centersByProvince).map(([id, count]) => [
                  catalogs?.provinces.find((p) => p.id === Number(id))?.name ||
                    id,
                  count,
                ]),
              )}
            />
            <Bars
              title="Distribución de calificaciones"
              values={Object.fromEntries(
                [1, 2, 3, 4, 5].map((stars) => [
                  `${stars} estrellas`,
                  data.ratingDistribution[String(stars)] || 0,
                ]),
              )}
            />
            <Bars
              title="Registro de usuarios por período"
              values={data.userRegistrationTrend}
            />
          </div>
        </>
      )}
    </>
  );
}

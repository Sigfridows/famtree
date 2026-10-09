"use client";
import { useEffect, useState } from "react";
import { adminApi, adminError } from "../api";
import type { Catalogs, ReportTable } from "../types";
import { Notice, Pagination } from "./AdminUI";

const labels: Record<string, string> = {
  id: "ID",
  name: "Nombre",
  asylum: "Asilo",
  asylum_name: "Asilo",
  asylumName: "Asilo",
  username: "Usuario",
  email: "Correo",
  role: "Rol",
  status: "Estado",
  createdAt: "Registro",
  created_at: "Registro",
  province: "Provincia",
  municipality: "Municipio",
  capacity: "Capacidad",
  minPrice: "Precio mínimo (RD$)",
  maxPrice: "Precio máximo (RD$)",
  rating: "Calificación",
  comment: "Comentario",
  author: "Autor",
  reports: "Reportes",
};

function cell(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return new Date(value).toLocaleDateString("es-DO");
  return String(value);
}

export default function Reports() {
  const [filters, setFilters] = useState({
    reportType: "centers",
    startDate: "",
    endDate: "",
    status: "",
    provinceId: "",
  });
  const [applied, setApplied] = useState<typeof filters | null>(null);
  const [data, setData] = useState<ReportTable | null>(null);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [page, setPage] = useState(1);
  const [format, setFormat] = useState("pdf");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    adminApi
      .catalogs()
      .then((d) => {
        if (alive) setCatalogs(d);
      })
      .catch((e) => {
        if (alive) setError(adminError(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!applied) return;
    let alive = true;
    adminApi
      .reports({ ...applied, page })
      .then((d) => {
        if (alive) {
          setData(d);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) {
          setData(null);
          setError(adminError(e));
        }
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [applied, page]);

  const states =
    filters.reportType === "centers"
      ? [
          ["ACTIVE", "Activo"],
          ["INACTIVE", "Inactivo"],
        ]
      : filters.reportType === "users"
        ? [
            ["ACTIVE", "Activo"],
            ["BLOCKED", "Bloqueado"],
          ]
        : [
            ["PUBLISHED", "Publicada"],
            ["HIDDEN", "Oculta"],
          ];

  return (
    <>
      <header className="admin-heading">
        <div>
          <h1>Reportes generales</h1>
          <p className="admin-subtitle">
            Consulta datos y descarga el mismo conjunto filtrado en PDF o CSV.
          </p>
        </div>
      </header>

      <Notice error={error} />

      <section className="admin-panel">
        <form
          className="admin-filters"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            setPage(1);
            setApplied({ ...filters });
          }}
        >
          <label>
            Tipo de reporte
            <select
              aria-label="Tipo de reporte"
              value={filters.reportType}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  reportType: e.target.value,
                  status: "",
                  provinceId: "",
                })
              }
            >
              <option value="centers">Centros de atención</option>
              <option value="users">Cuentas de usuario</option>
              <option value="reviews">Reseñas y moderación</option>
            </select>
          </label>
          <label>
            Desde
            <input
              aria-label="Desde"
              type="date"
              max={filters.endDate || undefined}
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </label>
          <label>
            Hasta
            <input
              aria-label="Hasta"
              type="date"
              min={filters.startDate || undefined}
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </label>
          <label>
            Estado
            <select
              aria-label="Estado"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">Todos</option>
              {states.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {filters.reportType === "centers" && (
            <label>
              Provincia
              <select
                aria-label="Provincia"
                value={filters.provinceId}
                onChange={(e) =>
                  setFilters({ ...filters, provinceId: e.target.value })
                }
              >
                <option value="">Todas</option>
                {catalogs?.provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="admin-primary" disabled={busy}>
            Consultar datos
          </button>
        </form>

        {busy && <p role="status">Procesando reporte…</p>}

        {data && applied && (
          <>
            <p className="admin-subtitle">
              Consulta aplicada:{" "}
              {applied.reportType === "centers"
                ? "Asilos"
                : applied.reportType === "users"
                  ? "Usuarios"
                  : "Reseñas"}{" "}
              · {applied.startDate || "Inicio del historial"} —{" "}
              {applied.endDate || "Hoy"} · Total: {data.total}
            </p>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    {Object.keys(data.rows[0] || {}).map((key) => (
                      <th key={key}>
                        {labels[key] || key.replaceAll("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={i}>
                      {Object.entries(row).map(([key, value]) => (
                        <td key={key}>{cell(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.total === 0 && (
                <p className="admin-empty">
                  No hay registros para estos criterios. Amplía el período o
                  cambia los filtros.
                </p>
              )}
            </div>

            <Pagination
              {...data}
              busy={busy}
              onChange={(value) => {
                setBusy(true);
                setPage(value);
              }}
            />

            <div className="admin-filters" style={{ marginTop: "20px" }}>
              <label>
                Formato de descarga
                <select
                  aria-label="Formato de descarga"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV (compatible con Excel)</option>
                </select>
              </label>
              <button
                className="admin-primary"
                disabled={
                  busy || !data.total || !applied.startDate || !applied.endDate
                }
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await adminApi.export({
                      ...applied,
                      page: 1,
                      format,
                      status: applied.status || undefined,
                      provinceId: applied.provinceId || undefined,
                    });
                  } catch (e) {
                    setError(adminError(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Descargar reporte
              </button>
            </div>
            {(!applied.startDate || !applied.endDate) && (
              <p className="admin-subtitle">
                Para descargar, selecciona ambas fechas y vuelve a consultar los
                datos.
              </p>
            )}
          </>
        )}

        {!data && !busy && (
          <p className="admin-empty">
            Elige un reporte y pulsa «Consultar datos».
          </p>
        )}
      </section>
    </>
  );
}
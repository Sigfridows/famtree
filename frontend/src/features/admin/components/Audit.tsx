"use client";
import { useEffect, useState } from "react";
import { adminApi, adminError } from "../api";
import { Notice, Status, dateLabel } from "./AdminUI";
export default function Audit() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    let alive = true;
    adminApi
      .decisions((page - 1) * 20)
      .then((d) => {
        if (alive) {
          setRows(d);
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
  }, [page]);
  return (
    <>
      <header className="admin-heading">
        <div>
          <h1>Auditoría de moderación</h1>
          <p className="admin-subtitle">
            Historial conservado de decisiones, responsables y justificaciones.
          </p>
        </div>
      </header>
      <Notice error={error} />
      <section className="admin-panel">
        {busy ? (
          <p role="status">Cargando historial…</p>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reporte</th>
                  <th>Moderador</th>
                  <th>Resolución</th>
                  <th>Justificación</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.reportId)}>
                    <td>#{String(row.reportId)}</td>
                    <td>#{String(row.moderatorUserId)}</td>
                    <td>
                      <Status value={String(row.status)} />
                    </td>
                    <td>{String(row.justification || "—")}</td>
                    <td>{dateLabel(row.resolvedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="admin-empty">No hay decisiones en esta página.</p>
            )}
          </div>
        )}
        <nav className="admin-pagination" aria-label="Paginación">
          <button
            disabled={busy || page === 1}
            onClick={() => {
              setBusy(true);
              setPage(page - 1);
            }}
          >
            Anterior
          </button>
          <span>Página {page}</span>
          <button
            disabled={busy || rows.length < 20}
            onClick={() => {
              setBusy(true);
              setPage(page + 1);
            }}
          >
            Siguiente
          </button>
        </nav>
      </section>
    </>
  );
}

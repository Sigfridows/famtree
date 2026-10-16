"use client";
import { useEffect, useState } from "react";
import { adminApi, adminError } from "../api";
import { Modal, Notice, Status } from "./AdminUI";
export default function Audit() {
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
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
          <h1>Auditoría</h1>
          <p className="admin-subtitle">
            Historial conservado de decisiones de moderación, responsables y justificaciones. El historial de bloqueos de cada cuenta aparece al gestionarla.
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
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.reportId)}>
                    <td>#{String(row.reportId)}</td>
                    <td>{String(row.moderatorName || row.moderatorUsername || "Nombre histórico no registrado")} · #{String(row.moderatorUserId)}</td>
                    <td>
                      <Status value={String(row.status)} />
                    </td>
                    <td>{String(row.justification || "—")}</td>
                    <td>{row.resolvedAt ? new Date(String(row.resolvedAt)).toLocaleString("es-DO") : "—"}</td>
                    <td><button className="admin-secondary" onClick={() => setSelected(row)}>Ver evento</button></td>
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
      {selected && <Modal title={`Evento de moderación · Reporte #${selected.reportId}`} onClose={() => setSelected(null)}>
        <dl className="admin-form">
          <div><dt>Actor</dt><dd>{String(selected.moderatorName || selected.moderatorUsername || "Nombre histórico no registrado")} · ID {String(selected.moderatorUserId)}</dd></div>
          <div><dt>Acción</dt><dd>{selected.status === "REVIEW_REMOVED" ? "Eliminar reseña reportada" : "Descartar reporte y conservar reseña"}</dd></div>
          <div><dt>Entidad</dt><dd>Reporte #{String(selected.reportId)} · Reseña #{String(selected.reviewId)}</dd></div>
          <div><dt>Justificación histórica</dt><dd>{String(selected.justification || "No registrada")}</dd></div>
          <div><dt>Fecha de resolución</dt><dd>{selected.resolvedAt ? new Date(String(selected.resolvedAt)).toLocaleString("es-DO") : "No registrada"}</dd></div>
        </dl>
        <button className="admin-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
      </Modal>}
    </>
  );
}

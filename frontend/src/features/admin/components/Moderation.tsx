"use client";
import { useEffect, useState } from "react";
import { adminApi, adminError } from "../api";
import type { Page, ReportCase } from "../types";
import { Modal, Notice, Pagination, Status, dateLabel } from "./AdminUI";
export const reasons: Record<string, string> = {
  OFFENSIVE_LANGUAGE: "Lenguaje ofensivo",
  FALSE_INFO: "Información falsa",
  SPAM: "Spam o publicidad",
  CONFLICT_OF_INTEREST: "Conflicto de interés",
  OTHER: "Otro motivo",
};
export default function Moderation() {
  const [data, setData] = useState<Page<ReportCase> | null>(null);
  const [query, setQuery] = useState({
    q: "",
    status: "PENDING",
    reason: "",
    page: 1,
  });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [target, setTarget] = useState<ReportCase | null>(null);
  const [decision, setDecision] = useState("DISCARDED");
  const [justification, setJustification] = useState("");
  useEffect(() => {
    let alive = true;
    adminApi
      .cases(query)
      .then((d) => {
        if (alive) {
          setData(d);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(adminError(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [query, refresh]);
  const filter = (values: Partial<typeof query>) => {
    setLoading(true);
    setQuery({ ...query, ...values });
  };
  return (
    <>
      <header className="admin-heading">
        <div>
          <h1>Moderación de reseñas</h1>
          <p className="admin-subtitle">
            Revisa cada caso antes de decidir. Toda resolución queda registrada.
          </p>
        </div>
      </header>
      <Notice error={!target ? error : ""} message={message} />
      <section className="admin-panel">
        <form
          className="admin-filters"
          onSubmit={(e) => {
            e.preventDefault();
            filter({ q: search, page: 1 });
          }}
        >
          <label className="search">
            Buscar
            <input aria-label="Buscar"
              placeholder="Asilo o autor de reseña…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Estado
            <select
              aria-label="Estado"
              value={query.status}
              onChange={(e) => filter({ status: e.target.value, page: 1 })}
            >
              <option value="PENDING">Pendientes</option>
              <option value="DISCARDED">Descartados</option>
              <option value="REVIEW_REMOVED">Reseña eliminada</option>
              <option value="ALL">Todos</option>
            </select>
          </label>
          <label>
            Motivo
            <select
              aria-label="Motivo"
              value={query.reason}
              onChange={(e) => filter({ reason: e.target.value, page: 1 })}
            >
              <option value="">Todos</option>
              {Object.entries(reasons).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className="admin-secondary">Buscar</button>
        </form>
        {loading ? (
          <p role="status">Cargando reportes…</p>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID Reporte</th>
                  <th>Asilo / autor</th>
                  <th>Denunciante</th>
                  <th>Motivo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((row) => (
                  <tr key={row.report_id}>
                    <td>#{row.report_id}</td>
                    <td>
                      <strong>{row.asylum_name}</strong>
                      <small>{row.author_name}</small>
                    </td>
                    <td>{row.reporter_name}</td>
                    <td>{reasons[row.reason] || row.reason}</td>
                    <td>{dateLabel(row.created_at)}</td>
                    <td>
                      <Status value={row.status} />
                    </td>
                    <td>
                      <button
                        className="admin-secondary"
                        onClick={() => {
                          setTarget(row);
                          setDecision("DISCARDED");
                          setJustification("");
                          setError("");
                        }}
                      >
                        {row.status === "PENDING"
                          ? "Moderar"
                          : "Ver resolución"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.total === 0 && (
              <p className="admin-empty">
                No hay reportes con estos criterios.
              </p>
            )}
          </div>
        )}
        {data && (
          <Pagination
            {...data}
            busy={loading}
            onChange={(page) => filter({ page })}
          />
        )}
      </section>
      {target && (
        <Modal
          title={`Reporte #${target.report_id}`}
          busy={busy}
          onClose={() => setTarget(null)}
        >
          <div className="admin-form">
            <p>
              <strong>{target.asylum_name}</strong> · {target.author_name} ·{" "}
              {target.rating}/5
            </p>
            <blockquote className="admin-panel">{target.comment}</blockquote>
            <p>
              Reportado por {target.reporter_name}:{" "}
              {reasons[target.reason] || target.reason}
            </p>
            <p>{target.detail || "Sin detalles adicionales."}</p>
            {target.status !== "PENDING" ? (
              <>
                <Status value={target.status} />
                <p>{target.justification}</p>
                <p>Resuelto: {dateLabel(target.resolved_at)}</p>
              </>
            ) : (
              <form
                className="admin-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    await adminApi.moderate(
                      target.report_id,
                      decision,
                      justification.trim(),
                    );
                    setTarget(null);
                    setMessage(
                      "Resolución guardada. Se notificará al denunciante según sus preferencias.",
                    );
                    setLoading(true);
                    setRefresh(refresh + 1);
                  } catch (err) {
                    setError(adminError(err));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label>
                  Resolución
                  <select
                    aria-label="Resolución"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                  >
                    <option value="DISCARDED">
                      Rechazar reporte y conservar reseña
                    </option>
                    <option value="REVIEW_REMOVED">
                      Aceptar reporte y retirar reseña
                    </option>
                  </select>
                </label>
                {decision === "REVIEW_REMOVED" && (
                  <p className="admin-error">
                    Al aceptar el reporte, la reseña dejará de ser pública y se recalculará la calificación del asilo.
                  </p>
                )}
                <label>
                  Justificación (10–300 caracteres)
                  <textarea aria-label="Justificación (10–300 caracteres)"
                    required
                    minLength={10}
                    maxLength={300}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                  />
                </label>
                <Notice error={error} />
                <div className="admin-actions">
                  <button
                    className="admin-primary"
                    disabled={busy || justification.trim().length < 10}
                  >
                    {busy ? "Guardando…" : decision === "REVIEW_REMOVED" ? "Aceptar reporte" : "Rechazar reporte"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setTarget(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Edit3, Power } from "lucide-react";
import { adminApi, adminError } from "../api";
import type { AdminCenter, Catalogs, Page } from "../types";
import { Modal, Notice, Pagination, Status } from "./AdminUI";
import CenterForm from "./CenterForm";
import CenterDetailsModal from "./CenterDetailsModal";

export default function Centers() {
  const [data, setData] = useState<Page<AdminCenter> | null>(null);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [query, setQuery] = useState({
    q: "",
    status: "",
    provinceId: "",
    page: 1,
  });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [editor, setEditor] = useState<AdminCenter | "new" | null>(null);
  const [confirm, setConfirm] = useState<AdminCenter | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    adminApi
      .catalogs()
      .then((c) => {
        if (alive) setCatalogs(c);
      })
      .catch((e) => {
        if (alive) setError(adminError(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    adminApi
      .centers(query)
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
          <h1>Asilos del sistema</h1>
          <p className="admin-subtitle">
            Gestiona centros, información pública y estado de publicación.
          </p>
        </div>
        <button
          className="admin-primary"
          onClick={() => {
            setError("");
            setEditor("new");
          }}
        >
          <Plus size={16} />
          Registrar asilo
        </button>
      </header>

      <Notice
        error={!editor && !confirm && !viewingId ? error : ""}
        message={message}
      />

      <section className="admin-panel">
        <form
          className="admin-filters"
          onSubmit={(e) => {
            e.preventDefault();
            filter({ q: search, page: 1 });
          }}
        >
          <label className="search" style={{ flex: 2 }}>
            Buscar asilo
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", color: "var(--slate-400)" }} />
              <input
                aria-label="Buscar asilo"
                placeholder="Nombre o ubicación…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </label>
          <label>
            Estado
            <select
              aria-label="Estado"
              value={query.status}
              onChange={(e) => filter({ status: e.target.value, page: 1 })}
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </label>
          <label>
            Provincia
            <select
              aria-label="Provincia"
              value={query.provinceId}
              onChange={(e) => filter({ provinceId: e.target.value, page: 1 })}
            >
              <option value="">Todas</option>
              {catalogs?.provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button className="admin-secondary">Buscar</button>
        </form>

        {loading ? (
          <p role="status" style={{ padding: "30px 0", textAlign: "center", color: "var(--slate-500)" }}>
            Cargando asilos…
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "70px" }}>ID</th>
                  <th>Asilo</th>
                  <th>Precio mensual</th>
                  <th>Administrador asignado</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((c) => (
                  <tr key={c.asylumId}>
                    <td style={{ color: "var(--slate-400)", fontWeight: 500 }}>
                      #{c.asylumId}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <strong style={{ color: "var(--slate-900)", fontWeight: 600 }}>
                          {c.name}
                        </strong>
                        <span style={{ fontSize: "11px", color: "var(--slate-500)" }}>
                          {c.municipalityName}, {c.provinceName}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: "var(--slate-700)" }}>
                      RD$ {Number(c.minPrice).toLocaleString("es-DO")} –{" "}
                      {Number(c.maxPrice).toLocaleString("es-DO")}
                    </td>
                    <td>
                      {c.administrator?.name ? (
                        <span>{c.administrator.name}</span>
                      ) : (
                        <span style={{ color: "var(--slate-400)", fontStyle: "italic" }}>
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td>
                      <Status value={c.status} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          title="Ver detalle"
                          className="admin-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          onClick={() => {
                            setError("");
                            setViewingId(c.asylumId);
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title="Editar"
                          className="admin-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          onClick={() => {
                            setError("");
                            setEditor(c);
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          title={c.status === "ACTIVE" ? "Desactivar" : "Activar"}
                          className="admin-secondary"
                          style={{ 
                            padding: "6px 10px", 
                            fontSize: "12px",
                            color: c.status === "ACTIVE" ? "#dc2626" : "inherit" 
                          }}
                          onClick={() => {
                            setError("");
                            setConfirm(c);
                          }}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.total === 0 && (
              <p className="admin-empty" style={{ padding: "40px", textAlign: "center" }}>
                No hay asilos que coincidan. Cambia los filtros o registra uno
                nuevo.
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

      {/* Modal de Detalle */}
      {viewingId !== null && (
        <CenterDetailsModal
          asylumId={viewingId}
          onClose={() => setViewingId(null)}
        />
      )}

      {/* Modal de Edición / Creación */}
      {editor && (
        <Modal
          title={editor === "new" ? "Registrar asilo" : `Editar ${editor.name}`}
          onClose={() => setEditor(null)}
        >
          <CenterForm
            initial={editor === "new" ? null : editor}
            onCancel={() => setEditor(null)}
            onSaved={() => {
              setEditor(null);
              setMessage("Información del asilo guardada correctamente.");
              setLoading(true);
              setRefresh(refresh + 1);
            }}
          />
        </Modal>
      )}

      {/* Modal de Confirmación de Estado */}
      {confirm && (
        <Modal
          title={`${confirm.status === "ACTIVE" ? "Desactivar" : "Activar"} asilo`}
          busy={busy}
          onClose={() => setConfirm(null)}
        >
          <p>
            ¿Confirmas el cambio de estado de <strong>{confirm.name}</strong>?
          </p>
          <p className="admin-subtitle">
            {confirm.status === "ACTIVE"
              ? "Dejará de aparecer en el catálogo y el mapa. Sus favoritos se conservarán como no disponibles y se notificará a quienes tengan esa preferencia activa."
              : "Volverá a aparecer en el catálogo y el mapa."}
          </p>
          <Notice error={error} />
          <div className="admin-actions">
            <button
              className="admin-primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await adminApi.setCenterStatus(
                    confirm.asylumId,
                    confirm.status !== "ACTIVE"
                  );
                  setConfirm(null);
                  setMessage("Estado actualizado.");
                  setLoading(true);
                  setRefresh(refresh + 1);
                } catch (e) {
                  setError(adminError(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Actualizando…" : "Confirmar"}
            </button>
            <button disabled={busy} onClick={() => setConfirm(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
"use client";
import { useEffect, useState } from "react";
import { adminApi, adminError } from "../api";
import type { AdminUser, Page } from "../types";
import {
  Modal,
  Notice,
  Pagination,
  Status,
  dateLabel,
  roleLabel,
} from "./AdminUI";
import CreateAdmin from "./CreateAdmin";

function History({
  userId,
  history,
  onLoaded,
}: {
  userId: number;
  history: Record<string, unknown>[];
  onLoaded: (rows: Record<string, unknown>[]) => void;
}) {
  useEffect(() => {
    adminApi.blockHistory(userId).then(onLoaded).catch(() => onLoaded([]));
  }, [userId, onLoaded]);
  if (!history.length) return null;
  return (
    <section className="rounded-lg bg-slate-50 p-3 text-sm">
      <h3 className="font-semibold">Historial de seguridad</h3>
      <ul className="mt-2 space-y-1">
        {history.slice(0, 5).map((row) => (
          <li key={String(row.id)}>
            {row.unblockedAt ? "Desbloqueada" : "Bloqueada"} · {dateLabel(row.unblockedAt || row.blockedAt)}
            {row.unblockReason ? ` · ${String(row.unblockReason)}` : ` · ${String(row.reason || "Sin motivo")}`}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Users() {
  const [data, setData] = useState<Page<AdminUser> | null>(null);
  const [query, setQuery] = useState({ q: "", role: "", status: "", page: 1 });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState("");
  const [create, setCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "", description: "" });
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    let alive = true;
    adminApi
      .users(query)
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
          <h1>Usuarios del sistema</h1>
          <p className="admin-subtitle">
            Roles, accesos y cuentas asignadas a cada asilo.
          </p>
        </div>
        <button className="admin-primary" onClick={() => setCreate(true)}>
          Crear administrador de asilo
        </button>
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
            Buscar usuario
            <input aria-label="Buscar usuario"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, usuario o correo…"
            />
          </label>
          <label>
            Rol
            <select
              aria-label="Rol"
              value={query.role}
              onChange={(e) => filter({ role: e.target.value, page: 1 })}
            >
              <option value="">Todos</option>
              {["REGISTERED_USER", "ASYLUM_ADMIN", "SYSTEM_ADMIN"].map(
                (role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ),
              )}
            </select>
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
              <option value="BLOCKED">Bloqueado</option>
            </select>
          </label>
          <button className="admin-secondary">Buscar</button>
        </form>
        {loading ? (
          <p role="status">Cargando usuarios…</p>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Teléfono</th>
                  <th>Rol / asilo</th>
                  <th>Registro</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((user) => (
                  <tr key={user.userId}>
                    <td>#{user.userId}</td>
                    <td>
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>
                      <small>
                        @{user.username} · {user.email}
                      </small>
                    </td>
                    <td>{user.phone || "No registrado"}</td>
                    <td>
                      {roleLabel(user.role)}
                      <small>
                        {user.assignedAsylumId
                          ? `Asilo #${user.assignedAsylumId}`
                          : "Sin asilo asignado"}
                      </small>
                    </td>
                    <td>{dateLabel(user.createdAt)}</td>
                    <td>
                      <Status value={user.status} />
                    </td>
                    <td><div className="admin-actions">
                      <button className="admin-secondary" onClick={() => { setEditTarget(user); setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || "", description: user.description || "" }); setHistory([]); setError(""); }}>Editar datos</button>
                      {user.role === "SYSTEM_ADMIN" ? <small>Cuenta protegida</small> : <button className="admin-secondary" onClick={() => { setTarget(user); setReason(""); setError(""); }}>{user.status === "BLOCKED" ? "Desbloquear" : "Bloquear"}</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.total === 0 && (
              <p className="admin-empty">No hay usuarios que coincidan.</p>
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
      {create && (
        <Modal
          title="Crear administrador de asilo"
          onClose={() => setCreate(false)}
        >
          <CreateAdmin
            onClose={() => setCreate(false)}
            onCreated={() => {
              setLoading(true);
              setRefresh(refresh + 1);
            }}
          />
        </Modal>
      )}
      {target && (
        <Modal
          title={`${target.status === "BLOCKED" ? "Desbloquear" : "Bloquear"} @${target.username}`}
          busy={busy}
          onClose={() => setTarget(null)}
        >
          <History userId={Number(target.userId)} history={history} onLoaded={setHistory} />
          <form
            className="admin-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                if (target.status === "BLOCKED")
                  await adminApi.unblock(Number(target.userId), reason.trim());
                else await adminApi.block(Number(target.userId), reason.trim());
                setTarget(null);
                setMessage("Estado de la cuenta actualizado.");
                setLoading(true);
                setRefresh(refresh + 1);
              } catch (err) {
                setError(adminError(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            <p>
              {target.status === "BLOCKED"
                ? "La cuenta podrá volver a iniciar sesión con sus credenciales habituales."
                : "Se cerrarán sus sesiones y se impedirá el acceso mientras permanezca bloqueada."}
            </p>
            <label>
              {target.status === "BLOCKED" ? "Justificación del desbloqueo" : "Motivo del bloqueo"}
              <textarea aria-label={target.status === "BLOCKED" ? "Justificación del desbloqueo" : "Motivo del bloqueo"} required minLength={10} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
              <small>Se guardará en el historial de seguridad.</small>
            </label>
            <Notice error={error} />
            <div className="admin-actions">
              <button
                className="admin-primary"
                disabled={
                  busy ||
                  reason.trim().length < 10
                }
              >
                {busy ? "Actualizando…" : "Confirmar"}
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
        </Modal>
      )}
      {editTarget && (
        <Modal title={`Editar datos de @${editTarget.username}`} busy={busy} onClose={() => setEditTarget(null)}>
          <form className="admin-form" onSubmit={async (event) => {
            event.preventDefault(); setBusy(true); setError("");
            try {
              await adminApi.updateUser(Number(editTarget.userId), { firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(), email: editForm.email.trim(), phone: editForm.phone.replace(/\D/g, "") || null, description: editForm.description.trim() || null });
              setEditTarget(null); setMessage("Los datos del usuario se actualizaron correctamente."); setRefresh((value) => value + 1);
            } catch (err) { setError(adminError(err)); } finally { setBusy(false); }
          }}>
            <p className="admin-subtitle">El nombre de usuario, rol y asignación se administran por separado.</p>
            <div className="admin-grid">
              {([['firstName','Nombre'],['lastName','Apellido'],['email','Correo electrónico'],['phone','Teléfono']] as const).map(([key,label]) => <label key={key}>{label}<input aria-label={label} required={key !== 'phone'} type={key === 'email' ? 'email' : 'text'} pattern={key === 'phone' ? '[0-9]{10}' : undefined} value={editForm[key]} onChange={(e) => setEditForm((value) => ({ ...value, [key]: e.target.value }))} /></label>)}
            </div>
            <label>Descripción<textarea aria-label="Descripción" maxLength={250} value={editForm.description} onChange={(e) => setEditForm((value) => ({ ...value, description: e.target.value }))} /></label>
            <Notice error={error} />
            <div className="admin-actions"><button className="admin-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button><button type="button" disabled={busy} onClick={() => setEditTarget(null)}>Cancelar</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}

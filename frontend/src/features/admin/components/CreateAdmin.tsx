"use client";
import { useEffect, useState } from "react";
import { adminApi, adminError } from "../api";
import type { AdminCenter } from "../types";
import { Notice } from "./AdminUI";
export default function CreateAdmin({
  onCreated,
  onClose,
}: {
  onCreated: () => void;
  onClose: () => void;
}) {
  const [centers, setCenters] = useState<AdminCenter[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assigned, setAssigned] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<{
    username: string;
    delivered: boolean;
    temporaryPassword: string;
  } | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const items: AdminCenter[] = [];
      let page = 1;
      while (true) {
        const data = await adminApi.centers({ page });
        items.push(...data.items);
        if (page * data.pageSize >= data.total) break;
        page++;
      }
      if (alive) setCenters(items);
    })()
      .catch((e) => {
        if (alive) setError(adminError(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  if (result)
    return (
      <>
        <Notice
          message={`Cuenta @${result.username} creada. ${result.delivered ? "Las instrucciones se enviaron al correo indicado." : "El correo no pudo entregarse. Contacta al responsable del servidor de correo antes de crear otra cuenta."}`}
        />
        {!result.delivered && (
          <label className="admin-form">
            Contraseña temporal (entrega privada al administrador)
            <input aria-label="Contraseña temporal (entrega privada al administrador)"
              readOnly
              value={result.temporaryPassword}
              onFocus={(e) => e.target.select()}
            />
            <small>
              Solo se muestra en esta confirmación. No se guarda en el
              navegador.
            </small>
          </label>
        )}
        <p>
          La contraseña debe cambiarse en el primer inicio de sesión. En
          desarrollo, el correo se consulta en el buzón local de Mailpit.
        </p>
        <button className="admin-primary" onClick={onClose}>
          Cerrar
        </button>
      </>
    );
  const selected = centers.find((c) => c.asylumId === Number(assigned));
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        if (selected?.administrator && !confirmed) {
          setError("Confirma el reemplazo del administrador actual.");
          return;
        }
        const form = new FormData(e.currentTarget);
        setBusy(true);
        try {
          const response = await adminApi.createAdmin({
            firstName: form.get("firstName"),
            lastName: form.get("lastName"),
            username: form.get("username"),
            email: form.get("email"),
            phone: form.get("phone"),
            assignedAsylumId: Number(assigned),
          });
          setResult({
            username: response.user.username,
            delivered: response.emailDelivered,
            temporaryPassword: response.temporaryPassword,
          });
          onCreated();
        } catch (err) {
          setError(adminError(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Notice error={error} />
      <fieldset disabled={busy || loading}>
        <legend>Cuenta y asignación</legend>
        <div className="admin-grid">
          <label>
            Nombre
            <input aria-label="Nombre" name="firstName" required minLength={2} maxLength={50} />
          </label>
          <label>
            Apellido
            <input aria-label="Apellido" name="lastName" required minLength={2} maxLength={50} />
          </label>
          <label>
            Usuario
            <input aria-label="Usuario"
              name="username"
              required
              minLength={3}
              maxLength={16}
              pattern="[A-Za-z0-9]+(\.[A-Za-z0-9]+)*"
            />
          </label>
          <label>
            Correo
            <input aria-label="Correo" name="email" required type="email" maxLength={100} />
          </label>
          <label>
            Teléfono
            <input aria-label="Teléfono" name="phone" required pattern="[0-9]{10}" maxLength={10} />
          </label>
          <label>
            Asilo asignado
            <select
              aria-label="Asilo asignado"
              required
              value={assigned}
              onChange={(e) => {
                setAssigned(e.target.value);
                setConfirmed(false);
              }}
            >
              <option value="">
                {loading ? "Cargando…" : "Selecciona un asilo"}
              </option>
              {centers.map((c) => (
                <option key={c.asylumId} value={c.asylumId}>
                  {c.name}
                  {c.administrator ? " (con administrador)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>
      {selected?.administrator && (
        <label className="admin-error">
          <input aria-label=""
            type="checkbox"
            required
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          Confirmo que se reemplazará a {selected.administrator.name} y se
          revocará su acceso al centro.
        </label>
      )}
      <p className="admin-subtitle">
        Se generará una contraseña temporal y se enviará al correo indicado. El
        acceso será con el nombre de usuario.
      </p>
      <div className="admin-actions">
        <button
          className="admin-primary"
          disabled={busy || loading || !centers.length}
        >
          {busy ? "Creando cuenta…" : "Crear y enviar acceso"}
        </button>
        <button type="button" disabled={busy} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

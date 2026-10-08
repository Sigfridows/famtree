"use client";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export function Notice({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return (
    <>
      {error && (
        <p role="alert" aria-live="assertive" className="admin-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" aria-live="polite" className="admin-success">
          {message}
        </p>
      )}
    </>
  );
}
export function Pagination({
  page,
  total,
  pageSize,
  busy,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  busy?: boolean;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav className="admin-pagination" aria-label="Paginación">
      <span>
        {total ? (page - 1) * pageSize + 1 : 0}–
        {Math.min(page * pageSize, total)} de {total}
      </span>
      <button disabled={busy || page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {pages}
      </span>
      <button
        disabled={busy || page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}
export function Modal({
  title,
  children,
  onClose,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="admin-modal"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="admin-modal-content">
        <header>
          <h2>{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            disabled={busy}
            onClick={onClose}
          >
            ×
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
export function Status({ value }: { value: string }) {
  const labels: Record<string, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    BLOCKED: "Bloqueado",
    PENDING: "Pendiente",
    DISCARDED: "Descartado",
    REVIEW_REMOVED: "Reseña eliminada",
    PUBLISHED: "Publicada",
    HIDDEN: "Oculta",
  };
  return (
    <span
      className={`admin-status ${value === "ACTIVE" || value === "PUBLISHED" ? "positive" : ""}`}
    >
      <i />
      {labels[value] || value}
    </span>
  );
}
export function Bars({
  title,
  values,
}: {
  title: string;
  values: Record<string, number>;
}) {
  const max = Math.max(1, ...Object.values(values));
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
      {Object.keys(values).length === 0 && <p>Sin datos para este período.</p>}
      {Object.entries(values).map(([label, value]) => (
        <div className="admin-bar" key={label}>
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
          <meter min={0} max={max} value={value} aria-label={label} />
        </div>
      ))}
    </section>
  );
}
export const dateLabel = (value: unknown) =>
  value
    ? new Date(String(value)).toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
export const roleLabel = (role: string) =>
  ({
    SYSTEM_ADMIN: "Administrador del sistema",
    ASYLUM_ADMIN: "Administrador de asilo",
    REGISTERED_USER: "Usuario registrado",
  })[role] || role;

"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="admin-success">
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
      className={`admin-status ${
        value === "ACTIVE" || value === "PUBLISHED" ? "positive" : ""
      }`}
    >
      <i />
      {labels[value] || value}
    </span>
  );
}

/* --- Componente Bars interactivo con Recharts --- */
const PALETTE = [
  "#657d39", // FamTree Olive
  "#13261b", // Dark Forest
  "#d97706", // Amber
  "#eab308", // Yellow
  "#2563eb", // Blue
  "#059669", // Emerald
  "#7c3aed", // Purple
];

interface ChartProps {
  title: string;
  values: Record<string, number>;
  type?: "column" | "area" | "pie";
}

export function Bars({ title, values, type = "column" }: ChartProps) {
  const [chartType, setChartType] = useState<"column" | "area" | "pie">(type);

  const data = Object.entries(values).map(([name, value]) => ({
    name,
    value,
  }));

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <section
      className="admin-panel"
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--slate-900)",
            }}
          >
            {title}
          </h2>
          <span style={{ fontSize: "12px", color: "var(--slate-500)" }}>
            Total: <strong>{total}</strong>
          </span>
        </div>

        {/* Switcher interactivo de vistas */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            backgroundColor: "var(--slate-100)",
            padding: "3px",
            borderRadius: "8px",
          }}
        >
          {(
            [
              ["column", "Columnas"],
              ["area", "Área"],
              ["pie", "Donut"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setChartType(key)}
              style={{
                padding: "3px 8px",
                fontSize: "11px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
                backgroundColor:
                  chartType === key ? "#ffffff" : "transparent",
                color:
                  chartType === key
                    ? "var(--slate-900)"
                    : "var(--slate-500)",
                boxShadow:
                  chartType === key ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="admin-empty" style={{ padding: "20px 0", fontSize: "13px" }}>
          Sin datos para mostrar en este período.
        </p>
      ) : (
        <div style={{ width: "100%", height: 220, marginTop: "8px" }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "column" ? (
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="value" fill="var(--famtree-olive, #657d39)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartType === "area" ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--famtree-olive, #657d39)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--famtree-olive, #657d39)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--famtree-olive, #657d39)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            ) : (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
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
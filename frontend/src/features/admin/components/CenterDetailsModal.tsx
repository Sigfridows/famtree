"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  MapPin, 
  BadgeDollarSign, 
  UserCheck, 
  Phone, 
  Calendar, 
  FileText,
  Users
} from "lucide-react";
import { adminApi, adminError } from "../api";
import type { AdminCenter } from "../types";
import { Modal, Notice, Status } from "./AdminUI";

interface CenterDetailsModalProps {
  asylumId: number;
  onClose: () => void;
}

export default function CenterDetailsModal({
  asylumId,
  onClose,
}: CenterDetailsModalProps) {
  const [center, setCenter] = useState<AdminCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminApi
      .center(asylumId)
      .then((data) => {
        if (alive) {
          setCenter(data);
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
  }, [asylumId]);

  return (
    <Modal
      title={center ? `Detalles: ${center.name}` : "Detalles del asilo"}
      onClose={onClose}
    >
      {/* Estilos Minimalistas + Reset Global de Scrollbar para el Modal */}
      <style>{`
        /* Personalización fina del scrollbar (4px) en WebKit y Firefox */
        .min-modal-content,
        .min-modal-content * {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .min-modal-content::-webkit-scrollbar,
        .min-modal-content *::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        .min-modal-content::-webkit-scrollbar-track,
        .min-modal-content *::-webkit-scrollbar-track {
          background: transparent;
        }

        .min-modal-content::-webkit-scrollbar-thumb,
        .min-modal-content *::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 99px;
        }

        .min-modal-content::-webkit-scrollbar-thumb:hover,
        .min-modal-content *::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* SI PREFIERES OCULTAR EL SCROLLBAR POR COMPLETO (Invisibilidad total), DESCOMENTA ESTAS 2 LÍNEAS:
        .min-modal-content::-webkit-scrollbar, .min-modal-content *::-webkit-scrollbar { display: none; }
        .min-modal-content, .min-modal-content * { -ms-overflow-style: none; scrollbar-width: none; }
        */

        .min-modal-content {
          max-height: 68vh;
          overflow-y: auto;
          padding-right: 4px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          color: #0f172a;
        }

        .min-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .min-card-flat {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
        }

        .min-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #64748b;
          padding-bottom: 6px;
          border-bottom: 1px solid #f8fafc;
        }

        .min-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
          gap: 12px;
        }

        .min-label {
          color: #64748b;
          font-weight: 400;
          font-size: 12px;
          white-space: nowrap;
        }

        .min-val {
          font-weight: 500;
          color: #0f172a;
          text-align: right;
        }

        .min-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          color: #1e293b;
        }

        .min-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 12px;
        }
      `}</style>

      <Notice error={error} />

      {loading ? (
        <p role="status" style={{ color: "#94a3b8", fontSize: "12.5px", padding: "12px 0" }}>
          Cargando detalles del asilo…
        </p>
      ) : center ? (
        <div className="min-modal-content">
          
          {/* Header ID del Sistema + Badge Estado */}
          <div className="min-card min-card-flat" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Building2 size={14} strokeWidth={1.5} style={{ color: "#94a3b8" }} />
              <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 400 }}>
                ID del Sistema: <strong className="min-mono" style={{ color: "#0f172a", fontWeight: 600 }}>#{center.asylumId}</strong>
              </span>
            </div>
            <div>
              <Status value={center.status} />
            </div>
          </div>

          {/* Grid Principal */}
          <div className="min-grid">
            
            {/* Ubicación */}
            <div className="min-card">
              <div className="min-header">
                <MapPin size={13} strokeWidth={1.5} style={{ color: "#94a3b8" }} />
                <span>Ubicación</span>
              </div>

              <div className="min-row">
                <span className="min-label">Provincia</span>
                <span className="min-val">{center.provinceName}</span>
              </div>

              <div className="min-row">
                <span className="min-label">Municipio</span>
                <span className="min-val">{center.municipalityName}</span>
              </div>

              {center.sector && (
                <div className="min-row">
                  <span className="min-label">Sector</span>
                  <span className="min-val">{center.sector}</span>
                </div>
              )}

              {center.address && (
                <div className="min-row">
                  <span className="min-label">Dirección</span>
                  <span className="min-val" style={{ maxWidth: "180px", wordBreak: "break-word" }}>
                    {center.address}
                  </span>
                </div>
              )}

              <div className="min-row">
                <span className="min-label">Coordenadas</span>
                <span className="min-val min-mono" style={{ fontSize: "11px", color: "#64748b" }}>
                  {center.latitude}, {center.longitude}
                </span>
              </div>
            </div>

            {/* Precios & Administración */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              <div className="min-card">
                <div className="min-header">
                  <BadgeDollarSign size={13} strokeWidth={1.5} style={{ color: "#94a3b8" }} />
                  <span>Precios y Capacidad</span>
                </div>

                <div className="min-row">
                  <span className="min-label">Rango mensual</span>
                  <span className="min-val min-mono" style={{ fontWeight: 600, color: "#0f172a" }}>
                    RD$ {Number(center.minPrice).toLocaleString("es-DO")} – {Number(center.maxPrice).toLocaleString("es-DO")}
                  </span>
                </div>

                {center.capacity !== undefined && (
                  <div className="min-row">
                    <span className="min-label">Capacidad</span>
                    <span className="min-val min-mono">
                      <Users size={12} strokeWidth={1.5} style={{ display: "inline", marginRight: "4px", color: "#94a3b8", verticalAlign: "middle" }} />
                      {center.capacity} personas
                    </span>
                  </div>
                )}
              </div>

              <div className="min-card">
                <div className="min-header">
                  <UserCheck size={13} strokeWidth={1.5} style={{ color: "#94a3b8" }} />
                  <span>Administración y Registro</span>
                </div>

                <div className="min-row">
                  <span className="min-label">Admin asignado</span>
                  <span className="min-val">
                    {center.administrator ? center.administrator.name : "Sin asignar"}
                  </span>
                </div>

                {center.phone && (
                  <div className="min-row">
                    <span className="min-label">Teléfono</span>
                    <span className="min-val min-mono">
                      <Phone size={12} strokeWidth={1.5} style={{ display: "inline", marginRight: "4px", color: "#94a3b8", verticalAlign: "middle" }} />
                      {center.phone}
                    </span>
                  </div>
                )}

                {center.createdAt && (
                  <div className="min-row">
                    <span className="min-label">Registro</span>
                    <span className="min-val min-mono">
                      <Calendar size={12} strokeWidth={1.5} style={{ display: "inline", marginRight: "4px", color: "#94a3b8", verticalAlign: "middle" }} />
                      {new Date(center.createdAt).toLocaleDateString("es-DO")}
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Descripción */}
          {center.description && (
            <div className="min-card min-card-flat">
              <div className="min-header">
                <FileText size={13} strokeWidth={1.5} style={{ color: "#94a3b8" }} />
                <span>Descripción del centro</span>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.5", color: "#475569" }}>
                {center.description}
              </p>
            </div>
          )}

        </div>
      ) : null}

      <div
        className="admin-actions"
        style={{ marginTop: "16px", justifyContent: "flex-end" }}
      >
        <button className="admin-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
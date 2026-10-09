"use client";
import { useEffect, useState } from "react";
import { centerAdminService } from "../api/centerAdminService";
import type { CenterInfo } from "../types/centerAdmin.types";
import { apiClient } from "@/lib/apiClient";
import CenterGallery from "./CenterGallery";
import { Building2, Save, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";

type Catalogs = {
  services: { id: number; name: string }[];
  care_types: { id: number; name: string }[];
};

const inputStyle =
  "w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-700 focus:outline-none text-slate-800 text-xs font-normal transition-all";

export default function CenterEditor() {
  const [center, setCenter] = useState<CenterInfo | null>(null);
  const [original, setOriginal] = useState<CenterInfo | null>(null);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      centerAdminService.getMyCenterInfo(),
      apiClient.get<Catalogs>("/asylums/catalogs"),
    ])
      .then(([data, options]) => {
        if (alive) {
          setCenter(data);
          setOriginal(data);
          setCatalogs(options.data);
        }
      })
      .catch((err) => {
        if (alive) setError(err.message);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!center || !catalogs)
    return (
      <div className="flex justify-center items-center py-20 text-slate-500 text-xs font-medium" role={error ? "alert" : "status"}>
        {error || "Cargando información del asilo…"}
      </div>
    );

  const change = (key: keyof CenterInfo, value: string | number | number[]) => {
    setCenter({ ...center, [key]: value });
    setSaved(false);
  };

  return (
    <div className="max-w-5xl space-y-6 pb-12">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4" />
            <span>Configuración del Centro</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión del Asilo</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {center.name} · {center.address}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
            center.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {center.status === "ACTIVE" ? "● Activo" : "● Inactivo"}
        </span>
      </div>

      <p className="text-xs text-slate-500 px-1">
        Nota: El administrador del sistema gestiona el nombre principal, la ubicación exacta y el estado general de publicación.
      </p>

      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setError("");
          setSaved(false);
          if (!center.serviceIds.length || !center.seniorTypeIds.length) {
            setError("Selecciona al menos un servicio y un tipo de atención.");
            setSaving(false);
            return;
          }
          try {
            const {
              description,
              phone,
              email,
              minPrice,
              maxPrice,
              totalCapacity,
              entryRequirements,
              certifications,
              website,
              serviceIds,
              seniorTypeIds,
            } = center;
            const updated = await centerAdminService.updateCenterInfo({
              description,
              phone,
              email,
              minPrice,
              maxPrice,
              totalCapacity,
              entryRequirements,
              certifications: certifications || null,
              website: website || null,
              serviceIds,
              seniorTypeIds,
            });
            setCenter(updated);
            setOriginal(updated);
            setSaved(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo guardar");
          } finally {
            setSaving(false);
          }
        }}
      >
        <fieldset
          disabled={saving}
          className="grid gap-5 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 md:grid-cols-2"
        >
          <legend className="font-bold text-slate-900 text-sm mb-2 px-1">
            Información de Contacto y Operativa
          </legend>

          <label className="text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Teléfono</span>
            <input
              aria-label="Teléfono"
              className={inputStyle}
              required
              pattern="[0-9]{10}"
              maxLength={10}
              value={center.phone}
              onChange={(e) => change("phone", e.target.value)}
            />
          </label>

          <label className="text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Correo Electrónico</span>
            <input
              aria-label="Correo"
              className={inputStyle}
              required
              type="email"
              value={center.email}
              onChange={(e) => change("email", e.target.value)}
            />
          </label>

          <label className="text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Precio Mínimo (RD$)</span>
            <input
              aria-label="Precio mínimo (RD$)"
              className={inputStyle}
              required
              type="number"
              min="0.01"
              step="0.01"
              value={center.minPrice}
              onChange={(e) => change("minPrice", e.target.value)}
            />
          </label>

          <label className="text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Precio Máximo (RD$)</span>
            <input
              aria-label="Precio máximo (RD$)"
              className={inputStyle}
              required
              type="number"
              min={center.minPrice}
              step="0.01"
              value={center.maxPrice}
              onChange={(e) => change("maxPrice", e.target.value)}
            />
          </label>

          <label className="text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Capacidad Total (Camas)</span>
            <input
              aria-label="Capacidad total"
              className={inputStyle}
              required
              type="number"
              min="1"
              max="100000"
              value={center.totalCapacity}
              onChange={(e) => change("totalCapacity", Number(e.target.value))}
            />
          </label>

          <label className="text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Sitio Web</span>
            <input
              aria-label="Sitio web"
              className={inputStyle}
              type="url"
              value={center.website ?? ""}
              onChange={(e) => change("website", e.target.value)}
            />
          </label>

          <label className="md:col-span-2 text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Descripción General</span>
            <textarea
              aria-label="Descripción"
              className={`${inputStyle} resize-none`}
              required
              minLength={20}
              maxLength={1000}
              rows={4}
              value={center.description}
              onChange={(e) => change("description", e.target.value)}
            />
          </label>

          <label className="text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Requisitos de Ingreso</span>
            <textarea
              aria-label="Requisitos de ingreso"
              className={`${inputStyle} resize-none`}
              required
              minLength={10}
              maxLength={500}
              rows={3}
              value={center.entryRequirements}
              onChange={(e) => change("entryRequirements", e.target.value)}
            />
          </label>

          <label className="text-xs font-medium text-slate-700 space-y-1.5 block">
            <span>Certificaciones</span>
            <textarea
              aria-label="Certificaciones"
              className={`${inputStyle} resize-none`}
              maxLength={250}
              rows={3}
              value={center.certifications ?? ""}
              onChange={(e) => change("certifications", e.target.value)}
            />
          </label>

          {(
            [
              ["serviceIds", "Servicios Ofrecidos", catalogs.services],
              ["seniorTypeIds", "Tipos de Atención", catalogs.care_types],
            ] as const
          ).map(([key, title, options]) => (
            <div key={key} className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <h2 className="font-bold text-xs text-slate-800 mb-3">{title}</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {options.map((option) => (
                  <label key={option.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      aria-label=""
                      type="checkbox"
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                      checked={center[key].includes(option.id)}
                      onChange={(e) =>
                        change(
                          key,
                          e.target.checked
                            ? [...center[key], option.id]
                            : center[key].filter((id) => id !== option.id),
                        )
                      }
                    />
                    {option.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Cambios guardados correctamente.</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            disabled={saving}
            className="px-6 py-3 bg-[#062319] hover:bg-[#0a3526] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-950/10 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando…" : "Guardar Cambios"}</span>
          </button>
          <button
            type="button"
            disabled={saving}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
            onClick={() => {
              setCenter(original);
              setError("");
              setSaved(false);
            }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
        </div>
      </form>
      <CenterGallery />
    </div>
  );
}
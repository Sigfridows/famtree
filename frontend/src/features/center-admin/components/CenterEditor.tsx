"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { centerAdminService } from "../api/centerAdminService";
import type { CenterInfo } from "../types/centerAdmin.types";
import { apiClient } from "@/lib/apiClient";
import CenterGallery from "./CenterGallery";

type Catalogs = {
  services: { id: number; name: string }[];
  care_types: { id: number; name: string }[];
};
const input =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm";
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
      <p role={error ? "alert" : "status"}>{error || "Cargando asilo…"}</p>
    );
  const change = (key: keyof CenterInfo, value: string | number | number[]) => {
    setCenter({ ...center, [key]: value });
    setSaved(false);
  };
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Gestión del Asilo</h1>
        <Link
          href={`/catalog?asiloId=${center.asylumId}`}
          className="underline"
        >
          Ver perfil público
        </Link>
      </div>
      <p>
        {center.name} · {center.address} ·{" "}
        {center.status === "ACTIVE" ? "Activo" : "Inactivo"}
      </p>
      <p className="text-sm text-slate-500">
        El administrador del sistema gestiona nombre, ubicación y estado de
        publicación.
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
          className="grid gap-5 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2"
        >
          <legend className="font-semibold">Información y contacto</legend>
          <label>
            Teléfono
            <input aria-label="Teléfono"
              className={input}
              required
              pattern="[0-9]{10}"
              maxLength={10}
              value={center.phone}
              onChange={(e) => change("phone", e.target.value)}
            />
          </label>
          <label>
            Correo
            <input aria-label="Correo"
              className={input}
              required
              type="email"
              value={center.email}
              onChange={(e) => change("email", e.target.value)}
            />
          </label>
          <label>
            Precio mínimo (RD$)
            <input aria-label="Precio mínimo (RD$)"
              className={input}
              required
              type="number"
              min="0.01"
              step="0.01"
              value={center.minPrice}
              onChange={(e) => change("minPrice", e.target.value)}
            />
          </label>
          <label>
            Precio máximo (RD$)
            <input aria-label="Precio máximo (RD$)"
              className={input}
              required
              type="number"
              min={center.minPrice}
              step="0.01"
              value={center.maxPrice}
              onChange={(e) => change("maxPrice", e.target.value)}
            />
          </label>
          <label>
            Capacidad total
            <input aria-label="Capacidad total"
              className={input}
              required
              type="number"
              min="1"
              max="100000"
              value={center.totalCapacity}
              onChange={(e) => change("totalCapacity", Number(e.target.value))}
            />
          </label>
          <label>
            Sitio web
            <input aria-label="Sitio web"
              className={input}
              type="url"
              value={center.website ?? ""}
              onChange={(e) => change("website", e.target.value)}
            />
          </label>
          <label className="md:col-span-2">
            Descripción
            <textarea aria-label="Descripción"
              className={input}
              required
              minLength={20}
              maxLength={1000}
              rows={4}
              value={center.description}
              onChange={(e) => change("description", e.target.value)}
            />
          </label>
          <label>
            Requisitos de ingreso
            <textarea aria-label="Requisitos de ingreso"
              className={input}
              required
              minLength={10}
              maxLength={500}
              value={center.entryRequirements}
              onChange={(e) => change("entryRequirements", e.target.value)}
            />
          </label>
          <label>
            Certificaciones
            <textarea aria-label="Certificaciones"
              className={input}
              maxLength={250}
              value={center.certifications ?? ""}
              onChange={(e) => change("certifications", e.target.value)}
            />
          </label>
          {(
            [
              ["serviceIds", "Servicios", catalogs.services],
              ["seniorTypeIds", "Tipos de atención", catalogs.care_types],
            ] as const
          ).map(([key, title, options]) => (
            <div key={key}>
              <h2 className="font-semibold mb-2">{title}</h2>
              {options.map((option) => (
                <label key={option.id} className="block text-sm py-1">
                  <input aria-label=""
                    type="checkbox"
                    checked={center[key].includes(option.id)}
                    onChange={(e) =>
                      change(
                        key,
                        e.target.checked
                          ? [...center[key], option.id]
                          : center[key].filter((id) => id !== option.id),
                      )
                    }
                  />{" "}
                  {option.name}
                </label>
              ))}
            </div>
          ))}
        </fieldset>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-emerald-700">
            Cambios guardados.
          </p>
        )}
        <button
          disabled={saving}
          className="rounded-xl bg-[#062319] px-6 py-3 text-white disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          disabled={saving}
          className="ml-3 rounded-xl border px-6 py-3"
          onClick={() => {
            setCenter(original);
            setError("");
            setSaved(false);
          }}
        >
          Cancelar cambios
        </button>
      </form>
      <CenterGallery />
    </div>
  );
}

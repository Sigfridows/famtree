"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/apiClient";
import { getImageUrl } from "@/lib/utils";
import { compareAsylums } from "@/features/compare/api/compare-asylums";
import type { AsylumDetail } from "../types/asylum.types";

export default function Compare({ onClose }: { onClose?: () => void }) {
  const [items, setItems] = useState<AsylumDetail[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparison, setComparison] = useState<AsylumDetail[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: favorites } = await apiClient.get<{ asylumId: number }[]>("/favorites");
        const responses = await Promise.all(favorites.map(f => apiClient.get<AsylumDetail>(`/asylums/${f.asylumId}`)));
        if (active) setItems(responses.map(r => r.data));
      } catch {
        if (active) setError("No se pudieron cargar tus favoritos. Comprueba que hayas iniciado sesión.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function compare() {
    if (selectedIds.length < 2 || selectedIds.length > 4 || busy) return;
    setBusy(true);
    setError("");
    try { setComparison((await compareAsylums(selectedIds)).items); }
    catch { setError("No se pudo comparar. Comprueba que las residencias sigan disponibles."); }
    finally { setBusy(false); }
  }

  return <section aria-label="Comparar favoritos" className="max-h-[88vh] overflow-auto rounded-3xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-950 dark:text-white">
    <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Comparar favoritos</h2><button onClick={onClose} aria-label="Cerrar comparación">Cerrar</button></div>
    <p className="my-3">Selecciona entre 2 y 4 residencias guardadas.</p>
    {error && <p role="alert" className="my-3 text-red-600">{error}</p>}
    {loading ? <p>Cargando favoritos…</p> : comparison ? <>
      <button onClick={() => setComparison(null)} className="my-3 underline">Volver a la selección</button>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="p-3 text-left">Característica</th>{comparison.map(item => <th className="min-w-48 p-3" key={item.id}>{item.name}</th>)}</tr></thead>
      <tbody>{[
        ["Precio mensual", (a: AsylumDetail) => `RD$ ${Number(a.price_min).toLocaleString()} – ${Number(a.price_max).toLocaleString()}`],
        ["Provincia", (a: AsylumDetail) => a.province_name],
        ["Capacidad", (a: AsylumDetail) => String(a.capacity)],
        ["Calificación", (a: AsylumDetail) => a.rating == null ? "Sin reseñas" : String(a.rating)],
        ["Servicios", (a: AsylumDetail) => a.services.map(s => s.name).join(", ") || "Sin información"],
        ["Tipos de atención", (a: AsylumDetail) => a.care_types.map(s => s.name).join(", ") || "Sin información"],
        ["Certificaciones", (a: AsylumDetail) => a.certifications || "Sin información"],
      ].map(([label, value]) => <tr className="border-t border-zinc-300" key={String(label)}><th className="p-3 text-left">{String(label)}</th>{comparison.map(item => <td className="p-3 align-top" key={item.id}>{(value as (a: AsylumDetail) => string)(item)}</td>)}</tr>)}</tbody></table></div>
    </> : <>
      {!items.length && !error && <p>No tienes residencias guardadas. Guarda tus favoritas desde sus detalles.</p>}
      <div className="space-y-3">{items.map(item => <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 p-3">
        <input type="checkbox" aria-label={`Seleccionar ${item.name}`} checked={selectedIds.includes(item.id)} disabled={busy || (!selectedIds.includes(item.id) && selectedIds.length >= 4)} onChange={() => setSelectedIds(ids => ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id])} />
        {item.cover_url && <Image unoptimized src={getImageUrl(item.cover_url)} alt="" width={64} height={48} className="h-12 w-16 rounded object-cover" />}
        <span>{item.name}</span>
      </label>)}</div>
      <button className="mt-4 rounded-xl bg-[#CCDD99] px-5 py-3 font-bold text-zinc-950 disabled:opacity-50" disabled={busy || selectedIds.length < 2 || selectedIds.length > 4} onClick={() => void compare()}>{busy ? "Comparando…" : `Comparar (${selectedIds.length})`}</button>
    </>}
  </section>;
}

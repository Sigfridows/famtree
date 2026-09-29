"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, ArrowLeft, CheckSquare, Square } from "lucide-react";
import logoFamTree from "@/assets/logo-famtree.png";
import EmptyState from "./EmptyState";

export interface AsiloItem {
  id: string; name: string; status: string; rating: number; province: string; price: string; numericPrice?: number; image: string; isRecommended?: boolean;
  features: { atencion24_7: boolean; terapiaFisioterapia: boolean; habitacionesPrivadas: boolean; camarasSeguridad: boolean; menuAdaptado: boolean; horarioLibre: boolean; };
}

const FEATURE_LABELS: { key: keyof AsiloItem["features"]; label: string }[] = [
  { key: "atencion24_7", label: "Atención Médica 24/7" }, { key: "terapiaFisioterapia", label: "Terapia y Fisioterapia" },
  { key: "habitacionesPrivadas", label: "Habitaciones Privadas" }, { key: "camarasSeguridad", label: "Cámaras y Seguridad" },
  { key: "menuAdaptado", label: "Menú Nutricional Adaptado" }, { key: "horarioLibre", label: "Horario de Visita Libre" },
];
// ... (Aquí van los MOCK_FAVORITOS que mantienes igual)

interface CompareProps { items?: AsiloItem[]; onClose?: () => void; }

export default function Compare({ items = [], onClose }: CompareProps) {
  const [viewMode, setViewMode] = useState<"table" | "comparison">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => items.map((item) => item.id));

  const toggleSelect = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === items.length ? [] : items.map((item) => item.id));
  const selectedAsilos = items.filter((item) => selectedIds.includes(item.id));

  return (
    <div className="relative w-full bg-[#161616] rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 text-white font-montserrat flex flex-col max-h-[88vh]">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors z-30 shadow-md">
          <X className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div key="table-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex flex-col overflow-hidden">
            {/* Header basado en las referencias visuales (Banner #CCDD99) */}
            <div className="bg-[#CCDD99] px-6 sm:px-8 py-5 sm:py-6 flex flex-wrap items-center justify-between gap-4 pr-16 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">Comparar Favoritos</h1>
                <p className="text-xs font-semibold text-zinc-800 mt-0.5">Selecciona las residencias que deseas evaluar en paralelo</p>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                {items.length > 0 && (
                  <button onClick={toggleSelectAll} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/40 hover:bg-white/60 text-zinc-950 font-bold text-xs transition-all">
                    {selectedIds.length === items.length ? <><CheckSquare className="w-3.5 h-3.5" /><span>Desmarcar</span></> : <><Square className="w-3.5 h-3.5" /><span>Marcar todo</span></>}
                  </button>
                )}
                <button
                  onClick={() => selectedIds.length > 0 && setViewMode("comparison")} disabled={selectedIds.length === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                    selectedIds.length > 0 ? "bg-zinc-950 text-[#CCDD99] hover:bg-zinc-900 shadow-md" : "bg-zinc-900/40 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  <Plus className="w-4 h-4" /><span>Comparar ({selectedIds.length})</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-3 max-h-[65vh]">
              {items.length === 0 ? (
                <EmptyState title="No tienes asilos guardados" description="Agrega tus opciones preferidas a favoritos para compararlas en tiempo real." />
              ) : (
                <>
                  <div className="hidden sm:grid grid-cols-12 text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-3 pb-1">
                    <div className="col-span-6 flex items-center gap-3"><span className="w-4" /><span>Residencia</span></div>
                    <div className="col-span-2 text-center">Calificación</div>
                    <div className="col-span-2 text-center">Provincia</div>
                    <div className="col-span-2 text-right pr-2">Monto</div>
                  </div>

                  {items.map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id} onClick={() => toggleSelect(item.id)}
                        className={`grid grid-cols-1 sm:grid-cols-12 items-center p-3.5 rounded-2xl border transition-all cursor-pointer gap-3 sm:gap-0 ${
                          isChecked ? "bg-zinc-900 border-[#CCDD99]/50 shadow-sm" : "bg-[#161616] border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="sm:col-span-6 flex items-center gap-3.5">
                          <input type="checkbox" checked={isChecked} readOnly className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 checked:bg-[#CCDD99] checked:border-[#CCDD99] focus:ring-0 cursor-pointer" />
                          <Image src={item.image} alt={item.name} width={44} height={44} unoptimized className="w-11 h-11 rounded-xl object-cover border border-zinc-800 shrink-0" />
                          <div className="truncate">
                            <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">{item.name}</h4>
                            <span className="text-[10px] text-[#CCDD99] font-medium">{item.status}</span>
                          </div>
                        </div>
                        <div className="sm:col-span-2 text-left sm:text-center font-extrabold text-xs text-white">
                          <span className="sm:hidden text-zinc-500 font-normal mr-1">Rating:</span>★ {item.rating.toFixed(1)}
                        </div>
                        <div className="sm:col-span-2 text-left sm:text-center font-bold text-xs text-zinc-400">
                          <span className="sm:hidden text-zinc-500 font-normal mr-1">Ubicación:</span>{item.province}
                        </div>
                        <div className="sm:col-span-2 text-left sm:text-right pr-2 font-black text-xs text-[#CCDD99]">
                          <span className="sm:hidden text-zinc-500 font-normal mr-1 block text-[10px]">Precio:</span>{item.price}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="comparison-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full p-4 sm:p-6 md:p-8 flex flex-col overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setViewMode("table")} className="flex items-center gap-2 text-xs font-bold text-[#CCDD99] hover:text-[#b8cb83] transition-colors">
                <ArrowLeft className="w-4 h-4" /><span>Volver a la selección</span>
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-2xl border border-zinc-800 bg-[#161616]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800">
                    <th className="p-4 min-w-50 sm:min-w-60 sticky left-0 bg-zinc-900 z-20 font-extrabold text-white border-r border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Image src={logoFamTree} alt="FamTree Logo" width={26} height={26} className="object-contain" />
                        <span className="font-extrabold text-xs tracking-wider uppercase text-white">FAMTREE</span>
                      </div>
                    </th>
                    {selectedAsilos.map((asilo) => (
                      <th key={asilo.id} className="p-4 min-w-52 max-w-64 text-center align-top border-r border-zinc-800 last:border-r-0">
                        <div className={`p-3 rounded-2xl border flex flex-col items-center justify-between h-full ${asilo.isRecommended ? "bg-[#CCDD99]/10 border-[#CCDD99]/30" : "bg-[#161616] border-zinc-800"}`}>
                          <Image src={asilo.image} alt={asilo.name} width={220} height={110} unoptimized className="w-full h-28 rounded-xl object-cover mb-2" />
                          <h3 className="font-extrabold text-xs text-white text-center leading-tight min-h-8 flex items-center justify-center">{asilo.name}</h3>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  <tr className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 font-bold text-zinc-300 bg-[#161616] sticky left-0 z-10 border-r border-zinc-800">Precio Mensual</td>
                    {selectedAsilos.map((asilo) => (
                      <td key={asilo.id} className="p-4 text-center font-black text-xs text-[#CCDD99] border-r border-zinc-800 last:border-r-0">{asilo.price}</td>
                    ))}
                  </tr>
                  {FEATURE_LABELS.map(({ key, label }) => (
                    <tr key={key} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-4 font-bold text-zinc-400 bg-[#161616] sticky left-0 z-10 border-r border-zinc-800">{label}</td>
                      {selectedAsilos.map((asilo) => {
                        const hasFeature = asilo.features[key];
                        return (
                          <td key={asilo.id} className="p-4 text-center border-r border-zinc-800 last:border-r-0">
                            <div className="flex items-center justify-center">
                              {hasFeature ? (
                                <div className="w-6 h-6 rounded-full bg-[#CCDD99]/20 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-[#CCDD99] stroke-3" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                                  <X className="w-3.5 h-3.5 text-rose-400 stroke-3" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
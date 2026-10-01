"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, ArrowLeft, CheckSquare, Square, Sparkles, Building2 } from "lucide-react";
import logoFamTree from "@/assets/famtree.png";
import EmptyState from "./EmptyState";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";
import { AsiloDetailData } from "./AsiloDetails";

export interface AsiloItem {
  id: string;
  numericId: number;
  name: string;
  status: string;
  rating: number;
  province: string;
  price: string;
  numericPrice: number;
  image: string;
  isRecommended?: boolean;
  features: {
    atencion24_7: boolean;
    terapiaFisioterapia: boolean;
    habitacionesPrivadas: boolean;
    camarasSeguridad: boolean;
    menuAdaptado: boolean;
    horarioLibre: boolean;
  };
}

const FEATURE_LABELS: { key: keyof AsiloItem["features"]; label: string }[] = [
  { key: "atencion24_7", label: "Atención Médica 24/7" },
  { key: "terapiaFisioterapia", label: "Terapia y Fisioterapia" },
  { key: "habitacionesPrivadas", label: "Habitaciones Privadas" },
  { key: "camarasSeguridad", label: "Cámaras y Seguridad" },
  { key: "menuAdaptado", label: "Menú Nutricional Adaptado" },
  { key: "horarioLibre", label: "Horario de Visita Libre" },
];

interface CompareProps {
  items?: AsylumSummary[];
  data?: AsiloDetailData;
  onClose?: () => void;
}

function getDeterministicFeature(asylumId: number, salt: number): boolean {
  return ((asylumId * 9301 + salt * 49297) % 233280) % 2 === 0;
}

// CONECTARLO PARA QUE SEA REAL EL CALCULO DE CUALES SERVICIOS SI TIENEN CADA UNO DE LOS ASILO
function mapSummaryToAsiloItem(item: AsylumSummary): AsiloItem {
  if (!item) {
    return {
      id: "0",
      numericId: 0,
      name: "Residencia",
      status: "Desconocido",
      rating: 0,
      province: "N/A",
      price: "Consultar",
      numericPrice: 0,
      image: "",
      features: {
        atencion24_7: true,
        terapiaFisioterapia: false,
        habitacionesPrivadas: false,
        camarasSeguridad: false,
        menuAdaptado: false,
        horarioLibre: false,
      },
    };
  }

  const priceMin = item.price_min ? Number(item.price_min) : 0;
  const priceText = priceMin > 0 ? `RD$ ${priceMin.toLocaleString()}` : "Consultar";

  return {
    id: String(item.id),
    numericId: item.id,
    name: item.name || "Residencia sin nombre",
    status: item.status === "ACTIVE" ? "Abierto" : "Cerrado",
    rating: typeof item.rating === "number" ? item.rating : 0,
    province: item.province_name || item.municipality_name || "República Dominicana",
    price: priceText,
    numericPrice: priceMin,
    image: item.cover_url || "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500&auto=format&fit=crop",
    features: {
      atencion24_7: true,
      terapiaFisioterapia: getDeterministicFeature(item.id || 1, 1),
      habitacionesPrivadas: getDeterministicFeature(item.id || 1, 2),
      camarasSeguridad: getDeterministicFeature(item.id || 1, 3),
      menuAdaptado: getDeterministicFeature(item.id || 1, 4),
      horarioLibre: getDeterministicFeature(item.id || 1, 5),
    },
  };
}

function mapDetailToAsiloItem(detail: AsiloDetailData): AsiloItem {
  const numericId = Number(detail.id) || 0;
  const priceMin = detail.priceMin ? Number(detail.priceMin) : 0;
  const priceText = priceMin > 0 ? `RD$ ${priceMin.toLocaleString()}` : "Consultar";

  return {
    id: String(detail.id),
    numericId,
    name: detail.title || "Residencia sin nombre",
    status: "Abierto",
    rating: typeof detail.rating === "number" ? detail.rating : 0,
    province: detail.address || "República Dominicana",
    price: priceText,
    numericPrice: priceMin,
    image: detail.images?.[0] || "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500&auto=format&fit=crop",
    features: {
      atencion24_7: true,
      terapiaFisioterapia: getDeterministicFeature(numericId || 1, 1),
      habitacionesPrivadas: getDeterministicFeature(numericId || 1, 2),
      camarasSeguridad: getDeterministicFeature(numericId || 1, 3),
      menuAdaptado: getDeterministicFeature(numericId || 1, 4),
      horarioLibre: getDeterministicFeature(numericId || 1, 5),
    },
  };
}

export default function Compare({ data, items = [], onClose }: CompareProps) {
  const [viewMode, setViewMode] = useState<"table" | "comparison">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const formattedItems = useMemo(() => {
    const list = Array.isArray(items) ? items.map(mapSummaryToAsiloItem) : [];

    if (data && !list.some((item) => item.id === String(data.id))) {
      list.unshift(mapDetailToAsiloItem(data));
    }

    return list;
  }, [items, data]);

  useEffect(() => {
  queueMicrotask(() => {
    if (formattedItems.length > 0) {
      setSelectedIds(formattedItems.slice(0, 4).map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  });
}, [formattedItems]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const toggleSelectAll = () => {
    const maxSelectable = Math.min(formattedItems.length, 4);
    if (selectedIds.length === maxSelectable) {
      setSelectedIds([]);
    } else {
      setSelectedIds(formattedItems.slice(0, 4).map((item) => item.id));
    }
  };

  const selectedAsilos = useMemo(() => {
    return formattedItems
      .filter((item) => selectedIds.includes(item.id))
      .map((item, _, array) => {
        const isBest = array.every((other) => {
          if (item.id === other.id) return true;
          if (item.rating > other.rating) return true;
          if (item.rating === other.rating) {
            if (item.numericPrice > 0 && other.numericPrice > 0) {
              return item.numericPrice <= other.numericPrice;
            }
          }
          return false;
        });

        return {
          ...item,
          isRecommended: isBest && array.length > 1,
        };
      });
  }, [formattedItems, selectedIds]);

  // Configuración adaptativa de dimensiones según la cantidad de items comparados
  const layoutConfig = useMemo(() => {
    const count = selectedAsilos.length;
    if (count <= 1) {
      return {
        labelColWidth: "w-1/3",
        itemColWidth: "w-2/3",
        paddingY: "py-3.5",
        paddingX: "px-4",
        imgHeight: "h-32 sm:h-36",
        titleSize: "text-xs sm:text-sm font-extrabold",
        textSize: "text-xs sm:text-sm",
        badgeSize: "text-[10px]",
        iconContainer: "w-6 h-6",
        iconSize: "w-4 h-4",
      };
    }
    if (count === 2) {
      return {
        labelColWidth: "w-1/3",
        itemColWidth: "w-1/3",
        paddingY: "py-2.5 sm:py-3",
        paddingX: "px-3 sm:px-4",
        imgHeight: "h-24 sm:h-28",
        titleSize: "text-xs font-bold",
        textSize: "text-xs",
        badgeSize: "text-[9px]",
        iconContainer: "w-5.5 h-5.5",
        iconSize: "w-3.5 h-3.5",
      };
    }
    if (count === 3) {
      return {
        labelColWidth: "w-[25%]",
        itemColWidth: "w-[25%]",
        paddingY: "py-2 sm:py-2.5",
        paddingX: "px-2.5 sm:px-3",
        imgHeight: "h-18 sm:h-22",
        titleSize: "text-[11px] sm:text-xs font-bold",
        textSize: "text-[11px] sm:text-xs",
        badgeSize: "text-[8px]",
        iconContainer: "w-5 h-5",
        iconSize: "w-3 h-3",
      };
    }
    // 4 items
    return {
      labelColWidth: "w-[20%]",
      itemColWidth: "w-[20%]",
      paddingY: "py-1.5 sm:py-2",
      paddingX: "px-2 sm:px-2.5",
      imgHeight: "h-14 sm:h-18",
      titleSize: "text-[10px] sm:text-[11px] font-bold",
      textSize: "text-[10px] sm:text-[11px]",
      badgeSize: "text-[8px]",
      iconContainer: "w-4.5 h-4.5",
      iconSize: "w-3 h-3",
    };
  }, [selectedAsilos.length]);

  const maxSelectable = Math.min(formattedItems.length, 4);
  const isAllSelected = selectedIds.length === maxSelectable && maxSelectable > 0;

  return (
    <div className="relative w-full max-w-6xl mx-auto bg-[#161616] rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 text-white font-montserrat flex flex-col max-h-[90vh]">
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors z-30 shadow-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col overflow-hidden"
          >
            <div className="bg-[#CCDD99] px-6 sm:px-8 py-5 sm:py-6 flex flex-wrap items-center justify-between gap-4 pr-16 relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                  Comparar Favoritos
                </h1>
                <p className="text-xs font-semibold text-zinc-800 mt-0.5">
                  Selecciona hasta 4 residencias para evaluarlas en paralelo
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                {formattedItems.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    type="button"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/40 hover:bg-white/60 text-zinc-950 font-bold text-xs transition-all cursor-pointer"
                  >
                    {isAllSelected ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Desmarcar todo</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Marcar todo (Máx 4)</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => selectedIds.length > 0 && setViewMode("comparison")}
                  disabled={selectedIds.length === 0}
                  type="button"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                    selectedIds.length > 0
                      ? "bg-zinc-950 text-[#CCDD99] hover:bg-zinc-900 shadow-md cursor-pointer"
                      : "bg-zinc-900/40 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Comparar ({selectedIds.length}/4)</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-3 max-h-[65vh]">
              {formattedItems.length === 0 ? (
                <EmptyState
                  title="No tienes asilos guardados"
                  description="Agrega tus opciones preferidas a favoritos para compararlas en tiempo real."
                />
              ) : (
                <>
                  <div className="hidden sm:grid grid-cols-12 text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-3 pb-1">
                    <div className="col-span-6 flex items-center gap-3">
                      <span className="w-4" />
                      <span>Residencia</span>
                    </div>
                    <div className="col-span-2 text-center">Calificación</div>
                    <div className="col-span-2 text-center">Provincia</div>
                    <div className="col-span-2 text-right pr-2">Monto</div>
                  </div>

                  {formattedItems.map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    const isDisabled = !isChecked && selectedIds.length >= 4;

                    return (
                      <div
                        key={item.id}
                        onClick={() => !isDisabled && toggleSelect(item.id)}
                        className={`grid grid-cols-1 sm:grid-cols-12 items-center p-3.5 rounded-2xl border transition-all cursor-pointer gap-3 sm:gap-0 ${
                          isChecked
                            ? "bg-zinc-900 border-[#CCDD99]/50 shadow-sm"
                            : isDisabled
                            ? "opacity-40 cursor-not-allowed bg-[#121212] border-zinc-800/50"
                            : "bg-[#161616] border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="sm:col-span-6 flex items-center gap-3.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) toggleSelect(item.id);
                            }}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 checked:bg-[#CCDD99] checked:border-[#CCDD99] focus:ring-0 cursor-pointer"
                          />
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={44}
                              height={44}
                              unoptimized
                              className="w-11 h-11 rounded-xl object-cover border border-zinc-800 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-zinc-500" />
                            </div>
                          )}
                          <div className="truncate">
                            <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">
                              {item.name}
                            </h4>
                            <span className="text-[10px] text-[#CCDD99] font-medium">
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <div className="sm:col-span-2 text-left sm:text-center font-extrabold text-xs text-white">
                          ★ {item.rating.toFixed(1)}
                        </div>
                        <div className="sm:col-span-2 text-left sm:text-center font-bold text-xs text-zinc-400">
                          {item.province}
                        </div>
                        <div className="sm:col-span-2 text-left sm:text-right pr-2 font-black text-xs text-[#CCDD99]">
                          {item.price}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="comparison-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full p-4 sm:p-5 flex flex-col overflow-hidden"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setViewMode("table")}
                type="button"
                className="flex items-center gap-2 text-xs font-bold text-[#CCDD99] hover:text-[#b8cb83] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a la selección</span>
              </button>
            </div>

            {/* Contenedor Adaptativo de la Tabla (100% de ancho sin scrollbars) */}
            <div className="w-full rounded-2xl border border-zinc-800 bg-[#161616] overflow-hidden">
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800">
                    <th className={`${layoutConfig.labelColWidth} p-3 sm:p-4 align-middle bg-zinc-900 font-extrabold text-white border-r border-zinc-800`}>
                      <div className="flex items-center gap-2">
                        {logoFamTree ? (
                          <Image
                            src={logoFamTree}
                            alt="FamTree Logo"
                            width={22}
                            height={22}
                            className="object-contain"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-[#CCDD99]" />
                        )}
                        <span className="font-extrabold text-[11px] sm:text-xs tracking-wider uppercase text-white truncate">
                          FAMTREE
                        </span>
                      </div>
                    </th>
                    {selectedAsilos.map((asilo) => (
                      <th
                        key={asilo.id}
                        className={`${layoutConfig.itemColWidth} p-2 sm:p-3 text-center align-top border-r border-zinc-800 last:border-r-0`}
                      >
                        <div
                          className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between h-full relative ${
                            asilo.isRecommended
                              ? "bg-[#CCDD99]/10 border-[#CCDD99]/50 shadow-md"
                              : "bg-[#161616] border-zinc-800"
                          }`}
                        >
                          {asilo.isRecommended && (
                            <div className={`absolute -top-2.5 bg-[#CCDD99] text-zinc-950 px-2 py-0.5 rounded-full ${layoutConfig.badgeSize} font-black tracking-wider uppercase flex items-center gap-1 shadow-md z-10`}>
                              <Sparkles className="w-2.5 h-2.5 shrink-0" /> Recomendado
                            </div>
                          )}
                          {asilo.image ? (
                            <Image
                              src={asilo.image}
                              alt={asilo.name}
                              width={200}
                              height={100}
                              unoptimized
                              className={`w-full ${layoutConfig.imgHeight} rounded-xl object-cover mb-1.5`}
                            />
                          ) : (
                            <div className={`w-full ${layoutConfig.imgHeight} rounded-xl bg-zinc-800 flex items-center justify-center mb-1.5`}>
                              <Building2 className="w-6 h-6 text-zinc-600" />
                            </div>
                          )}
                          <h3 className={`${layoutConfig.titleSize} text-white text-center leading-tight line-clamp-2`}>
                            {asilo.name}
                          </h3>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  <tr className="hover:bg-zinc-900/50 transition-colors">
                    <td className={`${layoutConfig.paddingX} ${layoutConfig.paddingY} font-bold text-zinc-300 ${layoutConfig.textSize} bg-[#161616] border-r border-zinc-800`}>
                      Calificación
                    </td>
                    {selectedAsilos.map((asilo) => (
                      <td
                        key={asilo.id}
                        className={`${layoutConfig.paddingX} ${layoutConfig.paddingY} text-center font-black ${layoutConfig.textSize} text-white border-r border-zinc-800 last:border-r-0`}
                      >
                        ★ {asilo.rating.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-900/50 transition-colors">
                    <td className={`${layoutConfig.paddingX} ${layoutConfig.paddingY} font-bold text-zinc-300 ${layoutConfig.textSize} bg-[#161616] border-r border-zinc-800`}>
                      Precio Mensual
                    </td>
                    {selectedAsilos.map((asilo) => (
                      <td
                        key={asilo.id}
                        className={`${layoutConfig.paddingX} ${layoutConfig.paddingY} text-center font-black ${layoutConfig.textSize} text-[#CCDD99] border-r border-zinc-800 last:border-r-0 truncate`}
                      >
                        {asilo.price}
                      </td>
                    ))}
                  </tr>
                  {FEATURE_LABELS.map(({ key, label }) => (
                    <tr key={key} className="hover:bg-zinc-900/50 transition-colors">
                      <td className={`${layoutConfig.paddingX} ${layoutConfig.paddingY} font-bold text-zinc-400 ${layoutConfig.textSize} bg-[#161616] border-r border-zinc-800 truncate`}>
                        {label}
                      </td>
                      {selectedAsilos.map((asilo) => {
                        const hasFeature = asilo.features?.[key];
                        return (
                          <td
                            key={asilo.id}
                            className={`${layoutConfig.paddingX} ${layoutConfig.paddingY} text-center border-r border-zinc-800 last:border-r-0`}
                          >
                            <div className="flex items-center justify-center">
                              {hasFeature ? (
                                <div className={`${layoutConfig.iconContainer} rounded-full bg-[#CCDD99]/20 flex items-center justify-center shrink-0`}>
                                  <Check className={`${layoutConfig.iconSize} text-[#CCDD99] stroke-3`} />
                                </div>
                              ) : (
                                <div className={`${layoutConfig.iconContainer} rounded-full bg-rose-500/20 flex items-center justify-center shrink-0`}>
                                  <X className={`${layoutConfig.iconSize} text-rose-400 stroke-3`} />
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
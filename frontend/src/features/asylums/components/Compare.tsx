"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, ArrowLeft, GripVertical } from "lucide-react";
import logoFamTree from "@/assets/logo-famtree.png";

export interface AsiloItem {
  id: string;
  name: string;
  status: string;
  rating: number;
  province: string;
  price: string;
  numericPrice?: number;
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

const MOCK_FAVORITOS: AsiloItem[] = [
  {
    id: "1",
    name: 'Centro Geriátrico "Atardecer Dorado"',
    status: "Abierto",
    rating: 4.8,
    province: "Santo Domingo",
    price: "$5,000/mes",
    numericPrice: 5000,
    image:
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80",
    features: {
      atencion24_7: true,
      terapiaFisioterapia: true,
      habitacionesPrivadas: true,
      camarasSeguridad: true,
      menuAdaptado: false,
      horarioLibre: false,
    },
  },
  {
    id: "2",
    name: 'Hogar Residencial "Oasis de la Paz"',
    status: "Abierto",
    rating: 4.3,
    province: "Barahona",
    price: "$2,500/mes",
    numericPrice: 2500,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
    isRecommended: true,
    features: {
      atencion24_7: true,
      terapiaFisioterapia: true,
      habitacionesPrivadas: true,
      camarasSeguridad: false,
      menuAdaptado: true,
      horarioLibre: true,
    },
  },
  {
    id: "3",
    name: 'Villa Senior "Bosques de San Rafael"',
    status: "Abierto",
    rating: 4.9,
    province: "Santiago",
    price: "$10,000/mes",
    numericPrice: 10000,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
    features: {
      atencion24_7: true,
      terapiaFisioterapia: true,
      habitacionesPrivadas: true,
      camarasSeguridad: true,
      menuAdaptado: false,
      horarioLibre: true,
    },
  },
  {
    id: "4",
    name: 'Residencial Senior "Jardines del Valle"',
    status: "Abierto",
    rating: 4.1,
    province: "La Vega",
    price: "$1,450/mes",
    numericPrice: 1450,
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&auto=format&fit=crop&q=80",
    features: {
      atencion24_7: true,
      terapiaFisioterapia: false,
      habitacionesPrivadas: false,
      camarasSeguridad: true,
      menuAdaptado: false,
      horarioLibre: true,
    },
  },
];

interface CompareProps {
  items?: AsiloItem[];
  onClose?: () => void;
}

export default function Compare({ items = MOCK_FAVORITOS, onClose }: CompareProps) {
  const [viewMode, setViewMode] = useState<"table" | "comparison">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    items.map((item) => item.id)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const selectedAsilos = items.filter((item) => selectedIds.includes(item.id));

  return (
    <div className="relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 text-[#161616] font-montserrat flex flex-col max-h-[88vh]">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors z-30 cursor-pointer shadow-md"
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
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col overflow-hidden"
          >
            <div className="bg-[#D6E6B8] px-8 py-6 flex items-center justify-between pr-16">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                Favoritos
              </h1>

              <button
                onClick={() => selectedIds.length > 0 && setViewMode("comparison")}
                disabled={selectedIds.length === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition-all cursor-pointer ${
                  selectedIds.length > 0
                    ? "bg-[#161616] text-white hover:bg-zinc-800"
                    : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>comparar ({selectedIds.length})</span>
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-3">
              <div className="grid grid-cols-12 text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 pb-1">
                <div className="col-span-5 flex items-center gap-3">
                  <span className="w-4" />
                  <span>Geriátrico</span>
                </div>
                <div className="col-span-2 text-center">Calificación</div>
                <div className="col-span-2 text-center">Provincia</div>
                <div className="col-span-3 text-right pr-6">Monto</div>
              </div>

              {items.length === 0 ? (
                <div className="py-12 text-center text-sm font-semibold text-zinc-400">
                  No tienes geriátricos guardados en favoritos para comparar.
                </div>
              ) : (
                items.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={`grid grid-cols-12 items-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-white border-zinc-900 shadow-sm"
                          : "bg-white border-zinc-200/70 hover:border-zinc-300"
                      }`}
                    >
                      <div className="col-span-5 flex items-center gap-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer accent-zinc-900"
                        />
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="w-10 h-10 rounded-xl object-cover border border-zinc-100 shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="font-extrabold text-xs text-zinc-900 truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 text-center font-extrabold text-xs text-zinc-800">
                        {item.rating.toFixed(1)}
                      </div>

                      <div className="col-span-2 text-center font-bold text-xs text-zinc-600">
                        {item.province}
                      </div>

                      <div className="col-span-3 flex items-center justify-end gap-4">
                        <div className="text-right">
                          <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wide">
                            Precio Total:
                          </span>
                          <span className="font-black text-xs text-zinc-900">
                            {item.price}
                          </span>
                        </div>
                        <GripVertical className="w-4 h-4 text-zinc-300 shrink-0" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="comparison-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full p-6 md:p-8 overflow-y-auto"
          >
            <div className="mb-6">
              <button
                onClick={() => setViewMode("table")}
                className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Regresar</span>
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4 items-stretch">
              <div className="col-span-12 lg:col-span-3 flex flex-col justify-between pt-2 pb-2">
                <div>
                  <div className="flex items-center gap-2 mb-8">
                    <Image
                      src={logoFamTree}
                      alt="FamTree Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    <span className="font-extrabold text-xs tracking-wider uppercase text-zinc-800">
                      FAMTREE
                    </span>
                  </div>

                  <div className="space-y-6 text-xs font-bold text-zinc-500 pt-36">
                    <div className="h-6 flex items-center">Precio Mensual</div>
                    <div className="h-6 flex items-center">Atención Médica 24/7</div>
                    <div className="h-6 flex items-center">Terapia y Fisioterapia</div>
                    <div className="h-6 flex items-center">Habitaciones Privadas</div>
                    <div className="h-6 flex items-center">Cámaras y Seguridad</div>
                    <div className="h-6 flex items-center">Menú Nutricional Adaptado</div>
                    <div className="h-6 flex items-center">Horario de Visita Libre</div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {selectedAsilos.map((asilo) => (
                  <div
                    key={asilo.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      asilo.isRecommended
                        ? "bg-[#E3EED0] border-[#C2D89B] shadow-sm"
                        : "bg-white border-zinc-200/80 shadow-sm"
                    }`}
                  >
                    <div>
                      <Image
                        src={asilo.image}
                        alt={asilo.name}
                        width={300}
                        height={128}
                        unoptimized
                        className="w-full h-32 rounded-xl object-cover mb-3 shadow-sm"
                      />
                      <h3 className="font-extrabold text-xs text-zinc-900 text-center leading-tight min-h-8 flex items-center justify-center">
                        {asilo.name}
                      </h3>
                    </div>

                    <div className="space-y-6 pt-6 text-center">
                      <div className="h-6 flex items-center justify-center font-black text-xs text-zinc-900">
                        {asilo.price}
                      </div>

                      <div className="h-6 flex items-center justify-center">
                        {asilo.features.atencion24_7 ? (
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 font-bold" />
                        )}
                      </div>

                      <div className="h-6 flex items-center justify-center">
                        {asilo.features.terapiaFisioterapia ? (
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 font-bold" />
                        )}
                      </div>

                      <div className="h-6 flex items-center justify-center">
                        {asilo.features.habitacionesPrivadas ? (
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 font-bold" />
                        )}
                      </div>

                      <div className="h-6 flex items-center justify-center">
                        {asilo.features.camarasSeguridad ? (
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 font-bold" />
                        )}
                      </div>

                      <div className="h-6 flex items-center justify-center">
                        {asilo.features.menuAdaptado ? (
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 font-bold" />
                        )}
                      </div>

                      <div className="h-6 flex items-center justify-center">
                        {asilo.features.horarioLibre ? (
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 font-bold" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
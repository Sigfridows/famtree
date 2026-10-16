"use client";

import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { useRef, useState } from "react";
import RatingSummary from "@/features/asylums/components/RatingSummary";
import { motion } from "framer-motion";
import { LocateFixed, Plus, Minus, Loader2 } from "lucide-react";
import type L from "leaflet";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/famtree.png";
import { useFavorites } from "@/features/asylums/hooks/useFavorites";
import { toDetailData } from "@/features/asylums/adapters/detail";
import AsiloDetails from "@/features/asylums/components/AsiloDetails";
import { useAsylumDetail } from "@/features/asylums/hooks/useAsylumDetail";
import { useAsylumMap } from "../hooks/useAsylumMap";
import MapLeafletView from "./MapLeafletView";

export default function MapContainer() {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [activePinId, setActivePinId] = useState<number | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const { pins, loading } = useAsylumMap();
  const sidebarRef = useRef<HTMLElement>(null);
  const activePin = pins.find(pin => pin.id === activePinId);
  const orderedPins = activePin ? [activePin, ...pins.filter(pin => pin.id !== activePin.id)] : pins;
  const selectPin = (id: number) => {
    setActivePinId(id);
    if (sidebarRef.current) sidebarRef.current.scrollTop = 0;
  };
  const { data: asylumDetail } = useAsylumDetail(selectedDetailId);
  const modalData = asylumDetail ? toDetailData(asylumDetail) : undefined;

  const handleCenterLocation = () => {
    setActivePinId(null);
    mapInstance?.fitBounds([[17.5, -72.1], [20, -68.2]], { padding: [30, 30] });
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-[#F3F3F3] pl-20 pr-4 py-2 text-[#161616] transition-colors dark:bg-zinc-950 dark:text-zinc-100 sm:pr-8 lg:pl-24 font-montserrat">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6">
        {/* Same centered banner and content width as the catalog. */}
        <header aria-label="Encabezado del mapa" className="relative z-30 flex shrink-0 flex-col items-center justify-between gap-4 lg:flex-row">
          <HeaderDesign
            title="Mapa Interactivo"
            subtitle="Asilos cercanos"
            showResidenceLabel={false}
            className="w-full lg:flex-1 lg:pr-28"
          />
          <HeaderControls showSearch={false} logoSrc={logoFamTree} className="relative z-20 shrink-0 pt-4 lg:-ml-24 lg:pt-0" />
        </header>

        {/* Normal-flow rows/columns keep the list below the header at every size. */}
        <div className="relative z-10 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_26.25rem] lg:grid-rows-1">
          <section aria-label="Mapa de residencias" className="relative min-h-0 overflow-hidden rounded-2xl border border-zinc-300 dark:border-zinc-800">
            <MapLeafletView
              pins={pins}
              activePinId={activePin?.id ?? null}
              onPinSelect={selectPin}
              onMapReady={setMapInstance}
            />
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              <button
                type="button" onClick={handleCenterLocation} title="Ver República Dominicana"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-white shadow-xl transition-colors hover:bg-zinc-800"
              >
                <LocateFixed className="h-5 w-5" />
              </button>
              <div className="flex items-center divide-x divide-zinc-700 overflow-hidden rounded-xl bg-zinc-900 text-white shadow-xl">
                <button type="button" onClick={() => mapInstance?.zoomIn()} title="Acercar" className="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:bg-zinc-800">
                  <Plus className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => mapInstance?.zoomOut()} title="Alejar" className="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:bg-zinc-800">
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            </div>
            {activePin && <button type="button" onClick={() => setActivePinId(null)} className="absolute bottom-20 left-4 z-20 rounded-xl bg-zinc-900 px-3 py-2 text-xs text-white">Cerrar selección</button>}
          </section>

          <aside ref={sidebarRef} role="list" aria-label="Residencias en el mapa"
            className="min-h-0 space-y-3 overflow-y-auto p-2 [scrollbar-color:var(--color-zinc-300)_transparent] dark:[scrollbar-color:var(--color-zinc-700)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
          >
            {loading && <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span className="text-xs font-bold">Cargando ubicaciones...</span>
            </div>}
            {!loading && pins.length === 0 && <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">No se encontraron asilos en esta zona.</p>
            </div>}
            {!loading && orderedPins.map((pin, idx) => {
              const isSelected = activePinId === pin.id;
              return <motion.div
                key={pin.id} role="listitem" aria-label={pin.name} aria-current={isSelected ? "true" : undefined} tabIndex={0}
                onClick={() => selectPin(pin.id)}
                onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {event.preventDefault(); selectPin(pin.id);} }}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`cursor-pointer space-y-2.5 rounded-[14px] border-2 p-4 text-xs shadow-xl transition-colors duration-200 ${isSelected
                  ? "border-[#161616] bg-white dark:border-[#CCDD99] dark:bg-zinc-900"
                  : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#CCDD99]/60 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-[#CCDD99]/20 dark:text-[#d3e5a3]">Disponible</span>
                    <RatingSummary rating={pin.rating} reviewCount={pin.review_count ?? 0}
                      className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200" />
                  </div>
                  {pin.review_count > 0 && <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">{pin.review_count} {pin.review_count === 1 ? "reseña" : "reseñas"}</span>}
                </div>
                {isSelected && <p className="font-semibold text-zinc-800 dark:text-[#CCDD99]">Seleccionado</p>}
                {pin.cover_url && <Image src={getImageUrl(pin.cover_url)} alt={pin.name} width={360} height={120} unoptimized className="h-24 w-full rounded-lg object-cover" />}
                <p>{pin.municipality_name || "Municipio no informado"} · {pin.province_name || "Provincia no informada"}</p>
                <h3 className="text-sm font-extrabold leading-tight text-zinc-900 dark:text-zinc-50">{pin.name}</h3>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-1 dark:border-zinc-800">
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-zinc-600 dark:text-zinc-400">Desde:</span>
                    <span className="text-xs font-black">RD$ {Number(pin.price_min).toLocaleString()} – {Number(pin.price_max).toLocaleString()} /mes</span>
                  </div>
                  <button type="button" onClick={event => {event.stopPropagation(); setSelectedDetailId(pin.id);}}
                    className="cursor-pointer rounded-lg bg-zinc-900 px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >Ver Detalle</button>
                </div>
              </motion.div>;
            })}
          </aside>
        </div>
      </div>
      <AsiloDetails isOpen={!!selectedDetailId} onClose={() => setSelectedDetailId(null)} data={modalData}
        favorites={favorites} isFavorite={selectedDetailId ? isFavorite(selectedDetailId) : false}
        onFavoriteToggle={() => { if (asylumDetail) void toggleFavorite(asylumDetail); }} />
    </div>
  );
}

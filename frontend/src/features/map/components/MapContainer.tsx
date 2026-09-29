"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LocateFixed, Plus, Minus, Star, Loader2 } from "lucide-react";
import type L from "leaflet";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";
import AsiloDetails from "@/features/asylums/components/AsiloDetails";
import { useAsylumDetail } from "@/features/asylums/hooks/useAsylumDetail";
import { useAsylumMap } from "../hooks/useAsylumMap";
import MapLeafletView from "./MapLeafletView";

export default function MapContainer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePinId, setActivePinId] = useState<number | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Hook del feature map
  const { pins, loading, updateFilters } = useAsylumMap();

  // Hook del detalle para el modal al presionar "Ver Detalle"
  const { data: asylumDetail } = useAsylumDetail(selectedDetailId);

  const handleSearch = () => {
    updateFilters({ q: searchQuery });
  };

  const handleZoomIn = () => mapInstance?.zoomIn();
  const handleZoomOut = () => mapInstance?.zoomOut();
  const handleCenterLocation = () => {
    mapInstance?.flyTo([18.47, -69.935], 12);
  };

  const modalData = asylumDetail
    ? {
        id: String(asylumDetail.id),
        title: asylumDetail.name,
        address: asylumDetail.address || `${asylumDetail.sector}, ${asylumDetail.municipality_name}`,
        schedule: "8:00 AM - 6:00 PM",
        email: asylumDetail.email,
        phone: asylumDetail.phone,
        admin: "Administración",
        priceMin: Number(asylumDetail.price_min) || 0,
        description: asylumDetail.description,
        rating: asylumDetail.rating ?? 0,
        isNew: false,
        images: asylumDetail.images?.map((img) => img.url) || [
          "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80",
        ],
      }
    : undefined;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F3F3F3] dark:bg-zinc-950 text-[#161616] dark:text-zinc-100 font-montserrat pl-20 pr-0 pt-0 transition-colors">
      
      {/* Visualización de Leaflet */}
      <MapLeafletView
        pins={pins}
        activePinId={activePinId}
        onPinSelect={(id) => setActivePinId(id)}
        onMapReady={(map) => setMapInstance(map)}
      />

      {/* Cabecera Flotante */}
      <header className="absolute top-0 left-20 right-0 z-30 px-6 pt-0 flex flex-col lg:flex-row items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto w-full lg:flex-1">
          <HeaderDesign
            title="Mapa Interactivo"
            subtitle="Asilos cercanos"
            className="w-full lg:pr-32 shadow-md"
          />
        </div>

        <div className="pointer-events-auto flex items-center gap-3 shrink-0 lg:-ml-24 relative z-30 pt-4 lg:pt-0 pr-6">
          <HeaderControls
            logoSrc={logoFamTree}
            placeholder="¿Qué quieres encontrar?"
            bgClass="bg-white dark:bg-zinc-900 shadow-md"
            borderClass="border-[#A4A4A4] dark:border-zinc-700"
            placeholderClass="placeholder-zinc-400 dark:placeholder-zinc-500 text-[#161616] dark:text-zinc-100"
            buttonBgClass="bg-[#161616] dark:bg-zinc-100 hover:bg-[#b0c872] dark:hover:bg-[#CCDD99]"
            buttonTextClass="text-white dark:text-zinc-900 hover:text-[#161616]"
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </header>

      {/* Controles del Mapa (Bottom Left) */}
      <div className="absolute bottom-6 left-28 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCenterLocation}
          className="w-10 h-10 bg-[#161616] dark:bg-zinc-900 dark:border dark:border-zinc-800 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Mi Ubicación"
        >
          <LocateFixed className="w-5 h-5 text-white dark:text-zinc-200" />
        </button>

        <div className="flex items-center bg-[#161616] dark:bg-zinc-900 dark:border dark:border-zinc-800 text-white rounded-xl shadow-xl overflow-hidden divide-x divide-zinc-700 dark:divide-zinc-800">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-white dark:text-zinc-200"
            title="Acercar"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-white dark:text-zinc-200"
            title="Alejar"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tarjetas Laterales (Derecha) con Scroll Minimalista y Modo Oscuro */}
      <aside 
        className="absolute top-32 right-6 bottom-6 z-20 w-full max-w-105 overflow-y-auto space-y-3 p-2 
          scrollbar-thin [scrollbar-color:var(--color-zinc-300)_transparent] dark:[scrollbar-color:var(--color-zinc-700)_transparent] 
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/80 
          [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600"
      >
        {loading && (
          <div className="flex items-center justify-center p-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-800 dark:text-zinc-200 mr-2" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Cargando ubicaciones...</span>
          </div>
        )}

        {!loading && pins.length === 0 && (
          <div className="p-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl text-center border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">No se encontraron asilos en esta zona.</p>
          </div>
        )}

        {!loading &&
          pins.map((pin, idx) => {
            const isSelected = activePinId === pin.id;
            return (
              <motion.div
                key={pin.id}
                onClick={() => setActivePinId(pin.id)}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`cursor-pointer rounded-[14px] p-4 shadow-xl border-2 transition-all duration-200 space-y-2.5 text-xs ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-[#161616] dark:border-[#CCDD99] scale-[1.01]"
                    : "bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md border-transparent dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#CCDD99]/60 dark:bg-[#CCDD99]/20 text-emerald-900 dark:text-[#d3e5a3] rounded-md font-bold text-[10px]">
                      Disponible
                    </span>
                    {pin.rating && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md font-bold text-[10px]">
                        <Star className="w-3 h-3 fill-amber-800 dark:fill-amber-300" />
                        {pin.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-400 dark:text-zinc-500 font-bold text-[10px]">
                    {pin.review_count || 0} reseñas
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 leading-tight">
                  {pin.name}
                </h3>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="block text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">Desde:</span>
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                      RD$ {Number(pin.price_min).toLocaleString()} /mes
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailId(pin.id);
                    }}
                    className="px-3 py-1.5 bg-[#161616] hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-[10px] font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Ver Detalle
                  </button>
                </div>
              </motion.div>
            );
          })}
      </aside>

      {/* Modal de Detalle */}
      <AsiloDetails
        isOpen={!!selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
        data={modalData}
      />
    </div>
  );
}
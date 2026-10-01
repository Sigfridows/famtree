"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2, MapPin, Star, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: AsylumSummary[];
  onRemoveFavorite: (id: number) => void;
  onSelectAsylum: (id: number) => void;
}

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectAsylum,
}: FavoritesDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay full-screen completo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 w-screen h-screen bg-black/75 backdrop-blur-md z-50 transition-opacity"
          />

          {/* Drawer Lateral */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121315]/85 backdrop-blur-2xl border-l border-white/10 text-white z-50 flex flex-col shadow-2xl shadow-black/80 font-montserrat"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#CCDD99]/15 border border-[#CCDD99]/20 text-[#CCDD99] shadow-inner">
                  <Heart className="w-5 h-5 fill-[#CCDD99]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Mis Favoritos
                  </h2>
                  <p className="text-xs text-zinc-400 font-medium">
                    {favorites.length}{" "}
                    {favorites.length === 1
                      ? "residencia guardada"
                      : "residencias guardadas"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                aria-label="Cerrar favoritos"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Favoritos con scroll minimalista */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800/80 [&::-webkit-scrollbar-thumb]:rounded-full">
              {favorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-4 text-zinc-500 shadow-xl">
                    <Heart className="w-10 h-10 text-zinc-600 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">
                    Sin residencias guardadas
                  </h3>
                  <p className="text-xs text-zinc-400 font-normal leading-relaxed max-w-xs mb-6">
                    Toca el icono del corazón en las tarjetas del catálogo para ir guardando tus opciones preferidas.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-[#CCDD99] text-zinc-950 text-xs font-bold hover:bg-[#b8cb83] transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    Explorar catálogo
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {favorites.map((asylum) => {
                    const isOpenStatus = asylum.status
                      ? asylum.status === "ACTIVE"
                      : true;
                    const formattedPrice = asylum.price_min
                      ? `RD$ ${Number(asylum.price_min).toLocaleString()}`
                      : "Consultar";

                    const locationText =
                      asylum.address ||
                      [asylum.sector, asylum.municipality_name || asylum.province_name]
                        .filter(Boolean)
                        .join(", ");

                    return (
                      <motion.div
                        key={asylum.id}
                        layout
                        initial={{ opacity: 0, y: 15, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                        onClick={() => {
                          onSelectAsylum(asylum.id);
                          onClose();
                        }}
                        className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-white/10 hover:border-[#CCDD99]/40 hover:bg-zinc-900/90 transition-all duration-200 shadow-lg hover:shadow-2xl hover:shadow-[#CCDD99]/5 cursor-pointer select-none"
                      >
                        <div className="relative w-22 h-22 rounded-xl overflow-hidden shrink-0 bg-zinc-800/80 border border-white/5">
                          {asylum.cover_url ? (
                            <Image
                              src={asylum.cover_url}
                              alt={asylum.name}
                              fill
                              sizes="88px"
                              className="object-cover group-hover:scale-108 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] font-semibold">
                              Sin foto
                            </div>
                          )}

                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/10">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOpenStatus ? "bg-[#CCDD99]" : "bg-rose-500"
                              }`}
                            />
                            <span className="text-[9px] font-bold text-zinc-300">
                              {isOpenStatus ? "Abierto" : "Cerrado"}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0 h-22 py-0.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs font-bold text-white truncate leading-snug group-hover:text-[#CCDD99] transition-colors">
                              {asylum.name}
                            </h4>

                            <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-[#CCDD99]/15 border border-[#CCDD99]/30 text-[#CCDD99] text-[10px] font-bold backdrop-blur-xs">
                              <Star className="w-2.5 h-2.5 fill-[#CCDD99]" />
                              <span>{asylum.rating?.toFixed(1) ?? "0.0"}</span>
                            </div>
                          </div>

                          {locationText && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium -mt-1 truncate">
                              <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                              <span className="truncate">{locationText}</span>
                            </div>
                          )}

                          <div className="flex items-end justify-between pt-1">
                            <div>
                              <span className="block text-[9px] text-zinc-500 font-normal leading-none mb-0.5">
                                Desde
                              </span>
                              <span className="text-xs font-extrabold text-[#CCDD99]">
                                {formattedPrice}
                                {asylum.price_min ? (
                                  <span className="text-[10px] font-normal text-zinc-400">
                                    /m
                                  </span>
                                ) : null}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveFavorite(asylum.id);
                                }}
                                className="w-7 h-7 rounded-full bg-zinc-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/5"
                                title="Quitar de favoritos"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <div className="w-7 h-7 rounded-full bg-[#CCDD99] text-zinc-950 flex items-center justify-center shadow-md group-hover:bg-[#b8cb83] transition-all">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
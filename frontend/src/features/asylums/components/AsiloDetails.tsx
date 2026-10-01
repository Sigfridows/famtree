"use client";
import { getImageUrl } from "@/lib/utils";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Share2,
  Clock,
  Mail,
  Phone,
  User,
  Star,
  Loader2,
  CheckCircle2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Compare from "./Compare";
import { AsylumSummary } from "../types/asylum.types";
import { useRouter } from "next/navigation";

export interface AsiloDetailData {
  id: string;
  title: string;
  address: string;
  city?: string;
  schedule: string;
  email: string;
  phone: string;
  website?: string;
  admin: string;
  capacity?: number;
  priceMin: number;
  priceMax?: number;
  description: string;
  rating: number;
  reviewsCount?: number;
  isNew?: boolean;
  images: string[];
  services?: { id: number; name: string }[];
  careTypes?: { id: number; name: string }[];
  amenities?: { id: number; name: string }[];
}

interface AsiloDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  data?: AsiloDetailData;
  loading?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  favorites?: AsylumSummary[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80";

export default function AsiloDetails({
  isOpen,
  onClose,
  data,
  loading = false,
  isFavorite = false,
  onFavoriteToggle,
  favorites = [],
}: AsiloDetailsProps) {
  const router = useRouter();
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handleGiveReview = () => {
    if (!data?.id) return;
    onClose(); // Cerrar el modal
    const encodedTitle = encodeURIComponent(data.title);
    router.push(`/review?asylumId=${data.id}&asylumName=${encodedTitle}`);
  };

  const images = data?.images && data.images.length > 0 ? data.images.map(getImageUrl) : [];

  // RENDERIZADO DINÁMICO DE LA GALERÍA
  const renderGallery = () => {
    const total = images.length;

    if (total <= 1) {
      const src = images[0] || FALLBACK_IMAGE;
      return (
        <div className="w-full h-full min-h-75 lg:min-h-0 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group">
          <Image
            src={src}
            alt="Instalación principal"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      );
    }

    if (total === 2) {
      return (
        <div className="grid grid-cols-2 gap-2.5 w-full h-full min-h-75 lg:min-h-0">
          {images.map((img, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group h-full">
              <Image
                src={img}
                alt={`Instalación ${idx + 1}`}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      );
    }

    if (total === 3) {
      return (
        <div className="grid grid-cols-2 gap-2.5 w-full h-full min-h-75 lg:min-h-0">
          <div className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group h-full">
            <Image
              src={images[0]}
              alt="Instalación 1"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              unoptimized
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col gap-2.5 w-full h-full">
            <div className="h-1/2 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group">
              <Image
                src={images[1]}
                alt="Instalación 2"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="h-1/2 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group">
              <Image
                src={images[2]}
                alt="Instalación 3"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      );
    }

    const extraCount = total - 4;
    return (
      <div className="grid grid-cols-2 gap-2.5 w-full h-full min-h-75 lg:min-h-0">
        <div className="flex flex-col gap-2.5 w-full h-full">
          <div className="h-[38%] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group">
            <Image
              src={images[0]}
              alt="Instalación 1"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              unoptimized
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="h-[62%] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group">
            <Image
              src={images[1]}
              alt="Instalación 2"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              unoptimized
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full h-full">
          <div className="h-[62%] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative group">
            <Image
              src={images[2]}
              alt="Instalación 3"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              unoptimized
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="h-[38%] rounded-2xl overflow-hidden relative bg-zinc-100 dark:bg-zinc-800 group cursor-pointer">
            <Image
              src={images[3]}
              alt="Instalación 4"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              unoptimized
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {extraCount > 0 && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center transition-opacity group-hover:bg-black/60">
                <span className="text-white font-bold text-sm tracking-wide">
                  + {extraCount} fotos
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0"
            />

            {/* Modal Principal adaptado a Modo Oscuro */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-10 p-5 sm:p-7 text-zinc-900 dark:text-zinc-100 font-montserrat flex flex-col overflow-hidden border border-zinc-100 dark:border-zinc-800 transition-colors"
            >
              {/* Botón de Cierre */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full flex items-center justify-center hover:bg-black dark:hover:bg-white transition-colors z-30 cursor-pointer shadow-md"
                aria-label="Cerrar detalles"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Estado de Carga */}
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-zinc-800 dark:text-zinc-200" />
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Cargando información de la residencia...
                  </p>
                </div>
              ) : data ? (
                /* Contenido Principal */
                <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden pr-1 lg:pr-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full">
                    
                    {/* Columna Izquierda: Scroll Minimalista e Información Completa */}
                    <div 
                      className="lg:col-span-6 flex flex-col justify-between h-full space-y-4 pr-2 lg:pr-3 overflow-y-auto max-h-full 
                        scrollbar-thin [scrollbar-color:var(--color-zinc-300)_transparent] dark:[scrollbar-color:var(--color-zinc-700)_transparent] 
                        [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
                        [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/80 
                        [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600"
                    >
                      
                      {/* Badges y Guardar */}
                      <div className="flex items-center justify-between gap-2 pt-0.5 shrink-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="flex items-center gap-1 px-3 py-0.5 bg-[#CCDD99]/40 dark:bg-[#CCDD99]/20 text-[#324408] dark:text-[#d3e5a3] rounded-full text-xs font-bold">
                            <Star className="w-3 h-3 fill-[#324408] dark:fill-[#d3e5a3]" />
                            {data.rating.toFixed(1)}
                            {data.reviewsCount !== undefined && (
                              <span className="text-[10px] font-medium opacity-80">
                                ({data.reviewsCount})
                              </span>
                            )}
                          </span>
                          {data.isNew && (
                            <span className="px-3 py-0.5 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 rounded-full text-xs font-bold">
                              Nuevo
                            </span>
                          )}
                          <span className="px-3 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 rounded-full text-xs font-bold">
                            Verificado
                          </span>
                          <span className="px-3 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold">
                            Seguro
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mr-8 lg:mr-0 shrink-0">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={onFavoriteToggle}
                            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                            aria-pressed={isFavorite}
                          >
                            <Heart
                              className={`w-5 h-5 transition-colors duration-200 ${
                                isFavorite
                                  ? "fill-[#CCDD99] text-[#CCDD99]"
                                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                              }`}
                            />
                          </motion.button>

                          <button
                            type="button"
                            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            aria-label="Compartir"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Título y Dirección */}
                      <div className="space-y-1 shrink-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                          {data.title}
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span>
                            {data.address}
                            {data.city ? `, ${data.city}` : ""}
                          </span>
                        </p>
                      </div>

                      {/* Matriz de Contacto e Información */}
                      <div className="bg-zinc-50/80 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shrink-0 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Horario */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 shadow-2xs">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col -space-y-0.5 min-w-0">
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Horario</span>
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {data.schedule || "No especificado"}
                              </span>
                            </div>
                          </div>

                          {/* Teléfono */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 shadow-2xs">
                              <Phone className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col -space-y-0.5 min-w-0">
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Teléfono</span>
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {data.phone || "No especificado"}
                              </span>
                            </div>
                          </div>

                          {/* Correo */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 shadow-2xs">
                              <Mail className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col -space-y-0.5 min-w-0">
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Correo</span>
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate" title={data.email}>
                                {data.email || "No especificado"}
                              </span>
                            </div>
                          </div>

                          {/* Administrador */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 shadow-2xs">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col -space-y-0.5 min-w-0">
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Administrador</span>
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {data.admin || "No especificado"}
                              </span>
                            </div>
                          </div>

                          {/* Sitio Web */}
                          {data.website && (
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 shadow-2xs">
                                <Globe className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col -space-y-0.5 min-w-0">
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Sitio Web</span>
                                <a
                                  href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline truncate"
                                >
                                  {data.website}
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Capacidad */}
                          {data.capacity !== undefined && (
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 shadow-2xs">
                                <Users className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col -space-y-0.5 min-w-0">
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Capacidad</span>
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {data.capacity} residentes
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Precios */}
                        <div className="pt-2.5 border-t border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Inversión Mensual:</span>
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50">
                              RD$ {Number(data?.priceMin ?? 0).toLocaleString("en-US")}
                            </span>
                            {data.priceMax && data.priceMax > data.priceMin && (
                              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                {" "} - RD$ {data.priceMax.toLocaleString("en-US")}
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium"> /mes</span>
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="space-y-1 shrink-0">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Descripción General</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed whitespace-pre-line">
                          {data.description || "Sin descripción disponible."}
                        </p>
                      </div>

                      {/* Tipos de Cuidado */}
                      {data.careTypes && data.careTypes.length > 0 && (
                        <div className="space-y-1.5 shrink-0">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#324408] dark:text-[#CCDD99]" />
                            Tipos de Cuidado Especializado
                          </h4>
                          <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                            {data.careTypes.map((care) => (
                              <div
                                key={`care-${care.id}`}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#CCDD99]/20 dark:bg-[#CCDD99]/15 border border-[#CCDD99]/60 dark:border-[#CCDD99]/40 text-zinc-900 dark:text-zinc-100"
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#324408] dark:text-[#d3e5a3]" />
                                <span>{care.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Servicios Incluidos */}
                      {data.services && data.services.length > 0 && (
                        <div className="space-y-1.5 shrink-0">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                            Servicios e Instalaciones
                          </h4>
                          <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                            {data.services.map((service) => (
                              <div
                                key={`srv-${service.id}`}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#324408] dark:text-[#d3e5a3]" />
                                <span>{service.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comodidades */}
                      {data.amenities && data.amenities.length > 0 && (
                        <div className="space-y-1.5 shrink-0">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Comodidades y Áreas Comunes</h4>
                          <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200">
                            {data.amenities.map((amenity) => (
                              <div
                                key={`amenity-${amenity.id}`}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 text-amber-900 dark:text-amber-300"
                              >
                                <span>{amenity.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-3 pt-3 pb-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsCompareOpen(true)}
                          className="w-[35%] bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          Comparar
                        </button>
                        <button
                          type="button"
                          onClick={handleGiveReview}
                          className="flex-1 bg-[#CCDD99] hover:bg-[#b8cb83] text-zinc-950 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          Dar Reseña
                        </button>
                      </div>
                    </div>

                    {/* Columna Derecha: Galería Adaptativa */}
                    <div className="lg:col-span-6 w-full h-full min-h-75 lg:min-h-0">
                      {renderGallery()}
                    </div>

                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Comparación */}
      <AnimatePresence>
        {isCompareOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-5xl z-10"
            >
              <Compare data={data} items={favorites} onClose={() => setIsCompareOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
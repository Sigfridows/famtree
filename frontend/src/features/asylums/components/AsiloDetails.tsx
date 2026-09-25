"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bookmark,
  Share2,
  Clock,
  Mail,
  Phone,
  User,
  Heart,
  Stethoscope,
  Utensils,
  Trees,
  Star,
} from "lucide-react";
import Compare from "./Compare";

export interface AsiloDetailData {
  id: string;
  title: string;
  address: string;
  schedule: string;
  email: string;
  phone: string;
  admin: string;
  price: number;
  description: string;
  rating: number;
  isNew?: boolean;
  images: string[];
}

interface AsiloDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  data?: AsiloDetailData;
}

const DEFAULT_ASILO: AsiloDetailData = {
  id: "1",
  title: 'Residencial Geriátrico "Senda Verde"',
  address: "Av. Anacaona #142, Los Cacicazgos, Santo Domingo, República Dominicana",
  schedule: "8:00 AM - 7:00 PM",
  email: "correo.corporativo@gmail.com",
  phone: "809-345-1234",
  admin: "Juan Perez Rodriguez",
  price: 2500,
  rating: 5.0,
  isNew: true,
  description:
    "Un centro de retiro y cuidado integral diseñado para ofrecer máxima tranquilidad, confort y calidad de vida a los adultos mayores. Rodeado de extensas áreas verdes y senderos adaptados con accesibilidad total, el residencial combina atención médica especializada 24/7 con un entorno cálido y familiar. Sus instalaciones incluyen suites privadas con luz natural, salas de fisioterapia y estimulación cognitiva, cocina nutricional personalizada y un programa diario de actividades sociales enfocadas en el bienestar físico y emocional.",
  images: [
    "https://i.pinimg.com/1200x/fb/1e/43/fb1e43536639e2b6c82dd36cd5f93af7.jpg",
    "https://i.pinimg.com/1200x/d6/d7/45/d6d7454addbdde13ba29d775f74c11a9.jpg",
    "https://i.pinimg.com/736x/9b/cd/0e/9bcd0e6c8c5bd4435f97f26e012f30b0.jpg",
    "https://i.pinimg.com/736x/83/72/e3/8372e312bce3278fd079c5f189f1c61d.jpg",
  ],
};

export default function AsiloDetails({
  isOpen,
  onClose,
  data = DEFAULT_ASILO,
}: AsiloDetailsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Imágenes de respaldo si el arreglo no tiene suficientes
  const fallbackImages = [
    data.images[0] || DEFAULT_ASILO.images[0],
    data.images[1] || DEFAULT_ASILO.images[1],
    data.images[2] || DEFAULT_ASILO.images[2],
    data.images[3] || DEFAULT_ASILO.images[3],
  ];

  const extraImagesCount = Math.max(0, data.images.length - 3);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs">
            {/* Backdrop Click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0"
            />

            {/* Modal Principal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-5xl h-full max-h-[90vh] lg:max-h-160 bg-white rounded-3xl shadow-2xl z-10 p-5 sm:p-7 text-[#161616] font-montserrat flex flex-col overflow-hidden border border-zinc-100"
            >
              {/* Botón de Cierre */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors z-30 cursor-pointer shadow-md"
                aria-label="Cerrar detalles"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Contenedor Responsivo Escroiable en Mobile, Grid en Desktop */}
              <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden pr-1 lg:pr-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full">
                  
                  {/* Columna Izquierda: Información Principal */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-4 pr-0 lg:pr-3">
                    
                    {/* Insignias y Acciones */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="flex items-center gap-1 px-3 py-0.5 bg-[#CCDD99]/40 text-[#324408] rounded-full text-xs font-bold">
                          <Star className="w-3 h-3 fill-[#324408]" />
                          {data.rating.toFixed(1)}
                        </span>
                        {data.isNew && (
                          <span className="px-3 py-0.5 bg-cyan-100 text-cyan-800 rounded-full text-xs font-bold">
                            Nuevo
                          </span>
                        )}
                        <span className="px-3 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                          Calidad
                        </span>
                        <span className="px-3 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                          Seguro
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-400 mr-8 lg:mr-0">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
                          aria-label="Guardar en favoritos"
                        >
                          <Bookmark
                            className={`w-5 h-5 transition-colors duration-200 ${
                              isBookmarked
                                ? "fill-amber-500 text-amber-500"
                                : "text-zinc-400 hover:text-zinc-800"
                            }`}
                          />
                        </motion.button>

                        <button 
                          type="button"
                          className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
                          aria-label="Compartir"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Título y Dirección */}
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight">
                        {data.title}
                      </h2>
                      <p className="text-xs text-zinc-400 font-normal max-w-md">
                        {data.address}
                      </p>
                    </div>

                    {/* Detalles de Contacto y Precio */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-zinc-50/60 p-3.5 rounded-2xl border border-zinc-100">
                      <div className="sm:col-span-7 space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-800 shrink-0 shadow-2xs">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col -space-y-0.5">
                            <span className="text-xs font-bold text-zinc-900">{data.schedule}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">Horario</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-800 shrink-0 shadow-2xs">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col -space-y-0.5">
                            <span className="text-xs font-bold text-zinc-900 truncate max-w-45 sm:max-w-none">{data.email}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">Correo</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-800 shrink-0 shadow-2xs">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col -space-y-0.5">
                            <span className="text-xs font-bold text-zinc-900">{data.phone}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">Teléfono</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-800 shrink-0 shadow-2xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col -space-y-0.5">
                            <span className="text-xs font-bold text-zinc-900">{data.admin}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">Administrador</span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-5 sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200">
                        <span className="text-[11px] font-semibold text-zinc-500 block">
                          Precio Total:
                        </span>
                        <div className="flex items-baseline sm:justify-end gap-1 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-zinc-900">
                            RD$ {data.price.toLocaleString("en-US")}
                          </span>
                          <span className="text-xs text-zinc-400 font-semibold">
                            /mes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                        Descripción
                      </h4>
                      <p className="text-xs text-zinc-500 font-normal leading-relaxed line-clamp-4 lg:line-clamp-none">
                        {data.description}
                      </p>
                    </div>

                    {/* Características */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                        Características
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-semibold text-zinc-800">
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                          <Heart className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Cuidado Personal</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                          <Stethoscope className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Atención Médica</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                          <Utensils className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Alimentación</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                          <Trees className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Áreas Verdes</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones Inferiores */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCompareOpen(true)}
                        className="w-[35%] bg-zinc-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        Comparar
                      </button>
                      <button 
                        type="button"
                        className="flex-1 bg-[#CCDD99] hover:bg-[#b8cb83] text-zinc-950 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        Dar Reseña
                      </button>
                    </div>
                  </div>

                  {/* Columna Derecha: Galería de Imágenes */}
                  <div className="lg:col-span-6 w-full min-h-75 lg:min-h-0 h-full">
                    <div className="grid grid-cols-2 gap-2.5 w-full h-full">
                      
                      {/* Columna Izquierda Galería */}
                      <div className="flex flex-col gap-2.5 w-full h-full">
                        <div className="h-[38%] rounded-2xl overflow-hidden bg-zinc-100 relative group">
                          <Image
                            src={fallbackImages[0]}
                            alt="Instalación 1"
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            unoptimized
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="h-[62%] rounded-2xl overflow-hidden bg-zinc-100 relative group">
                          <Image
                            src={fallbackImages[1]}
                            alt="Instalación 2"
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            unoptimized
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* Columna Derecha Galería */}
                      <div className="flex flex-col gap-2.5 w-full h-full">
                        <div className="h-[62%] rounded-2xl overflow-hidden bg-zinc-100 relative group">
                          <Image
                            src={fallbackImages[2]}
                            alt="Instalación 3"
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            unoptimized
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="h-[38%] rounded-2xl overflow-hidden relative bg-zinc-100 group cursor-pointer">
                          <Image
                            src={fallbackImages[3]}
                            alt="Instalación 4"
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            unoptimized
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {extraImagesCount > 0 && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity group-hover:bg-black/50">
                              <span className="text-white font-bold text-sm tracking-wide">
                                + {extraImagesCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
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
              <Compare onClose={() => setIsCompareOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
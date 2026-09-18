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
  address:
    "Av. Anacaona #142, Los Cacicazgos, Santo Domingo, República Dominicana",
  schedule: "8:00 AM - 7:00PM",
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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full h-full max-w-5xl max-h-212.5 bg-white rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-7 text-[#161616] flex flex-col"
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 sm:top-6 sm:right-6 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors z-30 cursor-pointer shadow-md"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full h-full">
                <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-4 pr-0 lg:pr-2">
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-3 py-0.5 bg-[#E2F2C5] text-[#44680A] rounded-full text-xs font-bold">
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

                    <div className="flex items-center gap-2.5 text-zinc-400 mr-8 lg:mr-0">
                      <motion.button
                        whileTap={{ scale: 0.75 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
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
                      <button className="hover:text-zinc-800 transition-colors cursor-pointer">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight">
                      {data.title}
                    </h2>
                    <p className="text-xs text-zinc-400 font-normal max-w-md">
                      {data.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-8 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col -space-y-0.5">
                          <span className="text-xs sm:text-sm font-bold text-zinc-900">
                            {data.schedule}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            Horario
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col -space-y-0.5">
                          <span className="text-xs sm:text-sm font-bold text-zinc-900">
                            {data.email}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            Correo
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col -space-y-0.5">
                          <span className="text-xs sm:text-sm font-bold text-zinc-900">
                            {data.phone}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            Teléfono
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col -space-y-0.5">
                          <span className="text-xs sm:text-sm font-bold text-zinc-900">
                            {data.admin}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            Administrador
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-4 sm:text-right pb-1">
                      <span className="text-xs font-semibold text-zinc-500 block">
                        Precio Total:
                      </span>
                      <div className="flex items-baseline sm:justify-end gap-1 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-zinc-900">
                          $ {data.price.toLocaleString("en-US")}
                        </span>
                        <span className="text-xs text-zinc-400 font-semibold">
                          /mes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                      Descripción
                    </h4>
                    <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                      {data.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                      Características
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-800">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-zinc-800" />
                        <span>Cuidado Personal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-zinc-800" />
                        <span>Atención Médica</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-zinc-800" />
                        <span>Comida</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trees className="w-4 h-4 text-zinc-800" />
                        <span>Áreas Verdes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setIsCompareOpen(true)}
                      className="w-[32%] bg-[#161616] hover:bg-zinc-800 text-white py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Comparar
                    </button>
                    <button className="flex-1 bg-[#C5DC83] hover:bg-[#b0c872] text-zinc-900 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
                      Dar Reseña
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 w-full h-full">
                  <div className="grid grid-cols-2 gap-2.5 w-full h-full">
                    <div className="flex flex-col gap-2.5 w-full h-full">
                      <div className="h-[32%] rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
                        <Image
                          src={data.images[0]}
                          alt="Interior Madera"
                          width={400}
                          height={300}
                          unoptimized
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="h-[68%] rounded-2xl overflow-hidden bg-zinc-100">
                        <Image
                          src={data.images[1]}
                          alt="Comedor Amarillas"
                          width={400}
                          height={500}
                          unoptimized
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 w-full h-full">
                      <div className="h-[70%] rounded-2xl overflow-hidden bg-zinc-100">
                        <Image
                          src={data.images[2]}
                          alt="Pasillo Alto"
                          width={400}
                          height={500}
                          unoptimized
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="h-[30%] rounded-2xl overflow-hidden relative bg-zinc-100 group cursor-pointer shrink-0">
                        <Image
                          src={data.images[3]}
                          alt="Vista Noche"
                          width={400}
                          height={300}
                          unoptimized
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            + 6
                          </span>
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
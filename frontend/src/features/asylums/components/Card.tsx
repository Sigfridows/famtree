"use client";

import Image from "next/image";
import { Star, Bed, Bath, Maximize2 } from "lucide-react";
import type { AsylumSummary } from "../types/asylum.types";

export interface CardProps {
  asylum: AsylumSummary;
  onDetailClick?: (asylum: AsylumSummary) => void;
  // Propiedades mockeadas opcionales para fallback visual
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

export default function Card({
  asylum,
  onDetailClick,
  bedrooms = 3, // Mock
  bathrooms = 2, // Mock
  area = 150, // Mock
}: CardProps) {
  const {
    name,
    address,
    sector,
    municipality_name,
    province_name,
    cover_url,
    rating,
    price_min,
    price_max,
    status,
  } = asylum;

  // Determinamos el estado del asilo
  const isOpen = status ? status === "ACTIVE" : true;

  // Formato de estrellas seguro
  const numericRating = rating ?? 0;

  // Imagen por defecto si no viene cover_url del backend
  const imageUrl =
    cover_url ||
    "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80";

  // Formato de ubicación
  const fullAddress = address || `${sector}, ${municipality_name}, ${province_name}`;

  // Formateador de precios en RD$
  const formattedPrice =
    price_min === price_max || !price_max
      ? `RD$ ${Number(price_min || 0).toLocaleString()}`
      : `RD$ ${Number(price_min || 0).toLocaleString()} - ${Number(price_max).toLocaleString()}`;

  return (
    <div className="relative group h-96 w-75 rounded-xl overflow-hidden font-montserrat flex flex-col justify-between p-5 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#AEAEC0]">
      {/* Imagen de fondo con overlay degradado */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-black/40" />
      </div>

      {/* Cabecera Superior (Badges) */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Badge Estado */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isOpen ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <span className="text-[10px] font-bold text-zinc-900">
            {isOpen ? "Abierto" : "Cerrado"}
          </span>
        </div>

        {/* Badge Calificación */}
        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs drop-shadow-md">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(numericRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-400 fill-zinc-400/50"
                }`}
              />
            ))}
          </div>
          <span className="text-white text-xs ml-1 font-bold">
            {numericRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Información Inferior */}
      <div className="relative z-10 space-y-2.5">
        <div>
          <h3 className="text-white text-base font-montserrat font-bold leading-tight line-clamp-1">
            {name}
          </h3>
          <p className="text-white/80 text-[11px] mt-0.5 font-montserrat font-semibold line-clamp-2">
            {fullAddress}
          </p>
        </div>

        {/* Especificaciones Mokeadas de la propiedad */}
        <div className="flex items-center justify-between font-montserrat text-[10px] font-medium text-zinc-300">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-zinc-300" />
            <span>{bedrooms} Hab</span>
          </div>

          <span className="w-px h-3.5 bg-white/40" />

          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-zinc-300" />
            <span>{bathrooms} Baños</span>
          </div>

          <span className="w-px h-3.5 bg-white/40" />

          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
            <span>{area}m²</span>
          </div>
        </div>

        {/* Footer: Precio y Botón de Modal */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="block text-[10px] text-zinc-400 font-normal">
              Desde
            </span>
            <span className="text-white text-xs font-bold">
              {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onDetailClick?.(asylum)}
            className="bg-[#CCDD99] text-zinc-950 hover:bg-[#b8cb83] px-4 py-2 rounded-[10px] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
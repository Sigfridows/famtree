"use client";

import Image from "next/image";
import { Star, Bed, Bath, Maximize2 } from "lucide-react";

export interface CardProps {
  id: string;
  title: string;
  address: string;
  isOpen: boolean;
  rating: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // m²
  price: number;
  imageUrl: string;
  onDetailClick?: () => void; // Prop agregada para manejar el modal
}

export default function Card({
  title,
  address,
  isOpen,
  rating,
  bedrooms,
  bathrooms,
  area,
  price,
  imageUrl,
  onDetailClick,
}: CardProps) {
  return (
    <div className="relative group h-93.75 w-75 rounded-xl overflow-hidden font-montserrat flex flex-col justify-between p-5 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#AEAEC0]">
      {/* Imagen de fondo con overlay degradado */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={title}
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
                  i < Math.floor(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-400 fill-zinc-400/50"
                }`}
              />
            ))}
          </div>
          <span className="text-white text-xs ml-1 font-bold">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Información Inferior */}
      <div className="relative z-10 space-y-2.5">
        <div>
          <h3 className="text-white text-base font-montserrat font-bold leading-tight">
            {title}
          </h3>
          <p className="text-white/80 text-[11px] mt-0.5 font-montserrat font-semibold line-clamp-2">
            {address}
          </p>
        </div>

        {/* Especificaciones de la propiedad */}
        <div className="flex items-center justify-between font-montserrat text-[10px] font-medium text-zinc-300">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-zinc-300" />
            <span>{bedrooms} Habitaciones</span>
          </div>

          <span className="w-px h-3.5 bg-white/40" />

          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-zinc-300" />
            <span>{bathrooms} Baño</span>
          </div>

          <span className="w-px h-3.5 bg-white/40" />

          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
            <span>Área: {area}m²</span>
          </div>
        </div>

        {/* Footer: Precio y Botón de Modal */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="block text-[12px] text-zinc-400 font-normal">
              Precio Total
            </span>
            <span className="text-white text-base font-bold">
              ${price.toLocaleString()}
            </span>
          </div>

          {/* Reemplazado <Link> por <button> para ejecutar el evento sin redirigir */}
          <button
            type="button"
            onClick={onDetailClick}
            className="bg-[#CCDD99] text-zinc-950 hover:bg-[#b8cb83] px-5 py-2.5 rounded-[10px] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
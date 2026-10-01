"use client";

import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { Star, Bed, Bath, Maximize2 } from "lucide-react";
import type { AsylumSummary } from "../types/asylum.types";

export interface CardProps {
  asylum: AsylumSummary;
  onDetailClick?: (asylum: AsylumSummary) => void;
  bedrooms?: number; bathrooms?: number; area?: number;
}

export default function Card({ asylum, onDetailClick, bedrooms = 3, bathrooms = 2, area = 150 }: CardProps) {
  const { name, address, sector, municipality_name, province_name, cover_url, rating, price_min, price_max, status } = asylum;

  const isOpen = status ? status === "ACTIVE" : true;
  const numericRating = rating ?? 0;
  const imageUrl = getImageUrl(cover_url) || "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80";
  const fullAddress = address || `${sector}, ${municipality_name}, ${province_name}`;
  const formattedPrice = price_min === price_max || !price_max
      ? `RD$ ${Number(price_min || 0).toLocaleString()}`
      : `RD$ ${Number(price_min || 0).toLocaleString()} - ${Number(price_max).toLocaleString()}`;

  return (
    <div className="relative group h-96 w-75 rounded-2xl overflow-hidden font-montserrat flex flex-col justify-between p-5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#CCDD99]/10 bg-zinc-950">
      <div className="absolute inset-0 z-0">
        <Image unoptimized src={imageUrl} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80" sizes="(max-width: 768px) 100vw, 25vw" />
        {/* Degradado más oscuro para el Dark Mode */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] via-[#0f0f0f]/70 to-transparent" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50">
          <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-[#CCDD99]" : "bg-rose-500"}`} />
          <span className="text-[10px] font-bold text-zinc-200">{isOpen ? "Abierto" : "Cerrado"}</span>
        </div>

        <div className="flex items-center gap-1 text-[#CCDD99] font-bold text-xs bg-zinc-900/80 px-2 py-1 rounded-full backdrop-blur-md border border-zinc-700/50">
          <Star className="w-3 h-3 fill-[#CCDD99] text-[#CCDD99]" />
          <span className="text-white text-xs font-bold">{numericRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="relative z-10 space-y-2.5">
        <div>
          <h3 className="text-white text-base font-bold leading-tight line-clamp-1">{name}</h3>
          <p className="text-zinc-400 text-[11px] mt-0.5 font-semibold line-clamp-2">{fullAddress}</p>
        </div>

        <div className="flex items-center justify-between text-[10px] font-medium text-zinc-400">
          <div className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /><span>{bedrooms} Hab</span></div>
          <span className="w-px h-3.5 bg-zinc-700" />
          <div className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /><span>{bathrooms} Baños</span></div>
          <span className="w-px h-3.5 bg-zinc-700" />
          <div className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /><span>{area}m²</span></div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="block text-[10px] text-zinc-500 font-normal">Desde</span>
            <span className="text-[#CCDD99] text-xs font-bold">{formattedPrice}</span>
          </div>
          <button onClick={() => onDetailClick?.(asylum)} className="bg-[#CCDD99] text-zinc-950 hover:bg-[#b8cb83] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer">
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
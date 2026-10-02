"use client";
import { getImageUrl } from "@/lib/utils";

import Image from "next/image";
import { Star } from "lucide-react";
import type { AsylumMapPin } from "../api/get-asylum-map";

export function createPinHtml(isSelected: boolean): string {
  if (isSelected) {
    return `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute w-9 h-9 rounded-full bg-[#CCDD99]/60 dark:bg-[#CCDD99]/40 animate-ping"></span>
        <div class="w-6 h-6 rounded-full bg-[#CCDD99] ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center shadow-[0_0_18px_rgba(204,221,153,1)]">
          <div class="w-3.5 h-3.5 rounded-full bg-zinc-950 dark:bg-zinc-900 shadow-[0_0_8px_rgba(0,0,0,0.5)]"></div>
        </div>
      </div>
    `;
  }
  return `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="w-5 h-5 rounded-full bg-[#CCDD99] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
        <div class="w-3.5 h-3.5 rounded-full bg-[#161616] dark:bg-zinc-900"></div>
      </div>
    </div>
  `;
}

interface MapPopupProps {
  pin: AsylumMapPin;
  onDetailClick: (id: number) => void;
}

export default function MapPopup({ pin, onDetailClick }: MapPopupProps) {
  return (
    <div className="p-1 font-montserrat w-48 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 rounded-xl">
      {pin.cover_url && (
        <div className="w-full h-24 relative rounded-xl overflow-hidden mb-2 bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={getImageUrl(pin.cover_url)}
            alt={pin.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
      <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-tight mb-1 truncate">
        {pin.name}
      </h4>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
          RD$ {Number(pin.price_min).toLocaleString()}
        </span>
        {pin.rating && (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-[#CCDD99]/40 dark:bg-[#CCDD99]/20 text-[#324408] dark:text-[#d3e5a3] px-1.5 py-0.5 rounded-md">
            <Star className="w-2.5 h-2.5 fill-[#324408] dark:fill-[#d3e5a3]" />
            {pin.rating.toFixed(1)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDetailClick(pin.id)}
        className="w-full bg-[#161616] dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
      >
        Ver Detalle
      </button>
    </div>
  );
}
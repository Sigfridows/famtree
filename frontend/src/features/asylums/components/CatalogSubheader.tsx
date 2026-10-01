"use client";

import { useState } from "react";
import {
  Heart,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Clock,
} from "lucide-react";
import FilterModal, { FilterData } from "@/features/asylums/components/Filter";

interface CatalogSubheaderProps {
  totalResults: number;
  savedCount: number;
  onOpenFavorites: () => void;
  onApplyFilters?: (filters: FilterData) => void;
  activeFilterCount?: number;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  selectedQuickFilter?: string;
  onQuickFilterChange?: (filterId: string) => void;
  servicesList?: string[];
}

const QUICK_FILTERS = [
  { id: "all", label: "Todas", icon: null },
  { id: "open", label: "Abiertas ahora", icon: Clock },
  { id: "top_rated", label: "Mejor valoradas", icon: Sparkles },
];

export default function CatalogSubheader({
  totalResults,
  savedCount,
  onOpenFavorites,
  onApplyFilters,
  activeFilterCount = 0,
  viewMode = "grid",
  onViewModeChange,
  selectedQuickFilter = "all",
  onQuickFilterChange,
  servicesList,
}: CatalogSubheaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <section className="w-full mb-6 relative z-30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#121315]/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/40">
        
        {/* LADO IZQUIERDO: Contador y Filtros Rápidos */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {totalResults}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {totalResults === 1 ? "residencia" : "residencias"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_FILTERS.map((chip) => {
              const Icon = chip.icon;
              const isActive = selectedQuickFilter === chip.id;

              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onQuickFilterChange?.(chip.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#CCDD99] text-zinc-950 shadow-md shadow-[#CCDD99]/10"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LADO DERECHO: Selector de vista, Favoritos y Filtros */}
        <div className="relative z-30 flex items-center justify-between sm:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
          
          {onViewModeChange && (
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/5">
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#CCDD99] text-zinc-950 shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Vista en cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#CCDD99] text-zinc-950 shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Vista en lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="hidden sm:block w-px h-6 bg-white/10" />

          {/* Botón Guardados */}
          <button
            type="button"
            onClick={onOpenFavorites}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer active:scale-95 group"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                savedCount > 0
                  ? "fill-[#CCDD99] text-[#CCDD99]"
                  : "text-zinc-400 group-hover:text-white"
              }`}
            />
            <span>Guardados</span>
            {savedCount > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#CCDD99] text-zinc-950 text-[10px] font-extrabold ml-0.5">
                {savedCount}
              </span>
            )}
          </button>

          {/* CONTENEDOR ANCLADO DE FILTROS */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#CCDD99]" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#CCDD99] text-zinc-950 text-[10px] font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Modal anclado al botón mediante `absolute top-full right-0` */}
            <FilterModal
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              servicesList={servicesList}
              onApply={(filters) => {
                onApplyFilters?.(filters);
                setIsFilterOpen(false);
              }}
            />
          </div>

        </div>

      </div>
    </section>
  );
}
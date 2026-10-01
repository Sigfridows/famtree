"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import Card from "@/features/asylums/components/Card";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";
import AsiloDetails, {
  AsiloDetailData,
} from "@/features/asylums/components/AsiloDetails";
import { useAsylums } from "@/features/asylums/hooks/useAsylums";
import { useAsylumDetail } from "@/features/asylums/hooks/useAsylumDetail";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";
import EmptyState from "@/features/asylums/components/EmptyState";
import FilterModal, { FilterData } from "@/features/asylums/components/Filter";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: -16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function CatalogoPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsiloId, setSelectedAsiloId] = useState<number | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const { data, loading, updateFilters } = useAsylums();
  const { data: asylumDetail, loading: detailLoading } =
    useAsylumDetail(selectedAsiloId);

  const asylums: AsylumSummary[] = data?.items || [];

  const handleSearch = () => {
    updateFilters({ q: searchQuery });
  };

  const modalData: AsiloDetailData | undefined = asylumDetail
    ? {
        id: String(asylumDetail.id),
        title: asylumDetail.name,
        address:
          asylumDetail.address ||
          `${asylumDetail.sector ? `${asylumDetail.sector}, ` : ""}${
            asylumDetail.municipality_name
          }`,
        schedule: "8:00 AM - 6:00 PM",
        email: asylumDetail.email,
        phone: asylumDetail.phone,
        admin: "Administración",
        priceMin: Number(asylumDetail.price_min) || 0,
        priceMax: Number(asylumDetail.price_max) || undefined,
        description: asylumDetail.description,
        rating: asylumDetail.rating ?? 0,
        isNew: false,
        images:
          asylumDetail.images?.length > 0
            ? asylumDetail.images.map((img) => img.url)
            : asylumDetail.cover_url
            ? [asylumDetail.cover_url]
            : [],
        services: asylumDetail.services,
        careTypes: asylumDetail.care_types,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-zinc-900 dark:bg-[#121315] dark:text-white font-montserrat pl-20 lg:pl-24 pr-4 sm:pr-8 py-6 relative overflow-hidden">
      {/* Resplandores ambientales tenues para la estética dark */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-[#CCDD99]/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-20 w-100 h-100 bg-[#CCDD99]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.03] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Cabecera y Controles */}
        <div className="-mt-4 flex flex-col z-40 lg:flex-row items-center justify-between relative">
          <HeaderDesign
            title="Catálogo"
            subtitle="Residencias y asilos disponibles"
            className="w-full lg:flex-1 lg:pr-28"
          />

          <HeaderControls
            logoSrc={logoFamTree}
            placeholder="Buscar residencias..."
            bgClass="bg-white dark:bg-[#1A1C1E]/80 backdrop-blur-md"
            borderClass="border-zinc-300 dark:border-white/10"
            placeholderClass="placeholder-zinc-500 text-zinc-900 dark:text-white/90 font-light"
            buttonBgClass="bg-[#CCDD99] hover:bg-[#b8cb83]"
            buttonTextClass="text-zinc-950 font-medium"
            className="shrink-0 lg:-ml-24 relative z-20 pt-4 lg:pt-0"
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>

        {/* Botón de Filtros */}
        <div className="flex justify-end items-center pt-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 text-xs font-light text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-white dark:bg-[#1A1C1E]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 shadow-xs transition-all cursor-pointer"
            >
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#CCDD99] text-[#121315] text-[10px] flex items-center justify-center font-medium">
                  {activeFiltersCount}
                </span>
              )}
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
            </button>

            <FilterModal
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onApply={(filters: FilterData) => {
                let count = 0;
                if (filters.maxPrice && filters.maxPrice < 50000) count++;
                if (filters.services && filters.services.length > 0) count++;
                if (filters.certifiedOnly) count++;
                if (filters.minRatingOnly) count++;
                setActiveFiltersCount(count);

                updateFilters({
                  q: searchQuery || undefined,
                  max_price: filters.maxPrice
                    ? String(filters.maxPrice)
                    : undefined,
                  page: 1,
                });
                setIsFilterOpen(false);
              }}
            />
          </div>
        </div>

        {/* Estado de Carga */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#CCDD99] mb-3 stroke-[1.5]" />
            <p className="text-xs font-light text-zinc-400">
              Cargando catálogo de residencias...
            </p>
          </div>
        )}

        {/* Estado Vacío */}
        {!loading && asylums.length === 0 && (
          <EmptyState
            title="No se encontraron residencias"
            description="No encontramos residencias que coincidan con los criterios o búsqueda seleccionados."
            actionLabel={searchQuery ? "Limpiar búsqueda" : undefined}
            onAction={() => {
              setSearchQuery("");
              updateFilters({ q: "" });
            }}
          />
        )}

        {/* Grid de Tarjetas */}
        {!loading && asylums.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {asylums.map((asylum) => (
              <motion.div key={asylum.id} variants={cardVariants}>
                <Card
                  asylum={asylum}
                  onDetailClick={() => setSelectedAsiloId(asylum.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal de Detalle */}
        <AsiloDetails
          isOpen={!!selectedAsiloId}
          onClose={() => setSelectedAsiloId(null)}
          data={modalData}
          loading={detailLoading}
        />
      </div>
    </div>
  );
}
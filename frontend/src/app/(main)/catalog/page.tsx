"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import Card from "@/features/asylums/components/Card";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";
import AsiloDetails from "@/features/asylums/components/AsiloDetails";
import { useAsylums } from "@/features/asylums/hooks/useAsylums";
import { useAsylumDetail } from "@/features/asylums/hooks/useAsylumDetail";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";
import EmptyState from "@/features/asylums/components/EmptyState";
import FilterModal, { FilterData } from "@/features/asylums/components/Filter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: -35, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function CatalogoPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsiloId, setSelectedAsiloId] = useState<number | null>(null);

  // Hook real de asilos
  const { data, loading, updateFilters } = useAsylums();

  // Hook para el detalle en el modal
  const { data: asylumDetail } = useAsylumDetail(selectedAsiloId);

  const asylums: AsylumSummary[] = data?.items || [];

  const handleSearch = () => {
    updateFilters({ q: searchQuery });
  };

  // Mapeo adaptativo del detalle backend para el componente AsiloDetails
  const modalData = asylumDetail
    ? {
        id: String(asylumDetail.id),
        title: asylumDetail.name,
        address:
          asylumDetail.address ||
          `${asylumDetail.sector}, ${asylumDetail.municipality_name}`,
        schedule: "8:00 AM - 6:00 PM",
        email: asylumDetail.email,
        phone: asylumDetail.phone,
        admin: "Administración",
        price: Number(asylumDetail.price_min) || 0,
        imageUrl:
          asylumDetail.cover_url ||
          "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80",
        description: asylumDetail.description,
        rating: asylumDetail.rating ?? 0,
        isNew: false,
        images: asylumDetail.images?.map((img) => img.url) || [
          "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80",
        ],
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#F6F7F8] text-[#161616] font-montserrat pl-24 pr-8 py-6 relative overflow-hidden">
      {/* Capas visuales de fondo */}
      <div className="absolute top-0 right-0 w-150 h-150 bg-[#CCDD99]/50 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-20 w-125 h-125 bg-[#CCDD99]/70 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-size-[20px_20px] opacity-35 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Cabecera */}
        <div className="-mt-6 flex flex-col z-40 lg:flex-row items-center justify-between relative">
          <HeaderDesign
            title="Catálogo"
            subtitle="Asilos cercanos"
            className="w-full lg:flex-1 lg:pr-28"
          />

          <HeaderControls
            logoSrc={logoFamTree}
            placeholder="Buscar residencias..."
            bgClass="bg-white"
            borderClass="border-[#A4A4A4]"
            placeholderClass="placeholder-zinc-400 text-[#161616]"
            buttonBgClass="bg-[#161616] hover:bg-[#b0c872]"
            buttonTextClass="text-white hover:text-[#161616]"
            className="shrink-0 lg:-ml-24 relative z-20 pt-4 lg:pt-0"
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>

        {/* Barra de Filtros */}
        <div className="flex justify-end items-center pt-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-800 hover:text-black bg-transparent px-4 py-2 transition-all cursor-pointer"
            >
              <span>Filtros</span>
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <FilterModal
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onApply={(filters: FilterData) => {
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

        {/* Estado de Carga (Loading) */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-700 mb-3" />
            <p className="text-sm font-semibold text-zinc-600">
              Cargando catálogo de asilos...
            </p>
          </div>
        )}

        {/* Estado Vacío (Empty State) */}
        {!loading && asylums.length === 0 && (
          <EmptyState
            title="No hay asilos disponibles"
            description="Actualmente no encontramos residencias registradas o que coincidan con tus filtros. Por favor, intenta de nuevo más tarde."
            actionLabel={searchQuery ? "Restablecer búsqueda" : undefined}
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4"
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
        />
      </div>
    </div>
  );
}

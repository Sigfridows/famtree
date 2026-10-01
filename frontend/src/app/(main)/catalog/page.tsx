"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Loader2 } from "lucide-react";
import Card from "@/features/asylums/components/Card";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/famtree.png";
import AsiloDetails, {
  AsiloDetailData,
} from "@/features/asylums/components/AsiloDetails";
import { useAsylums } from "@/features/asylums/hooks/useAsylums";
import { useAsylumDetail } from "@/features/asylums/hooks/useAsylumDetail";
import { useFavorites } from "@/features/asylums/hooks/useFavorites";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";
import EmptyState from "@/features/asylums/components/EmptyState";
import FavoritesDrawer from "@/features/asylums/components/FavoritesDrawer";
import CatalogSubheader from "@/features/asylums/components/CatalogSubheader";

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

// Componente interno para aislar la lectura de SearchParams dentro de Suspense
function CatalogContent() {
  const searchParams = useSearchParams();
  const asiloIdFromUrl = searchParams.get("asiloId");

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsiloId, setSelectedAsiloId] = useState<number | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Estados de control para la barra superior
  const [quickFilter, setQuickFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Custom hook para la gestión centralizada y optimista de favoritos
  const { favorites, isFavorite, toggleFavorite, removeFavoriteById } =
    useFavorites();

  const { data, loading, updateFilters } = useAsylums();
  const { data: asylumDetail, loading: detailLoading } =
    useAsylumDetail(selectedAsiloId);

  // 1. EFECTO: Captura el parámetro de la URL y abre el modal correspondiente
  useEffect(() => {
  if (asiloIdFromUrl) {
    const parsedId = Number(asiloIdFromUrl);
    if (!isNaN(parsedId)) {
      queueMicrotask(() => {
        setSelectedAsiloId(parsedId);
      });
    }
  }
}, [asiloIdFromUrl]);

  const rawAsylums: AsylumSummary[] = data?.items || [];

  // 2. HIDRATACIÓN: Enriquece la lista de favoritos con los datos del catálogo si la API devuelve datos parciales
  const enrichedFavorites = favorites.map((fav) => {
    const matched = rawAsylums.find((item) => Number(item.id) === Number(fav.id));
    return matched ? { ...fav, ...matched } : fav;
  });

  // 3. FALLBACK: Construye el objeto selectedAsylum casteando a AsylumSummary
  const selectedAsylum: AsylumSummary | undefined =
    rawAsylums.find((item) => item.id === selectedAsiloId) ||
    (asylumDetail
      ? ({
          id: asylumDetail.id,
          name: asylumDetail.name,
          address: asylumDetail.address,
          rating: asylumDetail.rating ?? 0,
          cover_url: asylumDetail.cover_url || asylumDetail.images?.[0]?.url || "",
          status: asylumDetail.status,
          price_min: asylumDetail.price_min,
          price_max: asylumDetail.price_max,
          province_id: asylumDetail.province_id ?? 0,
          province_name: asylumDetail.province_name ?? "",
          municipality_id: asylumDetail.municipality_id ?? 0,
          municipality_name: asylumDetail.municipality_name ?? "",
        } as AsylumSummary)
      : undefined);

  // Filtrado rápido cliente
  const asylums = rawAsylums.filter((asylum) => {
    if (quickFilter === "open") return asylum.status === "ACTIVE";
    if (quickFilter === "top_rated") return (asylum.rating ?? 0) >= 4.0;
    return true;
  });

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
    <div className="min-h-screen bg-[#F3F3F3] text-zinc-900 dark:bg-[#121315] dark:text-white font-montserrat pl-20 lg:pl-24 pr-4 sm:pr-8 py-6 relative overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
      {/* Resplandores ambientales */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-[#CCDD99]/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-20 w-100 h-100 bg-[#CCDD99]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.03] pointer-events-none z-0" />

      {/* Scrollbar minimalista */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #0e0e0e;
        }
        ::-webkit-scrollbar-thumb {
          background: #222222;
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ccd999;
        }
      `}</style>

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
            borderClass="border-white/10"
            placeholderClass="placeholder-zinc-500 text-zinc-900 dark:text-white/90 font-light"
            buttonBgClass="bg-[#CCDD99] hover:bg-[#b8cb83]"
            buttonTextClass="text-zinc-950 font-medium"
            className="shrink-0 lg:-ml-24 relative z-20 pt-4 lg:pt-0"
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>

        {/* SUBHEADER COMPONENTE REUTILIZABLE */}
        <div className="relative z-30">
          <CatalogSubheader
            totalResults={asylums.length}
            savedCount={enrichedFavorites.length}
            onOpenFavorites={() => setIsFavoritesOpen(true)}
            activeFilterCount={activeFiltersCount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedQuickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            onApplyFilters={(filters) => {
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
            }}
          />
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
            actionLabel={
              searchQuery || quickFilter !== "all"
                ? "Restablecer filtros"
                : undefined
            }
            onAction={() => {
              setSearchQuery("");
              setQuickFilter("all");
              updateFilters({ q: "" });
            }}
          />
        )}

        {/* Contenedor de Tarjetas */}
        {!loading && asylums.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`relative z-0 ${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                : "flex flex-col gap-4"
            }`}
          >
            {asylums.map((asylum) => (
              <motion.div key={asylum.id} variants={cardVariants}>
                <Card
                  asylum={asylum}
                  isFavorite={isFavorite(asylum.id)}
                  onFavoriteToggle={() => toggleFavorite(asylum)}
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
          isFavorite={selectedAsiloId ? isFavorite(selectedAsiloId) : false}
          onFavoriteToggle={() =>
            selectedAsylum && toggleFavorite(selectedAsylum)
          }
          favorites={enrichedFavorites}
        />

        {/* Drawer Lateral de Favoritos */}
        <FavoritesDrawer
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favorites={enrichedFavorites}
          onRemoveFavorite={removeFavoriteById}
          onSelectAsylum={(id) => setSelectedAsiloId(id)}
        />
      </div>
    </div>
  );
}

// Exportación principal envuelta en Suspense (Requerido por Next.js App Router para searchParams)
export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121315] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#CCDD99] mb-2" />
          <p className="text-xs text-zinc-400 font-light">Cargando...</p>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
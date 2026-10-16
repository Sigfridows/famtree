"use client";
import { requestAuthentication } from "@/components/shared/AuthenticationPrompt";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Loader2 } from "lucide-react";
import Card from "@/features/asylums/components/Card";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/famtree.png";
import { toDetailData } from "@/features/asylums/adapters/detail";
import AsiloDetails, {
} from "@/features/asylums/components/AsiloDetails";
import { useAsylums } from "@/features/asylums/hooks/useAsylums";
import { useAsylumDetail } from "@/features/asylums/hooks/useAsylumDetail";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useFavorites } from "@/features/asylums/hooks/useFavorites";
import type { AsylumFilters, AsylumSummary } from "@/features/asylums/types/asylum.types";
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
  const { isAuthenticated } = useAuth();
  const asiloIdFromUrl = searchParams.get("asiloId");

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsiloId, setSelectedAsiloId] = useState<number | null>(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Estados de control para la barra superior
  const [quickFilter, setQuickFilter] = useState<string>("all");

  // Custom hook para la gestión centralizada y optimista de favoritos
  const { favorites, isFavorite, toggleFavorite, removeFavoriteById } =
    useFavorites();

  const { data, loading, filters, error, refetch, updateFilters } = useAsylums();
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
    return true;
  });

  const modalData = asylumDetail ? toDetailData(asylumDetail) : undefined;

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
        <div className="relative z-40 flex items-center">
          <HeaderDesign
            title="Catálogo"
            showResidenceLabel={false}
            subtitle="Residencias y asilos disponibles"
            className="w-full"
          />

          <HeaderControls showSearch={false} logoSrc={logoFamTree} className="absolute right-4 bottom-4 sm:right-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-20" />
        </div>

        {/* SUBHEADER COMPONENTE REUTILIZABLE */}
        <div className="relative z-30">
          <CatalogSubheader
            totalResults={asylums.length}
            savedCount={enrichedFavorites.length}
            onOpenFavorites={() => isAuthenticated ? setIsFavoritesOpen(true) : requestAuthentication("Inicia sesión para consultar tus residencias guardadas.")}
            activeFilterCount={activeFiltersCount}
            selectedQuickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={() => updateFilters({ q: searchQuery || undefined })}
            onApplyFilters={(filters) => {
              setActiveFiltersCount(Object.values(filters).filter(value => Array.isArray(value) ? value.length : value !== undefined && value !== false).length);
              updateFilters({
                property_type: filters.type as AsylumFilters['property_type'],
                q: searchQuery || undefined,
                min_price: filters.minPrice === undefined ? undefined : String(filters.minPrice),
                max_price: filters.maxPrice === undefined ? undefined : String(filters.maxPrice),
                province_id: filters.province, municipality_id: filters.municipality,
                services: filters.services, care_types: filters.careTypes,
                certified_only: filters.certifiedOnly ?? false, rating_min: filters.minRating, page: 1,
              });
            }}
          />
        </div>

        <label className="flex items-center gap-3 text-sm">Ordenar por
          <select aria-label="Ordenar residencias" className="rounded-lg border border-zinc-600 bg-zinc-900 p-2 text-white" value={filters.sort ?? 'name_asc'} onChange={event => updateFilters({sort: event.target.value as AsylumFilters['sort']})}>
            <option value="name_asc">Nombre A–Z</option><option value="name_desc">Nombre Z–A</option><option value="price_asc">Menor precio</option><option value="price_desc">Mayor precio</option><option value="rating_desc">Mejor calificación</option>
          </select>
        </label>
        {filters.rating_min !== undefined && <p role="status" className="my-2 text-sm text-[#CCDD99]">Filtro aplicado: mínimo {filters.rating_min} {filters.rating_min === 1 ? "estrella" : "estrellas"}.</p>}
        {error && <p role="alert">No se pudo cargar el catálogo. <button onClick={refetch}>Reintentar</button></p>}
        {data && data.pagination.pages > 1 && <nav aria-label="Paginación del catálogo" className="flex gap-4"><button disabled={data.pagination.page <= 1} onClick={() => updateFilters({page: data.pagination.page - 1})}>Anterior</button><span>Página {data.pagination.page} de {data.pagination.pages}</span><button disabled={data.pagination.page >= data.pagination.pages} onClick={() => updateFilters({page: data.pagination.page + 1})}>Siguiente</button></nav>}
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
            className="relative z-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
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

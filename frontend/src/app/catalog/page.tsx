"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import FilterModal from "../../components/Filter";
import Card from "../../components/Card";
import HeaderDesign from "@/components/shared/HeaderDesing";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";
import AsiloDetails, { AsiloDetailData } from "@/components/AsiloDetails";

// Datos de prueba adaptados a AsiloDetailData con IDs únicos
const MOCK_HOMES: AsiloDetailData[] = Array.from({ length: 8 }, (_, index) => ({
  id: (index + 1).toString(),
  title: `Asilo Fuente de Luz ${index + 1}`,
  address: "Av. Duarte Km22, Calle Tercera 25, Santo Domingo 17304",
  schedule: "8:00 AM - 7:00 PM",
  email: "contacto@fuentedeluz.com",
  phone: "809-345-1234",
  admin: "Juan Pérez Rodríguez",
  price: 1100 + index * 150,
  imageUrl: "https://i.pinimg.com/736x/47/8f/ad/478fadc26c73819b706973dfecf965a6.jpg",
  description:
    "Un centro de retiro y cuidado integral diseñado para ofrecer máxima tranquilidad, confort y calidad de vida a los adultos mayores. Cuenta con atención médica 24/7 y áreas verdes.",
  rating: 4.8,
  isNew: index % 2 === 0,
  images: [
    "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80",
  ],
}));

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
  const [selectedAsilo, setSelectedAsilo] = useState<AsiloDetailData | null>(null);

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-[#161616] font-montserrat pl-24 pr-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="-mt-6 flex flex-col z-40 lg:flex-row items-center justify-between relative">
          <HeaderDesign
            title="Catalogo"
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
            onSearch={() => console.log("Buscando...", searchQuery)}
          />
        </div>

        {/* Barra de Filtros */}
        <div className="flex justify-end items-center pt-2">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-800 hover:text-black bg-transparent px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Filtros</span>
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <FilterModal
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onApply={(filters) => {
                console.log("Filtros aplicados:", filters);
                setIsFilterOpen(false);
              }}
            />
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4"
        >
          {MOCK_HOMES.map((home) => (
            <motion.div key={home.id} variants={cardVariants}>
              <Card
              bedrooms={2} bathrooms={1} area={250} imageUrl={""} {...home}
              isOpen={true}
              onDetailClick={() => setSelectedAsilo(home)}              />
            </motion.div>
          ))}
        </motion.div>

        {/* Modal de Detalle con la propiedad data vinculada */}
        <AsiloDetails
          isOpen={!!selectedAsilo}
          onClose={() => setSelectedAsilo(null)}
          data={selectedAsilo || undefined}
        />
      </div>
    </div>
  );
}
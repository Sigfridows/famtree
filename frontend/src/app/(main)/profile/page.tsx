"use client";

import { useState } from "react";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";
import { ProfileForm } from "@/features/profile/components/ProfileForm";

export default function GestionarPerfilPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative min-h-screen bg-[#F3F3F3] text-[#161616] font-montserrat pl-24 lg:pl-28 pr-6 pt-0 pb-16">
      <div className="mx-auto space-y-6">
        {/* CABECERA */}
        <header className="pt-0 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="w-full lg:flex-1">
            <HeaderDesign
              title="Gestionar Perfil"
              subtitle="Administra tu información personal y preferencias"
              className="w-full lg:pr-32 shadow-md"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 lg:-ml-24 relative z-30 pt-4 lg:pt-0 pr-6">
            <HeaderControls
              logoSrc={logoFamTree}
              placeholder="¿Qué quieres encontrar?"
              bgClass="bg-white shadow-md"
              borderClass="border-[#A4A4A4]"
              placeholderClass="placeholder-zinc-400 text-[#161616]"
              buttonBgClass="bg-[#161616] hover:bg-[#b0c872]"
              buttonTextClass="text-white hover:text-[#161616]"
              searchValue={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSearch={() => console.log("Buscando...", searchQuery)}
            />
          </div>
        </header>

        {/* CONTENIDO DE LA CARACTERÍSTICA DE PERFIL */}
        <ProfileForm />
      </div>
    </div>
  );
}
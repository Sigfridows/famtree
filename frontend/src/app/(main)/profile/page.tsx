"use client";

import { useState } from "react";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";
import { ProfileForm } from "@/features/profile/components/ProfileForm";

export default function GestionarPerfilPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative min-h-screen bg-[#121315] text-white font-montserrat pl-24 lg:pl-28 pr-6 pt-6 pb-16 selection:bg-[#CCD999] selection:text-black">
      {/* Glow ambiental sutil de fondo */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-[#CCD999]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto space-y-8 max-w-7xl">
        {/* CABECERA */}
        <header className="pt-0 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="w-full lg:flex-1">
            <HeaderDesign
              title="Gestionar Perfil"
              subtitle="Administra tu información personal y preferencias"
              className="w-full lg:pr-32 shadow-2xl border border-white/10 bg-[#141414]"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 lg:-ml-24 relative z-30 pt-4 lg:pt-0 pr-2">
            <HeaderControls
              logoSrc={logoFamTree}
              placeholder="¿Qué quieres encontrar?"
              bgClass="bg-[#141414] backdrop-blur-xl shadow-2xl"
              borderClass="border-white/10"
              placeholderClass="placeholder-zinc-400 text-white"
              buttonBgClass="bg-[#CCD999] hover:bg-[#b8cb83]"
              buttonTextClass="text-zinc-950 font-bold"
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
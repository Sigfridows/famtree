"use client";

import { useState } from "react";
import HeaderDesign from "@/components/shared/HeaderDesign";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/famtree.png";
import { ProfileForm } from "@/features/profile/components/ProfileForm";

export default function GestionarPerfilPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative min-h-screen bg-[#121315] text-white font-montserrat pl-24 lg:pl-28 pr-6 pt-6 pb-16 selection:bg-[#CCD999] selection:text-black">
      {/* Resplandores ambientales tenues para la estética dark */}
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
              placeholder="Que quieres encontrar?"
              bgClass="bg-[#1A1C1E]/80 backdrop-blur-md"
              borderClass="border-white/10"
              placeholderClass="placeholder-zinc-500 text-white/90 font-light"
              buttonBgClass="bg-[#CCDD99] hover:bg-[#b8cb83]"
              buttonTextClass="text-zinc-950 font-medium"
              className="shrink-0 lg:-ml-24 relative z-20 pt-4 lg:pt-0"
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
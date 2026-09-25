import { Search, PhoneCall } from "lucide-react";
import Image from "next/image";
import fondoInicio from "@/assets/fondo-inicio.png";
import logoFamTree from "@/assets/logo-famtree.png";
import NotificationsPopover from "../../components/shared/Notification";

export default function HomePage() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-8 pl-28 md:pl-32 shadow-2xl text-white">
      {/* 1. Imagen de fondo optimizada */}
      <Image
        src={fondoInicio}
        alt="Fondo FamTree"
        fill
        priority
        className="object-cover object-center -z-20"
      />

      {/* 2. Capa de oscurecimiento */}
      <div className="absolute inset-0 bg-black/60 -z-10" />

      {/* Header superior: Buscador y Logo */}
      <header className="relative z-40 flex justify-end items-center gap-6">
        {/* Notificaciones */}
        <NotificationsPopover variant="dark" />

        <div className="w-110 h-11 flex items-center justify-between bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50">
          <input
            type="text"
            placeholder="¿Qué quieres encontrar?"
            className="bg-transparent border-none outline-none text-sm placeholder-zinc-300 w-full pr-2 font-montserrat"
          />
          <button className="bg-[#161616] w-28 h-8 rounded-lg cursor-pointer text-white flex items-center justify-center gap-2 px-3 hover:bg-[#CCD999] hover:text-zinc-950 transition-colors shrink-0">
            <Search className="w-4 h-4" />
            <span className="text-xs font-montserrat font-bold">Buscar</span>
          </button>
        </div>

        <div className="flex flex-col items-center">
          {/* Usamos dimensiones en px exactas para el logo */}
          <Image
            src={logoFamTree}
            alt="Logo FamTree"
            className="w-21 h-21 object-contain"
          />
        </div>
      </header>

      {/* Hero Central */}
      <main className="relative z-10 text-center my-auto max-w-3xl mx-auto space-y-4">
        <h1 className="text-8xl md:text-7xl font-montserrat font-normal tracking-wide leading-tight">
          El Mejor Lugar <br /> Para Descansar
        </h1>
        <p className="text-sm text-zinc-300 max-w-md mx-auto font-montserrat font-light leading-relaxed">
          esto solo es un texto generico de fondo, no contiene ninguna
          informacion relevante
        </p>
      </main>

      {/* Footer / Botón Inferior */}
      <footer className="relative z-10 flex justify-center">
        <button className="flex items-center gap-3 bg-[#CCD999] text-zinc-950 pl-6 pr-2 py-2 rounded-full font-medium shadow-xl hover:bg-[#c0e07e] transition-all transform hover:scale-105">
          <span className="text-sm font-semibold font-montserrat">
            Asistencia de Emergencia
          </span>
          <div className="bg-white p-2 rounded-full text-zinc-950">
            <PhoneCall className="w-4 h-4" />
          </div>
        </button>
      </footer>
    </div>
  );
}

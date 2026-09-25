"use client";

import { FileText, PlusCircle } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="bg-linear-to-r from-[#062319] to-[#0a3526] border border-emerald-800/40 text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm relative overflow-hidden">
      {/* Luz ambiental sutil */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          Sistema Activo · Sincronizado hace 2 min
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard de Administración
        </h1>
        <p className="text-emerald-100/70 text-xs font-normal max-w-2xl leading-relaxed">
          Bienvenido, Administrador. Aquí tienes el resumen ejecutivo de la Residencia &quot;Serenidad y Vida&quot; para el día de hoy.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 relative z-10">
        <button className="px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 rounded-xl text-xs font-semibold text-emerald-100 flex items-center gap-2 transition-all shadow-sm">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reporte Diario</span>
        </button>
        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#062319] font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow-emerald-500/20">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Nueva Gestión</span>
        </button>
      </div>
    </div>
  );
}
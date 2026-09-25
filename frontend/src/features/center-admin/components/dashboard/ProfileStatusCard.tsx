"use client";

import { CheckCircle2, Clock } from "lucide-react";

export default function ProfileStatusCard() {
  return (
    <div className="bg-[#062319] text-white p-6 rounded-2xl shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-base">Estado del Perfil</h3>
        <p className="text-xs text-emerald-200/80 mt-0.5">Visibilidad de su residencia en el portal público.</p>
      </div>

      <div className="flex items-center justify-between bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
          Activo
        </span>
        <span className="text-[11px] text-emerald-300/70 font-mono">Actualizado: 12 Oct</span>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80 mb-1">
          Nivel de Optimización
        </p>
        <p className="text-3xl font-extrabold text-white font-mono">92%</p>
      </div>

      <div className="space-y-2 text-xs pt-1">
        <div className="flex items-center justify-between p-2.5 bg-emerald-900/30 rounded-xl">
          <span className="flex items-center gap-2 text-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Información Básica
          </span>
          <span className="text-emerald-400 font-medium">Listo</span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-emerald-900/30 rounded-xl">
          <span className="flex items-center gap-2 text-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Galería Multimedia
          </span>
          <span className="text-emerald-400 font-medium">Listo</span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-emerald-900/30 rounded-xl">
          <span className="flex items-center gap-2 text-emerald-100">
            <Clock className="w-4 h-4 text-amber-400" />
            Horarios Festivos
          </span>
          <span className="text-amber-400 font-medium">Pendiente</span>
        </div>
      </div>

      <button className="w-full py-2.5 bg-white text-[#062319] rounded-xl font-bold text-xs hover:bg-emerald-50 transition-all">
        Editar Perfil Completo
      </button>
    </div>
  );
}
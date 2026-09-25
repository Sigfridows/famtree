"use client";

import { Clock, MessageSquare, TrendingUp } from "lucide-react";

export default function DashboardKpis() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ocupación Actual */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ocupación Actual
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" /> 85%
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            72<span className="text-slate-400 text-lg font-normal">/85</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Camas disponibles</p>
        </div>
      </div>

      {/* Calificación Global */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Calificación Global
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2 py-0.5 rounded-full font-mono">
            ↗ +0.2
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            4.8<span className="text-slate-400 text-sm font-normal">/5.0</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Satisfacción media</p>
        </div>
      </div>

      {/* Solicitudes Pendientes */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:border-amber-300/60 transition-all flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-amber-400 rounded-b-full" />
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Solicitudes Pendientes
          </span>
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-600">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 tracking-tight font-mono">18</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
            ● Por responder
          </p>
        </div>
      </div>

      {/* Nuevas Reseñas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:border-blue-300/60 transition-all flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-blue-500 rounded-b-full" />
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Nuevas Reseñas
          </span>
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 tracking-tight font-mono">4</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Últimas 24h</p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { ThumbsUp, Search, Filter, AlertCircle, Download } from "lucide-react";

const reviews = [
  { name: "Elena Rodríguez", role: "Familiar de residente", date: "12 de Octubre, 2023", rating: 5, comment: "La atención personalizada que recibe mi padre es excepcional. El equipo de enfermería siempre está atento.", status: "Respondido" },
  { name: "Carlos Mendoza", role: "Residente", date: "08 de Octubre, 2023", rating: 4, comment: "Las actividades recreativas son excelentes, especialmente los talleres de pintura. Solo sugeriría mejorar la variedad del menú.", status: "Pendiente" },
  { name: "Sofía Valenzuela", role: "Hija de residente", date: "05 de Octubre, 2023", rating: 5, comment: "Increíble el nivel de comunicación. Recibo reportes semanales sobre el estado de salud de mi madre.", status: "Respondido" },
  { name: "Roberto Gómez", role: "Familiar", date: "30 de Septiembre, 2023", rating: 3, comment: "El servicio es bueno pero a veces hay demoras en las visitas programadas por falta de personal en recepción.", status: "Pendiente" },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Reseñas</h1>
          <p className="text-slate-500 text-xs mt-1">Administra y responde al feedback de residentes y familiares en tiempo real.</p>
        </div>
        <button className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          <Download className="w-3.5 h-3.5" />
          Exportar Informe
        </button>
      </div>

      {/* Tarjetas Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Puntuación Media</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">↗ 0.2</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">4.8</p>
          <p className="text-xs text-slate-400 mt-0.5">Promedio total de 452 reseñas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Reseñas Nuevas</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">↗ 12%</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">24</p>
          <p className="text-xs text-slate-400 mt-0.5">Últimos 30 días</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Tasa de Respuesta</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">↗ 5%</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">92%</p>
          <p className="text-xs text-slate-400 mt-0.5">Objetivo mensual: 95%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Sentimiento Positivo</span>
            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">↘ 2%</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">88%</p>
          <p className="text-xs text-slate-400 mt-0.5">Basado en análisis de texto</p>
        </div>
      </div>

      {/* Sugerencia / Alerta */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Sugerencia: Hay 4 reseñas de baja calificación (2 estrellas o menos) que requieren atención inmediata.</span>
      </div>

      {/* Buscador y Pestañas */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex gap-2 text-xs font-semibold">
          <button className="px-4 py-2 rounded-xl bg-[#062319] text-white">Todas (128)</button>
          <button className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100">Pendientes (12)</button>
          <button className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100">Respondidas (110)</button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o palabra..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-transparent text-xs outline-none focus:bg-white focus:border-emerald-600"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid de Cards de Reseñas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((rev, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-xs text-slate-900">{rev.name}</p>
                  <p className="text-[11px] text-slate-400">{rev.role}</p>
                </div>
                <div className="text-right">
                  <div className="flex text-amber-400 text-xs">
                    {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{rev.date}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">&quot;{rev.comment}&quot;</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${rev.status === "Respondido" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {rev.status}
              </span>
              <div className="flex items-center gap-3 text-slate-500">
                <button className="hover:text-emerald-700 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" /> Útil
                </button>
                <button className="font-bold text-emerald-800 hover:underline">
                  {rev.status === "Respondido" ? "Ver respuesta" : "Responder"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
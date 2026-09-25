"use client";

import { MoreVertical } from "lucide-react";

const requests = [
  { name: "Familia Martínez", type: "Visita Guiada", time: "Hoy, 10:30", status: "Pendiente", badge: "bg-amber-100 text-amber-800" },
  { name: "Roberto Sánchez", type: "Info. Médica", time: "Hoy, 09:15", status: "Urgente", badge: "bg-rose-100 text-rose-800" },
  { name: "Lucía Valdés", type: "Cotización", time: "Ayer, 16:45", status: "En revisión", badge: "bg-blue-100 text-blue-800" },
  { name: "Carlos Méndez", type: "Ingreso Nuevo", time: "Ayer, 14:20", status: "Completado", badge: "bg-emerald-100 text-emerald-800" },
  { name: "Sofía Herrera", type: "Visita Guiada", time: "12 Oct", status: "Pendiente", badge: "bg-amber-100 text-amber-800" },
];

export default function RecentRequestsTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Solicitudes de Información Recientes</h3>
          <p className="text-xs text-slate-500">Resumen de las últimas interacciones de potenciales residentes.</p>
        </div>
        <button className="text-xs font-semibold text-emerald-700 hover:underline">Ver todas &gt;</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3">Solicitante</th>
              <th className="pb-3">Tipo de Gestión</th>
              <th className="pb-3">Fecha/Hora</th>
              <th className="pb-3">Estado</th>
              <th className="pb-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 font-semibold text-slate-800">{row.name}</td>
                <td className="py-3 text-slate-600">{row.type}</td>
                <td className="py-3 text-slate-500 font-mono text-[11px]">{row.time}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${row.badge}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
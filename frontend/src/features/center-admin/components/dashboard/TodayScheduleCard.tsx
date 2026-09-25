"use client";

export default function TodayScheduleCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
      <div>
        <h3 className="font-bold text-slate-900 text-sm">Horarios de Hoy</h3>
        <p className="text-xs text-slate-500">Eventos y turnos programados para este turno.</p>
      </div>

      <div className="space-y-3 text-xs pt-1">
        <div className="p-3 border-l-4 border-l-emerald-600 bg-slate-50/70 rounded-r-xl space-y-0.5">
          <p className="font-bold text-emerald-800 font-mono">09:00 AM</p>
          <p className="font-semibold text-slate-800">Ronda Médica General</p>
          <p className="text-[11px] text-slate-500">Dr. Arriaga - Pabellón A</p>
        </div>

        <div className="p-3 border-l-4 border-l-blue-600 bg-slate-50/70 rounded-r-xl space-y-0.5">
          <p className="font-bold text-blue-800 font-mono">03:30 PM</p>
          <p className="font-semibold text-slate-800">Taller de Pintura</p>
          <p className="text-[11px] text-slate-500">Salón de Actividades</p>
        </div>
      </div>
    </div>
  );
}
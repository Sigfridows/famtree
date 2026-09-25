"use client";

export default function PriorityReviews() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-sm">Reseñas Prioritarias</h3>
        <button className="px-3 py-1 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
          Filtrar por Críticas
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#062319] text-emerald-400 flex items-center justify-center font-bold text-xs">
                ER
              </div>
              <div>
                <p className="font-bold text-slate-800">Elena Rodríguez</p>
                <div className="flex text-amber-400 text-[10px]">★★★★★</div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Hace 2 horas</span>
          </div>
          <p className="text-slate-600 italic">
            &quot;La atención personalizada que recibe mi padre es excepcional. El equipo de enfermería siempre está atento.&quot;
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                CM
              </div>
              <div>
                <p className="font-bold text-slate-800">Carlos Mendoza</p>
                <div className="flex text-amber-400 text-[10px]">★★☆☆☆</div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Hace 5 horas</span>
          </div>
          <p className="text-slate-600 italic">
            &quot;El sistema de aire acondicionado en mi habitación hace mucho ruido por la noche. He avisado varias veces.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
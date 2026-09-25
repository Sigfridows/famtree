"use client";

interface PreferencesSectionProps {
  notifications: boolean;
  offers: boolean;
  onOpenPasswordModal: () => void;
  onNotificationsToggle: () => void;
  onOffersToggle: () => void;
}

export function PreferencesSection({
  notifications,
  offers,
  onOpenPasswordModal,
  onNotificationsToggle,
  onOffersToggle,
}: PreferencesSectionProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200/60 space-y-6">
      <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
        Preferencias
      </h3>

      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="space-y-1 max-w-sm">
          <h4 className="text-xs font-bold text-zinc-900">Contraseña</h4>
          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
            Si desea cambiar su contraseña puede hacerlo dándole clic al botón de cambiar contraseña
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPasswordModal}
          className="bg-[#161616] hover:bg-zinc-800 text-white px-4 py-2 rounded-[5px] text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          Cambiar contraseña
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="space-y-1 max-w-sm">
          <h4 className="text-xs font-bold text-zinc-900">Notificaciones</h4>
          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
            Decide si recibir notificaciones por parte de nuestra plataforma FamTree para mantenerte informado.
          </p>
        </div>

        <button
          type="button"
          onClick={onNotificationsToggle}
          className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
            notifications ? "bg-[#161616]" : "bg-zinc-200"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              notifications ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 max-w-sm">
          <h4 className="text-xs font-bold text-zinc-900">Ofertas</h4>
          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
            Recibe ofertas especiales por parte de FamTree según el historial de tu selección.
          </p>
        </div>

        <button
          type="button"
          onClick={onOffersToggle}
          className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
            offers ? "bg-[#161616]" : "bg-zinc-200"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              offers ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
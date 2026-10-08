"use client";

interface PreferencesSectionProps {
  notifications: boolean;
  offers: boolean;
  onOpenPasswordModal: () => void;
  onNotificationsToggle: () => void;
  onOffersToggle: () => void;
  saving?: boolean;
}

export function PreferencesSection({
  notifications,
  offers,
  onOpenPasswordModal,
  onNotificationsToggle,
  onOffersToggle,
  saving = false,
}: PreferencesSectionProps) {
  return (
    <section className="bg-[#141414] rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6 text-white font-montserrat">
      <h3 className="font-bold text-[11px] text-[#CCD999] uppercase tracking-wider">
        Preferencias
      </h3>

      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1 max-w-sm">
          <h4 className="text-xs font-bold text-white">Contraseña</h4>
          <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
            Si desea cambiar su contraseña puede hacerlo dándole clic al botón de cambiar contraseña
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPasswordModal}
          className="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
        >
          Cambiar contraseña
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1 max-w-sm">
          <h4 className="text-xs font-bold text-white">Notificaciones</h4>
          <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
            Decide si recibir notificaciones por parte de nuestra plataforma FamTree para mantenerte informado.
          </p>
        </div>

        <button
          type="button"
          onClick={onNotificationsToggle}
          disabled={saving}
          aria-pressed={notifications}
          aria-label="Gestionar notificaciones"
          className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
            notifications ? "bg-[#CCD999]" : "bg-zinc-800 border border-white/5"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full transition-transform ${
              notifications ? "translate-x-6 bg-zinc-950" : "translate-x-0 bg-zinc-400"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1 max-w-sm">
          <h4 className="text-xs font-bold text-white">Ofertas</h4>
          <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
            Recibe ofertas especiales por parte de FamTree según el historial de tu selección.
          </p>
        </div>

        <button
          type="button"
          onClick={onOffersToggle}
          disabled={saving}
          aria-pressed={offers}
          aria-label="Gestionar ofertas"
          className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
            offers ? "bg-[#CCD999]" : "bg-zinc-800 border border-white/5"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full transition-transform ${
              offers ? "translate-x-6 bg-zinc-950" : "translate-x-0 bg-zinc-400"
            }`}
          />
        </button>
      </div>
    </section>
  );
}

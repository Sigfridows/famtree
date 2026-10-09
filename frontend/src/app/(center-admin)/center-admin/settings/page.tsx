"use client";

import { useState } from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { PasswordModal } from "@/features/profile/components/PasswordModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Settings, User, Phone, FileText, Camera, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const { profile, loading, saving, error, updateProfile, uploadAvatar } = useProfile();
  const { refreshSession } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p role="status" className="text-xs font-semibold text-slate-500 animate-pulse">
          Cargando perfil…
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        {error || "Perfil no disponible"}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-1">
          <Settings className="w-4 h-4" />
          <span>Configuración de Cuenta</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Mi Cuenta</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-mono">
          @{profile.username} · {profile.email}
        </p>
      </div>

      {/* Formulario de Perfil */}
      <form
        key={profile.userId}
        className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setMessage("");
          try {
            await updateProfile({
              firstName: String(form.get("firstName")),
              lastName: String(form.get("lastName")),
              phone: String(form.get("phone")) || null,
              description: String(form.get("description")) || null,
            });
            await refreshSession();
            setMessage("Perfil guardado correctamente.");
          } catch {
            setMessage("No se pudo guardar el perfil.");
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
            <span className="flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" /> Nombre
            </span>
            <input
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-normal text-slate-800 focus:bg-white focus:border-emerald-700 focus:outline-none transition-all"
              name="firstName"
              required
              minLength={2}
              maxLength={50}
              defaultValue={profile.firstName}
            />
          </label>

          <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
            <span className="flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" /> Apellido
            </span>
            <input
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-normal text-slate-800 focus:bg-white focus:border-emerald-700 focus:outline-none transition-all"
              name="lastName"
              required
              minLength={2}
              maxLength={50}
              defaultValue={profile.lastName}
            />
          </label>
        </div>

        <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
          <span className="flex items-center gap-1.5 mb-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-700" /> Teléfono
          </span>
          <input
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-normal text-slate-800 focus:bg-white focus:border-emerald-700 focus:outline-none transition-all font-mono"
            name="phone"
            pattern="[0-9]{10}"
            placeholder="10 dígitos numéricos"
            defaultValue={profile.phone ?? ""}
          />
        </label>

        <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
          <span className="flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-700" /> Biografía
          </span>
          <textarea
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-normal text-slate-800 focus:bg-white focus:border-emerald-700 focus:outline-none transition-all resize-none h-24"
            name="description"
            maxLength={250}
            defaultValue={profile.description ?? ""}
            placeholder="Breve descripción..."
          />
        </label>

        <button
          disabled={saving}
          className="px-6 py-3 bg-[#062319] hover:bg-[#0a3526] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <span>{saving ? "Guardando…" : "Guardar Perfil"}</span>
        </button>
      </form>

      {/* Tarjeta de Multimedia y Seguridad */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Multimedia y Seguridad</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-800">Foto de perfil</p>
            <p className="text-[11px] text-slate-500">Formatos permitidos: JPEG, PNG.</p>
          </div>
          <label className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all shadow-sm">
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>{saving ? "Subiendo..." : "Cambiar foto"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              disabled={saving}
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  await uploadAvatar(file);
                  await refreshSession();
                  setMessage("Foto actualizada correctamente.");
                } catch {
                  setMessage("No se pudo subir la foto.");
                }
              }}
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-800">Contraseña de acceso</p>
            <p className="text-[11px] text-slate-500">Actualiza tu clave de acceso al sistema.</p>
          </div>
          <button
            onClick={() => setPasswordOpen(true)}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>Cambiar contraseña</span>
          </button>
        </div>
      </div>

      {/* Alertas de error o éxito */}
      {error && (
        <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <PasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSuccess={() => {
          setMessage("Contraseña actualizada correctamente.");
          void refreshSession();
        }}
      />
    </div>
  );
}
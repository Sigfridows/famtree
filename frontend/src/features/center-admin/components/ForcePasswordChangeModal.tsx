"use client";

import { passwordChangeErrors } from "@/lib/validations/password-change";
import { friendlyError } from "@/lib/apiClient";
import { useState } from "react";
import Image from "next/image";
import logoFamTree from "@/assets/famtree.png";
import {
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  TreeDeciduous,
} from "lucide-react";

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  onPasswordChanged: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  onExit: () => Promise<void>;
}

export default function ForcePasswordChangeModal({
  isOpen,
  onPasswordChanged,
  onExit,
}: ForcePasswordChangeModalProps) {
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showTemp, setShowTemp] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validaciones
  const hasMinLength = newPassword.length >= 8;
  const hasVariety =
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[^A-Za-z0-9]/.test(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors = passwordChangeErrors(tempPassword, newPassword, confirmPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Revisa los campos indicados. Vuelve a escribir las contraseñas.");
      setTempPassword(""); setNewPassword(""); setConfirmPassword(""); setShowTemp(false); setShowNew(false); setShowConfirm(false);
      (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>(`[data-password-field="${Object.keys(errors)[0]}"]`)?.focus();
      return;
    }

    try {
      setLoading(true);
      await onPasswordChanged(tempPassword, newPassword);
    } catch (err: unknown) {
      setError(friendlyError(err, "No se pudo cambiar la contraseña. Comprueba tu contraseña actual."));
      setTempPassword(""); setNewPassword(""); setConfirmPassword(""); setShowTemp(false); setShowNew(false); setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        {/* Panel Izquierdo (Verde Oscuro) */}
        <div className="md:w-5/12 bg-[#062319] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Fondo decorativo con silueta */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <TreeDeciduous className="w-80 h-80 text-emerald-400" />
          </div>

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                <Image
                  src={logoFamTree}
                  alt="Logo FamTree"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug">
              Seguridad de su cuenta
            </h2>
            <p className="mt-4 text-emerald-100/80 text-sm leading-relaxed">
              Para proteger la información de sus residentes y los datos
              operativos del asilo, requerimos que actualice su contraseña
              temporal por una definitiva.
            </p>

            <div className="my-6 border-t border-emerald-800/60" />

            {/* Requisitos */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    hasMinLength && newPassword.length <= 128 ? "text-emerald-400" : "text-emerald-700"
                  }`}
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    MÍNIMO 8 CARACTERES
                  </p>
                  <p className="text-xs text-emerald-100/70">
                    Asegure una longitud adecuada.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    hasVariety ? "text-emerald-400" : "text-emerald-700"
                  }`}
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    VARIEDAD DE CARACTERES
                  </p>
                  <p className="text-xs text-emerald-100/70">
                    Use mayúsculas, minúsculas, números y símbolos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho (Formulario) */}
        <div className="md:w-7/12 p-8 md:p-10 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <Lock className="w-4 h-4" />
              <span>CAMBIO OBLIGATORIO</span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              Actualizar Contraseña
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Por favor, ingrese los detalles a continuación para continuar.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              {/* Contraseña Temporal */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Contraseña Temporal
                </label>
                <div className="relative">
                  {fieldErrors.current && <p id="password-error-current" className="mb-1 text-xs text-rose-500">{fieldErrors.current}</p>}
                  <input
                    type={showTemp ? "text" : "password"}
                    id="password-current" aria-label="Contraseña actual o temporal" data-password-field="current" aria-invalid={Boolean(fieldErrors.current)} aria-describedby="password-error-current" value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="Ingresa código de bienvenida"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-600 focus:outline-none text-slate-800 text-sm transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTemp(!showTemp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showTemp ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  {fieldErrors.next && <p id="password-error-next" className="mb-1 text-xs text-rose-500">{fieldErrors.next}</p>}
                  <input
                    type={showNew ? "text" : "password"}
                    id="password-next" aria-label="Nueva contraseña" data-password-field="next" aria-invalid={Boolean(fieldErrors.next)} aria-describedby="password-error-next" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Cree su nueva clave"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-600 focus:outline-none text-slate-800 text-sm transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  {fieldErrors.confirmation && <p id="password-error-confirmation" className="mb-1 text-xs text-rose-500">{fieldErrors.confirmation}</p>}
                  <input
                    type={showConfirm ? "text" : "password"}
                    id="password-confirmation" aria-label="Confirmar nueva contraseña" data-password-field="confirmation" aria-invalid={Boolean(fieldErrors.confirmation)} aria-describedby="password-error-confirmation" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita su nueva clave"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-600 focus:outline-none text-slate-800 text-sm transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#062319] hover:bg-[#0a3527] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/20 disabled:opacity-50"
              >
                <span>
                  {loading
                    ? "Actualizando..."
                    : "Actualizar y Acceder al Panel"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <button
              type="button"
              disabled={loading}
              className="mt-4 underline text-slate-700"
              onClick={async () => {
                setLoading(true);
                try {
                  await onExit();
                } catch {
                  setError("No se pudo cerrar sesión. Inténtalo de nuevo.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Cerrar sesión y salir
            </button>
          </div>

          {/* Nota de advertencia */}
          <div className="mt-6 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <span className="font-semibold">Nota:</span> Al cambiar su
              contraseña, se cerrarán todas las sesiones activas en otros
              dispositivos por motivos de seguridad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

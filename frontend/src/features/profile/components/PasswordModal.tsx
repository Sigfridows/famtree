"use client";

import { passwordChangeErrors } from "@/lib/validations/password-change";
import { ApiError, friendlyError } from "@/lib/apiClient";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { profileService } from "../api/profileService";

interface PasswordModalProps {
  isOpen: boolean;
  forced?: boolean;
  onExit?: () => Promise<void>;
  onPasswordChanged?: (current: string, next: string) => Promise<void>;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordModal({
  isOpen,
  onClose,
  onSuccess,
  forced = false, onExit, onPasswordChanged,
}: PasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFieldErrors({}); setShowCurrentPassword(false); setShowNewPassword(false); setShowConfirmation(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    if (forced || loading) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const errors = passwordChangeErrors(currentPassword, newPassword, confirmNewPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Revisa los campos indicados. Vuelve a escribir las contraseñas.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setShowCurrentPassword(false); setShowNewPassword(false); setShowConfirmation(false);
      (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>(`[data-password-field="${Object.keys(errors)[0]}"]`)?.focus();
      return;
    }

    try {
      setLoading(true);
      if (onPasswordChanged) await onPasswordChanged(currentPassword, newPassword);
      else await profileService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === "invalid_credentials" && err.status === 400) {
        setFieldErrors({current: "La contraseña actual o temporal es incorrecta."});
        document.getElementById("password-current")?.focus();
      }
      setError(friendlyError(err, "No se pudo cambiar la contraseña. Comprueba tu contraseña actual."));
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setShowCurrentPassword(false); setShowNewPassword(false); setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-montserrat"
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="password-dialog-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-[#161616] text-white rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-6 border border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
                <div className="p-1.5 rounded-lg bg-zinc-800/80 text-[#C5DC83]">
                  <Lock className="w-4 h-4" />
                </div>
                <span id="password-dialog-title">Cambiar Contraseña</span>
              </div>
              {!forced && <button
                aria-label="Cerrar cambio de contraseña"
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>}
            </div>

            {forced && <p className="text-xs text-zinc-300">Debes cambiar tu contraseña temporal para continuar.</p>}
            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-rose-950/60 text-rose-300 rounded-xl font-medium border border-rose-800/60">
                  {error}
                </div>
              )}

              {/* Contraseña Actual */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Contraseña Actual
                </label>
                {fieldErrors.current && <p id="password-error-current" role="alert" className="mb-1 text-xs text-rose-500">{fieldErrors.current}</p>}
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="password-current" aria-label="Contraseña actual o temporal" data-password-field="current" aria-invalid={Boolean(fieldErrors.current)} aria-describedby="password-error-current" value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#C5DC83] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Ocultar contraseña actual" : "Mostrar contraseña actual"}
                    aria-pressed={showCurrentPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Nueva Contraseña
                </label>
                {fieldErrors.next && <p id="password-error-next" role="alert" className="mb-1 text-xs text-rose-500">{fieldErrors.next}</p>}
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="password-next" aria-label="Nueva contraseña" data-password-field="next" aria-invalid={Boolean(fieldErrors.next)} aria-describedby="password-error-next" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#C5DC83] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
                    aria-pressed={showNewPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Confirmar Nueva Contraseña
                </label>
                {fieldErrors.confirmation && <p id="password-error-confirmation" className="mb-1 text-xs text-rose-500">{fieldErrors.confirmation}</p>}
                <div className="relative">
                  <input
                  type={showConfirmation ? "text" : "password"}
                  id="password-confirmation" aria-label="Confirmar nueva contraseña" data-password-field="confirmation" aria-invalid={Boolean(fieldErrors.confirmation)} aria-describedby="password-error-confirmation" value={confirmNewPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#C5DC83] transition-colors disabled:opacity-50"
                />
                <button type="button" aria-label={showConfirmation ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(!showConfirmation)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800">
                  {showConfirmation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-3">
                {!forced && <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#C5DC83] hover:bg-[#b0c872] text-zinc-950 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                  )}
                  <span>{loading ? "Actualizando..." : forced ? "Actualizar y Acceder al Panel" : "Actualizar"}</span>
                </button>
              </div>
            </form>
            {forced && <button type="button" disabled={loading} className="text-xs underline text-zinc-300" onClick={async () => {setLoading(true); try {await onExit?.();} catch {setError("No se pudo cerrar sesión. Inténtalo de nuevo.");} finally {setLoading(false);}}}>Cerrar sesión y salir</button>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

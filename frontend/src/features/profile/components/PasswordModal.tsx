"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { profileService } from "../api/profileService";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: PasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError("Debes ingresar tu contraseña actual.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await profileService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };

      console.error("Error al cambiar contraseña:", err);
      setError(
        errorObj?.response?.data?.error?.message ||
          errorObj?.message ||
          "Ocurrió un error. Verifica que tu contraseña actual sea correcta."
      );
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
                <span>Cambiar Contraseña</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C5DC83] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
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
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C5DC83] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
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
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C5DC83] transition-colors disabled:opacity-50"
                />
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#C5DC83] hover:bg-[#b0c872] text-zinc-950 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                  )}
                  <span>{loading ? "Actualizando..." : "Actualizar"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

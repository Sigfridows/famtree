"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Eye, EyeOff } from "lucide-react";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = () => {
    if (newPassword && newPassword === confirmPassword) {
      onSuccess();
      onClose();
      setNewPassword("");
      setConfirmPassword("");
    } else {
      alert("Las contraseñas no coinciden o están vacías");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl space-y-5 border border-zinc-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>Cambiar Contraseña</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 block">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-zinc-200 rounded-[5px] pl-3.5 pr-10 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 block">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 bg-[#161616] hover:bg-zinc-800 text-white rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
              >
                Actualizar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
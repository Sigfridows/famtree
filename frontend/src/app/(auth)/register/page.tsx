"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import logoImg from "@/assets/famtree.png";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const shakeVariants: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: "easeInOut" as const },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function RegisterPage() {
  const { formState, handlers } = useRegisterForm();
  const hasError = Boolean(formState.errorMessage);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col justify-between py-2"
    >
      {/* Encabezado */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center mb-2">
          <Image src={logoImg} alt="FamTree Logo" width={58} height={58} className="object-contain" />
          <div>
            <span className="block text-[10px] tracking-[0.35em] text-white font-normal font-cinzel uppercase">
              famtree
            </span>
            <h1 className="text-3xl font-semibold text-white font-poppins leading-tight">
              Registrarse
            </h1>
          </div>
        </div>
        <p className="text-[10px] text-[#c3c3c3] max-w-sm font-montserrat font-normal leading-relaxed mt-2">
          “Redefiniendo la búsqueda de cuidado geriátrico a través de tecnología, transparencia y calidez humana.”
        </p>
      </motion.div>

      {/* Banner de error general animado */}
      <AnimatePresence mode="wait">
        {hasError && (
          <motion.div
            key="error-banner"
            variants={shakeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md flex items-center gap-2.5 text-red-400 text-xs font-montserrat"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formState.errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario */}
      <form className="space-y-3.5" onSubmit={handlers.handleSubmit}>
        {/* Nombre de usuario */}
        <motion.div variants={itemVariants}>
          <label className="block text-xs font-semibold mb-1.5 text-white font-montserrat">Nombre Usuario</label>
          <input
            type="text"
            placeholder="Ej. JuanEduardo"
            value={formState.username}
            onChange={(e) => handlers.setUsername(e.target.value)}
            className="w-full bg-[#181818] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCDD99] transition-colors"
          />
        </motion.div>

        {/* Nombre y Apellido */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-white font-montserrat">Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej. Juan Eduardo"
              value={formState.firstName}
              onChange={(e) => handlers.setFirstName(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCDD99] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-white font-montserrat">Apellido Completo</label>
            <input
              type="text"
              placeholder="Ej. Rodriguez Alcantara"
              value={formState.lastName}
              onChange={(e) => handlers.setLastName(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCDD99] transition-colors"
            />
          </div>
        </motion.div>

        {/* Correo Electrónico */}
        <motion.div variants={itemVariants}>
          <label className="block text-xs font-semibold mb-1.5 text-white font-montserrat">Correo Electrónico</label>
          <input
            type="email"
            placeholder="usuario@dominio.extension"
            value={formState.email}
            onChange={(e) => handlers.setEmail(e.target.value)}
            className="w-full bg-[#181818] border border-white/10 rounded-md px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCDD99] transition-colors"
          />
        </motion.div>

        {/* Contraseñas */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-white font-montserrat">Contraseña</label>
            <div className="relative">
              <input
                type={formState.showPassword ? "text" : "password"}
                placeholder="••••••••••••••••"
                value={formState.password}
                onChange={(e) => handlers.setPassword(e.target.value)}
                onBlur={handlers.setPasswordTouched}
                className={`w-full bg-[#181818] border rounded-md pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                  formState.isPasswordInvalid
                    ? "border-red-500/80 focus:border-red-500"
                    : "border-white/10 focus:border-[#CCDD99]"
                }`}
              />
              <button
                type="button"
                onClick={handlers.togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              >
                <motion.div
                  key={formState.showPassword ? "hide" : "show"}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {formState.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.div>
              </button>
            </div>
            <AnimatePresence>
              {formState.isPasswordInvalid && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[10px] text-red-500 mt-1 font-montserrat"
                >
                  {formState.passwordError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-white font-montserrat">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type={formState.showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••••••"
                value={formState.confirmPassword}
                onChange={(e) => handlers.setConfirmPassword(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-md pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCDD99] transition-colors"
              />
              <button
                type="button"
                onClick={handlers.toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              >
                <motion.div
                  key={formState.showConfirmPassword ? "hide" : "show"}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {formState.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.div>
              </button>
            </div>
            <AnimatePresence>
              {formState.confirmPasswordError && formState.confirmPassword.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[10px] text-red-500 mt-1 font-montserrat"
                >
                  {formState.confirmPasswordError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Botón Principal */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={formState.isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#CCDD99] hover:bg-[#b8cb83] disabled:opacity-50 text-[#161616] font-bold py-3 rounded-md transition-colors duration-200 mt-2 text-sm shadow-md cursor-pointer"
          >
            {formState.isLoading ? "Registrando..." : "Registrarse"}
          </motion.button>
        </motion.div>
      </form>

      {/* Enlace de Inicio de Sesión */}
      <motion.div variants={itemVariants} className="text-center mt-5">
        <p className="text-xs text-gray-300">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-bold text-[#CCDD99] hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </motion.div>

      {/* Pie legal */}
      <motion.div variants={itemVariants} className="mt-6 text-[10px] text-zinc-500 space-y-1 leading-normal">
        <p>Al continuar, aceptas nuestros Términos y Condiciones y confirmas que has leído nuestra Política de Privacidad.</p>
        <p>© 2026 FamTree. Todos los derechos reservados.</p>
      </motion.div>
    </motion.div>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import logoImg from "@/assets/famtree.png";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
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

export default function LoginPage() {
  const { formState, handlers } = useLoginForm();
  const hasError = Boolean(formState.errorMessage);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col justify-between py-2"
    >
      {/* Encabezado */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center mb-3">
          <Image
            src={logoImg}
            alt="FamTree Logo"
            width={62}
            height={62}
            className="object-contain"
          />
          <div>
            <span className="block text-[10px] tracking-[0.35em] text-white font-normal font-cinzel uppercase">
              famtree
            </span>
            <h1 className="text-3xl font-semibold text-white font-poppins leading-tight">
              Iniciar Sesión
            </h1>
          </div>
        </div>

        <p className="text-[10px] text-[#c3c3c3] max-w-sm font-montserrat font-normal leading-relaxed mt-4">
          “Redefiniendo la búsqueda de cuidado geriátrico a través de tecnología, transparencia y calidez humana.”
        </p>
      </motion.div>

      {/* Banner de error animado */}
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
      <form className="space-y-5" onSubmit={handlers.handleSubmit}>
        {/* Campo Usuario */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold mb-2 text-white font-montserrat">
            Nombre Usuario
          </label>
          <input
            type="text"
            placeholder="Ej. Juan Eduardo"
            value={formState.username}
            onChange={(e) => handlers.setUsername(e.target.value)}
            className={`w-full bg-[#181818] border rounded-md px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
              hasError
                ? "border-red-500/80 focus:border-red-500"
                : "border-white/10 focus:border-[#CCDD99]"
            }`}
          />
        </motion.div>

        {/* Campo Contraseña */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold mb-2 text-white font-montserrat">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••••••••••"
              value={formState.password}
              onChange={(e) => handlers.setPassword(e.target.value)}
              className={`w-full bg-[#181818] border rounded-md pl-4 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                hasError
                  ? "border-red-500/80 focus:border-red-500"
                  : "border-white/10 focus:border-[#CCDD99]"
              }`}
            />
            <button
              type="button"
              onClick={handlers.togglePasswordVisibility}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-1"
            >
              <motion.div
                key={formState.showPassword ? "hide" : "show"}
                initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.15 }}
              >
                {formState.showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </motion.div>
            </button>
          </div>
        </motion.div>

        {/* Botón Principal */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={formState.isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#CCDD99] hover:bg-[#b8cb83] disabled:opacity-50 text-[#161616] font-bold py-3.5 rounded-md transition-colors duration-200 mt-3 text-sm shadow-md cursor-pointer"
          >
            {formState.isLoading ? "Cargando..." : "Iniciar Sesión"}
          </motion.button>
        </motion.div>
      </form>

      {/* Enlace de Registro */}
      <motion.div variants={itemVariants} className="text-center mt-10">
        <p className="text-xs text-gray-300">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-bold text-[#CCDD99] hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </motion.div>

      {/* Pie legal */}
      <motion.div variants={itemVariants} className="mt-16 text-[10px] text-zinc-500 space-y-1 leading-normal">
        <p>
          Al continuar, aceptas nuestros Términos y Condiciones y confirmas que has leído nuestra Política de Privacidad.
        </p>
        <p>© 2026 FamTree. Todos los derechos reservados.</p>
      </motion.div>
    </motion.div>
  );
}
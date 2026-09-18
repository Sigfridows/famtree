"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Phone,
  Mail,
  MapPin,
  FileText,
  Lock,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import HeaderDesign from "@/components/shared/HeaderDesing";
import HeaderControls from "@/components/shared/HeaderControls";
import logoFamTree from "@/assets/logo-famtree.png";

// Componente de Dropdown Personalizado
interface CustomSelectProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function CustomSelect({
  label,
  icon,
  value,
  options,
  onChange,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-1.5 relative">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
        {icon}
        <span>{label}</span>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold text-zinc-700 flex items-center justify-between shadow-xs hover:border-zinc-300 transition-colors cursor-pointer text-left"
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-40 py-1 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-xs text-left font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                  value === opt
                    ? "bg-zinc-100 text-zinc-900 font-bold"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                <span>{opt}</span>
                {value === opt && <Check className="w-3.5 h-3.5 text-zinc-800" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GestionarPerfilPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del perfil
  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
  );
  const [username] = useState("SugarDaddy");
  const [firstName, setFirstName] = useState("Miguel Alberto");
  const [lastName, setLastName] = useState("de Jesus Almanzar");

  // Contacto
  const phone = "893-313-8372";
  const email = "turealviejo46@gmail.com";

  // Ubicación
  const [city, setCity] = useState("Santo Domingo");
  const [municipality, setMunicipality] = useState("Los Alcarrizos");

  // Biografía
  const [bio, setBio] = useState(
    "Miguel Alberto ha dedicado más de una década a la investigación de las raíces históricas y migratorias del apellido Almánzar en la región del Cibao y la zona metropolitana. Como miembro activo y colaborador de FamTree, se encarga de digitalizar documentos antiguos, actas de nacimiento y registros fotográficos para preservar la memoria histórica de su linaje y mantener conectadas a las distintas ramas familiares en el extranjero."
  );

  // Preferencias
  const [notifications, setNotifications] = useState(true);
  const [offers, setOffers] = useState(false);

  // Modal para cambiar contraseña
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setAvatarUrl("");
  };

  const handleSave = () => {
    alert("¡Perfil actualizado con éxito!");
  };

  return (
    <div className="relative min-h-screen bg-[#F3F3F3] text-[#161616] font-montserrat pl-24 lg:pl-28 pr-6 pt-0 pb-16">
      <div className="mx-auto space-y-6">
        {/* 1. CABECERA FLOTANTE */}
        <header className="pt-0 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="w-full lg:flex-1">
            <HeaderDesign
              title="Gestionar Perfil"
              subtitle="Asilos cercanos"
              className="w-full lg:pr-32 shadow-md"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 lg:-ml-24 relative z-30 pt-4 lg:pt-0 pr-6">
            <HeaderControls
              logoSrc={logoFamTree}
              placeholder="¿Qué quieres encontrar?"
              bgClass="bg-white shadow-md"
              borderClass="border-[#A4A4A4]"
              placeholderClass="placeholder-zinc-400 text-[#161616]"
              buttonBgClass="bg-[#161616] hover:bg-[#b0c872]"
              buttonTextClass="text-white hover:text-[#161616]"
              searchValue={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSearch={() => console.log("Buscando...", searchQuery)}
            />
          </div>
        </header>

        {/* 2. CONTENIDO PRINCIPAL EN 2 COLUMNAS CENTRADAS */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA (Perfil + Preferencias) */}
          <div className="lg:col-span-6 space-y-6">
            {/* TARJETA PERFIL */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200/60 space-y-6">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                Perfil
              </h3>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={username}
                      width={80}
                      height={80}
                      unoptimized
                      className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-zinc-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-xl">
                      {firstName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Usuario
                    </span>
                    <h2 className="text-xl font-extrabold text-zinc-900 leading-tight">
                      {username}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Imagen</span>
                    </button>

                    <button
                      onClick={handleRemoveImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161616] hover:bg-zinc-800 text-white rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Inputs de Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-800 block">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-800 block">
                    Apellido Completo
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors shadow-xs"
                  />
                </div>
              </div>
            </section>

            {/* TARJETA PREFERENCIAS */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200/60 space-y-6">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                Preferencias
              </h3>

              {/* Cambiar Contraseña */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-xs font-bold text-zinc-900">
                    Contraseña
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    Si desea cambiar su contraseña puede hacerlo dándole clic al
                    botón de cambiar contraseña
                  </p>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="bg-[#161616] hover:bg-zinc-800 text-white px-4 py-2 rounded-[5px] text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  Cambiar contraseña
                </button>
              </div>

              {/* Notificaciones */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-xs font-bold text-zinc-900">
                    Notificaciones
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    Decide si recibir notificaciones por parte de nuestra
                    plataforma FamTree para mantenerte informado.
                  </p>
                </div>

                <button
                  onClick={() => setNotifications(!notifications)}
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

              {/* Ofertas */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-xs font-bold text-zinc-900">Ofertas</h4>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    Recibe ofertas especiales por parte de FamTree según el
                    historial de tu selección.
                  </p>
                </div>

                <button
                  onClick={() => setOffers(!offers)}
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
          </div>

          {/* COLUMNA DERECHA (Contacto + Biografía) */}
          <div className="lg:col-span-6 space-y-6">
            <section className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200/60 space-y-6">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">
                Contacto
              </h3>

              {/* Teléfono y Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                    <Phone className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Telefono</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-700 pt-0.5">
                    {phone}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                    <Mail className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Email</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-700 pt-0.5">
                    {email}
                  </p>
                </div>
              </div>

              {/* Dropdowns Personalizados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Ciudad"
                  icon={<MapPin className="w-3.5 h-3.5 text-zinc-600" />}
                  value={city}
                  options={[
                    "Santo Domingo",
                    "Santiago",
                    "La Vega",
                    "Puerto Plata",
                  ]}
                  onChange={setCity}
                />

                <CustomSelect
                  label="Municipio"
                  icon={<MapPin className="w-3.5 h-3.5 text-zinc-600" />}
                  value={municipality}
                  options={[
                    "Los Alcarrizos",
                    "Santo Domingo Este",
                    "Santo Domingo Oeste",
                    "Distrito Nacional",
                  ]}
                  onChange={setMunicipality}
                />
              </div>

              {/* Biografía */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                  <FileText className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Biografia</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={6}
                  className="w-full bg-white border border-zinc-200 rounded-[5px] p-3.5 text-xs text-zinc-500 font-medium leading-relaxed focus:outline-none focus:border-zinc-400 transition-colors resize-none shadow-xs"
                />
              </div>

              {/* Fecha de creación con línea punteada */}
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="font-bold text-zinc-700 shrink-0">
                  Fecha de creacion
                </span>
                <div className="flex-1 border-b border-dotted border-zinc-300 mx-3" />
                <span className="text-zinc-400 font-medium shrink-0">
                  3 sep. 2026
                </span>
              </div>
            </section>

            {/* BOTONES DE ACCIÓN (Cancelar / Guardar) */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="bg-[#161616] hover:bg-zinc-800 text-white px-8 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#C5DC83] hover:bg-[#b0c872] text-zinc-900 px-8 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL PARA CAMBIAR CONTRASEÑA */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
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
                  onClick={() => setIsPasswordModalOpen(false)}
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
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-800 block">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-zinc-200 rounded-[5px] px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (newPassword && newPassword === confirmPassword) {
                      alert("Contraseña actualizada correctamente");
                      setIsPasswordModalOpen(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    } else {
                      alert("Las contraseñas no coinciden o están vacías");
                    }
                  }}
                  className="px-5 py-2 bg-[#161616] hover:bg-zinc-800 text-white rounded-[5px] text-xs font-bold transition-colors cursor-pointer"
                >
                  Actualizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
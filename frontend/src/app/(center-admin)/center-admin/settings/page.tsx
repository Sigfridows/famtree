"use client";

import { useState } from "react";
import { User, Camera, Save, RotateCcw } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración de Cuenta y Seguridad</h1>
          <p className="text-slate-500 text-xs mt-1">Administra tus preferencias personales, seguridad y notificaciones del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" />
            Descartar
          </button>
          <button className="px-5 py-2 bg-[#062319] hover:bg-[#0c3527] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
            <Save className="w-3.5 h-3.5" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "profile" ? "border-emerald-700 text-emerald-800" : "border-transparent hover:text-slate-800"}`}
        >
          Perfil de Administrador
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "security" ? "border-emerald-700 text-emerald-800" : "border-transparent hover:text-slate-800"}`}
        >
          Seguridad y Acceso
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "notifications" ? "border-emerald-700 text-emerald-800" : "border-transparent hover:text-slate-800"}`}
        >
          Preferencias de Notificación
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información Personal</h3>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center relative overflow-hidden">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <div className="space-y-2">
                <div className="flex gap-3">
                  <button className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" /> Cambiar Foto
                  </button>
                  <button className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:underline">
                    Eliminar
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">JPG, GIF o PNG. Tamaño máximo de 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  defaultValue="Andrés Martínez Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Cargo / Rol</label>
                <input
                  type="text"
                  defaultValue="Director Administrativo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  defaultValue="andres.martinez@premiumcare.es"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  defaultValue="+34 612 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferencias de Interfaz</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Idioma del Sistema</label>
                <select className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none">
                  <option>Español (ES)</option>
                  <option>English (US)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Modo de Visualización</label>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl border bg-slate-100 font-semibold text-slate-800">Claro</button>
                  <button className="flex-1 py-2 rounded-xl border text-slate-500 hover:bg-slate-50">Oscuro</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
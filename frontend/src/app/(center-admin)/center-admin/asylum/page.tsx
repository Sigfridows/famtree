"use client";

import { useState } from "react";
import { Eye, Save, Plus, MapPin } from "lucide-react";

export default function AsylumPage() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión del Asilo</h1>
          <p className="text-slate-500 text-xs mt-1">Edita el perfil público, precios e instalaciones de tu residencia.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            Vista Previa
          </button>
          <button className="px-5 py-2 bg-[#062319] hover:bg-[#0c3527] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
            <Save className="w-3.5 h-3.5" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal (Izquierda) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Información Básica */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  defaultValue="Residencia Serenidad y Vida"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Número de Licencia</label>
                <input
                  type="text"
                  defaultValue="LIC-2024-8892-SV"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  defaultValue="+34 912 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  defaultValue="contacto@serenidadyvida.es"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Estructura Financiera y Capacidad */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Estructura Financiera y Capacidad</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Precio Base</label>
                <input
                  type="text"
                  defaultValue="$ 1200"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Mantenimiento</label>
                <input
                  type="text"
                  defaultValue="$ 150"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Capacidad Total</label>
                <input
                  type="number"
                  defaultValue={85}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Ocupación Actual</label>
                <input
                  type="number"
                  defaultValue={72}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Horarios Operativos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Horarios Operativos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <p className="font-bold text-slate-700 mb-2">Atención Administrativa</p>
                <div className="flex gap-3">
                  <input type="time" defaultValue="09:00" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200" />
                  <input type="time" defaultValue="18:00" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200" />
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-700 mb-2">Visitas Familiares</p>
                <div className="flex gap-3">
                  <input type="time" defaultValue="10:00" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200" />
                  <input type="time" defaultValue="16:00" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Descripción Pública y Servicios Incluidos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Descripción Pública y Servicios Incluidos</h3>
            <div>
              <textarea
                rows={4}
                defaultValue="En Serenidad y Vida, nos dedicamos a proporcionar un hogar cálido y profesional para nuestros adultos mayores. Contamos con instalaciones de primer nivel."
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
              />
              <p className="text-right text-[11px] text-slate-400 mt-1">115/500 caracteres</p>
            </div>

            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">Servicios Disponibles</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              {["Cuidado Médico 24/7", "Rehabilitación Física", "Asistencia Psicológica", "Nutrición Especializada", "Actividades Recreativas", "Gestión de Farmacia", "Asistencia Espiritual"].map((service, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={idx % 2 === 0} className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500" />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Galería / Mapa / Estado (Derecha) */}
        <div className="space-y-6">
          {/* Galería */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Galería de Imágenes</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-28 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                Imagen 1
              </div>
              <button className="h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-600 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-700 transition-colors">
                <Plus className="w-5 h-5" />
                <span className="text-xs font-semibold">Añadir</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Formatos aceptados: JPG, PNG. Máx 5MB.</p>
          </div>

          {/* Mapa */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación en Mapa</h3>
            <div className="h-40 rounded-xl bg-slate-100 border border-slate-200 relative flex items-center justify-center overflow-hidden">
              <MapPin className="w-7 h-7 text-rose-500 animate-bounce" />
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-center text-xs font-medium text-slate-700">
                Calle de la Armonía 124, Madrid
              </div>
            </div>
            <button className="w-full py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Actualizar Dirección
            </button>
          </div>

          {/* Estado de Publicación */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-slate-800">Perfil Activo</p>
              <p className="text-[11px] text-slate-400">Visible para el público</p>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isActive ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"}`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
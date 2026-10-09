"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { centerAdminService } from "@/features/center-admin/api/centerAdminService";
import type { CenterInfo, CenterReputation } from "@/features/center-admin/types/centerAdmin.types";
import { Building2, MessageSquare, Star, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<{ center: CenterInfo; reviews: CenterReputation } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([centerAdminService.getMyCenterInfo(), centerAdminService.getReviews()])
      .then(([center, reviews]) => {
        if (alive) setData({ center, reviews });
      })
      .catch((err) => {
        if (alive) setError(err.message);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p role={error ? "alert" : "status"} className="text-xs font-semibold text-slate-500 animate-pulse">
          {error || "Cargando resumen…"}
        </p>
      </div>
    );
  }

  const isActive = data.center.status === "ACTIVE";

  return (
    <div className="max-w-5xl space-y-6 pb-12">
      {/* Encabezado minimalista moderno */}
      <div className="bg-linear-to-r from-[#062319] to-[#0a3526] p-6 rounded-2xl text-white shadow-sm border border-emerald-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
            Panel de Administración
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">{data.center.name}</h1>
          <p className="text-emerald-100/70 text-xs">Resumen del centro que administras</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-xs font-medium">
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <span className="text-emerald-200">Estado: {isActive ? "Activo" : "Inactivo"}</span>
        </div>
      </div>

      {/* Tarjetas de Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Capacidad total</span>
            <Building2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-4">
            <strong className="text-3xl font-bold text-slate-900 font-mono">{data.center.totalCapacity}</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Plazas registradas</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reseñas publicadas</span>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-4">
            <strong className="text-3xl font-bold text-slate-900 font-mono">{data.reviews.summary.count}</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Total de opiniones</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Calificación media</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-4">
            <strong className="text-3xl font-bold text-slate-900 font-mono">
              {data.reviews.summary.average} <span className="text-slate-400 text-sm font-normal">/ 5</span>
            </strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Satisfacción global</p>
          </div>
        </div>
      </div>

      {/* Navegación y accesos directos */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Accesos Rápidos</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/center-admin/asylum"
            className="group p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Editar mi asilo</p>
              <p className="text-[11px] text-slate-500">Actualiza la información general y servicios</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/center-admin/reviews"
            className="group p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Consultar reseñas</p>
              <p className="text-[11px] text-slate-500">Revisa las opiniones y calificaciones detalladas</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
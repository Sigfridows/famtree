"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { centerAdminService } from "@/features/center-admin/api/centerAdminService";
import type { CenterInfo, CenterReputation } from "@/features/center-admin/types/centerAdmin.types";
export default function DashboardPage() {
  const [data, setData] = useState<{center: CenterInfo; reviews: CenterReputation} | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {let alive = true; Promise.all([centerAdminService.getMyCenterInfo(), centerAdminService.getReviews()]).then(([center, reviews]) => {if (alive) setData({center, reviews});}).catch(err => {if (alive) setError(err.message);}); return () => {alive = false;};}, []);
  if (!data) return <p role={error ? "alert" : "status"}>{error || "Cargando resumen…"}</p>;
  return <div className="max-w-5xl space-y-6"><h1 className="text-2xl font-bold">{data.center.name}</h1><p>Resumen del centro que administras</p>
    <div className="grid gap-4 sm:grid-cols-3">{[["Capacidad total", data.center.totalCapacity], ["Reseñas publicadas", data.reviews.summary.count], ["Calificación media", `${data.reviews.summary.average} / 5`]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-6 shadow-sm"><p>{label}</p><strong className="text-3xl">{value}</strong></div>)}</div>
    <p>Estado: {data.center.status === "ACTIVE" ? "Activo" : "Inactivo"}</p><nav className="flex gap-6"><Link className="underline" href="/center-admin/asylum">Editar mi asilo</Link><Link className="underline" href="/center-admin/reviews">Consultar reseñas</Link></nav>
  </div>;
}

"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { centerAdminService } from "../api/centerAdminService";
import type { CenterImage } from "../types/centerAdmin.types";
import { getImageUrl } from "@/lib/utils";
export default function CenterGallery() {
  const [images, setImages] = useState<CenterImage[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { let alive = true; centerAdminService.getImages().then(data => { if (alive) setImages(data); }).catch(err => { if (alive) setError(err.message); }); return () => {alive = false;}; }, []);
  async function perform(action: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await action(); setImages(await centerAdminService.getImages()); }
    catch (err) { setError(err instanceof Error ? err.message : "No se pudo actualizar la galería"); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">Galería</h2>
    <p className="text-sm">JPEG, PNG o WebP, hasta 5 MB. Entre 1 y 15 imágenes.</p>
    <label className="block">Añadir imagen<input aria-label="Añadir imagen" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || images.length >= 15} onChange={e => {
      const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
      if (file.size > 5 * 1024 * 1024) {setError("La imagen supera 5 MB"); return;}
      const form = new FormData(); form.append("file", file); void perform(() => centerAdminService.uploadGalleryImages(form));
    }} /></label>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-3">{images.map(image => <div key={image.imageId} className="space-y-2"><Image unoptimized src={getImageUrl(image.url)} alt={image.isCover ? "Portada del asilo" : "Imagen del asilo"} width={320} height={200} className="h-40 w-full rounded-xl object-cover" />
      <button className="mr-3 underline" disabled={busy || image.isCover} onClick={() => void perform(() => centerAdminService.setCover(image.imageId))}>{image.isCover ? "Portada" : "Usar como portada"}</button>
      <button className="text-red-700 underline disabled:opacity-40" disabled={busy || images.length <= 1} onClick={() => void perform(() => centerAdminService.removeImage(image.imageId))}>Eliminar</button></div>)}</div>
  </section>;
}

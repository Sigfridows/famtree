"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { centerAdminService } from "../api/centerAdminService";
import type { CenterImage } from "../types/centerAdmin.types";
import { getImageUrl } from "@/lib/utils";
import { Modal, Notice } from "@/features/admin/components/AdminUI";
import { adminError } from "@/features/admin/api";
import { Images, UploadCloud, Trash2, CheckCircle } from "lucide-react";

export default function CenterGallery() {
  const [images, setImages] = useState<CenterImage[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [target, setTarget] = useState<CenterImage | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    let alive = true;
    centerAdminService
      .getImages()
      .then((data) => {
        if (alive) setImages(data);
      })
      .catch((e) => {
        if (alive) setError(adminError(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function perform(action: () => Promise<unknown>, success: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setImages(await centerAdminService.getImages());
      setMessage(success);
    } catch (e) {
      setError(adminError(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function upload(files: File[]) {
    if (!files.length || lock.current || loading) return;
    if (images.length + files.length > 15) {
      setError(`Puedes añadir ${15 - images.length} imágenes más como máximo.`);
      return;
    }
    if (
      files.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 5 * 1024 * 1024 ||
          f.size === 0,
      )
    ) {
      setError("Selecciona imágenes JPEG, PNG o WebP de hasta 5 MB cada una.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    setProgress(0);
    let uploaded = 0;
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        await centerAdminService.uploadGalleryImages(form, (percent) =>
          setProgress(
            Math.round(((uploaded + percent / 100) / files.length) * 100),
          ),
        );
        uploaded++;
      }
      setMessage(`${uploaded} imágenes añadidas correctamente.`);
    } catch (e) {
      setError(
        `${uploaded} de ${files.length} imágenes añadidas. ${adminError(e)}`,
      );
    } finally {
      try {
        setImages(await centerAdminService.getImages());
      } catch {
        setError(
          "No pudimos actualizar la galería. Recarga antes de intentar otra subida.",
        );
      }
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase">
        <Images className="w-4 h-4" />
        <span>Multimedia</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">Galería del Asilo</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Formatos JPEG, PNG o WebP, hasta 5 MB por archivo. {images.length}/15 imágenes. Conserva al menos una.
        </p>
      </div>

      <label
        className="flex flex-col items-center justify-center my-4 rounded-2xl border-2 border-dashed border-emerald-700/30 hover:border-emerald-700/60 bg-emerald-50/30 hover:bg-emerald-50/60 p-8 text-center cursor-pointer transition-all"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(Array.from(e.dataTransfer.files));
        }}
      >
        <UploadCloud className="w-8 h-8 text-emerald-700 mb-2" />
        <span className="text-xs font-bold text-slate-800">Arrastra imágenes aquí o haz clic para seleccionarlas</span>
        <span className="text-[11px] text-slate-400 mt-1">Soporta múltiples archivos</span>
        <input
          aria-label="Añadir imágenes"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || loading || images.length >= 15}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            void upload(files);
          }}
        />
      </label>

      {busy && (
        <div role="status" className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="flex justify-between font-semibold">
            <span>Procesando imágenes…</span>
            <span>{progress}%</span>
          </div>
          <progress aria-label="Progreso de carga" max={100} value={progress} className="w-full h-2 rounded-lg overflow-hidden accent-emerald-700" />
        </div>
      )}

      {loading && <p role="status" className="text-xs text-slate-500">Cargando galería…</p>}
      
      <Notice error={!target ? error : ""} message={message} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <article key={image.imageId} className="bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="relative overflow-hidden rounded-xl">
              <Image
                unoptimized
                src={getImageUrl(image.url)}
                alt={image.isCover ? "Portada del asilo" : "Imagen del asilo"}
                width={320}
                height={200}
                className="h-40 w-full object-cover rounded-xl transition-transform hover:scale-105 duration-300"
              />
              {image.isCover && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md shadow">
                  Portada
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={busy || image.isCover}
                onClick={() =>
                  void perform(
                    () => centerAdminService.setCover(image.imageId),
                    "Portada actualizada.",
                  )
                }
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  image.isCover
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{image.isCover ? "Portada Actual" : "Usar Portada"}</span>
              </button>
              
              <button
                className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                disabled={busy || images.length <= 1}
                onClick={() => {
                  setError("");
                  setTarget(image);
                }}
                title="Eliminar imagen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {target && (
        <Modal
          title="Eliminar imagen"
          busy={busy}
          onClose={() => setTarget(null)}
        >
          <p className="text-xs text-slate-600">
            ¿Quieres eliminar esta imagen?{" "}
            {target.isCover && "Se elegirá automáticamente otra imagen como portada."}
          </p>
          <Notice error={error} />
          <div className="flex gap-2 pt-2">
            <button
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  await centerAdminService.removeImage(target.imageId);
                  setTarget(null);
                }, "Imagen eliminada.")
              }
            >
              Confirmar Eliminación
            </button>
            <button 
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all"
              disabled={busy} 
              onClick={() => setTarget(null)}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
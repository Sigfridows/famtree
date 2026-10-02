"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { centerAdminService } from "../api/centerAdminService";
import type { CenterImage } from "../types/centerAdmin.types";
import { getImageUrl } from "@/lib/utils";
import { Modal, Notice } from "@/features/admin/components/AdminUI";
import { adminError } from "@/features/admin/api";
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
      setMessage(`${uploaded} imágenes añadidas.`);
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
    <section className="admin-panel">
      <h2>Galería del asilo</h2>
      <p className="admin-subtitle">
        JPEG, PNG o WebP, hasta 5 MB por archivo. {images.length}/15 imágenes.
        Conserva al menos una.
      </p>
      <label
        className="block my-5 rounded-xl border-2 border-dashed border-emerald-700/40 p-7 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(Array.from(e.dataTransfer.files));
        }}
      >
        Arrastra imágenes aquí o selecciona archivos
        <input
          aria-label="Añadir imágenes"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || loading || images.length >= 15}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            void upload(files);
          }}
        />
      </label>
      {busy && (
        <div role="status">
          Procesando…{" "}
          <progress aria-label="Progreso de carga" max={100} value={progress} />{" "}
          {progress}%
        </div>
      )}
      {loading && <p role="status">Cargando galería…</p>}
      <Notice error={!target ? error : ""} message={message} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <article key={image.imageId} className="space-y-3">
            <Image
              unoptimized
              src={getImageUrl(image.url)}
              alt={image.isCover ? "Portada del asilo" : "Imagen del asilo"}
              width={320}
              height={200}
              className="h-40 w-full rounded-xl object-cover"
            />
            <div className="admin-actions">
              <button
                disabled={busy || image.isCover}
                onClick={() =>
                  void perform(
                    () => centerAdminService.setCover(image.imageId),
                    "Portada actualizada.",
                  )
                }
              >
                {image.isCover ? "Portada actual" : "Usar como portada"}
              </button>
              <button
                className="admin-danger"
                disabled={busy || images.length <= 1}
                onClick={() => {
                  setError("");
                  setTarget(image);
                }}
              >
                Eliminar imagen
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
          <p>
            ¿Quieres eliminar esta imagen?{" "}
            {target.isCover && "Se elegirá otra imagen como portada."}
          </p>
          <Notice error={error} />
          <div className="admin-actions">
            <button
              className="admin-primary"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  await centerAdminService.removeImage(target.imageId);
                  setTarget(null);
                }, "Imagen eliminada.")
              }
            >
              Confirmar eliminación
            </button>
            <button disabled={busy} onClick={() => setTarget(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

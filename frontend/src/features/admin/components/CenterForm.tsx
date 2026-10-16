"use client";
import { useEffect, useState } from "react";
import { adminApi, adminError } from "../api";
import type { AdminCenter, Catalogs } from "../types";
import { Notice } from "./AdminUI";

export default function CenterForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: AdminCenter | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [province, setProvince] = useState(initial?.provinceId || 0);
  const [form, setForm] = useState({
    name: initial?.name || "",
    municipalityId: initial?.municipalityId || 0,
    sector: initial?.sector || "",
    address: initial?.address || "",
    latitude: initial?.latitude ?? 18.47,
    longitude: initial?.longitude ?? -69.93,
    description: initial?.description || "",
    totalCapacity: initial?.totalCapacity || 1,
    minPrice: initial?.minPrice || "",
    maxPrice: initial?.maxPrice || "",
    entryRequirements: initial?.entryRequirements || "",
    certifications: initial?.certifications || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    website: initial?.website || "",
    serviceIds: initial?.serviceIds || [],
    seniorTypeIds: initial?.seniorTypeIds || [],
  });
  const [images, setImages] = useState("");

  useEffect(() => {
    let alive = true;
    adminApi
      .catalogs()
      .then((data) => {
        if (alive) setCatalogs(data);
      })
      .catch((e) => {
        if (alive) setError(adminError(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  function field(key: keyof typeof form, value: string | number | number[]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <form noValidate
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const invalid: Record<string, string> = {};
        const controls = Array.from(e.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select'));
        for (const control of controls) {
          if (!control.checkValidity()) {
            const label = control.getAttribute('aria-label') || 'Campo';
            invalid[label] = control.validity.valueMissing ? `${label}: este campo es obligatorio.` : control.validity.typeMismatch || control.validity.patternMismatch ? `${label}: escribe un valor válido.` : `${label}: revisa el formato y los límites indicados.`;
          }
        }
        if (!form.serviceIds.length) invalid.serviceIds = 'Selecciona al menos un servicio.';
        if (!form.seniorTypeIds.length) invalid.seniorTypeIds = 'Selecciona al menos un tipo de atención.';
        if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(form.email)) invalid['Correo institucional'] = 'Ingresa un correo institucional válido.';
        setFieldErrors(invalid);
        if (Object.keys(invalid).length) {
          setError('Revisa los campos indicados antes de guardar.');
          controls.find(control => invalid[control.getAttribute('aria-label') || ''])?.focus();
          return;
        }
        const urls = images
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);
        if (
          !initial &&
          (urls.length > 15 ||
            urls.some(
              (url) => !/^https?:\/\/\S+$/.test(url) || url.length > 255,
            ))
        ) {
          setError(
            "Agrega hasta 15 enlaces de imagen válidos (https://), uno por línea, de hasta 255 caracteres.",
          );
          return;
        }
        setBusy(true);
        try {
          await adminApi.saveCenter(initial?.asylumId || null, {
            ...form,
            certifications: form.certifications || null,
            website: form.website || null,
            ...(!initial ? { images: urls.map((url) => ({ url })) } : {}),
          });
          onSaved();
        } catch (err) {
          setError(adminError(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Notice error={error} />
      {!catalogs && <p role="status">Cargando catálogos…</p>}
      
      <fieldset disabled={busy || !catalogs}>
        <legend>Identidad y ubicación</legend>
        <div className="admin-grid">
          <label>
            Nombre del asilo
            {fieldErrors['Nombre del asilo'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Nombre del asilo']}</small>}
            <small>Obligatorio: 5–100 caracteres</small>
            <input
              aria-label="Nombre del asilo"
              aria-invalid={Boolean(fieldErrors['Nombre del asilo'])}
              required
              minLength={5}
              maxLength={100}
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
            />
          </label>
          <label>
            Provincia
            {fieldErrors['Provincia'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Provincia']}</small>}
            <select
              aria-label="Provincia"
              aria-invalid={Boolean(fieldErrors['Provincia'])}
              required
              value={province || ""}
              onChange={(e) => {
                setProvince(Number(e.target.value));
                field("municipalityId", 0);
              }}
            >
              <option value="">Selecciona una provincia</option>
              {catalogs?.provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Municipio
            {fieldErrors['Municipio'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Municipio']}</small>}
            <select
              aria-label="Municipio"
              aria-invalid={Boolean(fieldErrors['Municipio'])}
              required
              value={form.municipalityId || ""}
              onChange={(e) => field("municipalityId", Number(e.target.value))}
            >
              <option value="">Selecciona un municipio</option>
              {catalogs?.municipalities
                .filter((m) => m.province_id === province)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Sector
            {fieldErrors['Sector'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Sector']}</small>}
            <small>Obligatorio: máximo 100 caracteres</small>
            <input
              aria-label="Sector"
              aria-invalid={Boolean(fieldErrors['Sector'])}
              required
              maxLength={100}
              value={form.sector}
              onChange={(e) => field("sector", e.target.value)}
            />
          </label>
          <label>
            Dirección
            {fieldErrors['Dirección'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Dirección']}</small>}
            <small>Obligatorio: máximo 200 caracteres</small>
            <input
              aria-label="Dirección"
              aria-invalid={Boolean(fieldErrors['Dirección'])}
              required
              maxLength={200}
              value={form.address}
              onChange={(e) => field("address", e.target.value)}
            />
          </label>
          <label>
            Latitud
            {fieldErrors['Latitud'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Latitud']}</small>}
            <input
              aria-label="Latitud"
              aria-invalid={Boolean(fieldErrors['Latitud'])}
              required
              type="number"
              min={17}
              max={20.5}
              step="0.000001"
              value={form.latitude}
              onChange={(e) => field("latitude", Number(e.target.value))}
            />
          </label>
          <label>
            Longitud
            {fieldErrors['Longitud'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Longitud']}</small>}
            <input
              aria-label="Longitud"
              aria-invalid={Boolean(fieldErrors['Longitud'])}
              required
              type="number"
              min={-72.5}
              max={-68}
              step="0.000001"
              value={form.longitude}
              onChange={(e) => field("longitude", Number(e.target.value))}
            />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={busy || !catalogs}>
        <legend>Atención y contacto</legend>
        <div className="admin-grid">
          <label>
            Descripción
            {fieldErrors['Descripción'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Descripción']}</small>}
            <small>Obligatorio: 20–1000 caracteres</small>
            <textarea
              aria-label="Descripción"
              aria-invalid={Boolean(fieldErrors['Descripción'])}
              required
              minLength={20}
              maxLength={1000}
              rows={4}
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
            />
          </label>
          <label>
            Requisitos de ingreso
            {fieldErrors['Requisitos de ingreso'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Requisitos de ingreso']}</small>}
            <small>Obligatorio: 10–500 caracteres</small>
            <textarea
              aria-label="Requisitos de ingreso"
              aria-invalid={Boolean(fieldErrors['Requisitos de ingreso'])}
              required
              minLength={10}
              maxLength={500}
              rows={4}
              value={form.entryRequirements}
              onChange={(e) => field("entryRequirements", e.target.value)}
            />
          </label>
          <label>
            Capacidad total
            {fieldErrors['Capacidad total'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Capacidad total']}</small>}
            <input
              aria-label="Capacidad total"
              aria-invalid={Boolean(fieldErrors['Capacidad total'])}
              required
              type="number"
              min={1}
              max={100000}
              step={1}
              value={form.totalCapacity}
              onChange={(e) => field("totalCapacity", Number(e.target.value))}
            />
          </label>
          <label>
            Certificaciones
            {fieldErrors['Certificaciones'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Certificaciones']}</small>}
            <small>Opcional: máximo 250 caracteres</small>
            <textarea
              aria-label="Certificaciones"
              aria-invalid={Boolean(fieldErrors['Certificaciones'])}
              maxLength={250}
              value={form.certifications}
              onChange={(e) => field("certifications", e.target.value)}
            />
          </label>
          <label>
            Precio mínimo mensual (RD$)
            {fieldErrors['Precio mínimo mensual (RD$)'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Precio mínimo mensual (RD$)']}</small>}
            <input
              aria-label="Precio mínimo mensual (RD$)"
              aria-invalid={Boolean(fieldErrors['Precio mínimo mensual (RD$)'])}
              required
              type="number"
              min="0.01"
              max="99999999.99"
              step="0.01"
              value={form.minPrice}
              onChange={(e) => field("minPrice", e.target.value)}
            />
          </label>
          <label>
            Precio máximo mensual (RD$)
            {fieldErrors['Precio máximo mensual (RD$)'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Precio máximo mensual (RD$)']}</small>}
            <input
              aria-label="Precio máximo mensual (RD$)"
              aria-invalid={Boolean(fieldErrors['Precio máximo mensual (RD$)'])}
              required
              type="number"
              min={form.minPrice || "0.01"}
              max="99999999.99"
              step="0.01"
              value={form.maxPrice}
              onChange={(e) => field("maxPrice", e.target.value)}
            />
          </label>
          <label>
            Teléfono (10 dígitos)
            {fieldErrors['Teléfono (10 dígitos)'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Teléfono (10 dígitos)']}</small>}
            <input
              aria-label="Teléfono (10 dígitos)"
              aria-invalid={Boolean(fieldErrors['Teléfono (10 dígitos)'])}
              required
              pattern="[0-9]{10}"
              maxLength={10}
              value={form.phone}
              onChange={(e) => field("phone", e.target.value)}
            />
          </label>
          <label>
            Correo institucional
            {fieldErrors['Correo institucional'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Correo institucional']}</small>}
            <input
              aria-label="Correo institucional"
              aria-invalid={Boolean(fieldErrors['Correo institucional'])}
              required
              type="email"
              maxLength={100}
              value={form.email}
              onChange={(e) => field("email", e.target.value)}
            />
          </label>
          <label>
            Sitio web
            {fieldErrors['Sitio web'] && <small role="alert" style={{color: '#b91c1c'}}>{fieldErrors['Sitio web']}</small>}
            <small>Opcional: https:// y hasta 255 caracteres</small>
            <input
              aria-label="Sitio web"
              aria-invalid={Boolean(fieldErrors['Sitio web'])}
              type="url"
              maxLength={255}
              value={form.website}
              onChange={(e) => field("website", e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      {catalogs &&
        (
          [
            ["serviceIds", "Servicios", catalogs.services],
            ["seniorTypeIds", "Tipos de atención", catalogs.care_types],
          ] as const
        ).map(([key, label, options]) => (
          <fieldset key={key} disabled={busy} aria-invalid={Boolean(fieldErrors[key])}>
            <legend>{label} (al menos uno)</legend>
            {fieldErrors[key] && <p role="alert" style={{color: "#b91c1c"}}>{fieldErrors[key]}</p>}
            <div className="admin-checks">
              {options.map((o) => (
                <label key={o.id}>
                  <input
                    aria-label={o.name}
                    type="checkbox"
                    checked={form[key].includes(o.id)}
                    onChange={(e) =>
                      field(
                        key,
                        e.target.checked
                          ? [...form[key], o.id]
                          : form[key].filter((id) => id !== o.id),
                      )
                    }
                  />
                  {o.name}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

      {!initial && (
        <label>
          Imágenes opcionales: hasta 15 enlaces, uno por línea
          <textarea
            aria-label="Imágenes opcionales: hasta 15 enlaces, uno por línea"
              aria-invalid={Boolean(fieldErrors['Imágenes opcionales: hasta 15 enlaces, uno por línea'])}
            rows={3}
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="https://ejemplo.com/portada.jpg"
          />
          <small>
            La primera imagen será la portada. Usa imágenes autorizadas y
            accesibles.
          </small>
        </label>
      )}

      <div className="admin-actions">
        <button
          type="submit"
          className="admin-primary"
          disabled={busy || !catalogs}
        >
          {busy
            ? "Guardando…"
            : initial
              ? "Guardar cambios"
              : "Registrar asilo"}
        </button>
        <button type="button" disabled={busy} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
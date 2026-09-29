// src/lib/utils.ts
import { env } from "@/config/env";

export function getImageUrl(path?: string | null): string {
  if (!path) return "";

  // Si ya es una URL absoluta o un blob local de vista previa
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }

  // Obtener la URL base del backend sin la ruta de API (remueve /api/v1 si existe)
  const baseUrl = env.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}

/**
 * Limpia cualquier caracter que no sea un número.
 * Ejemplo: "(809) 123-4567" -> "8091234567"
 */
export function cleanPhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

/**
 * Formatea una cadena de números al formato estándar de 10 dígitos: XXX-XXX-XXXX
 * (o adapta la máscara a tu preferencia, ej: (XXX) XXX-XXXX).
 */
export function formatPhoneNumber(value?: string | null): string {
  const digits = cleanPhoneNumber(value).slice(0, 10); // Limitar a máximo 10 dígitos

  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
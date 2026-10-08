import { env } from "@/config/env";
import type { ApiErrorPayload } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = "api_error",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  validation_error: "Revisa los campos marcados y vuelve a intentarlo.",
  data_conflict: "Esta acción ya fue realizada o los datos cambiaron. Actualiza la pantalla e inténtalo de nuevo.",
  account_blocked: "Esta cuenta está bloqueada. Contacta con el administrador.",
  protected_account: "Esta cuenta está protegida y no puede modificarse.",
  permission_denied: "No tienes permiso para realizar esta acción.",
  duplicate_report: "Ya reportaste esta reseña.",
  invalid_preferences: "Selecciona una opción válida para tus preferencias.",
};

export function friendlyError(error: unknown, fallback = "No pudimos completar la acción. Inténtalo de nuevo."): string {
  if (!(error instanceof ApiError)) return fallback;
  if (error.code && FRIENDLY_MESSAGES[error.code]) return FRIENDLY_MESSAGES[error.code];
  if (error.status === 401) return "Tu sesión terminó. Inicia sesión de nuevo.";
  if (error.status === 403) return "No tienes permiso para realizar esta acción.";
  if (error.status === 422) return "Revisa los campos marcados y vuelve a intentarlo.";
  if (error.status === 409) return "Esta acción ya fue realizada o los datos cambiaron. Actualiza la pantalla e inténtalo de nuevo.";
  if (error.status >= 500) return "El servidor no pudo completar la acción. Inténtalo en unos momentos.";
  return error.message || fallback;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, unknown> | object;
  responseType?: "download";
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let queryString = "";
  if (options.params) {
    const paramsMap = options.params as Record<string, unknown>;
    const cleanParams = Object.entries(paramsMap).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = Array.isArray(value) ? value.join(",") : String(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const searchParams = new URLSearchParams(cleanParams).toString();
    if (searchParams) {
      queryString = `?${searchParams}`;
    }
  }

  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers);

  // Solo agregar Content-Type: application/json si NO es FormData
  if (
    options.body !== undefined &&
    !isFormData &&
    !headers.has("content-type")
  ) {
    headers.set("content-type", "application/json");
  }

  // Si es FormData, dejamos el body intacto para que fetch configure el multipart/form-data
  const formattedBody = isFormData
    ? (options.body as FormData)
    : options.body === undefined
      ? undefined
      : typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);

  const response = await fetch(`${env.apiBaseUrl}${path}${queryString}`, {
    ...options,
    body: formattedBody,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    let payload: ApiErrorPayload = {};
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      // Manejo de error de parseo
    }
    throw new ApiError(
      payload.error?.message ??
        `API request failed with status ${response.status}`,
      response.status,
      payload.error?.code,
      payload.error?.details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  if (options.responseType === "download") {
    return {
      blob: await response.blob(),
      filename: response.headers
        .get("content-disposition")
        ?.match(/filename="?([^";]+)/)?.[1],
    } as T;
  }
  return (await response.json()) as T;
}

export async function downloadApiFile(path: string, body: object) {
  const { blob, filename } = await apiRequest<{
    blob: Blob;
    filename?: string;
  }>(path, { method: "POST", body, responseType: "download" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename || `Reporte_FamTree.${blob.type.includes("pdf") ? "pdf" : "csv"}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const apiClient = {
  get: async <T = unknown>(
    path: string,
    options?: { params?: Record<string, unknown> | object },
  ): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, {
      method: "GET",
      params: options?.params,
    });
    return { data };
  },

  post: async <T = unknown>(
    path: string,
    body?: unknown,
  ): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "POST", body });
    return { data };
  },

  put: async <T = unknown>(
    path: string,
    body?: unknown,
  ): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "PUT", body });
    return { data };
  },

  patch: async <T = unknown>(
    path: string,
    body?: unknown,
  ): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "PATCH", body });
    return { data };
  },

  delete: async <T = unknown>(path: string): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "DELETE" });
    return { data };
  },
};

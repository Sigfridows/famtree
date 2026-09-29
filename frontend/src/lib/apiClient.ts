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

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, unknown> | object;
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
  if (options.body !== undefined && !isFormData && !headers.has("content-type")) {
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
  return (await response.json()) as T;
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
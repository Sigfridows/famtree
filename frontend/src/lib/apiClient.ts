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
  params?: Record<string, any>;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  // Manejo automatizado de Query Parameters para peticiones GET (ej. ?search=algo&minPrice=100)
  let queryString = "";
  if (options.params) {
    const cleanParams = Object.entries(options.params).reduce(
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

  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${env.apiBaseUrl}${path}${queryString}`, {
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    let payload: ApiErrorPayload = {};
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      // Un fallo que no responda JSON seguirá convirtiéndose en ApiError
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

/// Wrapper desacoplado que satisface la sintaxis de todos tus servicios
export const apiClient = {
  get: async <T = any>(
    path: string,
    options?: { params?: Record<string, any> },
  ): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, {
      method: "GET",
      params: options?.params,
    });
    return { data };
  },

  post: async <T = any>(path: string, body?: unknown): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "POST", body });
    return { data };
  },

  put: async <T = any>(path: string, body?: unknown): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "PUT", body });
    return { data };
  },

  patch: async <T = any>(
    path: string,
    body?: unknown,
  ): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "PATCH", body });
    return { data };
  },

  delete: async <T = any>(path: string): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "DELETE" });
    return { data };
  },
};

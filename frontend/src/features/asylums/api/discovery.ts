import { apiRequest } from "@/lib/apiClient";
import type { AsylumCatalogs, AsylumDetail, AsylumFilters, AsylumPage } from "../types";

/** Shared by catalog and map so filters cannot silently diverge. */
export function buildAsylumQuery(filters: AsylumFilters = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getAsylums(filters: AsylumFilters = {}, signal?: AbortSignal): Promise<AsylumPage> {
  return apiRequest<AsylumPage>(`/asylums${buildAsylumQuery(filters)}`, { signal, cache: "no-store" });
}

export function getAsylum(id: number, signal?: AbortSignal): Promise<AsylumDetail> {
  return apiRequest<AsylumDetail>(`/asylums/${encodeURIComponent(String(id))}`, { signal, cache: "no-store" });
}

export function getAsylumCatalogs(provinceId?: number, signal?: AbortSignal): Promise<AsylumCatalogs> {
  return apiRequest<AsylumCatalogs>(`/asylums/catalogs${buildAsylumQuery({ province_id: provinceId })}`, {
    signal,
    cache: "no-store",
  });
}

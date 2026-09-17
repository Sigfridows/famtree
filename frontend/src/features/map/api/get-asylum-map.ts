import { buildAsylumQuery } from "@/features/asylums";
import type { AsylumFilters, AsylumSummary, DiscoveryPage } from "@/features/asylums";
import { apiRequest } from "@/lib/api/client";

export type AsylumMapPin = Pick<AsylumSummary,
  "id" | "name" | "latitude" | "longitude" | "price_min" | "price_max" | "cover_url" | "rating" | "review_count"
>;
export type AsylumMapPage = DiscoveryPage<AsylumMapPin>;

/** Pages contain at most 100 pins; use pagination.pages to load the complete map. */
export function getAsylumMap(filters: AsylumFilters = {}, signal?: AbortSignal): Promise<AsylumMapPage> {
  return apiRequest<AsylumMapPage>(`/asylums/map${buildAsylumQuery(filters)}`, { signal, cache: "no-store" });
}

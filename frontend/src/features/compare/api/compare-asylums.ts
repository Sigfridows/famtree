import type { AsylumDetail } from "@/features/asylums";
import { apiRequest } from "@/lib/api/client";

export type AsylumComparison = { items: AsylumDetail[] };

/** The backend validates 2-4 distinct active centers and preserves selection order. */
export function compareAsylums(ids: number[], signal?: AbortSignal): Promise<AsylumComparison> {
  const query = new URLSearchParams({ ids: ids.join(",") });
  return apiRequest<AsylumComparison>(`/asylums/compare?${query}`, { signal, cache: "no-store" });
}

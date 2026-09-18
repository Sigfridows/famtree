import { apiRequest } from "@/lib/apiClient";

import type { HealthResponse } from "../types";

export function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/health", { cache: "no-store" });
}

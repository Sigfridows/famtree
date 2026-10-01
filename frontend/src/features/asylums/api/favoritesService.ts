// src/features/favorites/services/favoritesService.ts
import { apiRequest } from "@/lib/apiClient";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";

export const favoritesService = {
  /**
   * GET /api/v1/favorites
   * Obtiene la lista completa de asilos guardados en favoritos del usuario.
   */
  getFavorites: (signal?: AbortSignal): Promise<AsylumSummary[]> => {
    return apiRequest<AsylumSummary[]>("/favorites", {
      signal,
      cache: "no-store",
    });
  },

  /**
   * POST /api/v1/favorites/{asylum_id}
   * Agrega un asilo a los favoritos del usuario.
   */
  addFavorite: (asylumId: number): Promise<void> => {
    return apiRequest<void>(`/favorites/${encodeURIComponent(String(asylumId))}`, {
      method: "POST",
    });
  },

  /**
   * DELETE /api/v1/favorites/{asylum_id}
   * Elimina un asilo de los favoritos del usuario.
   */
  removeFavorite: (asylumId: number): Promise<void> => {
    return apiRequest<void>(`/favorites/${encodeURIComponent(String(asylumId))}`, {
      method: "DELETE",
    });
  },
};
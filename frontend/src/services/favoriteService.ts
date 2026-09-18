import { apiClient } from "@/lib/apiClient";
import { Favorite } from "@/types";

export const favoriteService = {
  getFavorites: async (): Promise<Favorite[]> => {
    const response = await apiClient.get<Favorite[]>("/favorites");
    return response.data;
  },

  addFavorite: async (asylumId: number): Promise<Favorite> => {
    const response = await apiClient.post<Favorite>("/favorites", { asylumId });
    return response.data;
  },

  removeFavorite: async (asylumId: number): Promise<void> => {
    await apiClient.delete(`/favorites/${asylumId}`);
  },
};
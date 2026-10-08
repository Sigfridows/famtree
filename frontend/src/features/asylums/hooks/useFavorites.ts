"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { AsylumSummary } from "@/features/asylums/types/asylum.types";
import { emitFeedback } from "@/components/shared/FeedbackToast";

interface FavoriteBackendItem {
  id?: number;
  favoriteId?: number;
  favorite_id?: number;
  asylumId?: number;
  asylum_id?: number;
  asylum?: Record<string, unknown>;
  [key: string]: unknown;
}

export function useFavorites() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [favorites, setFavorites] = useState<AsylumSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const pending = useRef(new Set<number>());

  // 1. Cargar y Normalizar Favoritos
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.get<unknown>("/favorites");
      
      const responseData = res.data as Record<string, unknown> | FavoriteBackendItem[];

      const rawList: FavoriteBackendItem[] = Array.isArray(responseData)
        ? responseData
        : (responseData?.items as FavoriteBackendItem[]) || (responseData?.data as FavoriteBackendItem[]) || [];

      const normalized: AsylumSummary[] = rawList
        .map((item) => {
          const asylumData = item.asylum && Object.keys(item.asylum).length > 0 ? item.asylum : {};

          const realId = Number(
            item.asylumId ?? 
            item.asylum_id ?? 
            asylumData.id ?? 
            item.id ?? 
            0
          );

          return {
            ...asylumData,
            id: realId,
            name: (asylumData.name as string) || (asylumData.title as string) || (item.name as string) || "Residencia",
            rating: Number(asylumData.rating ?? item.rating ?? 0),
            status: (asylumData.status as string) || (item.status as string) || "ACTIVE",
            cover_url: (asylumData.cover_url as string) || (asylumData.coverUrl as string) || (item.cover_url as string),
          } as AsylumSummary;
        })
        .filter((item) => Boolean(item.id && item.id !== 0));

      const detailed = await Promise.all(normalized.map(async item => {
        const response = await apiClient.get<AsylumSummary>(`/asylums/${item.id}`);
        return response.data;
      }));
      setFavorites(detailed);
    } catch (error: unknown) {
      const errObj = error as { status?: number; statusCode?: number; response?: { status?: number } };
      if (errObj?.status === 401 || errObj?.statusCode === 401 || errObj?.response?.status === 401) {
        setFavorites([]);
      } else {
        console.error("Error al obtener favoritos desde la API:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Re-ejecutar cuando termine de cargar el estado de auth o cambie la sesión
  useEffect(() => {
    if (!isAuthLoading) {
      queueMicrotask(() => {
        void fetchFavorites();
      });
    }
  }, [fetchFavorites, isAuthenticated, isAuthLoading]);

  const isFavorite = useCallback(
    (asylumId: number | string) => {
      if (!asylumId) return false;
      return favorites.some((fav) => Number(fav.id) === Number(asylumId));
    },
    [favorites]
  );

  const toggleFavorite = async (asylum: AsylumSummary) => {
    if (!asylum || !asylum.id) return;

    if (!isAuthenticated) {
      emitFeedback({ tone: "info", message: "Inicia sesión para guardar residencias en tus favoritos." });
      return;
    }

    const targetId = Number(asylum.id);
    if (pending.current.has(targetId)) return;
    pending.current.add(targetId);
    const exists = isFavorite(targetId);

    // Actualización optimista
    if (exists) {
      setFavorites((prev) => prev.filter((f) => Number(f.id) !== targetId));
    } else {
      setFavorites((prev) => [...prev, asylum]);
    }

    try {
      if (exists) {
        await apiClient.delete(`/favorites/${targetId}`);
      } else {
        await apiClient.post("/favorites", {
          asylumId: targetId,
        });
      }
      emitFeedback({ tone: "success", message: exists ? "Residencia retirada de favoritos." : "Residencia guardada en favoritos." });
    } catch {
      console.error("Error al modificar favorito:");
      void fetchFavorites(); // Revertir cambios en la interfaz si falla
      emitFeedback({ tone: "error", message: "No se pudo actualizar favoritos. Inténtalo de nuevo." });
    } finally {
      pending.current.delete(targetId);
    }
  };

  const removeFavoriteById = async (id: number) => {
    if (!isAuthenticated) return;

    const targetId = Number(id);
    setFavorites((prev) => prev.filter((f) => Number(f.id) !== targetId));
    try {
      await apiClient.delete(`/favorites/${targetId}`);
    } catch {
      fetchFavorites();
    }
  };

  return {
    favorites,
    loading: loading || isAuthLoading,
    isFavorite,
    toggleFavorite,
    removeFavoriteById,
    refetchFavorites: fetchFavorites,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface FavoriteItem {
  codigo_asilo: number;
  fecha_creacion?: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ items?: FavoriteItem[] } | FavoriteItem[]>('/favorites');
      const items = Array.isArray(data) ? data : data.items || [];
      setFavorites(items);
    } catch {
      // Manejo silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.resolve();
      if (isMounted) {
        void fetchFavorites();
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchFavorites]);

  const toggleFavorite = async (codigoAsilo: number) => {
    const isFav = favorites.some((f) => f.codigo_asilo === codigoAsilo);
    const previous = [...favorites];

    if (isFav) {
      setFavorites((prev) => prev.filter((f) => f.codigo_asilo !== codigoAsilo));
    } else {
      setFavorites((prev) => [...prev, { codigo_asilo: codigoAsilo, fecha_creacion: new Date().toISOString() }]);
    }

    try {
      if (isFav) {
        await apiClient.delete(`/favorites/${codigoAsilo}`);
      } else {
        await apiClient.post('/favorites', { codigo_asilo: codigoAsilo });
      }
    } catch (err) {
      setFavorites(previous);
      throw err;
    }
  };

  const isFavorite = (codigoAsilo: number) => favorites.some((f) => f.codigo_asilo === codigoAsilo);

  const refetch = () => {
    setLoading(true);
    void fetchFavorites();
  };

  return { favorites, loading, toggleFavorite, isFavorite, refetch };
}
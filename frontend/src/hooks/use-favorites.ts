'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/favorites');
      setFavorites(data.items || data);
    } catch {
      // Manejo silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

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

  return { favorites, loading, toggleFavorite, isFavorite, refetch: fetchFavorites };
}
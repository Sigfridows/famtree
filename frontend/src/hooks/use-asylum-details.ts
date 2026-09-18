'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Asylum } from '@/types';

export function useAsylumDetail(codigoAsilo: number | null) {
  const [data, setData] = useState<Asylum | null>(null);
  const [loading, setLoading] = useState(Boolean(codigoAsilo));
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!codigoAsilo) return;
    try {
      const { data: result } = await apiClient.get<Asylum>(`/asylums/${codigoAsilo}`);
      setData(result);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener detalle del asilo';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [codigoAsilo]);

  useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    // Saca la ejecución del flujo síncrono inmediato del effect
    await Promise.resolve();
    if (isMounted) {
      void fetchDetail();
    }
  };

  void loadData();

  return () => {
    isMounted = false;
  };
}, [fetchDetail]);

const refetch = () => {
  if (codigoAsilo) {
    setLoading(true);
    setError(null);
    void fetchDetail();
  }
};

return { data, loading, error, refetch };
}
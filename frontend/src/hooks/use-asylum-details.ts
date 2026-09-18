'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export function useAsylumDetail(codigoAsilo: number | null) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!codigoAsilo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/asylums/${codigoAsilo}`);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Error al obtener detalle del asilo');
    } finally {
      setLoading(false);
    }
  }, [codigoAsilo]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { asylumService } from '../services/asylumService';
import type { AsylumDetail } from '../types/asylum.types';

export function useAsylumDetail(codigoAsilo: number | null) {
  const [data, setData] = useState<AsylumDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(codigoAsilo));
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!codigoAsilo) return;
    try {
      const result = await asylumService.getAsylumById(codigoAsilo);
      setData(result);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al obtener detalle del asilo';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [codigoAsilo]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
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
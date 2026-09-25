'use client';

import { useState, useEffect, useCallback } from 'react';
import { asylumService } from '../services/asylumService';
import type { AsylumFilters, AsylumPage } from '../types/asylum.types';

export function useAsylums(initialFilters?: AsylumFilters) {
  const [filters, setFilters] = useState<AsylumFilters>({
    page: 1,
    ...initialFilters,
  });
  const [data, setData] = useState<AsylumPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsylums = useCallback(async () => {
    try {
      const result = await asylumService.getAsylums(filters);
      setData(result);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar asilos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.resolve();
      if (isMounted) {
        void fetchAsylums();
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchAsylums]);

  const updateFilters = (next: Partial<AsylumFilters>) => {
    setLoading(true);
    setFilters((prev) => ({
      ...prev,
      ...next,
      page: next.page ?? 1, // Reinicia a la página 1 si se cambia un filtro (a menos que explícitamente se pase 'page')
    }));
  };

  const refetch = () => {
    setLoading(true);
    setError(null);
    void fetchAsylums();
  };

  return {
    data, // Contiene { items: AsylumSummary[], pagination: Pagination, filters: AppliedFilters }
    loading,
    error,
    filters,
    updateFilters,
    refetch,
  };
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { asylumService, AsylumFilters } from '@/services/asylumService';
import { Asylum } from '@/types';

export function useAsylums(initialFilters?: AsylumFilters) {
  const [filters, setFilters] = useState<AsylumFilters>({
    page: 1,
    page_size: 10,
    ...initialFilters,
  });
  const [data, setData] = useState<Asylum[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsylums = useCallback(async () => {
    try {
      const result = await asylumService.getAsylums(filters);
      setData(result);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar asilos';
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
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  };

  const refetch = () => {
    setLoading(true);
    setError(null);
    void fetchAsylums();
  };

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    refetch,
  };
}
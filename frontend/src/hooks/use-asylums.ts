"use client";

import { useState, useEffect, useCallback } from "react";
import { asylumService } from "@/services/asylumService";
import { Asylum } from "@/types";

export interface AsylumFilters {
  search?: string;
  codigo_provincia?: number;
  codigo_municipio?: number;
  precio_minimo?: number;
  precio_maximo?: number;
  solo_favoritos?: boolean;
  page?: number;
  page_size?: number;
}

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
    setLoading(true);
    setError(null);
    try {
      const result = await asylumService.getAsylums(filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Error al cargar asilos");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAsylums();
  }, [fetchAsylums]);

  const updateFilters = (next: Partial<AsylumFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  };

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchAsylums,
  };
}

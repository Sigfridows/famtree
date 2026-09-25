"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAsylumMap, type AsylumMapPin } from "../api/get-asylum-map";
import type { AsylumFilters } from "@/features/asylums";

export function useAsylumMap(initialFilters: AsylumFilters = {}) {
  const [pins, setPins] = useState<AsylumMapPin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AsylumFilters>(initialFilters);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPins = useCallback(async (currentFilters: AsylumFilters) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Primera página
      const firstPage = await getAsylumMap(currentFilters, abortControllerRef.current.signal);
      let accumulatedPins = [...firstPage.items];

      // Si la API indica que hay más páginas de pines (máximo 100 por página)
      if (firstPage.pagination.pages > 1) {
        const remainingPromises = [];
        for (let page = 2; page <= firstPage.pagination.pages; page++) {
          remainingPromises.push(
            getAsylumMap(
              { ...currentFilters, page }, 
              abortControllerRef.current.signal
            )
          );
        }
        
        const remainingPages = await Promise.all(remainingPromises);
        remainingPages.forEach((res) => {
          accumulatedPins = [...accumulatedPins, ...res.items];
        });
      }

      setPins(accumulatedPins);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al cargar la información.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPins = async () => {
      if (isMounted) {
        await fetchPins(filters);
      }
    };

    void loadPins();

    return () => {
      isMounted = false;
      abortControllerRef.current?.abort();
    };
  }, [filters, fetchPins]);

  const updateFilters = (newFilters: Partial<AsylumFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    pins,
    loading,
    error,
    filters,
    updateFilters,
    refetch: () => fetchPins(filters),
  };
}
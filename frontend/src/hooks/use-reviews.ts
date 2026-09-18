'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface ReviewItem {
  codigo_reseña?: number;
  codigo_asilo: number;
  calificacion: number;
  comentario: string;
  fecha_creacion?: string;
}

export interface CreateReviewInput {
  codigo_asilo: number;
  calificacion: number;
  comentario: string;
}

export function useReviews(codigoAsilo: number | null) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(Boolean(codigoAsilo));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!codigoAsilo) return;
    try {
      const { data } = await apiClient.get<{ items?: ReviewItem[] } | ReviewItem[]>(`/asylums/${codigoAsilo}/reviews`);
      const items = Array.isArray(data) ? data : data.items || [];
      setReviews(items);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar reseñas';
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
        void fetchReviews();
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchReviews]);

  const submitReview = async (input: CreateReviewInput) => {
    setSubmitting(true);
    try {
      const { data } = await apiClient.post<ReviewItem>('/reviews', input);
      setLoading(true);
      await fetchReviews();
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al publicar reseña';
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const refetch = () => {
    if (codigoAsilo) {
      setLoading(true);
      setError(null);
      void fetchReviews();
    }
  };

  return { reviews, loading, submitting, error, submitReview, refetch };
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface CreateReviewInput {
  codigo_asilo: number;
  calificacion: number;
  comentario: string;
}

export function useReviews(codigoAsilo: number | null) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!codigoAsilo) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/asylums/${codigoAsilo}/reviews`);
      setReviews(data.items || data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  }, [codigoAsilo]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const submitReview = async (input: CreateReviewInput) => {
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/reviews', input);
      await fetchReviews();
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Error al publicar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  return { reviews, loading, submitting, error, submitReview, refetch: fetchReviews };
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../api/reviewService';
import { ReviewItem, CreateReviewInput, Asylum } from '../types/reviews.types';
import { apiClient } from '@/lib/apiClient';

export function useReviews(asylumId?: number | string | null) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [asylums, setAsylums] = useState<Asylum[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (asylumId) {
        const data = await reviewService.getReviewsByAsylum(asylumId);
        setReviews(data);
      } else {
        const [reviewsData, asylumsRes] = await Promise.all([
          reviewService.getAllReviews(),
          apiClient.get<unknown>("/asylums").catch(() => [])
        ]);
        
        const asylumsList = Array.isArray(asylumsRes) 
          ? asylumsRes 
          : ((asylumsRes as { data?: Asylum[] })?.data || []);
        
        setReviews(reviewsData);
        setAsylums(asylumsList);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al conectar con el servidor. Verifica tu conexión.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [asylumId]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    void init();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const submitReview = async (input: CreateReviewInput) => {
    setSubmitting(true);
    try {
      const newReview = await reviewService.createReview(input);
      setReviews((prev) => [newReview, ...prev]);
      return newReview;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al publicar reseña';
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (id: string | number) => {
    // 1. Guardar la copia de respaldo del estado actual
    const previousReviews = [...reviews];

    // 2. Aplicar la actualización optimista
    setReviews((prev) =>
      prev.map((item) => {
        const itemId = item.id || item.codigo_reseña;
        if (itemId === id) {
          const currentlyLiked = item.isLiked;
          const currentLikes = item.likes || 0;
          return {
            ...item,
            isLiked: !currentlyLiked,
            likes: currentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
          };
        }
        return item;
      })
    );

    try {
      await reviewService.toggleLikeReview(id);
    } catch (err) {
      console.error("Error al sincronizar el like en la API", err);
      // 3. Restaurar el estado original en caso de error de red
      setReviews(previousReviews);
    }
  };

  return { 
    reviews, 
    asylums, 
    loading, 
    submitting, 
    error, 
    submitReview, 
    toggleLike: handleToggleLike, 
    refetch: fetchData 
  };
}
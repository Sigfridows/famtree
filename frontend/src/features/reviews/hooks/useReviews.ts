"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { reviewService } from "../api/reviewService";
import { ReviewItem, CreateReviewInput, Asylum} from "../types/reviews.types";

export function useReviews(asylumId?: number | string | null) {
  const pending = useRef(new Set<string>());
  const [pendingLikes, setPendingLikes] = useState<string[]>([]);
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
        const asylumsList = await reviewService.getAsylums();
        setAsylums(asylumsList);

        const allReviews = await reviewService.getAllReviews(asylumsList);
        setReviews(allReviews);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al conectar con el servidor. Verifica tu conexión.";
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
      // Re-lanzamos el objeto de error original para no perder propiedades como `status` o `statusCode`
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (id: string | number) => {
    const key = String(id);
    if (pending.current.has(key)) return;
    pending.current.add(key);
    setPendingLikes([...pending.current]);
    try {
      const reaction = await reviewService.toggleLikeReview(id);
      setReviews(prev => prev.map(item => String(item.reviewId ?? item.id ?? item.codigo_reseña) === key
        ? {...item, likes: reaction.likes, isLiked: reaction.isLiked} : item));
    } finally {
      pending.current.delete(key);
      setPendingLikes([...pending.current]);
    }
  };

  return {
    reviews,
    pendingLikes,
    asylums,
    loading,
    submitting,
    error,
    submitReview,
    toggleLike: handleToggleLike,
    refetch: fetchData,
  };
}

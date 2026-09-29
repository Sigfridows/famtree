import { apiClient } from "@/lib/apiClient";
import { ReviewItem, CreateReviewInput, ReportReason, ReviewReport, Asylum } from "../types/reviews.types";

export const reviewService = {
  // Obtener la lista general de asilos
  getAsylums: async (): Promise<Asylum[]> => {
    const response = await apiClient.get<Asylum[] | { items: Asylum[] }>("/asylums");
    const data = response.data;
    return Array.isArray(data) ? data : (data as { items: Asylum[] }).items || [];
  },

  // Obtener reseñas de un asilo específico (Endpoint válido según Swagger)
  getReviewsByAsylum: async (asylumId: number | string): Promise<ReviewItem[]> => {
    const response = await apiClient.get<ReviewItem[] | { items: ReviewItem[] }>(`/asylums/${asylumId}/reviews`);
    const data = response.data;
    return Array.isArray(data) ? data : (data as { items: ReviewItem[] }).items || [];
  },

  // Obtener todas las reseñas acumulando las de cada asilo
  getAllReviews: async (): Promise<ReviewItem[]> => {
    const asylums = await reviewService.getAsylums();
    
    // Peticiones en paralelo para las reseñas de cada asilo registrado
    const reviewsPromises = asylums.map((asylum) =>
      reviewService.getReviewsByAsylum(asylum.id).catch(() => [])
    );

    const reviewsNested = await Promise.all(reviewsPromises);
    return reviewsNested.flat();
  },

  // Crear una nueva reseña
  createReview: async (payload: CreateReviewInput): Promise<ReviewItem> => {
    const response = await apiClient.post<ReviewItem>("/reviews", payload);
    return response.data;
  },

  // Toggle Like en una reseña
  toggleLikeReview: async (id: string | number): Promise<void> => {
    await apiClient.post(`/reviews/${id}/like`);
  },

  // Reportar reseña
  reportReview: async (reviewId: number, reason: ReportReason, detail?: string): Promise<ReviewReport> => {
    const response = await apiClient.post<ReviewReport>("/reviews/reports", { reviewId, reason, detail });
    return response.data;
  },
};
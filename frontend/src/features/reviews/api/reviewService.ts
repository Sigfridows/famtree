import { apiClient } from "@/lib/apiClient";
import { ReviewItem, CreateReviewInput, ReportReason, ReviewReport, Asylum } from "../types/reviews.types";

export const reviewService = {
  // Obtener todas las reseñas generales (para la vista global de comentarios)
  getAllReviews: async (): Promise<ReviewItem[]> => {
    const response = await apiClient.get<ReviewItem[] | { items: ReviewItem[] }>("/reviews");
    const data = response.data;
    return Array.isArray(data) ? data : data.items || [];
  },

  // Obtener reseñas por asilo específico
  getReviewsByAsylum: async (asylumId: number | string): Promise<ReviewItem[]> => {
    const response = await apiClient.get<ReviewItem[] | { items: ReviewItem[] }>(`/asylums/${asylumId}/reviews`);
    const data = response.data;
    return Array.isArray(data) ? data : data.items || [];
  },

  // Obtener la lista de asilos para el selector o menciones
  getAsylums: async (): Promise<Asylum[]> => {
    const response = await apiClient.get<Asylum[] | { items: Asylum[] }>("/asylums");
    const data = response.data;
    return Array.isArray(data) ? data : (data as { items: Asylum[] }).items || [];
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